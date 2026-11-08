<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\Suporte;
use App\Models\Demanda;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Serviço central de geração de Relatório de Horas.
 *
 * Monta a estrutura completa do relatório para Admin e Cliente,
 * evidenciando com clareza:
 *   - horas cobertas pelo plano (tipo = 'plano')
 *   - horas técnicas cobertas pelo saldo do plano (tipo = 'hora_tecnica', sem excedente)
 *   - horas técnicas excedentes ao plano (tipo = 'hora_tecnica', valor_excedente > 0)
 *   - horas técnicas avulsas (sem assinatura ativa)
 */
class RelatorioService
{
    /**
     * Gera o relatório de horas de um cliente para um período.
     *
     * @param  Cliente      $cliente
     * @param  Carbon       $dataInicio
     * @param  Carbon       $dataFim
     * @param  string       $tipo        'completo' | 'simples'
     * @return array
     */
    public function gerar(
        Cliente $cliente,
        Carbon $dataInicio,
        Carbon $dataFim,
        string $tipo = 'completo'
    ): array {
        $dominioIds = $cliente->dominios()->pluck('id');

        // ----------------------------------------------------------------
        // 1. Chamados do período (criados dentro do intervalo)
        // ----------------------------------------------------------------
        $chamadosPeriodo = Suporte::where('cliente_id', $cliente->id)
            ->whereBetween('created_at', [$dataInicio->startOfDay(), $dataFim->endOfDay()])
            ->with(['dominio', 'demandas.assinatura.plano'])
            ->orderBy('created_at', 'asc')
            ->get();

        // ----------------------------------------------------------------
        // 2. Pendências: demandas em aberto criadas ANTES do período
        //    (pertencentes a domínios do cliente)
        // ----------------------------------------------------------------
        $pendencias = Demanda::whereIn('dominio_id', $dominioIds)
            ->whereNotIn('status', ['concluido', 'cancelado'])
            ->where('created_at', '<', $dataInicio->startOfDay())
            ->with(['dominio', 'suporte', 'assinatura.plano'])
            ->orderBy('created_at', 'asc')
            ->get();

        // ----------------------------------------------------------------
        // 3. Totalizadores de horas
        // ----------------------------------------------------------------
        $totais = $this->calcularTotais($chamadosPeriodo, $cliente);

        // ----------------------------------------------------------------
        // 4. Plano atual do cliente (assinatura ativa de qualquer domínio)
        // ----------------------------------------------------------------
        $planoAtual = $this->resolverPlanoAtual($cliente);

        // ----------------------------------------------------------------
        // 5. Monta retorno conforme tipo do relatório
        // ----------------------------------------------------------------
        $base = [
            'tipo'    => $tipo,
            'periodo' => [
                'inicio' => $dataInicio->toDateString(),
                'fim'    => $dataFim->toDateString(),
            ],
            'cliente'   => $this->formatarCliente($cliente, $planoAtual),
            'resumo'    => $totais,
            'pendencias' => $this->formatarPendencias($pendencias, $tipo),
        ];

        if ($tipo === 'completo') {
            $base['chamados'] = $this->formatarChamadosCompleto($chamadosPeriodo);
        } else {
            $base['chamados'] = $this->formatarChamadosSimples($chamadosPeriodo);
        }

        return $base;
    }

    // =========================================================================
    // Formatadores
    // =========================================================================

    private function formatarCliente(Cliente $cliente, ?array $planoAtual): array
    {
        return [
            'id'          => $cliente->id,
            'nome'        => $cliente->nome,
            'email'       => $cliente->email,
            'cnpj'        => $cliente->cnpj,
            'cpf'         => $cliente->cpf,
            'cidade'      => $cliente->cidade,
            'estado'      => $cliente->estado,
            'is_parceiro' => $cliente->is_parceiro,
            'plano_atual' => $planoAtual,
        ];
    }

    /**
     * Calcula os totalizadores de horas com as três categorias distintas:
     *  - horas_plano:              demandas do tipo 'plano' (escopo do plano, sem custo)
     *  - horas_tecnicas_cobertas:  tipo 'hora_tecnica' com saldo do plano absorvendo o custo
     *  - horas_tecnicas_excedentes: tipo 'hora_tecnica' que ultrapassaram o saldo disponível
     *  - horas_tecnicas_avulsas:   tipo 'hora_tecnica' sem assinatura
     */
    private function calcularTotais(Collection $chamados, Cliente $cliente): array
    {
        $horasPlano             = 0.0;
        $horasTecnicasCobertas  = 0.0;
        $horasTecnicasExcedentes= 0.0;
        $horasTecnicasAvulsas   = 0.0;
        $valorExcedentes        = 0.0;
        $valorAvulsas           = 0.0;
        $totalChamados          = $chamados->count();
        $totalDemandas          = 0;

        foreach ($chamados as $chamado) {
            foreach ($chamado->demandas as $demanda) {
                $totalDemandas++;
                $horas = (float) $demanda->quantidade_horas_tecnicas;

                if ($demanda->tipo === 'plano') {
                    // Horas cobertas pelo escopo do plano (sem custo algum)
                    $horasPlano += $horas;
                } elseif ($demanda->assinatura_id) {
                    $excedente = (float) $demanda->valor_excedente;
                    if ($excedente > 0) {
                        // Horas técnicas que excederam o saldo do plano
                        $horasTecnicasExcedentes += $horas;
                        $valorExcedentes         += $excedente;
                    } else {
                        // Horas técnicas absorvidas pelo saldo disponível do plano
                        $horasTecnicasCobertas += $horas;
                    }
                } else {
                    // Sem plano: hora avulsa, cobrança integral
                    $horasTecnicasAvulsas += $horas;
                    $valorAvulsas         += (float) $demanda->valor;
                }
            }
        }

        $totalHoras   = $horasPlano + $horasTecnicasCobertas + $horasTecnicasExcedentes + $horasTecnicasAvulsas;
        $valorTotal   = round($valorExcedentes + $valorAvulsas, 2);

        // Valor hora de referência (do plano ativo ou padrão)
        $assinaturaAtiva = $cliente->assinaturas()->where('status', 'ativo')->with('plano')->first();
        $valorHora       = $assinaturaAtiva ? (float) $assinaturaAtiva->plano->valor_hora : \App\Models\Plano::valorHoraSemPlano();

        return [
            'total_chamados'              => $totalChamados,
            'total_demandas'              => $totalDemandas,
            // ── Horas por categoria ──
            'horas_plano'                 => round($horasPlano, 2),
            'horas_tecnicas_cobertas'     => round($horasTecnicasCobertas, 2),
            'horas_tecnicas_excedentes'   => round($horasTecnicasExcedentes, 2),
            'horas_tecnicas_avulsas'      => round($horasTecnicasAvulsas, 2),
            'total_horas'                 => round($totalHoras, 2),
            // ── Financeiro ──
            'valor_hora_referencia'       => round($valorHora, 2),
            'valor_horas_excedentes'      => round($valorExcedentes, 2),
            'valor_horas_avulsas'         => round($valorAvulsas, 2),
            'valor_total_a_pagar'         => $valorTotal,
        ];
    }

    private function formatarPendencias(Collection $pendencias, string $tipo): array
    {
        return $pendencias->map(function (Demanda $d) use ($tipo) {
            $base = [
                'id'          => $d->id,
                'titulo'      => $d->titulo,
                'status'      => $d->status,
                'tipo'        => $d->tipo,
                'horas'       => (float) $d->quantidade_horas_tecnicas,
                'dominio'     => $d->dominio?->nome,
                'chamado_id'  => $d->suporte_id,
                'criada_em'   => $d->created_at?->format('d/m/Y'),
            ];

            if ($tipo === 'completo') {
                $base['descricao'] = $d->descricao;
                $base['plano']     = $d->assinatura?->plano?->nome;
            }

            return $base;
        })->values()->toArray();
    }

    private function formatarChamadosCompleto(Collection $chamados): array
    {
        return $chamados->map(function (Suporte $s) {
            return [
                'id'         => $s->id,
                'mensagem'   => $s->mensagem,
                'status'     => $s->status,
                'dominio'    => $s->dominio?->nome,
                'criado_em'  => $s->created_at?->format('d/m/Y H:i'),
                'demandas'   => $s->demandas->map(function (Demanda $d) {
                    return $this->formatarDemandaCompleto($d);
                })->values()->toArray(),
            ];
        })->values()->toArray();
    }

    private function formatarChamadosSimples(Collection $chamados): array
    {
        return $chamados->map(function (Suporte $s) {
            $horasPlano      = 0.0;
            $horasCobertas   = 0.0;
            $horasExcedentes = 0.0;
            $horasAvulsas    = 0.0;

            foreach ($s->demandas as $d) {
                $horas = (float) $d->quantidade_horas_tecnicas;
                if ($d->tipo === 'plano') {
                    $horasPlano += $horas;
                } elseif ($d->assinatura_id) {
                    if ((float) $d->valor_excedente > 0) {
                        $horasExcedentes += $horas;
                    } else {
                        $horasCobertas += $horas;
                    }
                } else {
                    $horasAvulsas += $horas;
                }
            }

            return [
                'id'                       => $s->id,
                'status'                   => $s->status,
                'dominio'                  => $s->dominio?->nome,
                'criado_em'                => $s->created_at?->format('d/m/Y'),
                'total_demandas'           => $s->demandas->count(),
                'horas_plano'              => round($horasPlano, 2),
                'horas_tecnicas_cobertas'  => round($horasCobertas, 2),
                'horas_tecnicas_excedentes'=> round($horasExcedentes, 2),
                'horas_tecnicas_avulsas'   => round($horasAvulsas, 2),
            ];
        })->values()->toArray();
    }

    private function formatarDemandaCompleto(Demanda $d): array
    {
        $excedente = (float) $d->valor_excedente;
        $horas     = (float) $d->quantidade_horas_tecnicas;

        // Classifica a demanda para facilitar a leitura visual no frontend
        $classificacao = match(true) {
            $d->tipo === 'plano'                     => 'plano',
            !$d->assinatura_id                        => 'avulsa',
            $excedente > 0                            => 'excedente',
            default                                   => 'coberta_pelo_plano',
        };

        return [
            'id'             => $d->id,
            'titulo'         => $d->titulo,
            'descricao'      => $d->descricao,
            'tipo'           => $d->tipo,
            'classificacao'  => $classificacao,  // legível para o frontend
            'status'         => $d->status,
            'horas'          => $horas,
            'valor'          => (float) $d->valor,
            'valor_excedente'=> $excedente,
            'cobrado'        => $d->cobrado,
            'plano'          => $d->assinatura?->plano?->nome,
            'criada_em'      => $d->created_at?->format('d/m/Y H:i'),
            'atualizada_em'  => $d->updated_at?->format('d/m/Y H:i'),
        ];
    }

    private function resolverPlanoAtual(Cliente $cliente): ?array
    {
        $assinatura = $cliente->assinaturas()
            ->where('status', 'ativo')
            ->with('plano')
            ->first();

        if (!$assinatura || !$assinatura->plano) {
            return null;
        }

        return [
            'nome'                  => $assinatura->plano->nome,
            'limite_horas_tecnicas' => $assinatura->plano->limite_horas_tecnicas,
            'valor_hora'            => (float) $assinatura->plano->valor_hora,
            'horas_disponiveis'     => (float) $assinatura->horas_disponiveis,
            'assinatura_id'         => $assinatura->id,
        ];
    }
}


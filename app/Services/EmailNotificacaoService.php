<?php

namespace App\Services;

use App\Mail\Admins\NovaAssinaturaMail;
use App\Mail\Admins\NovoClienteMail;
use App\Mail\Admins\NovoChamadoAdminMail;
use App\Mail\Admins\NovoPagamentoMail;
use App\Mail\Admins\PagamentoConcluidoMail;
use App\Mail\Clientes\ContaCriadaMail;
use App\Mail\Clientes\DemandaConcluidaMail;
use App\Mail\Clientes\NovaChamadoMail;
use App\Mail\Clientes\NovaDemandaMail;
use App\Mail\Clientes\NovoSubUsuarioMail;
use App\Mail\Clientes\StatusDemandaMail;
use App\Models\Assinatura;
use App\Models\Cliente;
use App\Models\Demanda;
use App\Models\Pagamento;
use App\Models\Suporte;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Serviço centralizado de envio de e-mails de notificação.
 * Todos os pontos do sistema devem utilizar este serviço, evitando duplicidade.
 * Erros de envio são logados mas não interrompem o fluxo principal.
 */
class EmailNotificacaoService
{
    /**
     * Notifica o cliente recém-registrado com link de ativação de conta.
     */
    public function contaCriada(User $user, string $activationUrl): void
    {
        $this->enviarParaUsuario($user->email, new ContaCriadaMail($user, $activationUrl));
    }

    /**
     * Notifica o cliente quando um novo chamado de suporte é aberto.
     */
    public function novoChamadoCliente(Suporte $suporte): void
    {
        $email = $suporte->cliente?->email ?? $suporte->cliente?->user?->email;
        if ($email) {
            $this->enviarParaUsuario($email, new NovaChamadoMail($suporte));
        }
    }

    /**
     * Notifica o cliente quando uma nova demanda é criada para um chamado.
     */
    public function novaDemandaCliente(Demanda $demanda): void
    {
        $email = $demanda->dominio?->cliente?->email;
        if ($email) {
            $this->enviarParaUsuario($email, new NovaDemandaMail($demanda));
        }
    }

    /**
     * Notifica o cliente quando o status de uma demanda muda.
     */
    public function statusDemandaAlterado(Demanda $demanda, string $statusAnterior): void
    {
        $email = $demanda->dominio?->cliente?->email;
        if ($email) {
            $this->enviarParaUsuario($email, new StatusDemandaMail($demanda, $statusAnterior));
        }
    }

    /**
     * Notifica o cliente quando uma demanda é totalmente concluída.
     */
    public function demandaConcluida(Demanda $demanda): void
    {
        $email = $demanda->dominio?->cliente?->email;
        if ($email) {
            $this->enviarParaUsuario($email, new DemandaConcluidaMail($demanda));
        }
    }

    /**
     * Notifica o sub-usuário recém-criado com suas credenciais de acesso.
     */
    public function novoSubUsuario(User $subUser, string $senhaTemporaria): void
    {
        $this->enviarParaUsuario($subUser->email, new NovoSubUsuarioMail($subUser, $senhaTemporaria));
    }

    /**
     * Notifica todos os admins quando um novo cliente é cadastrado.
     */
    public function novoClienteAdmins(Cliente $cliente): void
    {
        $this->enviarParaAdmins(new NovoClienteMail($cliente));
    }

    /**
     * Notifica todos os admins quando uma nova assinatura é gerada.
     */
    public function novaAssinaturaAdmins(Assinatura $assinatura): void
    {
        $this->enviarParaAdmins(new NovaAssinaturaMail($assinatura));
    }

    /**
     * Notifica todos os admins quando um novo pagamento é gerado.
     */
    public function novoPagamentoAdmins(Pagamento $pagamento): void
    {
        $this->enviarParaAdmins(new NovoPagamentoMail($pagamento));
    }

    /**
     * Notifica todos os admins quando um pagamento é confirmado/concluído.
     */
    public function pagamentoConcluidoAdmins(Pagamento $pagamento): void
    {
        $this->enviarParaAdmins(new PagamentoConcluidoMail($pagamento));
    }

    /**
     * Notifica todos os admins quando um chamado de suporte é aberto pelo cliente.
     */
    public function novoChamadoAdmins(Suporte $suporte): void
    {
        $this->enviarParaAdmins(new NovoChamadoAdminMail($suporte));
    }

    // -------------------------------------------------------------------------
    // Métodos auxiliares privados
    // -------------------------------------------------------------------------

    /**
     * Envia e-mail para um endereço específico, capturando erros sem quebrar o fluxo.
     */
    private function enviarParaUsuario(string $email, mixed $mailable): void
    {
        try {
            Mail::to($email)->send($mailable);
        } catch (\Throwable $e) {
            Log::error('[EmailNotificacaoService] Falha ao enviar e-mail', [
                'para'  => $email,
                'class' => get_class($mailable),
                'erro'  => $e->getMessage(),
            ]);
        }
    }

    /**
     * Envia e-mail para todos os admins ativos, capturando erros individualmente.
     */
    private function enviarParaAdmins(mixed $mailable): void
    {
        $admins = User::admins()->ativo()->get();

        foreach ($admins as $admin) {
            $this->enviarParaUsuario($admin->email, $mailable);
        }
    }
}

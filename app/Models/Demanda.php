<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Demanda extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'dominio_id',
        'assinatura_id',
        'suporte_id',
        'titulo',
        'descricao',
        'status',
        'quantidade_horas_tecnicas',
        'valor',
        'valor_excedente',
        'cobrado',
    ];

    protected $casts = [
        'quantidade_horas_tecnicas' => 'decimal:2',
        'valor' => 'decimal:2',
        'valor_excedente' => 'decimal:2',
        'cobrado' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function dominio(): BelongsTo
    {
        return $this->belongsTo(Dominio::class);
    }

    public function assinatura(): BelongsTo
    {
        return $this->belongsTo(Assinatura::class);
    }

    public function suporte(): BelongsTo
    {
        return $this->belongsTo(Suporte::class);
    }

    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class);
    }

    public function scopePendente($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopeEmAndamento($query)
    {
        return $query->where('status', 'em_andamento');
    }

    public function scopeEmAprovacao($query)
    {
        return $query->where('status', 'em_aprovacao');
    }

    public function scopeConcluido($query)
    {
        return $query->where('status', 'concluido');
    }

    public function scopeNaoCobrado($query)
    {
        return $query->where('cobrado', false);
    }

    /**
     * Calcula o valor da demanda com base nas horas e no plano
     */
    public function calcularValor(): void
    {
        $dominio = $this->dominio;
        $assinatura = $dominio->assinatura;
        $horas = (float) $this->quantidade_horas_tecnicas;

        if (!$assinatura) {
            // Sem plano ativo: cobra valor integral (R$ 100/h)
            $valorHora = Plano::valorHoraSemPlano();
            $this->valor = round($horas * $valorHora, 2);
            $this->valor_excedente = 0;
            return;
        }

        $this->assinatura_id = $assinatura->id;
        $valorHora = (float) $assinatura->plano->valor_hora;

        // Tenta descontar horas do plano
        $excedente = $assinatura->descontarHoras($horas);

        if ($excedente > 0) {
            // Cobra apenas o excedente
            $this->valor_excedente = round($excedente * $valorHora, 2);
            $this->valor = round(($horas - $excedente) * 0 + $this->valor_excedente, 2); // Horas do plano são "grátis"
        } else {
            // Todas as horas cobertas pelo plano
            $this->valor = 0;
            $this->valor_excedente = 0;
        }
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pagamento extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'assinatura_id',
        'suporte_id',
        'valor',
        'status',
        'data_vencimento',
        'data_pagamento',
        'referencia_mes',
        'descricao',
    ];

    protected $casts = [
        'valor' => 'decimal:2',
        'data_vencimento' => 'date',
        'data_pagamento' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function assinatura(): BelongsTo
    {
        return $this->belongsTo(Assinatura::class);
    }

    public function suporte(): BelongsTo
    {
        return $this->belongsTo(Suporte::class);
    }

    public function scopeAberto($query)
    {
        return $query->where('status', 'aberto');
    }

    public function scopePago($query)
    {
        return $query->where('status', 'pago');
    }

    public function scopePendenteConferencia($query)
    {
        return $query->where('status', 'pendente_conferencia');
    }

    public function scopeDoMes($query, string $referenciaMes)
    {
        return $query->where('referencia_mes', $referenciaMes);
    }

    /**
     * Marca o pagamento como pago
     */
    public function marcarComoPago(): void
    {
        $this->status = 'pago';
        $this->data_pagamento = now();
        $this->save();
    }
}

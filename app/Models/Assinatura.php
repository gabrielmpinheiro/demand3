<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assinatura extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'dominio_id',
        'plano_id',
        'horas_disponiveis',
        'status',
        'data_inicio',
        'data_fim',
    ];

    protected $casts = [
        'horas_disponiveis' => 'decimal:2',
        'data_inicio' => 'date',
        'data_fim' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function dominio(): BelongsTo
    {
        return $this->belongsTo(Dominio::class);
    }

    public function plano(): BelongsTo
    {
        return $this->belongsTo(Plano::class);
    }

    public function demandas(): HasMany
    {
        return $this->hasMany(Demanda::class);
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }

    public function scopeAtivo($query)
    {
        return $query->where('status', 'ativo');
    }

    /**
     * Desconta horas da assinatura
     */
    public function descontarHoras(float $horas): float
    {
        $horasDisponiveis = (float) $this->horas_disponiveis;

        if ($horasDisponiveis >= $horas) {
            $this->horas_disponiveis = $horasDisponiveis - $horas;
            $this->save();
            return 0; // sem excedente
        }

        $excedente = $horas - $horasDisponiveis;
        $this->horas_disponiveis = 0;
        $this->save();

        return $excedente;
    }

    /**
     * Reseta as horas para o limite do plano
     */
    public function resetarHoras(): void
    {
        $this->horas_disponiveis = $this->plano->limite_horas_tecnicas;
        $this->save();
    }
}

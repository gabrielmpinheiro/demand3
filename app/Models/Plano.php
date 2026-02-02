<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plano extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'limite_horas_tecnicas',
        'valor_hora',
        'status',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'limite_horas_tecnicas' => 'integer',
        'valor_hora' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function assinaturas(): HasMany
    {
        return $this->hasMany(Assinatura::class);
    }

    public function scopeAtivo($query)
    {
        return $query->where('status', 'ativo');
    }

    /**
     * Valor hora padrão para clientes sem plano
     */
    public static function valorHoraSemPlano(): float
    {
        return 100.00;
    }
}

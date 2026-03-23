<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'nome',
        'email',
        'telefone',
        'endereco',
        'cidade',
        'estado',
        'cep',
        'cnpj',
        'cpf',
        'inscricao_estadual',
        'inscricao_municipal',
        'status',
        'is_parceiro',
        'parceria_inicio',
        'parceria_fim',
        'valor_hora_avulsa',
        'valor_hora_subsidiada',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'is_parceiro' => 'boolean',
        'parceria_inicio' => 'date',
        'parceria_fim' => 'date',
        'valor_hora_avulsa' => 'decimal:2',
        'valor_hora_subsidiada' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dominios(): HasMany
    {
        return $this->hasMany(Dominio::class);
    }

    public function assinaturas(): HasMany
    {
        return $this->hasMany(Assinatura::class);
    }

    public function pagamentos(): HasMany
    {
        return $this->hasMany(Pagamento::class);
    }

    public function suportes(): HasMany
    {
        return $this->hasMany(Suporte::class);
    }

    public function notificacoes(): HasMany
    {
        return $this->hasMany(Notificacao::class);
    }

    public function vaults(): HasMany
    {
        return $this->hasMany(Vault::class);
    }

    public function scopeAtivo($query)
    {
        return $query->where('status', 'ativo');
    }

    public function scopeParceiro($query)
    {
        return $query->where('is_parceiro', true);
    }

    public function getParceriaStatsAttribute(): array
    {
        $chamadosGerados  = $this->suportes()->count();
        $chamadosConcluidos = $this->suportes()->where('status', 'concluido')->count();
        $demandasGeradas  = \App\Models\Demanda::whereIn('dominio_id', $this->dominios()->pluck('id'))->count();
        $demandasConcluidas = \App\Models\Demanda::whereIn('dominio_id', $this->dominios()->pluck('id'))->where('status', 'concluido')->count();

        return [
            'chamados_gerados'    => $chamadosGerados,
            'chamados_concluidos' => $chamadosConcluidos,
            'demandas_geradas'    => $demandasGeradas,
            'demandas_concluidas' => $demandasConcluidas,
        ];
    }
}

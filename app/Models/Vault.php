<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class Vault extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cliente_id',
        'dominio_id',
        'servico',
        'login',
        'senha',
        'url',
        'notas',
        'status',
    ];

    protected $hidden = [
        'senha',
    ];

    protected $casts = [
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

    public function scopeAtivo($query)
    {
        return $query->where('status', 'ativo');
    }

    /**
     * Criptografa a senha antes de salvar
     */
    public function setSenhaAttribute($value): void
    {
        $this->attributes['senha'] = Crypt::encryptString($value);
    }

    /**
     * Descriptografa a senha ao acessar
     */
    public function getSenhaDecryptedAttribute(): string
    {
        try {
            return Crypt::decryptString($this->attributes['senha']);
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Retorna a senha descriptografada (apenas para admins)
     */
    public function revelarSenha(): string
    {
        return $this->senha_decrypted;
    }
}

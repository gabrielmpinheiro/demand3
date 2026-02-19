<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'notificacoes';

    protected $fillable = [
        'cliente_id',
        'demanda_id',
        'user_id',
        'tipo',
        'titulo',
        'mensagem',
        'lida',
        'status',
    ];

    protected $casts = [
        'lida' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function demanda(): BelongsTo
    {
        return $this->belongsTo(Demanda::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeNaoLida($query)
    {
        return $query->where('lida', false);
    }

    public function scopeLida($query)
    {
        return $query->where('lida', true);
    }

    public function scopeParaAdmins($query)
    {
        return $query->whereNotNull('user_id');
    }

    public function marcarComoLida(): void
    {
        $this->lida = true;
        $this->save();
    }

    /**
     * Cria notificação para todos os admins
     */
    public static function notificarAdmins(string $titulo, string $mensagem, ?int $demandaId = null, ?int $clienteId = null, string $tipo = 'demanda'): void
    {
        $admins = User::admins()->ativo()->get();

        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'cliente_id' => $clienteId,
                'demanda_id' => $demandaId,
                'tipo' => $tipo,
                'titulo' => $titulo,
                'mensagem' => $mensagem,
            ]);
        }
    }

    /**
     * Cria notificação para o cliente (visível na área do cliente)
     */
    public static function notificarCliente(int $clienteId, string $titulo, string $mensagem, ?int $demandaId = null, string $tipo = 'demanda'): void
    {
        self::create([
            'cliente_id' => $clienteId,
            'user_id' => null,
            'demanda_id' => $demandaId,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensagem' => $mensagem,
        ]);
    }
}

<?php

namespace App\Console\Commands;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateUsersForExistingClients extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'clients:create-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria usuários para clientes existentes que ainda não possuem acesso ao sistema';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando verificação de clientes sem usuário...');

        $clientes = Cliente::whereNull('user_id')->get();

        if ($clientes->isEmpty()) {
            $this->info('Nenhum cliente sem usuário encontrado.');
            return;
        }

        $this->info("Encontrados {$clientes->count()} clientes sem usuário vinculado.");

        $bar = $this->output->createProgressBar($clientes->count());
        $bar->start();

        $createdCount = 0;
        $linkedCount = 0;
        $errors = [];

        foreach ($clientes as $cliente) {
            try {
                if (empty($cliente->email)) {
                    $errors[] = "Cliente ID {$cliente->id} ({$cliente->nome}) não possui e-mail cadastrado.";
                    $bar->advance();
                    continue;
                }

                // Verifica se já existe usuário com este e-mail
                $user = User::where('email', $cliente->email)->first();

                if ($user) {
                    // Vincula usuário existente
                    $cliente->user_id = $user->id;
                    $cliente->save();
                    $linkedCount++;
                } else {
                    // Cria novo usuário
                    // Gera uma senha aleatória se não for definida uma padrão
                    // Aqui definiremos uma senha padrão 'Mudar@123' para facilitar o primeiro acesso,
                    // ou poderíamos gerar uma aleatória e exibir no final. 
                    // Vamos usar uma senha padrão e avisar no output.
                    $password = 'Mudar@123';

                    $user = User::create([
                        'name' => $cliente->nome,
                        'email' => $cliente->email,
                        'password' => Hash::make($password),
                        'role' => 'cliente',
                        'status' => 'ativo',
                    ]);

                    $cliente->user_id = $user->id;
                    $cliente->save();
                    $createdCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Erro ao processar cliente ID {$cliente->id}: {$e->getMessage()}";
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Processo concluído!");
        $this->info("- Usuários criados: $createdCount");
        $this->info("- Usuários vinculados a contas existentes: $linkedCount");

        if ($createdCount > 0) {
            $this->warn("ATENÇÃO: Os novos usuários foram criados com a senha padrão: 'Mudar@123'.");
            $this->warn("Solicite que eles alterem a senha no primeiro acesso.");
        }

        if (!empty($errors)) {
            $this->error("Erros encontrados:");
            foreach ($errors as $error) {
                $this->line(" - $error");
            }
        }
    }
}

# Documentação da API - Comandos CURL para Postman

Esta documentação contém exemplos de comandos `curl` para testar todos os endpoints da API. Você pode importar esses comandos diretamente para o Postman ou executá-los no terminal.

## Variáveis de Ambiente
Utilize as seguintes variáveis no seu ambiente do Postman:
- `base_url`: `http://localhost:8000/api`
- `token`: O token retornado no login.

---

## 🔐 Autenticação

### Login
```bash
curl --location --request POST '{{base_url}}/auth/login' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@example.com",
    "password": "password"
}'
```

### Logout (Requer Token)
```bash
curl --location --request POST '{{base_url}}/auth/logout' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Obter Usuário Autenticado
```bash
curl --location --request GET '{{base_url}}/auth/user' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Registro de Usuário (Admin)
```bash
curl --location --request POST '{{base_url}}/auth/register' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "name": "Novo Usuário",
    "email": "novo@usuario.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "user"
}'
```

### Atualizar Senha
```bash
curl --location --request PUT '{{base_url}}/auth/password' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "current_password": "password",
    "password": "new_password123",
    "password_confirmation": "new_password123"
}'
```

---

## 👥 Clientes

### Listar Clientes
```bash
curl --location --request GET '{{base_url}}/clientes?status=ativo&search=Empresa' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Cliente
```bash
curl --location --request POST '{{base_url}}/clientes' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "nome": "Cliente de Teste",
    "email": "contato@clienteteste.com",
    "telefone": "11999999999",
    "endereco": "Rua Teste, 123",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01000-000",
    "cnpj": "12.345.678/0001-90",
    "status": "ativo"
}'
```

### Ver Cliente
```bash
curl --location --request GET '{{base_url}}/clientes/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Atualizar Cliente
```bash
curl --location --request PUT '{{base_url}}/clientes/1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "nome": "Cliente Atualizado",
    "status": "inativo"
}'
```

### Excluir Cliente
```bash
curl --location --request DELETE '{{base_url}}/clientes/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

---

## 🌐 Domínios

### Listar Domínios
```bash
curl --location --request GET '{{base_url}}/dominios?cliente_id=1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Domínio
```bash
curl --location --request POST '{{base_url}}/dominios' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "cliente_id": 1,
    "nome": "meudominio.com.br",
    "status": "ativo"
}'
```

### Ver Domínio
```bash
curl --location --request GET '{{base_url}}/dominios/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Atualizar Domínio
```bash
curl --location --request PUT '{{base_url}}/dominios/1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "nome": "novodominio.com",
    "status": "inativo"
}'
```

### Excluir Domínio
```bash
curl --location --request DELETE '{{base_url}}/dominios/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

---

## 📝 Demandas (Solicitações)

### Listar Demandas
```bash
curl --location --request GET '{{base_url}}/demandas?status=pendente' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Demanda
```bash
curl --location --request POST '{{base_url}}/demandas' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "dominio_id": 1,
    "titulo": "Implementação de nova funcionalidade",
    "descricao": "Descrição detalhada da tarefa a ser realizada",
    "quantidade_horas_tecnicas": 2.5,
    "status": "pendente"
}'
```

### Ver Demanda
```bash
curl --location --request GET '{{base_url}}/demandas/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Atualizar Demanda
```bash
curl --location --request PUT '{{base_url}}/demandas/1' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "titulo": "Título de Demanda Atualizado",
    "quantidade_horas_tecnicas": 3.0
}'
```

### Aprovar Demanda
```bash
curl --location --request POST '{{base_url}}/demandas/1/aprovar' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Concluir Demanda
```bash
curl --location --request POST '{{base_url}}/demandas/1/concluir' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Cancelar Demanda
```bash
curl --location --request POST '{{base_url}}/demandas/1/cancelar' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Excluir Demanda
```bash
curl --location --request DELETE '{{base_url}}/demandas/1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

---

## 🔐 Vault (Cofre de Senhas)

### Listar Credenciais
```bash
curl --location --request GET '{{base_url}}/vault?cliente_id=1' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Credencial
```bash
curl --location --request POST '{{base_url}}/vault' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "cliente_id": 1,
    "dominio_id": 1,
    "servico": "Painel de Controle",
    "login": "admin",
    "senha": "password_segura",
    "url": "https://painel.site.com",
    "notas": "Notas sobre o acesso",
    "status": "ativo"
}'
```

### Revelar Senha
```bash
curl --location --request GET '{{base_url}}/vault/1/revelar-senha' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

---

## 💎 Planos e Assinaturas

### Listar Planos
```bash
curl --location --request GET '{{base_url}}/planos' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Assinatura
```bash
curl --location --request POST '{{base_url}}/assinaturas' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "cliente_id": 1,
    "dominio_id": 1,
    "plano_id": 1,
    "status": "ativo",
    "data_inicio": "2024-01-01"
}'
```

### Resetar Horas da Assinatura
```bash
curl --location --request POST '{{base_url}}/assinaturas/1/resetar-horas' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

---

## 💰 Pagamentos

### Listar Pagamentos
```bash
curl --location --request GET '{{base_url}}/pagamentos' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Marcar como Pago
```bash
curl --location --request POST '{{base_url}}/pagamentos/1/marcar-pago' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Gerar Fatura Mensal
```bash
curl --location --request POST '{{base_url}}/pagamentos/gerar-fatura' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "cliente_id": 1,
    "referencia_mes": "2024-02"
}'
```

---

## 🎫 Suporte

### Listar Tickets
```bash
curl --location --request GET '{{base_url}}/suportes' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Criar Ticket
```bash
curl --location --request POST '{{base_url}}/suportes' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "cliente_id": 1,
    "demanda_id": 1,
    "mensagem": "Preciso de ajuda com esta demanda.",
    "status": "aberto"
}'
```

---

## 🔔 Notificações

### Listar Notificações
```bash
curl --location --request GET '{{base_url}}/notificacoes?lida=false' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Marcar como Lida
```bash
curl --location --request POST '{{base_url}}/notificacoes/1/marcar-lida' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer {{token}}'
```

### Marcar Todas como Lidas
```bash
curl --location --request POST '{{base_url}}/notificacoes/marcar-todas-lidas' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{token}}' \
--data-raw '{
    "user_id": 1
}'
```

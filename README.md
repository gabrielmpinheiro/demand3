# Demand3 - Sistema de Gerenciamento de Demandas

API REST desenvolvida em Laravel 12 para gerenciamento de demandas do serviço SiteCare do Pulo do Gato.

## Requisitos

- Docker Desktop (certifique-se de que está rodando!)
- Docker Compose

## Solução de Problemas Comuns

### Erro: "boostrap/cache directory must be present and writable"
Se você encontrar este erro ao rodar migrações, execute:
```bash
docker-compose exec app mkdir -p bootstrap/cache
docker-compose exec app chmod -R 777 bootstrap/cache storage
```

### Erro: "open //./pipe/dockerDesktopLinuxEngine"
Significa que o Docker Desktop não está rodando. Abra o aplicativo Docker Desktop no Windows e aguarde iniciar.

---

## Instalação Rápida

1. **Clone o repositório** e entre na pasta:
   ```bash
   cd demand3
   ```

2. **Suba o ambiente:**
   ```bash
   docker-compose up -d
   ```

3. **Instale dependências e configure:**
   ```bash
   docker-compose exec app composer install
   docker-compose exec app cp .env.example .env
   docker-compose exec app php artisan key:generate
   ```

4. **Prepare o banco de dados:**
   ```bash
   docker-compose exec app php artisan migrate --seed
   ```
   > O usuário admin é `admin@demand3.local` com senha `password`.

---

## Como Usar (Exemplos)

A API roda em `http://localhost:8000/api`.

### 1. Autenticação (Login)

Primeiro, obtenha seu **token** de acesso.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@demand3.local", "password":"password"}'
```

**Response (Sucesso):**
```json
{
    "message": "Login realizado com sucesso",
    "data": {
        "token": "1|abcdef123456..."
    }
}
```

> **IMPORTANTE:** Copie o token retornado. Você precisará dele para todas as outras requisições (`Authorization: Bearer SEU_TOKEN`).

---

### 2. Criar um Cliente

**Request:**
```bash
curl -X POST http://localhost:8000/api/clientes \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "nome": "Empresa Exemplo Ltda",
           "email": "contato@empresa.com",
           "cnpj": "12.345.678/0001-90",
           "status": "ativo"
         }'
```

---

### 3. Criar uma Demanda (Com Cálculo Automático)

O sistema calcula automaticamente se deve descontar do plano ou cobrar excedente.

**Request:**
```bash
curl -X POST http://localhost:8000/api/demandas \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "dominio_id": 1,
           "titulo": "Ajuste no layout da home",
           "descricao": "Alterar cor do botão principal",
           "quantidade_horas_tecnicas": 1.5
         }'
```

---

### 4. Consultar Todas as Demandas

**Request:**
```bash
curl -X GET http://localhost:8000/api/demandas \
     -H "Authorization: Bearer SEU_TOKEN"
```

---

### 5. Salvar Senha no Vault (Criptografado)

**Request:**
```bash
curl -X POST http://localhost:8000/api/vault \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
           "cliente_id": 1,
           "servico": "WordPress Admin",
           "login": "admin",
           "senha": "MinhaSenhaSuperSecreta123"
         }'
```
> A senha será salva criptografada no banco de dados.

---

### 6. Revelar Senha do Vault

**Request:**
```bash
curl -X GET http://localhost:8000/api/vault/1/revelar-senha \
     -H "Authorization: Bearer SEU_TOKEN"
```

**Response:**
```json
{
    "data": {
        "senha": "MinhaSenhaSuperSecreta123"
    }
}
```

---

## Rodando Testes Automatizados

Para verificar se tudo está funcionando como esperado:

```bash
docker-compose exec app php artisan test
```

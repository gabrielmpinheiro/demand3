# Deploy — Demand3 (Locaweb Hospedagem Compartilhada)

## Visão Geral da Arquitetura

A Locaweb separa os arquivos em dois diretórios:

| O quê             | Caminho no servidor                                        |
|--------------------|------------------------------------------------------------|
| **Core da app**    | `/home/storage/d/c3/95/pulodogato1/demand3`               |
| **Pasta public**   | `/home/storage/d/c3/95/pulodogato1/public_html/demand3`   |

**URL de acesso:** https://sitecare.pulodogato.art.br

---

## Pré-requisitos

- **Node.js 20+** e **npm** (para build do frontend)
- **PHP 8.2+** e **Composer** (para dependências backend)
- **Cliente SSH/SFTP** (ex: WinSCP, FileZilla, ou terminal)

---

## 1. Deploy Automatizado (GitHub Actions)

### Configurar Secrets no GitHub

No repositório → **Settings → Secrets and variables → Actions**, crie:

| Nome do Secret  | Valor                   |
|-----------------|-------------------------|
| `SSH_HOST`      | `179.188.12.237`        |
| `SSH_USER`      | `pulodogato1`           |
| `SSH_PASSWORD`  | *(senha do SSH)*        |
| `SSH_PORT`      | `22`                    |

### Como funciona

Ao fazer **push na branch `main`**, o workflow `.github/workflows/deploy.yml` executa:

1. ✅ `npm ci` + `npm run build` (gera `public/build/`)
2. ✅ `composer install --no-dev` (gera `vendor/`)
3. ✅ Upload do **core** via SCP → `/demand3/`
4. ✅ Upload do **public** via SCP → `/public_html/demand3/`
5. ✅ `php artisan migrate --force` via SSH
6. ✅ `php artisan config:cache && route:cache && view:cache`

---

## 2. Deploy Manual (Primeiro Deploy ou Emergência)

### Passo 1 — Build local

```bash
# No container Docker ou localmente
npm ci
npm run build
composer install --no-dev --optimize-autoloader
```

### Passo 2 — Subir o .env para o servidor

> ⚠️ O `.env` é o arquivo principal de configuração. Ele deve ser copiado **manualmente** apenas na primeira vez.

```bash
# Via SCP
scp -P 22 .env.production pulodogato1@179.188.12.237:/home/storage/d/c3/95/pulodogato1/demand3/.env
```

### Passo 3 — Subir o _server_config.php

Copie o arquivo de exemplo e suba para a pasta public:

```bash
cp public/_server_config.php.example public/_server_config.php
scp -P 22 public/_server_config.php pulodogato1@179.188.12.237:/home/storage/d/c3/95/pulodogato1/public_html/demand3/_server_config.php
```

### Passo 4 — Upload dos arquivos

**Core da aplicação → `/demand3/`:**
```bash
scp -r -P 22 app/ bootstrap/ config/ database/ resources/views/ routes/ storage/ vendor/ artisan composer.json composer.lock \
  pulodogato1@179.188.12.237:/home/storage/d/c3/95/pulodogato1/demand3/
```

**Pasta public → `/public_html/demand3/`:**
```bash
scp -r -P 22 public/ \
  pulodogato1@179.188.12.237:/home/storage/d/c3/95/pulodogato1/public_html/demand3/
```

### Passo 5 — Migrations

```bash
ssh -p 22 pulodogato1@179.188.12.237
cd /home/storage/d/c3/95/pulodogato1/demand3
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Passo 6 — Verificar permissões

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

---

## 3. Rollback

Se algo der errado após o deploy:

```bash
ssh -p 22 pulodogato1@179.188.12.237
cd /home/storage/d/c3/95/pulodogato1/demand3

# Desfazer última migration
php artisan migrate:rollback --step=1

# Limpar caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

Para rollback de código, reverta o commit no Git e faça um novo push para `main` — o CI/CD fará o redeploy automaticamente.

---

## 4. Estrutura de Arquivos no Servidor

```
/home/storage/d/c3/95/pulodogato1/
├── demand3/                          ← Core da aplicação
│   ├── .env                          ← Configuração (NÃO está no Git)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/views/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── artisan
│   ├── composer.json
│   └── composer.lock
│
└── public_html/
    └── demand3/                      ← Pasta pública (subdomínio)
        ├── _server_config.php        ← Define APP_BASE_PATH (NÃO está no Git)
        ├── index.php
        ├── .htaccess
        └── build/                    ← Assets compilados (JS/CSS)
            └── manifest.json
```

---

## 5. Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro 500 ao acessar o site | Verifique se o `.env` existe em `demand3/.env` e tem as credenciais corretas |
| Assets (CSS/JS) não carregam | Verifique se `public/build/manifest.json` existe na `public_html/demand3/build/` |
| Erro de banco de dados | Confirme host/user/senha no `.env`. Teste: `php artisan db:show` |
| Permissão negada | `chmod -R 775 storage/ bootstrap/cache/` |
| `_server_config.php` faltando | Verifique se o arquivo existe em `public_html/demand3/_server_config.php` |

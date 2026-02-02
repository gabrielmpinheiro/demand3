## Sistema de gerenciamento de demandas

API REST que irá gerenciar as demandas dos assinantes do SiteCare do Pulo do Gato.

# Tecnologias

- PHP 8.2
- Laravel 12
- MySQL 8.0
- Docker
- Git
- GitHub

Entidades do sistema:
- Clientes (assinantes do SiteCare e/ou clientes avulsos. Um cliente pode ter vários domínios e várias assinaturas)
    - Nome
    - Email
    - Telefone
    - Endereço
    - Cidade
    - Estado
    - CEP
    - CNPJ
    - CPF
    - Inscricao Estadual
    - Inscricao Municipal
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Domínios (Domínios dos clientes)
    - Nome
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Demandas (Demandas dos assinantes do site care - OU - demamndas para um cliente avulso)
    - Título
    - Descrição
    - Status
    - Quantidade de horas técnicas
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Usuários (Usuários do sistema)
    - Nome
    - Email
    - Senha
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Planos (Planos do SiteCare)
    - Nome
    - Descrição
    - Preço
    - Limite de horas técnicas
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Assinaturas (Assinaturas dos clientes)
    - Cliente
    - Domínio
    - Plano
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Pagamentos    
    - Cliente
    - Assinatura
    - Status (aberto, pago, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Suporte
    - Cliente
    - Demanda
    - Status (aberto, em andamento, concluído, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Notificações
    - Cliente
    - Demanda
    - Status (aberto, em andamento, concluído, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão
- Vault
    - Cliente
    - Domínio
    - Servico
    - Login
    - Senha
    - URL
    - Status (ativo, inativo, cancelado)
    - Data de criação
    - Data de atualização
    - Data de exclusão


## Regras do negócio
- Os planos são divididos da seguinte forma:
    - Starter: 0 horas técnicas
    - Basic: 2 horas técnicas
    - Growth: 6 horas técnicas
    - Enterprise: 10 horas técnicas
- Quando um cliente solicitar uma demanda:
    - Se ele tiver plano ativo, será descontado do plano
    - Se ele não tiver plano ativo, será cobrado o valor da demanda
    - Se ele tiver plano ativo, mas não tiver horas técnicas suficientes, será cobrado o valor excedente das horas técnicas de acordo com o valor hora do plano
    - Se ele tiver plano ativo, mas não possuir horas técnicas, será gerada uma cobrança do valor da demanda de acordo com o valor hora do plano.
    - Se o cliente não tiver nenhum plano ativo, será cobrado o valor integral da demanda.
    - O valor hora é de R$ 100,00 para quem não tem plano ativo.
    - O valor hora é de R$ 50,00 para quem tem plano ativo.
- As assinaturas são por domínio. Ou seja, um cliente pode ter várias assinaturas, uma para cada domínio.
- Quando um cliente solicita uma demanda, é criada uma notificação no sistema para os administradores.
- Os administradores podem aprovar, reprovar ou cancelar a demanda.
- O valor da fatura mensal é a soma dos valores das demandas do domínio entre o primeiro e o último dia de cada mês, o que irá gerar uma cobrança para o cliente. Essa cobrança será enviada por e-mail para o cliente.
- O Vault é um cofre para guardar senhas e logins de serviços que o cliente utiliza. O cliente pode adicionar, editar, excluir e visualizar os serviços que ele utiliza. O Vault é criptografado com a senha do cliente. O admin tem acesso ao vault do cliente.

# Ações:
    - Gere a infraestrutura para que o projeto funcione (docker)
    - Gere a estrutura inicial do projeto com as tabelas necessárias para o banco de dados.
    - Gere os modelos e migrations para o banco de dados.
    - Gere os controllers e rotas para o projeto.
    - Gere os testes para o projeto.
    - Gere a documentação do projeto.
    
    

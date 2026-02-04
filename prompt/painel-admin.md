## FrontEnd Painel Admin

 Com base na API REST que irá gerenciar as demandas dos assinantes do SiteCare do Pulo do Gato, iremos gerar o painel do Administrador, que irá funcionar em ambiente Web.

 O painel do administrador será composto pelas seguintes funcionalidades:
 - Login:
    - Será a primeira tela visível para o usuário
    - A tela deverá ter um design no desktop com um formulario de login à direita e o logo do SiteCare à esquerda. No mobile, o formulario de login deverá ser a segunda coisa visível e o logo do SiteCare deverá ser a primeira coisa visível.
    - Irá validar as credenciais do usuário com a API REST
    - Irá redirecionar o usuário para o dashboard
    - Deve ter uma função "esqueci a senha" que irá enviar um email para o usuário com um link para redefinir a senha.

 - Dashboard:
    - Será a primeira tela visível para o usuário após o login
    - Irá exibir um resumo geral do faturamento dos últimos 30 dias
    - Irá exibir um resumo geral das demandas dos últimos 30 dias
    - Irá exibir um resumo geral dos clientes dos últimos 30 dias    
    - Irá exibir um resumo geral das assinaturas dos últimos 30 dias
    - Terá uma barra de menus com os links para as funcionalidades do admin:
        - Gerenciar usuários (permite criar outros admins)
        - Gerenciar clientes (permite cadastrar novos clientes para a plataforma)
        - Gerenciar Domínios (permite adicionar domínios para os clientes)
        - Gerenciar Demandas (permite adicionar demandas para os clientes)        
        - Gerenciar Planos (permite adicionar ou remover planos)
        - Gerenciar Assinaturas (permite criar assinaturas para clientes)
        - Gerenciar Pagamentos (permite visualizar pagamentos)
        - Suporte (permite visualizar e interagir com demandas)
        - Notificações (permite visualizar e interagir com as notificações)
        - Vault (permite visualizar e interagir com o vault)

#   Regras
    - O painel do admin será responsivo e deverá funcionar em dispositivos móveis e desktop. Mas foi pensado para funcionar perfeitamente mobile first.
    - O painel do admin deverá ter um design moderno e atraente, com interações simples e intuitivas.
    - O esquema de cores do admin será em tonalidades de verde e cinza claro.
    - Obedecer as regras de negócio definidas na API REST.
    - a url de acesso deverá ser "/admpanel"
    - Para o frontEnd, utilize as tecnologias: React, Bootstrap 5, Tailwind CSS, JavaScript, HTML5, CSS3
    - O sistema deverá ser semelhante a um aplicativo mobile. Ou seja, deverá ter um menu lateral que poderá ser aberto e fechado, e um menu inferior que poderá ser acessado com o dedo.
    - O sistema irá utilizar a mesma instalação do Laravel onde está a API REST (monolito). Portanto as rotas do frontEnd deverão ser definidas no arquivo routes/web.php e as rotas da API REST deverão ser definidas no arquivo routes/api.php
    - O sistema precisa antecipar um outro frontEnd para clientes que será criado futuramente. Portanto, o frontEnd do admin deverá ser desenvolvido de forma que não atrapalhe o desenvolvimento do frontEnd do cliente. 
    
    
# Descrição das funcionalidades
    - Gerenciar usuários: Permitirá as ações básicas de CRUD (Create, Read, Update, Delete) nos usuários do sistema. 
    - Gerenciar clientes: Permitirá as ações básicas de CRUD, mas também uma visão geral dos domínios, assinaturas, demandas, pagamentos, utilização do suporte e vault. 
    - Gerenciar Domínios: Permitirá as ações básicas de crud, e permitirá adicionar, editar, excluir e visualizar os domínios dos clientes. 
    - Gerenciar demandas: O painel de demandas irá mostrar todas as demandas do sistema. Precisa funcionar de um jeito que os admnis possam filtrar as demandas por status, prazo, cliente, etc. Ao interagir com uma demanda, o admin poderá verificar os detalhes da demanda e marcá-la como concluída, reprovada ou cancelada. 
    - Gerenciar Planos: Permitirá as ações básicas de CRUD, mas também uma visão geral dos planos e suas assinaturas. 
    - Gerenciar Assinaturas: Permitirá as ações básicas de CRUD, mas também uma visão geral das assinaturas e seus clientes. 
    - Gerenciar Pagamentos: Permitirá visualizar os pagamentos do sistema, e poderá marcar como pago ou não pago, e uma visão geral do pagamento (cliente, plano, período, valor, status, etc)
    - Suporte: Permitirá as ações básicas de CRUD, mas também uma visão geral do suporte e suas demandas. 
    - Notificações: Permitirá visualizar as notificações do sistema, e poderá marcar como lida ou não lida, e uma visão geral da notificação (cliente, demanda, status, etc)
    - Vault: Permitirá as ações básicas de CRUD, mas também uma visão geral do vault e suas demandas. 


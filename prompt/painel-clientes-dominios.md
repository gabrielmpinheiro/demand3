# Implementação do módulo Clientes e Domínios - Demand3

- Com base nos padrões já estabelecidos no sistema e em nossa API, implemente o módulo clientes e domínios, fazendo as chamadas na API e criando as telas que faltam:
  - É preciso que a lista de clientes seja puxada da API, e que a API seja capaz de retornar os dados dos clientes.
  - Ao clicar em Novo Cliente, deve abrir um modal para cadastro de novos clientes.
  - Ao clicar em Editar, deve abrir um modal para edição de clientes.
  - Ao clicar em Excluir, o sistema pergunta se a pessoa tem certeza que deseja excluir o cliente, caso sim, o cliente é excluído.
  - Um domínio só pode ser excluído se o cliente não tiver nenhum plano ativo cadastrado.
  - Um cliente pode ter vários domínios, os domínios são únicos, outro cliente não pode usar um domínio que já está cadastrado. 
  - Deve ter um botão para gestão desses domínios pelo admin, que deve abrir um modal para cadastro, edição e exclusão de domínios.
  - As ações de cadastro, edição e exclusão devem ser feitas através da API.
  - Preciso que seja gerado log para eventos de erro nas ações de cadastro, edição e exclusão, e também para registrar casos de sucesso, salve em /demand3/logs/personal-logs/clientes.log
  - Verificar a responsividade das novas funcionalidades, se tanto no celular como no desktop estão funcionando corretamente.
  
# Implementação do módulo Planos - Demand3

- Com base nos padrões já estabelecidos no sistema e em nossa API, implemente o módulo planos, fazendo as chamadas na API e criando as telas que faltam:
  - É preciso que a lista de planos seja puxada da API, e que a API seja capaz de retornar os dados dos planos.
  - Ao clicar em Novo Plano, deve abrir um modal para cadastro de novos Planos.
  - Ao clicar em Editar, deve abrir um modal para edição de Planos.
  - Ao clicar em Excluir, o sistema pergunta se a pessoa tem certeza que deseja excluir o Plano, caso sim, o Plano é excluído.
  - Um plano só pode ser excluído se não houver nenhum cliente ativo no plano cadastrado.    
  - As ações de cadastro, edição e exclusão devem ser feitas através da API.
  - Preciso que seja gerado log para eventos de erro nas ações de cadastro, edição e exclusão, e também para registrar casos de sucesso, salve em /demand3/logs/personal-logs/Planos.log
  - Verificar a responsividade das novas funcionalidades, se tanto no celular como no desktop estão funcionando corretamente.
  
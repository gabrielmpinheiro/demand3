# Implementação do módulo Assinaturas - Demand3

- Com base nos padrões já estabelecidos no sistema e em nossa API, implemente o módulo assinaturas, fazendo as chamadas na API e criando as telas que faltam:
  - É preciso que a lista de assinaturas seja puxada da API, e que a API seja capaz de retornar os das assinaturas.
  - O botão Nova Assinatura, deve abrir uma modal para que o admin possa cadastrar uma nova assinatura. A assinatura é atribuida a um cliente e um domínio, e deverá também selecionar o plano. A assinatura precisa ter uma data de início, para contagem do valor do plano.
  - Ao clicar em Editar, deve abrir um modal para edição da assinatura. 
  - Ao clicar em Excluir, o sistema pergunta se a pessoa tem certeza que deseja excluir a assinatura, caso sim, ela é excluida.
  - Uma assinatura só pode ser excluída se não houver nenhum pagamento vinculado a ela em atraso. Se houver pagamentos em atraso, o sistema deve mostrar uma mensagem informando que a assinatura não pode ser excluída.
  - As ações de cadastro, edição e exclusão devem ser feitas através da API.
  - Preciso que seja gerado log para eventos de erro nas ações de cadastro, edição e exclusão, e também para registrar casos de sucesso, salve em /demand3/logs/personal-logs/assinaturas.log
  - Verificar a responsividade das novas funcionalidades, se tanto no celular como no desktop estão funcionando corretamente.
  
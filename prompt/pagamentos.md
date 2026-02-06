# Implementação do módulo Pagamentos - Demand3

- Com base nos padrões já estabelecidos no sistema e em nossa API, implemente o módulo pagamentos, fazendo as chamadas na API e criando as telas que faltam:
  - É preciso que a lista de pagamentos seja puxada da API, e que a API seja capaz de retornar os dados dos pagamentoss.
  - Ao clicar em Novo pagamentos, deve abrir um modal que o admin possa registrar um pagamento manualmente. O pagamento deve ter um valor(valor do plano + valor de horas avulsas), uma data de pagamento, uma forma de pagamento, e uma assinatura vinculada e o período de pagamento. Caso seja uma demanda avulsa, não precisa ter uma assinatura vinculada.    
  - A partir da data de inicio da assinatura, no último dia de cada mês deve ser gerado um pagamento em aberto para o cliente.
  - Quando um pagamento é registrado para uma determinada assinatura, e o status muda para pago, o sistema deve calcular o saldo de horas do cliente, subtraindo as horas do plano e adicionando as horas avulsas.
  - O saldo de horas reseta para o valor padrão no início de cada mês.
  - Ao clicar em Editar, deve abrir um modal para edição de pagamentos.
  - Ao clicar em Excluir, o sistema pergunta se a pessoa tem certeza que deseja excluir o pagamento, caso sim, o pagamento é excluído.
  - Um pagamento não pode ser excluído, mas pode ser cancelado, desde que esteja em aberto.
  - As ações de cadastro, edição e exclusão devem ser feitas através da API.
  - Preciso que seja gerado log para eventos de erro nas ações de cadastro, edição e exclusão, e também para registrar casos de sucesso, salve em /demand3/logs/personal-logs/pagamentos.log
  - Verificar a responsividade das novas funcionalidades, se tanto no celular como no desktop estão funcionando corretamente.
  
# Manual do Sistema - Demand3

O Demand3 é um sistema de gerenciamento de demandas técnicas para clientes com serviços de manutenção e hospedagem. O sistema gerencia assinaturas de planos, faturamento de horas técnicas e controle de credenciais.

## 🏗️ Estrutura de Entidades

O sistema é construído sobre as seguintes entidades principais:

### 1. Usuários (`User`)
- Responsáveis pelo acesso ao sistema (gestores e administradores).
- Administradores têm permissões totais, incluindo registro de novos usuários.

### 2. Clientes (`Cliente`)
- A entidade principal que agrupa domínios, assinaturas e demandas.
- Possuem dados cadastrais como CNPJ/CPF, endereço e contato.

### 3. Domínios (`Dominio`)
- Web sites ou serviços vinculados a um cliente.
- Cada domínio pode ter uma **Assinatura** ativa.

### 4. Planos e Assinaturas (`Plano` e `Assinatura`)
- **Planos**: Definem o limite de horas técnicas mensais inclusas, o preço da mensalidade e o valor da hora excedente.
- **Assinaturas**: Representam o vínculo entre um Cliente (em um respectivo Domínio) e um Plano. Gerencia a quantidade de `horas_disponiveis` no ciclo atual.

### 5. Demandas (`Demanda`)
- Solicitações técnicas realizadas para um domínio.
- Controlam o consumo de horas e o faturamento do serviço.

### 6. Pagamentos (`Pagamento`)
- Registros financeiros de faturas mensais ou cobranças avulsas de demandas sem plano.

### 7. Vault - Cofre de Senhas (`Vault`)
- Armazenamento seguro de credenciais (login, senha, URL) para suporte aos domínios.

---

## 🛠️ Regras de Negócio e Fluxos

### 1. Cálculo de Horas Técnicas e Valor da Demanda
A lógica de faturamento é processada automaticamente no momento da criação da demanda (`Demanda::calcularValor()`):

- **Sem Plano Ativo**:
  - Se o domínio não possuir uma assinatura ativa, a demanda é cobrada integralmente.
  - O valor padrão é **R$ 100,00 por hora**.
- **Com Plano Ativo**:
  - O sistema tenta descontar as horas da demanda das `horas_disponiveis` na assinatura.
  - **Horas Inclusas**: Se houver horas no plano, o custo da demanda é R$ 0,00 (coberto pela mensalidade).
  - **Horas Excedentes**: Se a demanda superar as horas disponíveis, o excedente é cobrado com base no `valor_hora` definido no plano.

### 2. Ciclo de Vida da Demanda
Os status possíveis para uma demanda são:
- `pendente`: Aguardando início ou aprovação.
- `em_andamento`: Trabalho sendo executado.
- `concluido`: Trabalho finalizado e pronto para faturamento.
- `cancelado`: Trabalho interrompido (pode estornar horas ao plano se não houver cobrança).

### 3. Faturamento Mensal
O sistema permite gerar uma "Fatura Mensal" para o cliente buscando todas as demandas concluídas no período (`referencia_mes`) que ainda não foram cobradas.
- O pagamento é criado com status `aberto`.
- Ao marcar como `pago`, a data de pagamento é registrada.

### 4. Suporte e Notificações
- **Suporte**: Tickets vinculados a demandas específicas para comunicação entre o cliente e a equipe técnica.
- **Notificações**: Alertas automáticos enviados aos administradores e usuários sobre novas demandas, alterações de status ou pagamentos.

---

## 🔒 Segurança (Vault)
- Credenciais no cofre são vinculadas a um cliente e domínio.
- Senhas são armazenadas de forma segura e só podem ser reveladas por usuários com permissões administrativas.

---

## 🚀 Como Operar o Sistema (Resumo)
1. **Cadastre o Cliente** e seus respectivos **Domínios**.
2. **Defina os Planos** disponíveis (ex: Plano 5h, Plano 10h).
3. **Crie a Assinatura** para o domínio do cliente, escolhendo o plano.
4. **Registre as Demandas** conforme as solicitações chegarem. O sistema cuidará do saldo de horas.
5. **Gere a Fatura** ao final do mês para consolidar os valores excedentes e horas técnicas cobradas.

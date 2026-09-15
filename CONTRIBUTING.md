# Guia de Contribuição (Contributing)

Bem-vindo ao projeto do Ministério de Louvor! Siga o padrão abaixo para gerenciar o ciclo de vida do código.

## Padrão de Fluxo de Trabalho (Workflow)

O gerenciamento de código, novas implementações, correções e deploys deve seguir obrigatoriamente a seguinte dinâmica:

### 1. Criação de Issues
Nenhum código deve ser escrito sem uma Issue correspondente. 
- Para **qualquer** tarefa (Nova Funcionalidade, Correção/Fix ou Melhoria), crie primeiro uma Issue no GitHub.
- Descreva o escopo e o problema a ser resolvido.

### 2. Criação da Branch
Nunca trabalhe diretamente na branch `main`.
A partir da branch `main`, crie uma nova branch para a tarefa.
Padrão de nomenclatura:
- `feature/<numero-da-issue>-<descricao>` (ex: `feature/10-login-screen`)
- `fix/<numero-da-issue>-<descricao>` (ex: `fix/11-cors-error`)
- `chore/<numero-da-issue>-<descricao>` (ex: `chore/12-update-deps`)

### 3. Pull Requests (PRs) e Deploys
- Ao terminar a tarefa, faça o push da sua branch e abra um **Pull Request (PR)** contra a branch `main`.
- **OBRIGATÓRIO**: A descrição do Pull Request deve mencionar o número da Issue que ele resolve. Use as palavras-chave do GitHub (ex: `Resolves #10`, `Fixes #11`, `Closes #12`).
- O merge do PR na branch `main` será a ação que gerenciará o Deploy para o ambiente de produção.

Ao adotar este padrão, garantimos rastreabilidade, controle de qualidade e a preparação para integração contínua (CI/CD).

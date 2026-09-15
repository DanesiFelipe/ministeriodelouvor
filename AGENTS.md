# Regras para Agentes de IA

Este arquivo define os padrões de fluxo de trabalho (workflow) que todos os agentes de IA devem seguir obrigatoriamente ao trabalhar neste repositório.

## Gerenciamento de Tarefas (Issues e Pull Requests)

1. **Issues Obrigatórias**:
   - Antes de iniciar qualquer trabalho (seja correção de bug, melhoria ou nova funcionalidade), você **DEVE** garantir que exista uma Issue aberta no GitHub correspondente a essa tarefa.
   - Se a Issue não existir, você deve solicitar ao usuário para criá-la (ou usar a CLI do GitHub `gh` para criá-la, caso esteja disponível).

2. **Fluxo de Branches e Pull Requests (PRs)**:
   - Todo o desenvolvimento deve ser feito em uma nova branch, e **NUNCA** diretamente na branch `main`.
   - O formato do nome da branch deve ser: `tipo/numero-da-issue-descricao-curta`. Ex: `feature/12-autenticacao-jwt` ou `fix/15-erro-cors`.
   - Ao finalizar a tarefa, o código deve ser "commitado" (com uma mensagem clara) e enviado (`push`) para a origin.
   - Um Pull Request (PR) deve ser aberto no GitHub para a branch `main`.

3. **Vínculo entre PR e Issue**:
   - Na descrição do Pull Request (ou na mensagem de commit que encerra a tarefa), você **DEVE** mencionar a Issue correspondente utilizando as palavras-chave do GitHub para que ela seja fechada automaticamente no merge (exemplo: `Resolves #12`, `Fixes #15`, `Closes #18`).

Siga estritamente essas regras.

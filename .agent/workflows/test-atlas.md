---
description: Avalia o progresso do ContextAtlas e testa as ferramentas MCP.
---

# Ferramentas do MCP do ContextAtlas
Aqui estão todas as ferramentas que desenvolvemos no servidor (`src/MCP/server.ts`) e o que elas esperam. Use esta lista como referência quando formos testar ou implementar novas lógicas:

- `find_symbol(symbol: string)`: Encontra entidades exatas (funções, classes).
- `search_symbol(query: string)`: Busca de código por string parcial.
- `expand_node(nodeId: string, depth: number)`: Navega até X níveis pelo grafo (Breadth-First Search).
- `get_file(path: string)`: Retorna o arquivo de texto em disco.
- `trace_callers(functionName: string)`: Descobre quem depende/chama essa função (arestas invertidas).
- `trace_callees(nodeId: string)`: Descobre as dependências que a função chama.
- `create_reasoning_context_graph(...)`: Registra os pensamentos do Claude/agente (decisões, bugs, test plans) no `reasoningGraph`.
- `save_code_change(...)`: Grava qualquer alteração feita nos arquivos no `changesGraph`.
- `get_file_history(file, nodeType)`: Retorna o histórico de alterações que aquele arquivo sofreu.
- `get_all_changes()`: Apresenta uma timeline de mudanças do projeto inteiro.
- `find_bugs_by_file(file)`: Filtra registros de "bug" do `reasoningGraph` de um arquivo específico.

---
### O que fazer quando eu rodar a skill `/test-atlas`
Siga estes passos estritamente para simular o uso do ContextAtlas:

//turbo-all
1. Execute `bunx tsc --noEmit` para verificar se nossa camada TypeScript está 100% livre de erros (já que o MCP é rigoroso com schemas/tipagens Zod).

2. Leia o arquivo `src/MCP/server.ts` rapidamente apenas para verificar se o registro de rotas do Zod está válido.

3. Construa uma resposta informando quantas ferramentas MCP temos implementadas, confirme se a validação TypeScript de todas passou com sucesso e ofereça para criar um pequeno script que invoque (execute localmente simulando o MCP) alguma ferramenta escolhida.

4. Utilize a tool que seja mais adequada ao contexto da conversa atual, sempre visando em armazenar o contexto da melhor forma possível. 
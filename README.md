# ContextAtlas

> **🇺🇸 English** | [🇧🇷 Português](#-português)

ContextAtlas is an MCP Server that captures not just syntax, but the **agent's reasoning**, building a temporal and structural memory of the entire development session for any AI Agent compatible with the MCP protocol (Cursor, Claude Desktop, Windsurf, Devin, etc).

## 🚀 Quick Start

Add ContextAtlas to your favorite MCP client's configuration file (e.g., `claude_desktop_config.json` for Claude Desktop or your editor's settings):

```json
"mcpServers": {
  "contextatlas": {
    "command": "npx",
    "args": [
      "-y",
      "@contextatlas/core@latest",
      "mcp-atlas"
    ]
  }
}
```

*After restarting your MCP client, your AI Agent immediately gains ContextAtlas capabilities!*

---

## 🛠️ Available AI Tools

With ContextAtlas active, the AI Agent gains the following tools:

- **`find_symbol`**: Quickly locates classes, methods, and functions by name across the entire project.
- **`trace_callers`**: Discovers who depends on function X (avoiding breaking existing code!).
- **`trace_callees`**: Understands what a complex piece of code depends on internally.
- **`expand_node`**: Navigates dependency graph connections via relational search (BFS).
- **`save_code_change`**: The agent automatically "saves" to persistent memory that it modified a file, to remember it in future context.
- **`create_reasoning_context_graph`**: Saves temporal reasoning so that another agent (weeks later) knows *why* it built the code that way.
- **`semantic_search`**: Finds the graph nodes that best match a natural language query using embeddings.
- **`get_impact`**: Returns impact weights from modified nodes to assess blast radius of changes.

---

## Overview

The goal is to create a local tool capable of building a **project and agent interaction context graph** to provide real structural context to AI agents that edit code.

It solves three key problems present in current tools:

- Limited understanding of the actual code structure
- Lack of structured memory of the agent's reasoning
- Difficulty integrating context via standardized protocols

The system builds a **Context Graph**, where:

- Code
- User prompts
- Agent reasoning
- Tool calls
- Code changes

are represented as **nodes and edges**.

This allows the agent to understand:

- Real project dependencies
- Impact of changes
- Decision history
- Development session flow

---

## Core Concept

The tool maintains a **living graph of the project**.

It is not just:

- AST
- Embeddings
- Text indexing

It combines three main layers:

| Layer | Purpose |
|---|---|
| **Code Graph** | Structural relationships between files, functions, classes, imports |
| **Reasoning Graph** | Agent thoughts, decisions, plans, and observations |
| **Change Graph** | Temporal log of every code modification and its rationale |

---

## Graph Structure

### Node Types

Every relevant entity becomes a node.

**Code Structure:** `File` · `Module` · `Function` · `Class` · `Interface` · `Import` · `Export`

**AI Interactions:** `UserPrompt` · `AgentThought` · `ToolCall` · `CodeChange`

### Relationship Types

Edges capture dependency and flow.

**Code Relations:** `IMPORTS` · `EXPORTS` · `CALLS` · `IMPLEMENTS` · `DEFINES`

**Interaction Relations:** `GENERATED_BY` · `THINKS` · `CALLS_TOOL` · `MODIFIES` · `RELATED_TO_PROMPT`

---

## Graph Example

User sends the prompt:

> fix the login bug

The agent executes the following flow:

1. Analyzes the problem
2. Decides to investigate a file
3. Reads the file
4. Applies a patch

Resulting structure:

```
UserPrompt
 └── AgentThought
      └── ToolCall(read_file)
           └── CodeChange
                └── modifies → auth.service.ts
                     └── calls → jwt.util.ts
```

This creates **structured memory of the development session**.

---

## License

MIT

---

---

# 🇧🇷 Português

O ContextAtlas é um Servidor MCP que captura não apenas a sintaxe, mas o **raciocínio do agente**, e constrói uma memória temporal e estrutural de toda a sessão de desenvolvimento para qualquer Agente de IA compatível com o protocolo MCP (Cursor, Claude Desktop, Windsurf, Devin, etc).

## 🚀 Quick Start (Instalação)

Basta adicionar o ContextAtlas ao arquivo de configuração do seu cliente MCP favorito (por exemplo, `claude_desktop_config.json` para o Claude Desktop ou nas configurações do seu editor):

```json
"mcpServers": {
  "contextatlas": {
    "command": "npx",
    "args": [
      "-y",
      "@contextatlas/core@latest",
      "mcp-atlas"
    ]
  }
}
```

*Após reiniciar o seu cliente MCP, o seu Agente de IA imediatamente ganha as capacidades do ContextAtlas!*

---

## 🛠️ Ferramentas Disponíveis na IA

Com o ContextAtlas ativo, o Agente de IA ganha as seguintes tools:

- **`find_symbol`**: Localiza rapidamente classes, métodos e funções pelo nome no projeto todo.
- **`trace_callers`**: Descobre quem depende da função X (evitando quebrar código existente!).
- **`trace_callees`**: Entende de quem um código complexo depende internamente.
- **`expand_node`**: Navega pelas conexões do grafo de dependências via busca relacional (BFS).
- **`save_code_change`**: O agente "salva" automaticamente para a memória persistente que modificou o arquivo para lembrar disso no futuro do contexto.
- **`create_reasoning_context_graph`**: Salva o raciocínio temporal para que outro agente (semanas depois) saiba o "*por que*" ele construiu o código daquele jeito.
- **`semantic_search`**: Encontra os nós do grafo que melhor correspondem a uma consulta em linguagem natural usando embeddings.
- **`get_impact`**: Retorna os pesos de impacto dos nós modificados para avaliar o raio de explosão das mudanças.

---

## Visão Geral

A proposta é criar uma ferramenta local capaz de construir um **grafo de contexto do projeto e das interações do agente** para fornecer contexto estrutural real a agentes de IA que editam código.

O objetivo é resolver três problemas principais presentes nas ferramentas atuais:

- Entendimento limitado da estrutura real do código
- Ausência de memória estruturada do raciocínio do agente
- Dificuldade de integrar contexto via protocolos padronizados

O sistema constrói um **Context Graph**, no qual:

- Código
- Prompts do usuário
- Raciocínio do agente
- Chamadas de ferramentas
- Mudanças no código

são representados como **nós e arestas**.

Isso permite que o agente compreenda:

- Dependências reais do projeto
- Impacto de mudanças
- Histórico de decisões
- Fluxo de desenvolvimento da sessão

---

## Conceito Central

A ferramenta mantém um **grafo vivo do projeto**.

Ele não é apenas:

- AST
- Embeddings
- Indexação textual

Ele combina três camadas principais:

| Camada | Propósito |
|---|---|
| **Code Graph** | Relacionamentos estruturais entre arquivos, funções, classes, imports |
| **Reasoning Graph** | Pensamentos, decisões, planos e observações do agente |
| **Change Graph** | Log temporal de cada modificação de código e sua justificativa |

---

## Estrutura do Grafo

### Tipos de Nós

Cada entidade relevante vira um nó.

**Estrutura do Código:** `File` · `Module` · `Function` · `Class` · `Interface` · `Import` · `Export`

**Interações com IA:** `UserPrompt` · `AgentThought` · `ToolCall` · `CodeChange`

### Tipos de Relações

As arestas capturam dependência e fluxo.

**Relações de Código:** `IMPORTS` · `EXPORTS` · `CALLS` · `IMPLEMENTS` · `DEFINES`

**Relações de Interação:** `GENERATED_BY` · `THINKS` · `CALLS_TOOL` · `MODIFIES` · `RELATED_TO_PROMPT`

---

## Exemplo de Grafo

Usuário envia o prompt:

> corrija bug no login

O agente executa o seguinte fluxo:

1. Analisa o problema
2. Decide investigar um arquivo
3. Lê o arquivo
4. Aplica um patch

Estrutura resultante:

```
UserPrompt
 └── AgentThought
      └── ToolCall(read_file)
           └── CodeChange
                └── modifies → auth.service.ts
                     └── calls → jwt.util.ts
```

Isso cria **memória estruturada da sessão de desenvolvimento**.

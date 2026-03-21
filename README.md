# ContextAtlas

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

---

# Visão Geral Teórica

A proposta é criar uma ferramenta local capaz de construir um **grafo de contexto do projeto e das interações do agente** para fornecer contexto estrutural real a agentes de IA que editam código.

O objetivo é resolver três problemas principais presentes nas ferramentas atuais:

- entendimento limitado da estrutura real do código
- ausência de memória estruturada do raciocínio do agente
- dificuldade de integrar contexto via protocolos padronizados

O sistema constrói um **Context Graph**, no qual:

- código
- prompts do usuário
- raciocínio do agente
- chamadas de ferramentas
- mudanças no código

são representados como **nós e arestas**.

Isso permite que o agente compreenda:

- dependências reais do projeto
- impacto de mudanças
- histórico de decisões
- fluxo de desenvolvimento da sessão

---

# Conceito Central

A ferramenta mantém um **grafo vivo do projeto**.

Ele não é apenas:

- AST
- embeddings
- indexação textual

Ele combina três camadas principais:

Code Graph  
Reasoning Graph  
Change Graph

---

# Estrutura do Grafo

## Tipos de Nós

Cada entidade relevante vira um nó.

### Estrutura do Código

File  
Module  
Function  
Class  
Interface  
Import  
Export  

### Interações com IA

UserPrompt  
AgentThought  
ToolCall  
CodeChange  

---

## Tipos de Relações

As arestas capturam dependência e fluxo.

### Relações de Código

IMPORTS  
EXPORTS  
CALLS  
IMPLEMENTS  
DEFINES  

### Relações de Interação

GENERATED_BY  
THINKS  
CALLS_TOOL  
MODIFIES  
RELATED_TO_PROMPT  

---

# Exemplo de Grafo

Usuário envia o prompt:

corrija bug no login

O agente executa o seguinte fluxo:

1. analisa o problema  
2. decide investigar um arquivo  
3. lê o arquivo  
4. aplica um patch  

Estrutura resultante:

UserPrompt  
 └── AgentThought  
      └── ToolCall(read_file)  
           └── CodeChange  
                └── modifies → auth.service.ts  
                     └── calls → jwt.util.ts  

Isso cria **memória estruturada da sessão de desenvolvimento**.

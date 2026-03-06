# Visão Geral

A proposta é criar um SDK local capaz de construir um **grafo de contexto do projeto e das interações do agente** para fornecer contexto estrutural real a agentes de IA que editam código.

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

O SDK mantém um **grafo vivo do projeto**.

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

---
description: Como atualizar a versão e publicar o pacote no NPM 
---


Siga estes passos exatamente nesta ordem:
1. Rode `npm run build` para garantir que o projeto está compilado e sem erros de TypeScript.
2. Atualize a versão do `package.json` rodando `npm version patch`.
// turbo
3. Faça o commit: `git commit -am "chore: release nova versão"`
// turbo
4. Publique rodando `npm publish`

# BuggyTrip — Front-end React

Aplicação React para avaliações de passeios BuggyTrip, construída com Vite.

## Requisitos

- Node.js 20.19+ ou 22.12+.
- npm.

## Desenvolvimento

Instale as dependências e inicie o servidor:

```sh
npm install
npm run dev
```

O servidor Vite inicia em `http://localhost:5173` e encaminha as chamadas
`/api` para `http://localhost:8080`. Para outra URL da API, defina
`VITE_API_URL` em um arquivo `.env.local`.

## Build e pré-visualização

```sh
npm run build
npm run preview
```

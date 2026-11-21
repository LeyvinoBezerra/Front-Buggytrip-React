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

O servidor Vite inicia em `http://localhost:5173`. A aplicação usa dados
mockados no navegador e não precisa de uma API ou backend.

### Contas de demonstração

- Cliente: `cliente@buggytrip.local` / `Cliente@123`
- Administrador: `admin@buggytrip.local` / `Admin@123`

As avaliações, contas e bugueiros criados são salvos no `localStorage` do
navegador. Para restaurar os dados de exemplo, limpe os dados do site no
navegador.

## Build e pré-visualização

```sh
npm run build
npm run preview
```

# Sistema de Itinerantes — DPE-GO

Sistema web de gerenciamento de eventos itinerantes da Defensoria Pública do Estado de Goiás.

## Stack

- **Frontend**: React + TypeScript + Vite + TanStack Query + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de dados**: PostgreSQL via Drizzle ORM
- **Autenticação**: Passport.js (local strategy) + express-session + connect-pg-simple

## Rodando o projeto

O workflow `Start application` executa `npm run dev`, que sobe o Express na porta 5000 servindo tanto a API quanto o frontend via Vite.

## Arquitetura

```
server/
  index.ts            — Entry point: configura sessão, passport, middlewares
  auth.ts             — Estratégia Passport (local) e serialização de sessão
  routes.ts           — Rotas da API com controle de acesso por perfil
  storage.ts          — Camada de acesso ao banco (interface IStorage + DatabaseStorage)
  db.ts               — Conexão Drizzle ORM

shared/
  schema.ts           — Tabelas, schemas de inserção e tipos TypeScript
  routes.ts           — Definição tipada das rotas da API (contratos)

client/src/
  App.tsx             — Roteamento, AuthProvider, guards de rota
  pages/
    dashboard.tsx     — Painel principal
    login.tsx         — Tela de login
    nao-encontrado.tsx — Página 404
    calendario/       — Calendário mensal de eventos
    eventos/          — Lista e detalhe de eventos
    equipamentos/     — Gerenciamento de equipamentos
    tecnicos/         — Lista de técnicos/servidores
    administracao/    — Área admin (gerenciar usuários)
  hooks/              — use-autenticacao, use-eventos, use-equipamentos, use-usuarios
  components/         — Layout (sidebar + header), badges-status, paginacao-tabela
```

## Rotas do sistema

| URL | Página |
|---|---|
| `/` | Painel (dashboard) |
| `/calendario` | Calendário de eventos |
| `/eventos` | Lista de eventos itinerantes |
| `/eventos/:id` | Detalhe de um evento |
| `/equipamentos` | Gerenciamento de equipamentos |
| `/tecnicos` | Lista de técnicos/servidores |
| `/administracao/usuarios` | Gerenciar usuários (admin only) |

## Perfis de Acesso

| Perfil | Role | Acesso |
|---|---|---|
| Administrador | `admin` | Total: eventos, equipamentos, usuários, relatórios |
| Suporte TI | `technician` | Eventos e equipamentos (sem gerenciar usuários) |
| Almoxarifado | `almoxarifado` | Eventos e equipamentos (sem gerenciar usuários) |
| Defensor(a) | `defender` | Somente leitura — apenas eventos |
| Assessor(a) | `advisor` | Somente leitura — apenas eventos |

## Credenciais padrão (ambiente de desenvolvimento)

| Usuário | Senha | Perfil |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `joao.ti` | `password` | Suporte TI |
| `admin.almo` | `password` | Almoxarifado |

## Fluxo de Status de Equipamentos

`Solicitado → Em Teste → Pronto → Enviado → Retornado`

## Tema Visual

Verde institucional DPE-GO: `hsl(152, 70%, 22%)` — aplicado na sidebar e elementos primários.

## Documentação

- `COMO-RODAR.md` — Passo a passo para rodar o projeto localmente
- `DOCUMENTACAO.md` — Explicação detalhada do sistema e do código

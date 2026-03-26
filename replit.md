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
  index.ts      — Entry point: configura sessão, passport, middlewares
  auth.ts       — Estratégia Passport (local) e serialização de sessão
  routes.ts     — Rotas da API com controle de acesso por perfil
  storage.ts    — Camada de acesso ao banco (interface IStorage + DatabaseStorage)
  db.ts         — Conexão Drizzle ORM

shared/
  schema.ts     — Tabelas, schemas de inserção e tipos TypeScript
  routes.ts     — Definição tipada das rotas da API (contratos)

client/src/
  App.tsx       — Roteamento, AuthProvider, guards de rota
  pages/        — Dashboard, Eventos, Equipamentos, Técnicos, Login
  hooks/        — use-auth, use-events, use-equipment, use-users
  components/   — Layout (sidebar + header), TablePager, StatusBadges
```

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

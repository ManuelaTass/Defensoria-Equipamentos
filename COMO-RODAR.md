# Como Rodar o Projeto Localmente

Sistema de Itinerantes — Defensoria Pública do Estado de Goiás

---

## Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

- **Node.js** versão 20 ou superior → https://nodejs.org
- **PostgreSQL** versão 14 ou superior → https://www.postgresql.org/download/
- **npm** (já vem junto com o Node.js)
- **Git** → https://git-scm.com

---

## Passo 1 — Clonar o Repositório

Abra o terminal e execute:

```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-itinerantes
```

---

## Passo 2 — Instalar as Dependências

Com o terminal dentro da pasta do projeto, execute:

```bash
npm install
```

Isso vai instalar todas as bibliotecas necessárias automaticamente.

---

## Passo 3 — Configurar o Banco de Dados

### 3.1 — Criar o banco no PostgreSQL

Abra o terminal do PostgreSQL (`psql`) e crie o banco:

```sql
CREATE DATABASE itinerantes;
```

### 3.2 — Configurar as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@localhost:5432/itinerantes
SESSION_SECRET=uma_chave_secreta_longa_e_aleatoria_aqui
```

Substitua `USUARIO` e `SENHA` pelo usuário e senha do seu PostgreSQL.

**Exemplo:**
```env
DATABASE_URL=postgresql://postgres:minhasenha@localhost:5432/itinerantes
SESSION_SECRET=dpegoSecretKey2024XyZ987
```

---

## Passo 4 — Criar as Tabelas no Banco

Execute o comando abaixo para criar as tabelas automaticamente:

```bash
npm run db:push
```

Se der algum problema, tente:
```bash
npm run db:push --force
```

---

## Passo 5 — Rodar o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Você verá no terminal algo assim:
```
11:00:00 AM [express] serving on port 5000
```

Agora abra o navegador e acesse: **http://localhost:5000**

---

## Passo 6 — Fazer Login

Na tela de login, use as credenciais padrão:

| Usuário | Senha | Perfil |
|---|---|---|
| `admin` | `admin123` | Administrador (acesso total) |
| `joao.ti` | `password` | Suporte TI |
| `admin.almo` | `password` | Almoxarifado |

> **Importante:** Troque as senhas padrão após o primeiro acesso em produção.

---

## Comandos Úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run db:push` | Sincroniza o banco de dados com o esquema |
| `npm run build` | Gera a versão de produção |
| `npm start` | Inicia o servidor em modo de produção |

---

## Problemas Comuns

**Erro: "Cannot connect to database"**
- Verifique se o PostgreSQL está rodando
- Confira se o `DATABASE_URL` no `.env` está correto

**Erro: "Port 5000 already in use"**
- Algum outro programa está usando a porta 5000
- Encerre o processo ou mude a porta no arquivo `server/index.ts`

**Erro: "Table does not exist"**
- Execute `npm run db:push` para criar as tabelas

---

## Estrutura de Pastas

```
/
├── client/          → Frontend (React + TypeScript)
│   └── src/
│       ├── pages/   → Páginas da aplicação
│       ├── hooks/   → Lógica de dados
│       └── components/ → Componentes reutilizáveis
├── server/          → Backend (Node.js + Express)
├── shared/          → Código compartilhado (esquemas e rotas)
└── COMO-RODAR.md   → Este arquivo
```

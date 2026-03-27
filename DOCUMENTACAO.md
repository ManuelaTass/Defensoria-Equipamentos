# Documentação do Sistema de Itinerantes

**Defensoria Pública do Estado de Goiás — DPE-GO**

---

## O que é este sistema?

O **Sistema de Itinerantes** é uma aplicação web desenvolvida para gerenciar os **eventos itinerantes** da Defensoria Pública do Estado de Goiás. Esses eventos são atendimentos realizados fora da sede, em cidades do interior ou regiões periféricas, onde uma equipe de servidores e equipamentos de TI é deslocada para atender a população.

O sistema permite:
- Planejar e acompanhar eventos itinerantes
- Controlar o estoque e uso de equipamentos
- Alocar técnicos de TI para cada evento
- Acompanhar o fluxo de status dos equipamentos
- Visualizar os eventos em um calendário mensal

---

## Perfis de Usuário

| Perfil | O que pode fazer |
|---|---|
| **Administrador** | Acesso total: criar, editar e excluir tudo, incluindo usuários |
| **Suporte TI** | Gerenciar eventos e equipamentos (não gerencia usuários) |
| **Almoxarifado** | Gerenciar eventos e equipamentos (não gerencia usuários) |
| **Defensor(a)** | Apenas visualizar eventos (somente leitura) |
| **Assessor(a)** | Apenas visualizar eventos (somente leitura) |

---

## Módulos do Sistema

### 1. Painel (Dashboard)
Tela inicial com um resumo rápido do sistema:
- Quantidade de eventos em andamento e planejados
- Equipamentos em uso
- Total de servidores cadastrados
- Lista dos eventos mais recentes com status colorido

### 2. Calendário
Visualização mensal dos eventos:
- Cada dia do calendário mostra barras coloridas indicando os eventos ativos naquele período
- Clique em um dia para ver os eventos daquele dia no painel lateral
- Cor amarela = Planejamento, Azul = Em Andamento, Verde = Concluído
- Permite criar um novo evento diretamente pelo calendário

### 3. Eventos Itinerantes
Lista completa de todos os eventos:
- Filtros por status (Planejamento, Em Andamento, Concluído, Cancelado)
- Busca por nome ou local
- Criação de novos eventos com formulário detalhado
- Acesso ao detalhe de cada evento

#### Detalhe do Evento
Tela completa de um evento específico contendo:
- **Informações gerais**: nome, local, datas, status, número do processo, link do GLPI
- **Aba Equipamentos**: lista de equipamentos alocados com fluxo de status:
  `Solicitado → Em Teste → Pronto → Enviado → Retornado`
- **Aba Técnicos Defensores**: defensores participantes do evento
- **Aba Suporte TI**: técnicos de TI alocados, com controle de chamado GLPI criado
- **Aba Resumo**: visão consolidada dos equipamentos e técnicos

### 4. Equipamentos
Cadastro de todo o parque de equipamentos de TI:
- Notebook, impressora, switch, desktop, etc.
- Cada equipamento tem: nome, número de série, status e localização
- Status disponíveis: `Disponível`, `Em Uso`, `Manutenção`, `Emprestado`

### 5. Técnicos
Lista de todos os servidores cadastrados no sistema:
- Filtro por perfil (Defensores/Assessores ou TI/Almoxarifado)
- Permite criar, editar e excluir servidores

### 6. Gerenciar Usuários (apenas Admin)
Área exclusiva do administrador para:
- Ver todos os usuários cadastrados
- Criar novos usuários com login, senha e perfil de acesso
- Editar dados e trocar senha de qualquer usuário
- Remover usuários do sistema

---

## Como o Código Funciona

### Arquitetura Geral

O sistema é dividido em três camadas principais:

```
Frontend (React) ←→ Backend (Express) ←→ Banco de Dados (PostgreSQL)
```

### Backend (`server/`)

| Arquivo | Função |
|---|---|
| `index.ts` | Ponto de entrada: inicializa o Express, configura sessão e autenticação |
| `auth.ts` | Define como o login funciona (Passport.js com estratégia local) |
| `routes.ts` | Define todas as rotas da API (endpoints HTTP) |
| `storage.ts` | Camada de acesso ao banco de dados (todas as consultas SQL ficam aqui) |
| `db.ts` | Conexão com o PostgreSQL via Drizzle ORM |

**Fluxo de uma requisição:**
1. Frontend faz uma chamada HTTP (ex: `GET /api/eventos`)
2. O Express verifica se o usuário está autenticado (`requireAuth`)
3. Verifica se o usuário tem permissão (`requireRole`)
4. O controlador na rota chama o Storage
5. O Storage executa a query no banco
6. O resultado é retornado como JSON para o frontend

### Shared (`shared/`)

| Arquivo | Função |
|---|---|
| `schema.ts` | Define as tabelas do banco e os tipos TypeScript |
| `routes.ts` | Contrato das rotas da API (usado tanto pelo frontend quanto backend) |

### Frontend (`client/src/`)

| Pasta/Arquivo | Função |
|---|---|
| `App.tsx` | Configura as rotas do frontend e o contexto de autenticação |
| `pages/` | Uma pasta por página da aplicação |
| `hooks/` | Lógica de busca e manipulação de dados (TanStack Query) |
| `components/layout.tsx` | Estrutura com sidebar e cabeçalho, usada em todas as páginas |
| `components/badges-status.tsx` | Badges coloridos de status |
| `lib/queryClient.ts` | Configuração do cliente HTTP para as requisições |

**Fluxo de dados no frontend:**
1. Página é carregada e o hook (ex: `useEvents()`) é chamado
2. TanStack Query verifica se os dados já estão em cache
3. Se não estiver, faz a requisição para a API
4. Os dados chegam e são exibidos na tela
5. Quando o usuário faz uma ação (criar, editar), uma Mutation é disparada
6. Após sucesso, o cache é invalidado e os dados são recarregados

---

## Banco de Dados

### Tabelas

| Tabela | O que armazena |
|---|---|
| `users` | Usuários do sistema (login, senha, nome, perfil) |
| `events` | Eventos itinerantes (nome, local, datas, status) |
| `equipment` | Equipamentos de TI (nome, série, status) |
| `event_equipment` | Vínculo entre evento e equipamento (com status do fluxo) |
| `event_technicians` | Vínculo entre evento e técnico (com controle de chamado) |

### Fluxo de Status dos Equipamentos

```
Solicitado → Em Teste → Pronto → Enviado → Retornado
```

Cada passo representa onde o equipamento está no processo de preparação para o evento.

---

## Autenticação e Segurança

- O login é feito com usuário e senha
- A sessão do usuário é armazenada no banco de dados (tabela `session`)
- Todas as rotas da API exigem login (`requireAuth`)
- Rotas sensíveis exigem perfil específico (`requireRole`)
- O frontend redireciona para o login se o usuário não estiver autenticado
- Menus e botões de ação são ocultados conforme o perfil do usuário

---

## Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| React 18 | Interface do usuário |
| TypeScript | Tipagem estática em todo o projeto |
| Vite | Build e servidor de desenvolvimento do frontend |
| Node.js + Express | Servidor backend |
| PostgreSQL | Banco de dados relacional |
| Drizzle ORM | Abstração do banco de dados (queries TypeScript) |
| TanStack Query | Gerenciamento de estado e cache do frontend |
| Passport.js | Autenticação com sessão |
| shadcn/ui | Componentes de interface |
| Tailwind CSS | Estilização |
| Wouter | Roteamento do frontend |
| Zod | Validação de dados |

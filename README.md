# 💎 Onyx - Finance Management

<div align="center">
  <img src="./assets/Onyx_logo.png" alt="Onyx Logo" width="150"/>
  
  <p><strong>Gestão financeira inteligente, moderna e segura.</strong></p>

  <p>Para utilizar a aplicação, basta acessar: <strong><a style='color: violet;' href='https://onyx.rhianpablo.com'>onyx.rhianpablo.com</a></strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-20232A?style=for-the-badge&logo=typescript&logoColor=blue" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-20232A?style=for-the-badge&logo=tailwind-css&logoColor=aqua" alt="Tailwind Badge"/>
  <img src="https://img.shields.io/badge/FastAPI-20232A?style=for-the-badge&logo=FastAPI" alt="FastAPI Badge"/>
  <img src="https://img.shields.io/badge/Python-20232A?style=for-the-badge&logo=python" alt="Python Badge"/>
  <img src="https://img.shields.io/badge/Postgres-20232A?style=for-the-badge&logo=postgresql" alt="Postgres Badge"/>
  <img src="https://img.shields.io/badge/Docker-20232A?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Badge"/>
</div>

<br/>

## 📋 Índice
 - [Sobre o Projeto](#sobre-o-projeto)
 - [Status do Projeto](#status-do-projeto)
 - [Principais Funcionalidades](#principais-funcionalidades)
 - [Objetivo e Motivação](#objetivo-e-motivacao)
 - [Tecnologias Utilizadas](#tecnologias-utilizadas)
 - [ChatBot Inteligente & Insights](#chatbot-inteligente)
 - [Estrutura do Projeto](#estrutura-do-projeto)
 - [Hospedagem e Infraestrutura](#hospedagem)
 - [CI/CD e Imagens Docker](#cicd)
 - [Como Executar Localmente](#como-executar-localmente)
 - [Screenshots](#screenshots)
 - [Autor](#autor)

---

## <a id="sobre-o-projeto"></a>📖 Sobre o Projeto

O **Onyx - Finance Management** é uma aplicação Full-Stack de gerenciamento financeiro pessoal projetada para oferecer uma experiência ágil, segura e inteligente. Combinando um design moderno a uma arquitetura robusta, o sistema permite registrar transações sem fricção — seja preenchendo rapidamente de forma manual ou utilizando comandos em linguagem natural através do ChatBot inteligente integrado com IA.

O projeto também eleva a segurança ao eliminar a dependência de senhas tradicionais, contando com autenticação biométrica via **WebAuthn (Passkeys, FaceID, TouchID)**, além de suporte a fluxo seguro de recuperação de acesso.

---

## <a id="status-do-projeto"></a>🚧 Status do Projeto

**Em desenvolvimento ativo e produção.** A aplicação já opera em ambiente de produção sob o domínio [onyx.rhianpablo.com](https://onyx.rhianpablo.com), com melhorias contínuas, novos recursos e refinamentos periódicos na interface e nas integrações de inteligência artificial.

---

## <a id="principais-funcionalidades"></a>✨ Principais Funcionalidades

* **🔐 Autenticação Passwordless & Biometria:** Login biométrico seguro via WebAuthn (Passkeys / FaceID / TouchID) e autenticação protegida por JWT.
* **🤖 ChatBot Financeiro com IA:** Interpretação de mensagens em linguagem natural para categorização e registro automático de gastos e receitas via Google Gemini AI.
* **➕ Lançamento Manual e Categorias:** Criação e gestão customizada de despesas e receitas organizadas por categorias.
* **📊 Dashboard Dinâmico:** Visualização em tempo real de saldo atual, gastos do dia, receitas, despesas e faturas do mês.
* **💡 Insights Inteligentes:** Recomendações e análises inteligentes baseadas no comportamento de gastos do usuário.
* **🧾 Extrato Detalhado:** Histórico financeiro completo com filtros por período e categoria, ordenação e exibição detalhada de cada transação.
* **📱 Progressive Web App (PWA):** Instalação facilitada no smartphone ou computador com experiência próxima a um app nativo.

---

## <a id="objetivo-e-motivacao"></a>🎯 Objetivo e Motivação

O Onyx foi concebido para resolver a burocracia e o atrito dos métodos tradicionais de controle de gastos, como planilhas complexas ou formulários extensos. 

A ideia central é transformar o registro de despesas e receitas em um processo tão simples e instantâneo quanto mandar uma mensagem de texto. Com um fluxo descomplicado e visualizações claras, qualquer pessoa consegue manter a saúde financeira em dia de onde estiver.

---

## <a id="tecnologias-utilizadas"></a>💻 Tecnologias Utilizadas

### Frontend
* **React (TypeScript):** Componentização declarativa, tipagem estática e alta escalabilidade.
* **Tailwind CSS:** Design responsivo, moderno e de alta produtividade.
* **Vite & Vite PWA:** Build ultrarrápido e suporte completo a instalação como Progressive Web App (PWA).
* **Axios:** Cliente HTTP para comunicação eficiente com o backend.

### Backend
* **FastAPI:** Framework Python assíncrono de altíssimo desempenho para APIs RESTful.
* **SQLAlchemy & Alembic:** ORM e versionamento seguro de esquemas de banco de dados.
* **PostgreSQL:** Banco de dados relacional robusto para armazenamento estruturado das transações.
* **WebAuthn / FIDO2:** Protocolo seguro para autenticação biométrica sem senhas.
* **JWT & Passlib / Bcrypt:** Criação e validação de tokens de sessão seguros.
* **Google Gemini AI:** Modelo generativo para processamento de linguagem natural (NLP) e extração de entidades financeiras.
* **APScheduler:** Agendamento e gerenciamento de rotinas em segundo plano.

### DevOps & Infraestrutura
* **Docker & Docker Compose:** Conteinerização consistente para desenvolvimento e produção.
* **VPS (Virtual Private Server):** Servidor dedicado onde rodam os contêineres do Frontend e Backend.
* **Neon PostgreSQL:** Banco de dados serverless em nuvem com alta disponibilidade e backups automáticos.
* **GitHub Actions:** Pipelines de CI/CD automatizadas (testes, geração de imagens Docker e deploy contínuo via self-hosted runner).

---

## <a id="chatbot-inteligente"></a>🤖 ChatBot Inteligente & Insights

Com o objetivo de tornar o registro financeiro intuitivo, o Onyx integra a API do **Google Gemini AI**. 

Em vez de preencher múltiplos campos, o usuário pode apenas digitar ou colar:
> *"Gastei 45 reais na padaria hoje de manhã"* ou *"Recebi um pix de 1200 referente a freela"*

A Inteligência Artificial extrai automaticamente o valor, identifica se é receita ou despesa, infere a data e a categoria adequada, persistindo tudo diretamente no banco de dados. Além disso, a aplicação conta com geração de **Insights Financeiros**, analisando padrões de consumo para sugerir melhorias no orçamento.

---

## <a id="estrutura-do-projeto"></a>🏗 Estrutura do Projeto

### Frontend (`/front-end-app`)
* **`assets/`:** Imagens, ícones e mídias estáticas.
* **`components/`:** Componentes reutilizáveis (botões, cards, modais, formulários).
* **`hooks/`:** Custom hooks para consumo de APIs, ciclo de vida e estado global.
* **`interfaces/`:** Definições e contratos de tipagem TypeScript.
* **`layouts/`:** Wrappers estruturais (Dashboard, Extrato, etc.) padronizando navegação via `<Outlet />`.
* **`pages/`:** Páginas completas da aplicação (Login, Cadastro, Dashboard, Extrato, Chat, Adicionar Transação, etc.).
* **`routes/`:** Definições de rotas públicas e rotas autenticadas protegidas.
* **`services/`:** Instâncias Axios, configuração de headers, cookies e armazenamento de tokens.
* **`utils/`:** Helpers e funções de formatação (datas, moeda BRL, máscaras).

### Backend (`/app`)
* **`controllers/`:** Regras de negócio centrais e manipulação de entidades.
* **`core/`:** Configurações da aplicação, conexões com o banco e carregamento de variáveis de ambiente.
* **`models/`:** Mapeamento de tabelas relacionais do SQLAlchemy.
* **`routers/`:** Endpoints e rotas da API REST organizados por domínio (usuários, transações, chat, insights, etc.).
* **`schemas/`:** Modelos Pydantic para validação, serialização e contratos de dados das requisições.
* **`services/`:** Integrações externas (Google Gemini AI, envio de e-mails, agendadores de tarefas).
* **`utils/`:** Utilitários de segurança, tratamento de datas e funções auxiliares.

---

## <a id="hospedagem"></a>☁️ Hospedagem e Infraestrutura

A infraestrutura do Onyx foi desenhada para unir estabilidade, baixo custo e facilidade de manutenção:

* **VPS (Virtual Private Server):** Ambiente de produção onde rodam os contêineres Docker do Frontend e Backend, respondendo sob o domínio próprio: **[onyx.rhianpablo.com](https://onyx.rhianpablo.com)**.
* **[Neon](https://neon.tech/):** Banco de dados PostgreSQL Serverless em nuvem, garantindo alta escalabilidade, persistência confiável e baixa latência.

---

## <a id="cicd"></a>⚙️ CI/CD e Imagens Docker

O ciclo de vida de integração e entrega contínua é gerenciado via **GitHub Actions**:

### Workflows Implementados:
1. **Smoke Tests & Testes Automatizados (Integração):**
   - Ao abrir um Pull Request para a branch `develop`, um ambiente Docker temporário é instanciado.
   - O Frontend, Backend e Banco de Dados são inicializados com verificações de integridade (*Health Checks*).
   - Testes automatizados com `pytest` são disparados no backend. Se houver falhas, o merge é bloqueado.

2. **Deploy Automático na VPS:**
   - Ao realizar push ou merge na branch `master`, os workflows de build geram as novas imagens Docker e publicam no Docker Hub.
   - Um runner *self-hosted* conectado diretamente à VPS executa os scripts de deploy (`deploy_frontend.sh` e `deploy_api.sh`), realizando o pull da imagem mais recente e recriando os contêineres sem indisponibilidade.

### Repositórios no Docker Hub:
Você pode obter as imagens oficiais da aplicação diretamente do Docker Hub:
* 🌐 **Frontend:** [`docker pull rhianpablo11/finance-management-frontend`](https://hub.docker.com/r/rhianpablo11/finance-management-frontend)
* ⚙️ **Backend:** [`docker pull rhianpablo11/finance-management-backend`](https://hub.docker.com/r/rhianpablo11/finance-management-backend)

---

## <a id="como-executar-localmente"></a>🚀 Como Executar Localmente

Você pode rodar todo o ecossistema na sua máquina utilizando Docker Compose:

### Pré-requisitos
* [Docker](https://www.docker.com/) instalado
* [Docker Compose](https://docs.docker.com/compose/)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/rhianpablo11/onyx_finance_management.git
   cd onyx_finance_management
   ```

2. **Configure as Variáveis de Ambiente:**
   No arquivo `docker-compose.yaml`, configure as variáveis de ambiente necessárias:
   * `GEMINI_API_KEY`: Chave da API do Google Gemini para o ChatBot e Insights.
   * `ADDRESS_EMAIL` e `PASSWORD_EMAIL`: Credenciais do e-mail remetente para envio de códigos de recuperação/verificação.
   * `BIOMETRIC_RP_ID` e `BIOMETRIC_ORIGIN`: Configurações de domínio e origem para a API WebAuthn (em desenvolvimento local: `localhost` e `http://localhost:5173`).
   * `ORIGINS_ALLOWED`: Origens permitidas para requisições CORS.

3. **Inicie os Contêineres:**
   ```bash
   docker compose up --build
   ```
   *O backend se encarrega de criar as tabelas e inicializar o banco de dados na primeira execução.*

4. **Acesse no Navegador:**
   * **Frontend:** [http://localhost:5173](http://localhost:5173)
   * **Swagger Docs (API):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## <a id="screenshots"></a>🎨 Screenshots

<div align="center">
  <img src="./assets/tela_inicial.jpg" alt="Tela Inicial" width="24%"/>
  <img src="./assets/tela_login.jpg" alt="Tela de Login" width="24%"/>
  <img src="./assets/tela_cadastro.jpg" alt="Tela de Cadastro" width="24%"/>
</div>

<div align="center">
  <img src="./assets/dashboard.jpg" alt="Dashboard Preview" width="24%"/>
  <img src="./assets/tela_chatbot.jpg" alt="ChatBot Preview" width="24%"/>
  <img src="./assets/extrato.jpg" alt="Extrato Preview" width="24%"/>
  <img src="./assets/detalhes_operacao.jpg" alt="Detalhes da Operação" width="24%"/>
</div>

---

## <a id="autor"></a>👨‍💻 Autor

Desenvolvido por **[Rhian Pablo](https://www.linkedin.com/in/rhianpablo11/)**  
Estudante de Engenharia da Computação - Universidade Estadual de Feira de Santana (UEFS).

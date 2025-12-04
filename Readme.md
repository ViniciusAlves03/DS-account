# Despesa Simples - Serviço de Contas (Account Service)

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Inversify](https://img.shields.io/badge/Inversify-2C5C85?style=for-the-badge)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

Este é o repositório do **Serviço de Contas (Account)**, o microsserviço central de identidade e autenticação para o sistema **Despesa Simples**.

Ele é responsável por gerenciar usuários (Titulares, Dependentes e Administradores), controlar o acesso via JWT, e lidar com a autenticação.

Construído com TypeScript, este projeto segue princípios de **Clean Architecture** e **Domain-Driven Design (DDD)** para garantir um código desacoplado, testável e de fácil manutenção.

## ✨ Principais Funcionalidades

* **Gerenciamento de Usuários:**
    * Criação e gestão de três tipos de usuários: `Admin` (Administrador), `Holder` (Titular) e `Dependent` (Dependente).
    * Associação hierárquica entre Titulares e seus Dependentes.
* **Autenticação e Autorização:**
    * Fluxo completo de autenticação via E-mail/Senha.
    * Geração de tokens **JWT (RS256)** para acesso seguro à API.
    * Fluxo de **Refresh Token** para renovação de sessão.
* **Recuperação de Senha:**
    * Lógica completa de "Esqueci minha senha" com envio de e-mail transacional.
    * Validação de token de recuperação e alteração segura de senha.
* **Upload de Avatar:**
    * Endpoint para upload de imagem de perfil do usuário.
    * Armazenamento de arquivos otimizado usando **MongoDB GridFS**.
* **Comunicação Assíncrona:**
    * Uso de **RabbitMQ** para publicar eventos de integração.
    * Garante que o envio de e-mails não bloqueie a resposta da API.
* **Integração com API Gateway:**
    * Sincronização automática com um API Gateway (Kong) para criar `Consumers`, `JWTs` e `ACLs` (Grupos de Acesso), automatizando o provisionamento de segurança.
* **Documentação de API:**
    * Geração automática de documentação **Swagger (OpenAPI 3.0)**.

## 🚀 Tecnologias Utilizadas

* **Core:** Node.js, TypeScript
* **Framework API:** Express.js
* **Injeção de Dependência:** InversifyJS
* **Banco de Dados:** MongoDB
* **ODM:** Mongoose
* **Armazenamento de Arquivos:** MongoDB GridFS
* **Mensageria:** RabbitMQ
* **Autenticação:** JSON Web Token (JWT) - RS256
* **Logging:** Winston
* **Documentação:** Swagger / OpenAPI

## 📋 Pré-requisitos

Para executar este projeto localmente, você precisará ter os seguintes serviços instalados e em execução:

* Node.js (v21.x ou superior)
* MongoDB
* RabbitMQ
* Um API Gateway (opcional, para a funcionalidade do `GatewayRepository`)
* Chaves de assinatura JWT (RSA Private/Public Keys)

## ⚙️ Instalação e Execução

Existem duas formas de rodar o projeto em desenvolvimento.

### Método 1: Rodando com Docker (Recomendado)

Este método é o mais simples, pois usa o Dockerfile para executar a aplicação, e Docker Compose para subir os serviços de banco de dados (MongoDB) e mensageria (RabbitMQ). A aplicação Node.js rodará localmente, conectando-se a eles.

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/ViniciusAlves03/DS-account.git](https://github.com/ViniciusAlves03/DS-account.git)
    cd DS-account
    ```

2.  **Inicie os serviços (Mongo e RabbitMQ):**
    Use o arquivo `docker-compose.yml` para iniciar os containers das dependências em background.
    ```bash
    docker-compose up -d
    ```
    * MongoDB estará disponível em: `localhost:27017`
    * RabbitMQ (admin) estará disponível em: `http://localhost:15672`

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`. Você pode usar o seguinte comando:
    ```bash
    cp .env.example .env
    ```

4.  **Construa a imagem da aplicação:**
    Usando o Dockerfile fornecido, construa a imagem do serviço de contas.
    ```bash
    docker build -t DS-account:latest .
    ```

5.  **Rode o contêiner da aplicação:**
    Este comando inicia sua aplicação, a conecta na mesma rede das dependências (`exp-network`) e injeta as variáveis de ambiente do arquivo `.env`
    ```bash
    docker run -d \
        --name exp-app \
        -p 3000:3000 \
        --network exp-network \
        --env-file .env \
        DS-account:latest
    ```
    A aplicação estará sendo executada em `http://localhost:3000`.

---
### Método 2: Rodando Localmente (Sem Docker)

Este método exige que você tenha instâncias do **MongoDB** e **RabbitMQ** instaladas e rodando na sua máquina local.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/ViniciusAlves03/DS-account.git
    cd DS-account
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`. Você pode usar:
    ```bash
    cp .env.example .env
    ```

4.  **Compile o TypeScript:**
    ```bash
    npm run build
    ```

5.  **Inicie o servidor (modo de desenvolvimento):**
    ```bash
    npm run dev
    ```

6.  **Inicie o servidor (modo de produção):**
    ```bash
    npm start
    ```

## 🏗️ Estrutura do Projeto

```sh
src/
├── application/     # Camada de Aplicação (Lógica de negócio e casos de uso)
│   ├── domain/      # Entidades de domínio, modelos, validadores e exceções.
│   ├── port/        # Interfaces para serviços e repositórios.
│   └── service/     # Implementação dos serviços (casos de uso).
│
├── infrastructure/  # Camada de Infraestrutura (Detalhes de implementação)
│   ├── database/    # Configuração de DB, Schemas Mongoose.
│   ├── entity/      # Entidades de banco e Mappers.
│   ├── eventbus/    # Implementação do RabbitMQ.
│   ├── repository/  # Implementação dos repositórios (MongoDB, GridFS).
│   └── port/        # Interfaces da camada de infraestrutura.
│
├── ui/              # Camada de Interface (Entrada e Saída)
│   ├── controllers/ # Controllers da API (Express).
│   ├── exception/   # Manipuladores de exceção da API.
│   └── swagger/     # Arquivo de definição do OpenAPI (api_1.0.0.yaml).
│
├── di/              # Configuração da Injeção de Dependência.
├── background/      # Serviços e tarefas em background.
├── utils/           # Utilitários (Logger, Config, Strings).
└── app.ts           # Ponto de entrada da aplicação Express.
```

## 📖 Visão Geral da API (Endpoints)

Abaixo está um resumo de todos os endpoints disponíveis neste microsserviço, agrupados por recurso.

Para uma documentação interativa completa, com detalhes de *schemas* e *body*, acesse a documentação do Swagger:
**`http://localhost:3000/v1/reference`**


### 🔑 Auth (Autenticação)

Rotas para autenticação, atualização de token e recuperação de senha.

| Método | Rota (Path) | Descrição |
| :--- | :--- | :--- |
| `POST` | `/v1/auth` | Autentica um usuário (login). |
| `POST` | `/v1/auth/refresh` | Atualiza o token de acesso (refresh token). |
| `POST` | `/v1/auth/forgot` | Solicita a recuperação de senha (envia e-mail). |
| `PATCH` | `/v1/auth/password` | Altera a senha do usuário (com senha antiga ou token). |

---

### 👑 Admins (Administradores)

Rotas para gerenciamento de usuários administradores.

| Método | Rota (Path) | Descrição |
| :--- | :--- | :--- |
| `POST` | `/v1/admins` | Adiciona um novo Administrador. |
| `GET` | `/v1/admins` | Lista todos os Administradores (paginado). |
| `GET` | `/v1/admins/{admin_id}` | Obtém um Administrador pelo seu ID. |
| `PATCH` | `/v1/admins/{admin_id}` | Atualiza um Administrador existente. |

---

### 👤 Holders (Titulares)

Rotas para gerenciamento dos usuários principais (Titulares de conta).

| Método | Rota (Path) | Descrição |
| :--- | :--- | :--- |
| `POST` | `/v1/holders` | Adiciona um novo Titular (registro). |
| `GET` | `/v1/holders` | Lista todos os Titulares (paginado). |
| `GET` | `/v1/holders/{holder_id}` | Obtém um Titular pelo seu ID. |
| `PATCH` | `/v1/holders/{holder_id}` | Atualiza um Titular existente. |
| `DELETE` | `/v1/holders/{holder_id}` | Remove um Titular. |
| `POST` | `/v1/holders/{holder_id}/dependents` | Adiciona um novo Dependente para um Titular. |
| `PATCH` | `/v1/holders/{holder_id}/dependents/{dependent_id}` | Atualiza a autorização de um Dependente. |
| `DELETE` | `/v1/holders/{holder_id}/dependents/{dependent_id}` | Desassocia um Dependente de um Titular. |

---

### 👥 Dependents (Dependentes)

Rotas para gerenciamento direto de Dependentes.

| Método | Rota (Path) | Descrição |
| :--- | :--- | :--- |
| `GET` | `/v1/dependents` | Lista todos os Dependentes (paginado). |
| `GET` | `/v1/dependents/{dependent_id}` | Obtém um Dependente pelo seu ID. |
| `PATCH` | `/v1/dependents/{dependent_id}` | Atualiza um Dependente existente. |
| `DELETE` | `/v1/dependents/{dependent_id}` | Remove um Dependente. |

---

### 👥 Users (Usuários - Geral)

Rotas gerais que se aplicam a todos os tipos de usuários.

| Método | Rota (Path) | Descrição |
| :--- | :--- | :--- |
| `GET` | `/v1/users` | Lista todos os usuários (Admin, Holder, Dependent). |
| `DELETE` | `/v1/users/{user_id}` | Remove um usuário de qualquer tipo. |
| `PUT` | `/v1/users/{user_id}/avatar` | Adiciona ou atualiza o avatar do usuário. |
| `GET` | `/v1/users/{user_id}/avatar` | Obtém a imagem (binário) do avatar do usuário. |
| `DELETE` | `/v1/users/{user_id}/avatar` | Remove o avatar do usuário. |

---

## 🧑‍💻 Autor <a id="autor"></a>

<p align="center">Desenvolvido por Vinícius Alves <strong><a href="https://github.com/ViniciusAlves03">(eu)</a></strong>.</p>

---

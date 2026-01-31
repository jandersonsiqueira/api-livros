# API de Livros (DevOps Project)

Projeto final da disciplina de DevOps. Trata-se de uma aplicação web em Node.js integrada com banco de dados PostgreSQL, demonstrando um pipeline completo de CI/CD com Jenkins, SonarQube e Trivy.

## 📋 Pré-requisitos

Para executar este projeto, você precisará de:

* **Docker** e **Docker Compose** instalados.
* **Node.js** v18+ (Apenas se quiser rodar os testes fora do Docker).

## 🚀 Como Rodar a Aplicação (Ambiente de Desenvolvimento)

A maneira mais simples de rodar a aplicação completa (API + Banco de Dados) é utilizando o Docker Compose da pasta de deploy.

1. Navegue até a pasta de deploy:
   ```bash
   cd deploy

```

2. Suba a stack (A aplicação estará disponível em `http://localhost:3000`):
```bash
docker compose up -d

```

*Nota: Por padrão, o compose buscará a tag `latest` se a variável `TAG` não for definida. Para rodar uma versão específica gerada pelo pipeline, use: `TAG=v1.0.X docker compose up -d*`
3. Para derrubar o ambiente e limpar os containers:
```bash
docker compose down

```

## 🧪 Testes e Qualidade de Código

O projeto possui testes unitários configurados com **Jest**. O pipeline exige uma cobertura de código mínima de **50%** para passar no Quality Gate do SonarQube.

Para rodar os testes localmente e verificar a cobertura:

```bash
# 1. Instale as dependências (na raiz do projeto)
npm install

# 2. Execute os testes com relatório de cobertura
npm run test

```

O relatório será gerado na pasta `coverage/`.

## ⚙️ Pipeline CI/CD (Jenkins)

O arquivo `Jenkinsfile` na raiz descreve o pipeline automatizado:

1. **Build & Install:** Prepara o ambiente Node.js.
2. **Unit Tests:** Executa os testes unitários.
3. **SonarQube Analysis:** Verifica a qualidade do código e checa se a cobertura é > 50%.
4. **Trivy Repo Scan:** Busca vulnerabilidades e segredos no código fonte (Filesystem).
5. **Docker Build:** Cria a imagem da aplicação.
6. **Trivy Image Scan:** Busca vulnerabilidades na imagem Docker gerada (falha se houver CRITICAL/HIGH).
7. **Push & Git Tag:** (Executado apenas na branch `main`) Realiza o push para o DockerHub e cria uma Tag de release no Git automaticamente.

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Node.js (Express)
* **Banco de Dados:** PostgreSQL
* **Containerização:** Docker
* **CI/CD:** Jenkins
* **Análise de Código:** SonarQube
* **Segurança:** Trivy Security Scanner
# RAGFi

## Overview

RAGFi is a **Retrieval-Augmented Generation Framework** designed to enhance decision-making with AI-driven insights. The system integrates multiple services, including a web server, MySQL for database storage, Elasticsearch for search and vector similarity, and NGINX as a proxy. This setup enables a robust platform for managing data, performing advanced search queries, and generating contextually relevant responses.

---

## Features

1. **News Ingestion**:

   - Fetch and ingest financial news using the AlphaVantage API.
   - Automatically deduplicate and index news into Elasticsearch for retrieval.

2. **Text Embedding**:

   - Generate dense vector embeddings for text using Sentence-Transformers.
   - Store embeddings in Elasticsearch's vector database for semantic search.

3. **Semantic Search**:

   - Search for financial news and topics using text and vector similarity.
   - Combine keyword and embedding-based searches for accurate results.

4. **GPT Integration**:

   - Generate actionable insights using GPT models.
   - Stream responses via Server-Sent Events (SSE).

5. **Pagination**:

   - Efficiently paginate search results for large datasets.

6. **Custom Querying**:
   - Search financial news using filters like tickers, topics, and full-text queries.

---

## Architecture

- **Backend**: Node.js with Express.js and TypeScript
- **Database**:
  - Relational Data: MySQL
  - Semantic Search and Vector Database: Elasticsearch
- **Text Embeddings**: Sentence-Transformers
- **API Integrations**:
  - AlphaVantage for financial news
  - GPT-based text generation

---

## Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Services

### Proxy (`proxy`)

- **Image**: `nginx:alpine`
- **Port**: Exposes the application on port `80`.
- **Configuration**: Uses `nginx.conf` for routing and proxy setup.
- **Network**: Connects to the `backend` network.

### Server (`server`)

- **Dockerfile**: `Dockerfile.dev` (for development).
- **Port**: Exposes the application on port `3001`.
- **Environment Variables**:
  - `DATABASE_URL`: Connection string for MySQL.
  - `ELASTICSEARCH_URL`: URL for Elasticsearch integration.
- **Dependencies**:
  - MySQL (Database).
  - Elasticsearch (Search engine).
- **Volumes**:
  - Mounts the project directory for hot-reloading during development.

### MySQL (`mysql`)

- **Image**: `mysql:5.7`
- **Environment Variables**:
  - `MYSQL_ROOT_PASSWORD`: Root password for MySQL.
  - `MYSQL_DATABASE`: Name of the development database.
- **Port**: Exposes MySQL on port `3306`.
- **Volumes**:
  - Stores MySQL data in a persistent volume (`data`).

### Elasticsearch (`elasticsearch`)

- **Image**: `docker.elastic.co/elasticsearch/elasticsearch:8.10.0`
- **Environment Variables**:
  - `discovery.type`: Ensures Elasticsearch runs in single-node mode.
  - `ES_JAVA_OPTS`: Java memory settings for performance optimization.
- **Ports**:
  - Exposes Elasticsearch on port `9200` (HTTP).
  - Exposes Elasticsearch on port `9300` (Transport).
- **Volumes**:
  - Stores Elasticsearch data in a persistent volume (`es_data`).

---

## Setup Instructions

### Prerequisites

- Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) on your machine.

---

### Steps

#### 1. Clone the Repository

Clone the RAGFi repository to your local machine:

```bash
git clone https://github.com/your-repo/ragfi.git
cd ragfi
```

### 2. Configure NGINX

Edit the nginx.conf file if you need to customize proxy settings. This file is located in the root directory of the repository.

### 3. Start the Services

Run the following command to start all services using Docker Compose:

```bash
docker-compose up -d
```

### 4. Verify Services

Check that the services are running and accessible:

- NGINX: http://localhost
- Server: http://localhost:3001
- Swagger: http://localhost:3001/api-docs
- Elasticsearch: http://localhost:9200
- MySQL: Connect to port 3306 using root as the username and the password specified in the MYSQL_ROOT_PASSWORD environment variable.

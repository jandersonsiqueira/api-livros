-- Criação da tabela de livros
CREATE TABLE IF NOT EXISTS livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir alguns dados iniciais para teste
INSERT INTO livros (titulo, autor) VALUES 
    ('Clean Code', 'Robert C. Martin'),
    ('DevOps Handbook', 'Gene Kim');

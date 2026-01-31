const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/myapp'
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

// CREATE - Cadastrar um novo livro
app.post('/livros', async (req, res) => {
    try {
        const { titulo, autor } = req.body;
        
        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Título e autor são obrigatórios' });
        }

        const result = await pool.query(
            'INSERT INTO livros (titulo, autor) VALUES ($1, $2) RETURNING *',
            [titulo, autor]
        );
        
        res.status(201).json({ 
            message: 'Livro criado com sucesso!',
            livro: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar livro:', error);
        res.status(500).json({ error: 'Erro ao criar livro' });
    }
});

// READ - Consultar todos os livros
app.get('/livros', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM livros ORDER BY id DESC');
        res.json({ 
            total: result.rows.length,
            livros: result.rows 
        });
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// READ - Consultar um livro específico por ID
app.get('/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM livros WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        
        res.json({ livro: result.rows[0] });
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ error: 'Erro ao buscar livro' });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
}

module.exports = app;
const request = require('supertest');
const app = require('../src/app');
const { Pool } = require('pg');

// Mock do PostgreSQL
jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

let pool;

describe('Testes da API', () => {
    beforeEach(() => {
        pool = new Pool();
        jest.clearAllMocks();
    });

    it('Deve retornar status 200 na rota health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'UP');
    });

    describe('POST /livros - Criar livro', () => {
        it('Deve criar um livro com sucesso', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1, titulo: 'DevOps Book', autor: 'John Doe' }]
            });

            const res = await request(app)
                .post('/livros')
                .send({ titulo: 'DevOps Book', autor: 'John Doe' });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Livro criado com sucesso!');
            expect(res.body.livro).toHaveProperty('titulo', 'DevOps Book');
        });

        it('Deve retornar erro 400 quando faltar título', async () => {
            const res = await request(app)
                .post('/livros')
                .send({ autor: 'John Doe' });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error');
        });

        it('Deve retornar erro 400 quando faltar autor', async () => {
            const res = await request(app)
                .post('/livros')
                .send({ titulo: 'DevOps Book' });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error');
        });

        it('Deve retornar erro 500 quando ocorrer erro no banco', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/livros')
                .send({ titulo: 'DevOps Book', autor: 'John Doe' });
            
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /livros - Listar todos os livros', () => {
        it('Deve retornar lista de livros', async () => {
            pool.query.mockResolvedValue({
                rows: [
                    { id: 1, titulo: 'Clean Code', autor: 'Robert Martin' },
                    { id: 2, titulo: 'DevOps Handbook', autor: 'Gene Kim' }
                ]
            });

            const res = await request(app).get('/livros');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total', 2);
            expect(res.body.livros).toHaveLength(2);
        });

        it('Deve retornar lista vazia quando não houver livros', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const res = await request(app).get('/livros');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('total', 0);
            expect(res.body.livros).toHaveLength(0);
        });

        it('Deve retornar erro 500 quando ocorrer erro no banco', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/livros');
            
            expect(res.statusCode).toEqual(500);
        });
    });

    describe('GET /livros/:id - Buscar livro por ID', () => {
        it('Deve retornar um livro específico', async () => {
            pool.query.mockResolvedValue({
                rows: [{ id: 1, titulo: 'Clean Code', autor: 'Robert Martin' }]
            });

            const res = await request(app).get('/livros/1');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.livro).toHaveProperty('titulo', 'Clean Code');
        });

        it('Deve retornar 404 quando livro não existir', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const res = await request(app).get('/livros/999');
            
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Livro não encontrado');
        });

        it('Deve retornar erro 500 quando ocorrer erro no banco', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/livros/1');
            
            expect(res.statusCode).toEqual(500);
        });
    });
});
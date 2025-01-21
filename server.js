const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 81;

// Разрешить CORS для запросов
app.use(cors());

// Настройка статики для клиентской части
app.use(express.static(path.join(__dirname, 'public')));

// Настройка подключения к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

// API для получения данных
app.get('/api/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM map_points');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка при запросе к PostgreSQL:', err);
        res.status(500).send('Ошибка сервера');
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на http://localhost:${port}`);
});

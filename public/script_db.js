const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 8080;

// Настройка подключения к базе данных
const pool = new Pool({
    user: 'postgres',            // Имя пользователя PostgreSQL
    host: 'localhost',           // Хост PostgreSQL
    database: 'smart_building_monitoring', // Название базы данных
    password: 'your_password',   // Пароль пользователя
    port: 5432,                  // Порт PostgreSQL
});

app.use(cors());

// Проверка подключения к базе
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Ошибка подключения к базе данных:', err.stack);
    }
    console.log('Успешное подключение к базе данных smart_building_monitoring');
    release();
});


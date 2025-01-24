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
    password: 'password',   // Пароль пользователя
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



// Получение всех метрик
app.get('/api/metrics', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                m.timestamp, 
                m.electricity_ph1, 
                m.electricity_ph2, 
                m.electricity_ph3, 
                m.amperage_ph1, 
                m.amperage_ph2, 
                m.amperage_ph3, 
                m.cold_water_pressure, 
                m.hot_water_in_pressure, 
                m.hot_water_out_pressure, 
                m.hot_water_in_temp, 
                m.hot_water_out_temp, 
                m.leak_sensor, 
                m.air_temp, 
                m.humidity,
                b.name AS building_name,
                b.latitude, 
                b.longitude
            FROM metrics m
            JOIN controllers c ON m.controller_id = c.controller_id
            JOIN buildings b ON c.building_id = b.building_id;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения данных из таблицы metrics:', err);
        res.status(500).send('Ошибка запроса к базе данных');
    }
});

// Получение списка зданий
app.get('/api/buildings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM buildings');
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения данных из таблицы buildings:', err);
        res.status(500).send('Ошибка запроса к базе данных');
    }
});

// Получение информации о контроллерах
app.get('/api/controllers', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.serial_number, 
                c.vendor, 
                c.model, 
                c.status, 
                c.last_heartbeat, 
                b.name AS building_name, 
                b.address 
            FROM controllers c
            JOIN buildings b ON c.building_id = b.building_id;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения данных из таблицы controllers:', err);
        res.status(500).send('Ошибка запроса к базе данных');
    }
});


// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на http://localhost:${port}`);
});

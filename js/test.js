// Global variables
let map;
// path to csv data
let path = "data/10.csv";
//let picture_path= "a-afanasyev/leaflet/main/data/images/";
let picture_path= "data/images/";
let markers = L.featureGroup();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',       // Ваш пользователь PostgreSQL
    host: 'localhost',      // Хост (обычно localhost)
    database: 'map_data',   // Имя базы данных
    password: 'postgres', // Пароль от PostgreSQL
    port: 5432              // Порт PostgreSQL (обычно 5432)
});

async function fetchData() {
    try {
        const result = await pool.query('SELECT * FROM map_points');
        console.log('Данные из базы:', result.rows);
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
}

// Вызов функции
fetchData();
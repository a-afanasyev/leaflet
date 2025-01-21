const { Pool } = require('pg');

// Настройки подключения к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432
});

// Функция для получения данных из PostgreSQL
async function fetchData() {
    try {
        const result = await pool.query('SELECT * FROM map_points');
        return result.rows;
    } catch (err) {
        console.error('Error fetching data from PostgreSQL:', err);
        return [];
    }
}

// Инициализация карты и работа с данными
$(document).ready(async function () {
    // Создание карты
    const map = L.map('map').setView([0, 0], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Получение данных из базы данных
    const data = await fetchData();

    // Создание маркеров и боковой панели
    const markers = L.featureGroup();
    data.forEach((item) => {
        if (!item.latitude || !item.longitude || !item.status) {
            console.warn('Skipping invalid data:', item);
            return;
        }

        const electricityImage = item.electricity === 'ok'
            ? 'data/images/Electricity_Green.png'
            : 'data/images/Electricity_Red.png';

        const waterImage = item.water === 'ok'
            ? 'data/images/Water_Green.png'
            : 'data/images/Water_Red.png';

        const circleOptions = {
            radius: 8,
            weight: 1,
            color: 'white',
            fillColor: item.status === 'ok' ? 'green' : item.status === 'warning' ? 'orange' : 'red',
            fillOpacity: 1
        };

        const marker = L.circleMarker([item.latitude, item.longitude], circleOptions);

        const popupContent = `
            <div>
                <strong>${item.region} ${item.markaz} ${item.home}</strong>
                <br>
                <table>
                    <tr>
                        <td><img src="${electricityImage}" alt="Electricity_Status" style="width: 20px;" /></td>
                        <td>${item.el_ph1}V</td>
                        <td>${item.el_ph2}V</td>
                        <td>${item.el_ph3}V</td>
                    </tr>
                    <tr>
                        <td><img src="${waterImage}" alt="Water_Status" style="width: 20px;" /></td>
                        <td>${item.cold_water_pr} Bar</td>
                        <td>${item.hot_water_pr} Bar</td>
                    </tr>
                </table>
            </div>`;

        marker.bindPopup(popupContent).addTo(markers);

        // Добавление в боковую панель
        const sidebarGroup = $(`#${item.status}-group .status-items`);
        if (sidebarGroup.length) {
            const sidebarItem = $(`<div class="sidebar-item">
                <img src="${electricityImage}" alt="Electricity_Status" style="width: 15px;">
                <img src="${waterImage}" alt="Water_Status" style="width: 15px;">
                ${item.region} ${item.markaz} ${item.home}
            </div>`);

            sidebarItem.click(function () {
                map.setView([item.latitude, item.longitude], 10);
                marker.openPopup();
            });

            sidebarGroup.append(sidebarItem);
        }
    });

    // Добавление маркеров на карту
    markers.addTo(map);

    // Установка границ карты
    map.fitBounds(markers.getBounds());
});

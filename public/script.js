document.addEventListener('DOMContentLoaded', async function () {
    const map = L.map('map').setView([0, 0], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markers = L.featureGroup();

    try {
        // Запрос данных с сервера
        const response = await fetch('/api/data');
        const data = await response.json();

        data.forEach((item) => {
            if (!item.latitude || !item.longitude || !item.status) {
                console.warn('Пропущены некорректные данные:', item);
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
                fillOpacity: 1,
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

            markers.addLayer(marker);
        });

        markers.addTo(map);
        map.fitBounds(markers.getBounds());
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
    }
});

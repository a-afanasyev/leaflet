
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


// initialize
$( document ).ready(function() {
	createMap();
	readCSV(path);
});

// create the map
function createMap(){
	map = L.map('map').setView([0,0],3);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}
// function to read csv data
function readCSV(){
	Papa.parse(path, {
		header: true,
		download: true,
		skipEmptyLines: true,
		complete: function(data) {
			console.log(data);
			
			// map the data
			mapCSV(data);

		}
	});
}

function mapCSV(data){

	// circle options
	let circleOptionsBlue = {
		radius: 8,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}
	let circleOptionsGreen = {
		radius: 8,
		weight: 1,
		color: 'white',
		fillColor: 'Green',
		fillOpacity: 1
	}
    let circleOptionsRed = {
		radius: 8,
		weight: 1,
		color: 'white',
		fillColor: 'Red',
		fillOpacity: 1
	}
    let circleOptionsYellow = {
		radius: 8,
		weight: 1,
		color: 'white',
		fillColor: 'orange',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		//проверяем состояние электоэнергии
		const isPhase1Ok = item.el_ph1 >= 210 && item.el_ph1 <= 230
		const isPhase2Ok = item.el_ph2 >= 210 && item.el_ph2 <= 230
		const isPhase3Ok = item.el_ph3 >= 210 && item.el_ph3 <= 230
		const isVoltageOk = isPhase1Ok && isPhase2Ok && isPhase3Ok;
		const voltageImage = isVoltageOk ? picture_path+"Electricity_Green.png" : picture_path+"Electricity_Orange.png";
		const isVoltageOff = item.el_ph1 == 0 && item.el_ph2 == 0 && item.el_ph3 == 0;
		//проверяем состояние ХВС
		const isColdWaterOk = item.cold_water_pr >= 1;
		const ColdWaterImage = isColdWaterOk ? picture_path+"Water_Blue.png" : picture_path+"Water_No_Blue.png";

		//проверяем состояние ГВС
		const isHotWaterOk = item.hot_water_pr >= 1;
		const HotWaterImage = isHotWaterOk ? picture_path+"Water_Red.png" : picture_path+"Water_No_Red.png";

		if(isVoltageOk && !isVoltageOff && isColdWaterOk && isHotWaterOk){
			//если все ок - рисуем зеленый индикатор и отображаем попап что все ок
			
			//формируем попап с зелеными индикаторами
			let popupContent = `
				<div class="custom-popup-style" style="text-align: center;">
				<strong>${item.region} ${item.markaz} ${item.home}</strong> 
				<br>
				<div>
					<table class="custom-popup-style">
						<tr>
							<td><img src="${picture_path}Electricity_Green.png" alt="Electicity_Ok" style="width: 20px;"></td>
							<td>${item.el_ph1}V</td>
							<td>${item.el_ph2}V</td>
							<td>${item.el_ph3}V</td>
						</tr>
						<tr>
							<td><img src="${picture_path}Water_Blue.png" alt="water_Ok" style="width: 20px;"></td>
							<td colspan="1">${item.cold_water_pr}Bar</td>
							<td colspan="1"><img src="${picture_path}Water_Red.png" alt="water_Ok" style="width: 20px;"></td>
							<td colspan="1">${item.hot_water_pr}Bar</td>
						</tr>

			`;
			let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsGreen)
			.on('mouseover',function(){

                this.bindPopup(popupContent).openPopup()
            })
            
			markers.addLayer(marker)
            

			// create sidebar 
            let sidebarItem = $(`<div class="sidebar-item"><img src="data/images/Electricity_Green.png" alt="Electicity_Ok" style="width: 15px;">
			<img src="data/images/Water_Green.png" alt="Electicity_Ok" style="width: 15px;">${item.region} ${item.markaz} ${item.home}</div>`);

            sidebarItem.click(function() {
                map.setView([item.latitude, item.longitude], 3000);
                marker.bindPopup(popupContent).openPopup();
            });

                // Добавление элемента в соответствующую группу на сайдбаре
             $(`#${item.status}-group .status-items`).append(sidebarItem);

		}
		else if (!isVoltageOff) {
			//если есть электричество но есть отклонения по другим параметрам - рисуем оранжевый индикатор и отображаем попап
		
			// create popup filling
			let popupContent = `
			<div class="custom-popup-style" style="text-align: center;">
			<strong>${item.region} ${item.markaz} ${item.home}</strong> 
			<br>
			<div>
				<table class="custom-popup-style">
					<tr>
					
						<td><img src=${voltageImage} alt="Electricity_Status" style="width: 20px;"></td>
						<td ${!isPhase1Ok ? "class='blinking-cell-orange'" : '' } >${item.el_ph1}V</td>
						<td ${!isPhase2Ok ? "class='blinking-cell-orange'" : '' } >${item.el_ph2}V</td>
						<td ${!isPhase3Ok ? "class='blinking-cell-orange'" : '' } >${item.el_ph3}V</td>
					</tr>
					<tr>
						<td><img src="${ColdWaterImage}" alt="ColdWater_Ok" style="width: 20px;"></td>
						<td colspan="1">${item.cold_water_pr}Bar</td>
						<td colspan="1"><img src="${HotWaterImage}" alt="HotWater_Ok" style="width: 20px;"></td>
						<td colspan="1">${item.hot_water_pr}Bar</td>
					</tr>

			`;

            let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsYellow)
            .on('mouseover',function(){
                this.bindPopup(popupContent).openPopup()
            })
            markers.addLayer(marker)
			
			let sidebarItem = $(`<div class="sidebar-item">${item.region} ${item.markaz} ${item.home}</div>`);

            sidebarItem.click(function() {
                map.setView([item.latitude, item.longitude], 3000);
                marker.bindPopup(popupContent).openPopup();
            });

                // Добавление элемента в соответствующую группу на сайдбаре
             $(`#${item.status}-group .status-items`).append(sidebarItem);
		}

		else if (isVoltageOff){
			//если нет электричества отображаем красный индикатор и рисуем попап с отключением электричества
			// create popup filling
			let popupContent = `
				<div class="custom-popup-style" style="text-align: center;">
				<strong>${item.region} ${item.markaz} ${item.home}</strong> 
				<br>
				<div>
					<table class="custom-popup-style">
						<tr>
							<td><img src="data/images/Electricity_Red.png" alt="Electicity_Ok" style="width: 20px;"></td>
							<td>${item.el_ph1}V</td>
							<td>${item.el_ph2}V</td>
							<td>${item.el_ph3}V</td>
						</tr>
						<tr>
							<td><img src=${ColdWaterImage} alt="ColdWater_Ok" style="width: 20px;"></td>
							<td colspan="1">${item.cold_water_pr}Bar</td>
							<td colspan="1"><img src="${HotWaterImage}" style="width: 20px;"></td>
							<td colspan="1">${item.hot_water_pr}Bar</td>
						</tr>
			`;
			let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsRed)
			.on('mouseover',function(){
				this.bindPopup(popupContent).openPopup()
			})
			markers.addLayer(marker)

			let sidebarItem = $(`<div class="sidebar-item">${item.region} ${item.markaz} ${item.home}</div>`);

			sidebarItem.click(function() {
				map.setView([item.latitude, item.longitude], 3000);
				marker.bindPopup(popupContent).openPopup();
			});

				// Добавление элемента в соответствующую группу на сайдбаре
			$(`#${item.status}-group .status-items`).append(sidebarItem);
				
		}



	})

			// Предположим, что у вас уже есть объект карты Leaflet в переменной `map`
	//	let popup = L.popup({ className: 'blinking-popup' })
	//	.setLatLng([41.28320,69.19576]) // Установите координаты, где должен появиться попап
	//	.setContent("Warning!") // Содержимое попапа
	//	.openOn(map); // Добавьте попап на карту
    
    $('.status-title').click(function() {
        $(this).next('.status-items').slideToggle('fast');
    });
	// add featuregroup to map
	markers.addTo(map)

	// fit map to markers
	map.fitBounds(markers.getBounds())
}

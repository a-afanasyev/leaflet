// 41.28033,69.19897

// Global variables
let map;
// path to csv data
let path = "data/10.csv";

let markers = L.featureGroup();

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
		radius: 10,
		weight: 1,
		color: 'white',
		fillColor: 'dodgerblue',
		fillOpacity: 1
	}
    let circleOptionsRed = {
		radius: 10,
		weight: 1,
		color: 'white',
		fillColor: 'Red',
		fillOpacity: 1
	}
    let circleOptionsYellow = {
		radius: 10,
		weight: 1,
		color: 'white',
		fillColor: 'orange',
		fillOpacity: 1
	}

	// loop through each entry
	data.data.forEach(function(item,index){
		// create a marker
		if(item.status === 'ok') {
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsBlue)
            .on('mouseover',function(){
                this.bindPopup(`${item.Region} ${item.markaz} ${item.home}<br>All Good`).openPopup()
            })
            markers.addLayer(marker)
            
            let sidebarItem = $(`<div class="sidebar-item">${item.Region} ${item.markaz} ${item.home}</div>`);

            sidebarItem.click(function() {
                map.setView([item.latitude, item.longitude], 3000);
                marker.bindPopup(`${item.Region} ${item.markaz} ${item.home}<br>All Good`).openPopup();
            });

                // Добавление элемента в соответствующую группу на сайдбаре
             $(`#${item.status}-group .status-items`).append(sidebarItem);

            

            //$('.sidebar').append('<div class="sidebar-item">'+item.home+'</div>')

        } else if (item.status === 'war') {
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsYellow)
            .on('mouseover',function(){
                this.bindPopup(`${item.Region} ${item.markaz} ${item.home}<br>Warning`).openPopup()
            })
            markers.addLayer(marker)
        } else {
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptionsRed)
            .on('mouseover',function(){
                this.bindPopup(`${item.Region} ${item.markaz} ${item.home}<br>Error`).openPopup()
            })
            markers.addLayer(marker)
        }

	})
    
    $('.status-title').click(function() {
        $(this).next('.status-items').slideToggle('fast');
    });
	// add featuregroup to map
	markers.addTo(map)

	// fit map to markers
	map.fitBounds(markers.getBounds())
}
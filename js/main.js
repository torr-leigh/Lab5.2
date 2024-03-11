//MAP 
var map = L.map('map').setView([43.8, -120.55], 6)
;

var Esri_WorldPhysical = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
}).addTo(map);


// style for watershed boundaries
var myStyle = {
    "color": "#8A51FD",  
    "weight": 2,
    dashArray: '4',
    "fillOpacity": 0
};


//___add geojson from data folder to map
fetch('data/watershed_boundaries_OR.json') 
.then(response => response.json())
.then(geojsonData => {
    var geojson = L.geoJSON(geojsonData, {
        style: myStyle,
        onEachFeature: onEachFeature
    }).addTo(map);
})
.catch(error => console.error('Error: ', error));

    // Event handling functions
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#40ABCF',
            dashArray: '',
            fillOpacity: 0.1
        });

        layer.bringToFront();
    }

    function resetHighlight(e) {
        var layer = e.target;
        layer.setStyle(myStyle);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }


    fetch('data/thermal_springs_OR.geojson.json') 
    .then(response => response.json())
    .then(data => {
        riversLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Define marker options
                var hotSpringMarker = {
                    radius: 5, // Adjust the size of the circle
                    fillColor: getColor(feature.properties.newTemp), // Call a function to get the color based on the value in one of the fields
                    color: "#000", // Border color
                    weight: 1, // Border width
                    opacity: 1, // Border opacity
                    fillOpacity: 0.8 // Fill opacity
                };
                return L.circleMarker(latlng, hotSpringMarker);
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error: ', error));

// Function to get color based on value
function getColor(newTemp) {
    // Define temperature ranges and corresponding colors
    if (newTemp < 82) {
        return '#FFDD62'; // color for temperature < 82
    } else if (newTemp >= 82 && newTemp <= 106) {
        return 'green'; // color for temperature between 82 and 106
    } else {
        return '#F1515E'; // color for temperature > 106
    }
}


// Load your GeoJSON datasets
// below: It fetches the GeoJSON data for hot springs and watershed boundaries using fetch.
// It uses Promise.all to wait for both fetch requests to resolve.
// When both GeoJSON datasets are successfully loaded, it converts them into Turf.js feature 
// collections. It iterates over each watershed polygon, filters the hot springs that fall 
// within each watershed using Turf.js pointsWithinPolygon, and counts them.
// It stores the counts in an object hotSpringsCountByWatershed, where the keys are the watershed IDs.
// Finally, it logs the hotSpringsCountByWatershed object to the console.
 //____________________________________________________________
// Load your GeoJSON datasets
/* Promise.all([
    fetch('data/thermal_springs_OR.geojson.json').then(response => response.json()),
    fetch('data/watershed_boundaries_OR.json').then(response => response.json())
]).then(([hotSpringsData, watershedsData]) => {
    var hotSprings = turf.featureCollection(hotSpringsData.features.map(feature => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties
    })));
    var watersheds = turf.featureCollection(watershedsData.features);

    // Create an empty object to store the count of hot springs in each watershed
    var hotSpringsCountByWatershed = {};

    // Iterate over each watershed polygon
    watersheds.features.forEach(function(watershed) {
        // Check if the ID property exists before accessing it
        if (watershed.properties && watershed.properties.id) {
            var watershedId = watershed.properties.id;

            // Use Turf.js to filter hot springs that are within the current watershed polygon
            var hotSpringsWithinWatershed = turf.pointsWithinPolygon(hotSprings, watershed.geometry);

            // Get the count of hot springs within the current watershed
            var hotSpringsCount = hotSpringsWithinWatershed.features.length;

            // Store the count in the object with the watershed ID as key
            hotSpringsCountByWatershed[watershedId] = hotSpringsCount;
        }
    });

    // Now hotSpringsCountByWatershed object contains the count of hot springs within each watershed
    console.log(hotSpringsCountByWatershed);
}).catch(error => console.error('Error loading GeoJSON: ', error));



//_________________________

*/
/*
// Load your GeoJSON datasets
Promise.all([
    fetch('data/thermal_springs_OR.geojson.json').then(response => response.json()),
    fetch('data/watershed_boundaries_OR.json').then(response => response.json())
]).then(([hotSpringsData, watershedsData]) => {
    var hotSprings = turf.featureCollection(hotSpringsData.features.map(feature => ({
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties
    })));
    var watersheds = turf.featureCollection(watershedsData.features);

    // Create an empty object to store the count of hot springs in each watershed
    var hotSpringsCountByWatershed = {};

    // Iterate over each watershed polygon
    watersheds.features.forEach(function(watershed) {
        // Check if the ID property exists before accessing it
        if (watershed.properties && watershed.properties.id) {
            var watershedId = watershed.properties.id;

            // Use Turf.js to filter hot springs that are within the current watershed polygon
            var hotSpringsWithinWatershed = turf.pointsWithinPolygon(hotSprings, watershed.geometry);

            // Get the count of hot springs within the current watershed
            var hotSpringsCount = hotSpringsWithinWatershed.features.length;

            // Store the count in the object with the watershed ID as key
            hotSpringsCountByWatershed[watershedId] = hotSpringsCount;
        }
    });

    // Define a color scale for the choropleth map
    function getColor(hotSpringsCount) {
        if (hotSpringsCount === 0) {
            return 'white';
        } else if (hotSpringsCount >= 1 && hotSpringsCount <= 3) {
            return 'grey';
        } else {
            return 'black';
        }
    }

    // Style function to assign colors to watershed polygons based on hot springs count
    function style(feature) {
        var watershedId = feature.properties.id;
        var hotSpringsCount = hotSpringsCountByWatershed[watershedId] || 0; // Default to 0 if no hot springs found
        var fillColor = getColor(hotSpringsCount);
        
        return {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    // Add watershed polygons to the map with the choropleth style
    L.geoJSON(watersheds, {
        style: style
    }).addTo(map);

// Add legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = ['0', '1-3', '3+'];

    div.innerHTML += '<h4>Hot Springs Count</h4>';
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(parseInt(grades[i])) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
}).catch(error => console.error('Error loading GeoJSON: ', error));

*/


//MAP  2
var map2 = L.map('map2').setView([43.8, -120.55], 6)
;

var Esri_WorldPhysical = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
	maxZoom: 8
}).addTo(map2);

//fetch geojson count file
fetch('data/hs_ws_count.geojson') 
.then(response => response.json())
.then(geojsonData => {
    var geojson = L.geoJSON(geojsonData, {
        style: style3
    }).addTo(map2);
})
.catch(error => console.error('Error: ', error));

function getColor2(d) {
    return d === 10 ? '#150e37' :
           d === 9  ? '#3b0f6f' :
           d === 8  ? '#641a80' :
           d === 6  ? '#8c2981' :
           d === 5  ? '#b6367a' :
           d === 4  ? '#dd4a69' :
           d === 3  ? '#f66f5c' :
           d === 2  ? '#fe9f6d' :
           d === 1  ? '#fece91' :
           d === 0  ? '#fcfdbf' :
                      '#FFEDA0';
}
function style3(feature) {
    return {
        fillColor: getColor2(feature.properties.NUMPOINTS),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

L.geoJson('data/hs_ws_count.geojson', {style: style3}).addTo(map2);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map2) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor2(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
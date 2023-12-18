// Store our API endpoing as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create basemap, overlay and map object globally to be shared between Earthquake (Part-1) and Tectonic (Part-2)
let baseMaps = {};
let overlayMaps = {};
let myMap = null;

// Perform a GET request to the query URL
d3.json(queryURL).then(function(data){
    // Once e get a response, send the data.features and data.features object to the createFeatures function.
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData){

    // Give each feature a popup describing the place, ISO time format, magnitude, depth, and number of time felt
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p><hr><p>Number of Incidents: ${feature.properties.felt}`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*4,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: "#000000",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.65
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
}

// Circles color palette based on mag (feature) data marker: data markers should reflect the magnitude of the earthquake by their size and the depth of the earthquake by color. Earthquakes with higher magnitudes should appear larger, and earthquakes with greater depth should appear darker in color.
function chooseColor(value){
    switch(true){
        case(-10.0 <= value && value <= 10.0):
            return "#a3f600"; 
        case (10.1 <= value && value <=30.0):
            return "#dcf400";
        case (30.1 <= value && value <=50.0):
            return "#f7db11";
        case (50.1 <= value && value <= 70.0):
            return "#fdb72a";
        case (70.1 <= value && value <=90.0):
            return "#fca35d";
        case (value > 90.0):
            return "#ff5f65";  
        default:
            return "#FEB24C";
    }
}

// Create map legend to provide context for map data
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 10, 30, 50, 70, 90];
    var labels = [];
    var legendInfo = "<h4>Legend -- Depth</h4>";

    div.innerHTML = legendInfo

    // go through each magnitude item to label and color the legend
    // push to labels array as list item
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Create map
function createMap(earthquakes) {
   // Define outdoors and graymap layers
   let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "outdoors-v11",
    accessToken: API_KEY
  })

  let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "light-v10",
    accessToken: API_KEY
  });

  let satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Assign values to baseMaps object to hold our base layers
  baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap,
    "Satellite": satelliteLayer
  };

  // // Create overlay object to hold our overlay layer
  overlayMaps['Earthquakes'] = earthquakes;

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 4,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}
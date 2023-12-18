// The link to get the tectonic plate boundaries data
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
var tectLayer = new L.layerGroup();

d3.json(tectonicURL).then((tectData) => {
    L.geoJSON(tectData, {
        color: "#fd9f00",
        weight: 2
    }).addTo(tectLayer);

    overlayMaps['Tectonic Layer'] = tectLayer
})
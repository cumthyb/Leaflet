var mymap = L.map("mapid").setView([51.505, -0.09], 13);

L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY3VtdGh5YiIsImEiOiJjamZ5NW9mNmEwZWlzMnFvYmJqZGtydnNpIn0.8abUPjkH8Ds6uCoXvKP02w", {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: "mapbox.streets"
    }
).addTo(mymap);

/*
    var BING_KEY = 'AjplQ1rClfpeFOrGCshKt6fnHdbQ8YAPsGpVvq6EoKRTFfdhKju8aSCSWI0TXDZh'
    var mymap = L.map('mapid').setView([51.505, -0.09], 13)
    var bingLayer = L.TileLayer.Bing(BING_KEY).addTo(mymap)
*/

var marker = L.marker([51.5, -0.09]).addTo(mymap);

var circle = L.circle([51.508, -0.11], {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);

var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");



var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);
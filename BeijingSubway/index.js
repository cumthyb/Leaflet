var map = L.map("mapid", {
    attributionControl: false
}).setView([39.9, 116.36], 13);

var baseLayer = L.tileLayer(
    "https://api.mapbox.com/styles/v1/cumthyb/cjg59eh0x1qdp2sp51uct6dsd/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiY3VtdGh5YiIsImEiOiJjamZ5NW9mNmEwZWlzMnFvYmJqZGtydnNpIn0.8abUPjkH8Ds6uCoXvKP02w",
);

var geojson;


function loadJSON() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "geojson.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                geojson = JSON.parse(xhr.responseText);
                let [lines, stations] = AddGeo2map(geojson);
                map.layers = [baseLayer, lines, stations];
                var baseMaps = {
                    "baselayer": baseLayer,
                };

                var overlayMaps = {
                    "lines": lines,
                    'stations': stations
                };

                L.control.layers(baseMaps, overlayMaps).addTo(map);
            }
        }
    }
    xhr.send();
}

loadJSON();

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};


/**
 * 生成图标
 * 
 * @param {any} isTransfer 是否换乘站
 * @returns 
 */
function getPointIcon(isTransfer) {
    let option = {
        iconSize: [20, 20], // size of the icon
        shadowSize: [35, 35], // size of the shadow
        iconAnchor: [10, 10], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [0, -15] // point from which the popup should open relative to the iconAnchor
    };
    option.iconUrl = (isTransfer ? "./rules.ico" : "./subway.ico");
    return L.icon(option);
}

const colors = ["#DAA520", "#FF8247", "#B23AEE", "#EE2C2C", "#228B22"];

/**
 * 线样式
 * 
 * @param {any} params 
 * @returns 
 */
function getLineStyle(params) {
    return {
        stroke: true,
        color: colors[Math.round(Math.random() * 5)]
    }
}

/**
 * 站点消息弹框
 * 
 * @param {any} properties 
 * @returns 
 */
function getInfoForm(properties) {
    console.log(properties)
    return `
            <table class='station-info'>
                <caption>${properties.name}</caption>
                <tr>
                    <td>是否换乘站</td>
                    <td>${properties.isTransfer?"是":"否"}</td>
                </tr>
                <tr>
                    <td>始发时间(往)</td>
                    <td>${properties.time.go.start}</td>
                </tr>
                <tr>
                <td>末班时间(往)</td>
                <td>${properties.time.go.end}</td>
            </tr>
            <tr>
            <td>始发时间(返)</td>
            <td>${properties.time.back.start}</td>
        </tr>
        <tr>
        <td>末班时间(返)</td>
        <td>${properties.time.back.end}</td>
    </tr>
            </table>
`
}




/**
 * 在Map上生成Geo
 * 
 * @param {any} geojson 
 */
function AddGeo2map(geojson) {
    //加载站点
    let stations = L.geoJSON(geojson, {
        filter: feature => feature.geometry.type === "Point",
        pointToLayer: function(feature, latlng) {
            // return L.circleMarker(latlng, geojsonMarkerOptions);
            return L.marker(latlng, { icon: getPointIcon(feature.properties.isTransfer) });
        }
    }).bindPopup(function(layer) {
        return getInfoForm(layer.feature.properties);
        // return layer.feature.properties.name;
    });

    //加载路线
    let lines = L.geoJSON(geojson, {
        filter: feature => feature.geometry.type === "LineString",
        style: feature => getLineStyle(feature)
    }).bindPopup(function(layer) {
        return layer.feature.properties.name;
    });
    return [lines, stations];
}
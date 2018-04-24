var map = L.map("mapid", {
    attributionControl: false
}).setView([39.9, 116.36], 13);

var baseLayer = L.tileLayer(
    "https://api.mapbox.com/styles/v1/cumthyb/cjg59eh0x1qdp2sp51uct6dsd/tiles/256/{z}/{x}/{y}?" + "access_token=pk.eyJ1IjoiY3VtdGh5YiIsImEiOiJjamZ5NW9mNmEwZWlzMnFvYmJqZGtydnNpIn0.8abUPjkH8Ds6uCoXvKP02w"
);

var geojson;

// TODO 请求Geojson并加载
function loadJSON() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "geojson.json", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status != 200) {
                return;
            }
            geojson = JSON.parse(xhr.responseText);
            let [lines, stations, heatmapLayer] = AddGeo2map(geojson);
            map.layers = [baseLayer, lines, stations];
            var baseMaps = {
                "baselayer": baseLayer,
            };
            var overlayMaps = {
                "lines": lines,
                "stations": stations,
                "heat": heatmapLayer
            };
            L.control.layers(baseMaps, overlayMaps).addTo(map);
        }
    };
    xhr.send();
}

loadJSON();


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
    };
}

/**
 * 站点消息弹框
 *
 * @param {any} properties
 * @returns
 */
function getInfoForm(properties) {
    console.log(properties);
    return `
            <table class='station-info'>
                <caption>${properties.name}</caption>
                <tr>
                    <td>是否换乘站</td>
                    <td>${properties.isTransfer ? "是" : "否"}</td>
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
`;
}

var heatData = {};
heatData.max = 11;
heatData.data = [];

/**
 * 在Map上生成Geo
 *
 * @param {any} geojson
 */
function AddGeo2map(geojson) {
    //加载站点
    let points = [];
    let stations = L.geoJSON(geojson, {
        filter: feature => feature.geometry.type === "Point",
        pointToLayer: function (feature, latlng) {
            points.push(latlng);
            return L.marker(latlng, {icon: getPointIcon(feature.properties.isTransfer)});
        }
    }).bindPopup(function (layer) {
        return getInfoForm(layer.feature.properties);
        // return layer.feature.properties.name;
    });

    //加载路线
    let lines = L.geoJSON(geojson, {
        filter: feature => feature.geometry.type === "LineString",
        style: feature => getLineStyle(feature)
    }).bindPopup(function (layer) {
        return layer.feature.properties.name;
    });

    points.map((point, index) => {
        heatData.data.push({lat: point.lat, lng: point.lng, count: Math.random() * 10 + 1});
    });

    var heatmapLayer = new HeatmapOverlay(cfg);
    map.addLayer(heatmapLayer);
    heatmapLayer.setData(heatData);


    return [lines, stations, heatmapLayer];
}


/*
// don't forget to include leaflet-heatmap.js
var testData = {
    max: 8,
    data: [{lat: 24.6408, lng:46.7728, count: 3},{lat: 50.75, lng:-1.55, count: 1}, ...]
};


*/
var cfg = {
    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    // if scaleRadius is false it will be the constant radius used in pixels
    "radius": 10,
    "maxOpacity": .8,
    // scales the radius based on map zoom
    "scaleRadius": true,
    // if set to false the heatmap uses the global maximum for colorization
    // if activated: uses the data maximum within the current map boundaries
    //   (there will always be a red spot with useLocalExtremas true)
    "useLocalExtrema": true,
    // which field name in your data represents the latitude - default "lat"
    latField: "lat",
    // which field name in your data represents the longitude - default "lng"
    lngField: "lng",
    // which field name in your data represents the data value - default "value"
    valueField: "count",
    gradient: {
        "0.99": "rgba(255,0,0,1)",
        "0.9": "rgba(255,255,0,1)",
        "0.8": "rgba(0,255,0,1)",
        "0.5": "rgba(0,255,255,1)",
        "0": "rgba(0,0,255,1)"
    }
};



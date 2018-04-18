var Koa = require('koa');
var cors = require('koa2-cors');
var bodyParser = require('koa-bodyparser');
var router = require('koa-router')();
var axios = require("axios")
var fs = require("fs")
var coordtransform = require('coordtransform');

var app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(router.routes());

router.get('/', async(ctx, next) => {
    let p1 = getJSON_daw();
    let p2 = getJSON_info();

    const p = Promise.all([p1, p2]);

    p.then(() => {
        geojson = getGeoJson();
        ctx.response.body =
            '<h1>Index</h1> <form action="/login" method="post"> ' +
            '<p>Name: <input name="name"></p>' +
            ' <p>Password: <input name="password" type="password"></p> ' +
            '<p><input type="submit" value="Submit"></p>' +
            ' </form>';
    }).catch(error => {
        console.log(error)
    })
});


router.get('/1', async(ctx, next) => {
    let geojson = getGeoJson();
    ctx.response.body =
        '<h1>Index</h1> <form action="/login" method="post"> ' +
        '<p>Name: <input name="name"></p>' +
        ' <p>Password: <input name="password" type="password"></p> ' +
        '<p><input type="submit" value="Submit"></p>' +
        ' </form>';
});


app.listen(3000);


var _obj_daw;

function getJSON_daw() {
    return axios.get("http://map.amap.com/service/subway?srhdata=1100_drw_beijing.json")
        .then(function(response) {　　
            // console.log(''.concat(response.data, '\r\n', response.status, '\r\n', response.statusText, '\r\n', response.headers, '\r\n', response.config));
            _obj_daw = response.data;
            fs.writeFile('drw.json', JSON.stringify(response.data), (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        })
        .catch(function(error) {　　
            console.log(error);
        });
}


var _obj_info;

function getJSON_info() {
    return axios.get("http://map.amap.com/service/subway?srhdata=1100_info_beijing.json")
        .then(function(response) {　　
            // console.log(''.concat(response.data, '\r\n', response.status, '\r\n', response.statusText, '\r\n', response.headers, '\r\n', response.config));
            _obj_info = response.data;
            fs.writeFile('info.json', JSON.stringify(response.data), (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });
        })
        .catch(function(error) {　　
            console.log(error);
        });
}

function getGeoJson(params) {
    let geojson = initGeoJson();
    _obj_daw.l.map((line, index) => {
        let lineObj = getLineJson();
        lineObj.properties.name = line.kn; //线路名称
        lineObj.properties.lineID = line.ls; //线路ID
        lineObj.properties.isLoop = line.lo === "1"; //是否环线

        line.st.map((station, index2) => {
            let coordStr = station.sl.split(',');
            let coord = [coordStr[0] - 0, coordStr[1] - 0];

            gcj02towgs84 = coordtransform.gcj02towgs84(coord[0], coord[1]);

            lineObj.geometry.coordinates.push(gcj02towgs84);

            let pointObj = getPointJson();
            pointObj.geometry.coordinates = gcj02towgs84;
            pointObj.properties.name = station.n;
            pointObj.properties.index = index2;
            console.log(line.ls)

            let sl = _obj_info["l"].filter(p => p.ls === line.ls)[0]["st"][index2];

            try {
                pointObj.properties.time = {
                    "go": { "start": sl["d"][0]["ft"], "end": sl["d"][0]["lt"] },
                    "back": { "start": sl["d"][1]["ft"], "end": sl["d"][1]["lt"] }
                }
            } catch (error) {
                console.log(error)
            }

            geojson.features.push(pointObj);
        })
        geojson.features.push(lineObj);



    })
    fs.writeFile("geojson.json", JSON.stringify(geojson), error => console.log(error));
    return geojson;

}

function initGeoJson() {
    let geojson = {};
    geojson.type = "FeatureCollection";
    geojson.features = [];
    return geojson;
}

function getPointJson() {
    let point = {}
    point.type = "Feature";
    point.geometry = {};
    point.geometry.type = "Point";
    point.geometry.coordinates = [];
    point.properties = {};
    return point;
}

function getLineJson() {
    let line = {}
    line.type = "Feature";
    line.geometry = {};
    line.geometry.type = "LineString";
    line.geometry.coordinates = [];
    line.properties = {};
    return line;
}
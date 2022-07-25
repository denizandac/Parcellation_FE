var coordinate = [0, 0, 0, 0];
const vsource = new ol.source.Vector();

const vector = new ol.layer.Vector({
    source: vsource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({                   //Polygon Layout
            color: 'rgba(122, 255, 122, 0.3)',
        }),
        stroke: new ol.style.Stroke({               //Line Layout
            color: '#00580d',
            width: 3,
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({               //Single Point Layout
                color: '#00ad1a',
            }),
        }),
    }),
});

const modify = new ol.interaction.Modify({ source: vsource });

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }), vector
    ],
    view: tr_default = new ol.View({
        center: [35.81117486687671, 38.48532145357543],
        zoom: 6.33,
        projection: 'EPSG:4326'
    })
});

map.addInteraction(modify);

let draw, snap; // global so we can remove them later
const typeSelect = document.getElementById('type');

function addInteractions() {
    draw = new ol.interaction.Draw({
        source: vsource,
        type: typeSelect.value,
    });
    map.addInteraction(draw);
    snap = new ol.interaction.Snap({ source: vsource });
    map.addInteraction(snap);
    draw.on('drawend', function (evt) {
        console.log(evt.feature);
    })
}

const ilSelect = document.getElementById('il');

typeSelect.onchange = function () {
    console.log("type_select_changed");
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
};

ilSelect.onchange = function () {
    /*
    tr_default.center = ol.proj.fromLonLat([ankara.coordinate.lon, ankara.coordinate.lat]);
    tr_default.view.zoom = 7;
    */

    console.log(ilSelect.value);
    switch (ilSelect.value) {
        case "varsayılan":
            map.getView().fit([25.510800189155127, 35.8222391628244, 45.01489847773129, 40.86525153675757], map.getSize());
            break;

        case "antalya":
            coordinate = [29.10650084190967, 35.811034908759645, 32.76815589623481, 37.55449929665927];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "ankara":
            coordinate = [32.53327463710088, 39.675318075832415, 33.077913086276254, 40.07245027835613];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "eskisehir":
            coordinate = [29.768962060873545, 38.959541960310034, 32.14294905433248, 40.267807238439104];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "istanbul":
            coordinate = [27.779327966474582, 40.67360032713637, 30.06122383706303, 41.72694348494914];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "izmir":
            coordinate = [26.142466377787763, 37.73303061464326, 28.571379377252004, 39.436895215354696];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "züvas":

            var audio = new Audio('züvas.mp3');
            audio.play();
            coordinate = [35.66697915108025, 38.40365106512393, 39.01006713787671, 40.70293430196919];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "haymana":
            coordinate = [32.4859955753491, 39.42228574503231, 32.5160619735757, 39.448825123466946];
            map.getView().fit(coordinate, map.getSize());
            break;

        default:
            break;
    }
};

addInteractions();
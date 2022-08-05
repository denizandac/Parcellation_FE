var coordinate = [0, 0, 0, 0];
var wkt = new ol.format.WKT();
const vsource = new ol.source.Vector();

get_all_data();

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

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }), vector
    ],
    view: tr_default = new ol.View({
        center: [35.51117486687671, 38.48532145357543],
        zoom: 6,
        projection: 'EPSG:4326'
    })
});

var modify = new ol.interaction.Modify({ source: vsource });
map.addInteraction(modify);

let draw, snap; // global so we can remove them later


var savevar = document.getElementById("save");
var exitvar = document.getElementById("exit");

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
        cur_feature = evt.feature;
        cur_wkt = wkt.writeFeature(evt.feature);
        modal.style.display = "block";

        savevar.onclick = function () {
            // tabloya ekleme operasyonları
            var il = document.getElementById("il").value;
            var ilce = document.getElementById("ilce").value;
            cur_feature.il = il;
            cur_feature.ilce = ilce;
            //insert to table
            send_data(cur_feature, il, ilce, cur_wkt);
            insert_to_table(cur_feature.id, cur_wkt, il, ilce);
            modal.style.display = "none";
            clear_saves();

        }
        exitvar.onclick = function () {
            // mape eklemeden çık
            console.log(vsource.getFeatures().length);
            vsource.removeFeature(vsource.getFeatures()[vsource.getFeatures().length - 1]);
            modal.style.display = "none";

        }
    })
}

const typeSelect = document.getElementById('type_selection');
typeSelect.onchange = function () {
    console.log("type_select_changed");
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
};

const ilSelect = document.getElementById('il_selection');
ilSelect.onchange = function () {
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

function clear_saves() {
    document.getElementById('il').value = " ";
    document.getElementById('ilce').value = " ";
}

function insert_to_table(id, wkt, il, ilce) {
    var il_var = document.getElementById("il");
    var ilce_var = document.getElementById("ilce");
    var table = document.getElementById("table_id");
    var delete_button = document.createElement('input');
    var update_button = document.createElement('input');
    delete_button.id = "delete_button";
    delete_button.type = "button";
    delete_button.value = "Sil";
    delete_button.className = "exit";
    update_button.id = "update_button";
    update_button.type = "button";
    update_button.value = "Düzenle";
    update_button.className = "save";
    var row = table.insertRow(1);
    row.id = wkt;
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    cell1.innerHTML = id;
    cell2.innerHTML = il;
    cell3.innerHTML = ilce;
    cell4.innerHTML = wkt;
    cell5.appendChild(update_button);
    cell5.appendChild(delete_button);

    delete_function(id, wkt, il, ilce);
    update_function(id, wkt, il, ilce);
}

function delete_function(id, wkt, il, ilce,) {
    var cur_button = document.getElementById("delete_button");
    var cur_wkt = wkt;
    var cur_il = il;
    var cur_ilce = ilce;

    cur_button.onclick = function () {
        var deleted_row = document.getElementById(wkt);
        deleted_row.parentNode.removeChild(deleted_row);
        delete_data(id, cur_il, cur_ilce, cur_wkt);
        var features = vsource.getFeatures();
        for (var i in features) {
            if (features[i].id == id) {
                vsource.removeFeature(features[i]);
            }
        }
        console.log("parsel updated");
        alert("Parsel Silindi");
    }
}

function update_function(id, wkt, il, ilce,) {
    var cur_button2 = document.getElementById("update_button");
    var cur_wkt = wkt;
    var last_il = il;
    var last_ilce = ilce;

    cur_button2.onclick = function () {
        document.getElementById("il_edit").value = last_il;
        document.getElementById("ilce_edit").value = last_ilce;
        modal_edit.style.display = "block";

        document.getElementById("editParsel").onclick = function () {
            var cur_il = document.getElementById("il_edit").value;
            var cur_ilce = document.getElementById("ilce_edit").value;
            update_data(id, cur_il, cur_ilce, cur_wkt);
            /*
            for (var i in document.getElementById("table_id").rows) {
                var cur_row = document.getElementById("table_id").rows[i];
                if (cur_row[1] == last_il && cur_row[2] == last_ilce) {
                    cur_row[1] = cur_il;
                    cur_row[2] = cur_ilce;
                }
            }
            */
            console.log("parsel updated");
            modal_edit.style.display = "none";
        }
        document.getElementById("deleteParsel").onclick = function () {
            var deleted_row = document.getElementById(wkt);
            deleted_row.parentNode.removeChild(deleted_row);
            delete_data(id, cur_il, cur_ilce, cur_wkt);
            var features = vsource.getFeatures();
            for (var i in features) {
                if (features[i].id == id) {
                    vsource.removeFeature(features[i]);
                }
            }
            console.log("parsel deleted");
            modal_edit.style.display = "none";
            alert("Parsel Silindi");
        }
    }
}

addInteractions();

// ajax-part

function get_one(id) {
    $.ajax({
        url: "https://localhost:44308/api/parcel",
        dataType: "json",
        type: "get",
        contentType: "application/json",
        success: function (data) {
            for (var i in data) {
                if (id == data[i].id) {
                    insert_to_table(data[i].id, data[i].wkt, data[i].il, data[i].ilce);
                }
            }
        }
    });
}

function get_all_data() {
    $.ajax({
        url: "https://localhost:44308/api/parcel",
        dataType: "json",
        type: "get",
        contentType: "application/json",
        success: function (data) {
            for (var i in data) {
                insert_to_table(data[i].id, data[i].wkt, data[i].il, data[i].ilce);
            }
        }
    });
}
function send_data(sended_, sended_il, sended_ilce, sended_wkt) {
    $.ajax({
        url: "https://localhost:44308/api/parcel",
        dataType: "json",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ "il": sended_il, "ilce": sended_ilce, "wkt": sended_wkt }),
        success: function (data) {
            sended_.id = data;
        }
    });
}

function delete_data(deleted_, deleted_il, deleted_ilce, deleted_wkt) {
    $.ajax({
        url: "https://localhost:44308/api/parcel",
        dataType: "json",
        type: "delete",
        contentType: "application/json",
        data: JSON.stringify({ "id": deleted_, "il": deleted_il, "ilce": deleted_ilce, "wkt": deleted_wkt }),
    });
}

function update_data(updated_, updated_il, updated_ilce, updated_wkt) {
    $.ajax({
        url: "https://localhost:44308/api/parcel/update",
        dataType: "json",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ "id": updated_, "il": updated_il, "ilce": updated_ilce, "wkt": updated_wkt }),
    });
}
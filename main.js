var coordinate = [0, 0, 0, 0];
var wkt = new ol.format.WKT();
const vsource = new ol.source.Vector();
var il_selected;
var flag;

get_all_data();

const vector = new ol.layer.Vector({
    source: vsource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({                   //Polygon Layout
            color: 'rgba(2, 89, 69, 0.300)',
        }),
        stroke: new ol.style.Stroke({               //Line Layout
            color: '#025945',
            width: 3,
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({               //Single Point Layout
                color: '#025945',
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
        zoom: 6.1,
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

    modify.on('modifyend', function (evt) {
        var cur_wkt = evt.features.getArray()[0];
        flag = 0;
        update_data(cur_wkt.id, cur_wkt.il, cur_wkt.ilce, wkt.writeFeature(cur_wkt));
        var table = document.getElementById('table_id');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        $.ajax({
            url: 'https://localhost:44398/api/parcel',
            dataType: 'json',
            type: 'get',
            contentType: 'application/json',
            data: { "data": "check" },
            success: function (data) {
                for (var i in data) {
                    // debugger
                    if (flag != data.length) {
                        flag++;
                        insert_to_table(data[i].id, data[i].wkt, data[i].il, data[i].ilce);
                    }
                }
            }
        });
        clear_saves();
    });

    draw.on('drawend', function (evt) {
        var sended_geometry_coordinates = evt.feature.getGeometry().getCoordinates();
        //console.log(sended_geometry_coordinates);
        cur_feature = evt.feature;
        cur_wkt = wkt.writeFeature(evt.feature);
        //console.log(cur_wkt);
        var cur_arr = convert_string_to_lonlat(cur_wkt);
        //console.log(cur_arr.length)
        if (cur_arr.length > 1) {
            jQuery.get("https://localhost:44398/api/parcel/intersect", { lon: cur_arr[1], lat: cur_arr[2] }, function (data) {
                console.log(data.il);
                il_selected = data.il;

            })
            //console.log(intersected_il)
        }

        if (il_selected != undefined && il_selected != "Varsayılan") {
            document.getElementById("il").value = il_selected;
        }
        modal.style.display = "block";
        savevar.onclick = function () {
            // tabloya ekleme operasyonları
            if (!document.getElementById("il").value && !document.getElementById("ilce").value) {
                alert("Lütfen İl ve İlçe Giriniz");
            }
            else if (!document.getElementById("il").value && document.getElementById("ilce").value) {
                alert("Lütfen İl Giriniz");
            }
            else if (document.getElementById("il").value && !document.getElementById("ilce").value) {
                alert("Lütfen İlçe Giriniz");
            }
            else {
                var il = document.getElementById("il").value;
                var ilce = document.getElementById("ilce").value;
                cur_feature.il = il;
                cur_feature.ilce = ilce;
                //insert to table
                $.ajax({
                    url: "https://localhost:44398/api/parcel",
                    dataType: "json",
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify({ "il": cur_feature.il, "ilce": cur_feature.ilce, "wkt": cur_wkt }),
                    success: function (data) {
                        cur_feature.id = data.id;
                        insert_to_table(cur_feature.id, cur_wkt, il, ilce);
                    }
                });
                modal.style.display = "none";
                clear_saves();
            }
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
    il_selected = " ";
    console.log("type_select_changed");
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
};

const ilSelect = document.getElementById('il_selection');
ilSelect.onchange = function () {
    il_selected = ilSelect.value;
    switch (ilSelect.value) {
        case "Varsayılan":
            map.getView().fit([25.510800189155127, 35.8222391628244, 45.01489847773129, 40.86525153675757], map.getSize());
            break;

        case "Antalya":
            coordinate = [29.10650084190967, 35.811034908759645, 32.76815589623481, 37.55449929665927];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "Ankara":
            coordinate = [32.53327463710088, 39.675318075832415, 33.077913086276254, 40.07245027835613];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "Eskisehir":
            coordinate = [29.768962060873545, 38.959541960310034, 32.14294905433248, 40.267807238439104];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "İstanbul":
            coordinate = [27.779327966474582, 40.67360032713637, 30.06122383706303, 41.72694348494914];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "İzmir":
            coordinate = [26.142466377787763, 37.73303061464326, 28.571379377252004, 39.436895215354696];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "Sivas":
            var audio = new Audio('züvas.mp3');
            audio.play();
            coordinate = [35.66697915108025, 38.40365106512393, 39.01006713787671, 40.70293430196919];
            map.getView().fit(coordinate, map.getSize());
            break;

        case "Haymana":
            coordinate = [32.4859955753491, 39.42228574503231, 32.5160619735757, 39.448825123466946];
            map.getView().fit(coordinate, map.getSize());
            break;

        default:
            break;
    }
};

function convert_string_to_lonlat(curr_wkt) {
    var arr = [];
    var ilk = curr_wkt.split("(");
    arr[0] = ilk[0];
    if (arr[0] == 'POINT') {
        var ilk_ = ilk[1].split(" ");
        var ikinci = ilk_[1].split(")");
        var ilk_float = parseFloat(ilk_[0]);
        var ikinci_float = parseFloat(ikinci[0]);
        arr[1] = ilk_float;
        arr[2] = ikinci_float;
        //console.log(arr)
    }
    return arr;
}
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
    delete_button.value = "SİL";
    delete_button.className = "exit";
    delete_button.style = "width: 80px;"
    update_button.id = "update_button";
    update_button.type = "button";
    update_button.value = "DÜZENLE";
    update_button.className = "save";
    update_button.style = "width: 80px;"
    var row = table.insertRow(1);
    row.id = id;
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
// var delete_all_button = document.getElementById("delete_all_button");
// delete_all_button.onclick = function () {
//     console.log("tüm parseller silindi");
//     for (var i in (document.getElementById("table_id")).rows) {
//         var cur_row = (document.getElementById("table_id")).rows[i];
//         if (cur_row.id != undefined && cur_row.id) {
//             console.log(cur_row)
//             console.log(cur_row.cells[0])
//             console.log(cur_row.cells[1])
//             console.log(cur_row.cells[2])
//             console.log(cur_row.cells[3])
//             delete_data(console.log(cur_row.cells[0]), console.log(cur_row.cells[1]), console.log(cur_row.cells[2]), console.log(cur_row.cells[3]));
//         }
//     }
// }

function delete_function(id, wkt, il, ilce,) {
    var cur_button = document.getElementById("delete_button");
    var cur_wkt = wkt;
    var cur_il = il;
    var cur_ilce = ilce;

    cur_button.onclick = function () {
        debugger
        var deleted_row = document.getElementById(id);
        deleted_row.parentNode.removeChild(deleted_row);
        delete_data(id, cur_il, cur_ilce, cur_wkt);
        var features = vsource.getFeatures();
        for (var i in features) {
            if (features[i].id == id) {
                vsource.removeFeature(features[i]);
            }
        }
        console.log("parsel deleted");
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
            if (!document.getElementById("il_edit").value && !document.getElementById("ilce_edit").value) {
                alert("Lütfen İl ve İlçe Giriniz");
            }
            else if (!document.getElementById("il_edit").value && document.getElementById("ilce_edit").value) {
                alert("Lütfen İl Giriniz");
            }
            else if (document.getElementById("il_edit").value && !document.getElementById("ilce_edit").value) {
                alert("Lütfen İlçe Giriniz");
            }
            else {
                var cur_il = document.getElementById("il_edit").value;
                var cur_ilce = document.getElementById("ilce_edit").value;
                update_data(id, cur_il, cur_ilce, cur_wkt);

                for (var i in (document.getElementById("table_id")).rows) {
                    var cur_row = (document.getElementById("table_id")).rows[i];
                    if (cur_row.id != undefined) {
                        if (cur_row.id == id) {
                            cur_row.cells[1].innerHTML = cur_il;
                            cur_row.cells[2].innerHTML = cur_ilce;
                        }
                    }
                }
                vsource.getFeatures()[vsource.getFeatures().length - 1].il = cur_il;
                vsource.getFeatures()[vsource.getFeatures().length - 1].ilce = cur_ilce;
                modal_edit.style.display = "none";
            }
        }
        document.getElementById("deleteParsel").onclick = function () {
            var cur_il = document.getElementById("il_edit").value;
            var cur_ilce = document.getElementById("ilce_edit").value;
            var deleted_row = document.getElementById(id);
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


// function is_in_turkey(point_wkt) {
//     $.ajax({
//         url: "https://localhost:44398/api/parcel/compare",
//         dataType: "json",
//         type: "get",
//         contentType: "application/json",
//     });
// }

// function does_intersect(point_wkt) {
//     $.ajax({
//         url: "https://localhost:44398/api/parcel/intersect",
//         dataType: "json",
//         type: "get",
//         contentType: "application/json",
//     });
// }


function get_one(id) {
    $.ajax({
        url: "https://localhost:44398/api/parcel",
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
        url: "https://localhost:44398/api/parcel",
        dataType: "json",
        type: "get",
        contentType: "application/json",
        success: function (data) {
            for (var i in data) {
                insert_to_table(data[i].id, data[i].wkt, data[i].il, data[i].ilce);
                var draw_wkt = data[i].wkt;
                var cur_format = new ol.format.WKT();
                var cur_feature = cur_format.readFeature(draw_wkt, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326',
                });
                vsource.addFeature(cur_feature);
                cur_feature.id = data[i].id;
                cur_feature.il = data[i].il;
                cur_feature.ilce = data[i].ilce;
            }
        }
    });
}
function send_data(sended_, sended_il, sended_ilce, sended_wkt) {
    $.ajax({
        url: "https://localhost:44398/api/parcel",
        dataType: "json",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ "il": sended_il, "ilce": sended_ilce, "wkt": sended_wkt }),
        success: function (data) {
            sended_ = data;
        }
    });
}

function delete_data(deleted_, deleted_il, deleted_ilce, deleted_wkt) {
    $.ajax({
        url: "https://localhost:44398/api/parcel",
        dataType: "json",
        type: "delete",
        contentType: "application/json",
        data: JSON.stringify({ "id": deleted_, "il": deleted_il, "ilce": deleted_ilce, "wkt": deleted_wkt }),
    });
}

function update_data(updated_, updated_il, updated_ilce, updated_wkt) {
    $.ajax({
        url: "https://localhost:44398/api/parcel/update",
        dataType: "json",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ "id": updated_, "il": updated_il, "ilce": updated_ilce, "wkt": updated_wkt }),
    });
}

function get() {
    $.ajax({
        url: 'https://localhost:44398/api/parcel',
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',
        data: { "data": "check" },
        success: function (data) {
            for (var i in data) {
                insert_to_table(data[i].id, data[i].wkt, data[i].il, data[i].ilce);
            }
        }
    });
}

function does_intersect(longitude, latitude) {
    $.ajax({
        url: 'https://localhost:44398/api/parcel/intersect',
        dataType: 'json',
        type: 'get',
        contentType: 'application/json',
        data: ({ "lon": longitude, "lat": latitude }),
        success: function (data) {
            console.log(typeof (data))
            il_selected = random_il;
        }
    })
}
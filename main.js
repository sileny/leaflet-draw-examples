window.onload = function() {
var map = L.map('map', {
//  pin: true,
//  pinCircle: true,
//  pinControl: true,
//  guideLayers: []
});

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 16, attribution: osmAttrib});

map.setView(new L.LatLng(51.7500000, 19.4666700),12);
map.addLayer(osm);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var selectedLayer;
var selectedLayers = []; // 选中的图层

var drawControl = new L.Control.Draw({
  draw: {
    polyline: {
      distance: 20
    },
    polygon: {
      distance: 25
    },
    marker: {
      distance: 25
    },
    rectangle: {},
    circle: {}
  },
  edit: {
    featureGroup: drawnItems
  }
});
map.addControl(drawControl);


map.on('click', function(event) {
  console.log(event.latlng);
});



var geoJson = L.geoJson(loadJson(), {
  onEachFeature: function (feature, layer) {
    if(feature.geometry.type == "LineString") {
      layer.setStyle({
        color: 'purple',
        weight: 5
      });
    }
    // 模拟某个图层进入编辑模式
    // if (feature.properties.id === 1) {
    //   layer.editing.enable();
    // }
    if (feature.properties.id === 1) {
      selectedLayer = layer;
    }
    layer.on('click', handleLayerClick);
    drawnItems.addLayer(layer);
  }
});

function highlightFeature(layer) {
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}

function resetHighlight(layer) {
    geoJson.resetStyle(layer);
}

// https://leafletjs.cn/examples/choropleth/
function handleLayerClick(event) {
  var layer = event.target;

  var index = selectedLayers.findIndex(item => item === layer);
  if (index !== -1) {
    resetHighlight(layer);
    selectedLayers.splice(index, 1);
  } else {
    highlightFeature(layer);
    selectedLayers.push(layer);
  }
}

// map.addGuideLayer(drawnItems);
// map.removeGuideLayer(drawnItems);


map.on('draw:created', function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
  //console.log(JSON.stringify(drawnItems.toGeoJSON()));
});


map.on('mousemove', function (e) {
  //console.log(e.latlng);
});


var editor = new L.EditToolbar.Edit(map, { featureGroup: drawnItems });

console.log(editor);


var el = document.createElement('div');
el.onclick = () => {
  editor.enable();
};
el.innerText = '进入编辑模式';
el.style.position = 'fixed';
el.style.right = '20px';
el.style.top = '20px';
el.style.backgroundColor = '#f00';
el.style.color = '#fff';
el.style.zIndex = 999;
el.style.cursor = 'pointer';
document.body.appendChild(el);


// 某一个或者几个图层进入编辑模式
var el = document.createElement('div');
el.onclick = () => {
  selectedLayer.editing.enable();
};
el.innerText = '某个图形进入编辑模式';
el.style.position = 'fixed';
el.style.right = '20px';
el.style.top = '60px';
el.style.backgroundColor = '#f00';
el.style.color = '#fff';
el.style.zIndex = 999;
el.style.cursor = 'pointer';
document.body.appendChild(el);


// 选中层的操作
var el = document.createElement('div');
el.onclick = () => {
  for (var i = 0; i < selectedLayers.length; i++) {
    var layer = selectedLayers[i];
    layer.editing.enable();
  }
};
el.innerText = '选中的图形进入编辑模式';
el.style.position = 'fixed';
el.style.right = '20px';
el.style.top = '100px';
el.style.backgroundColor = '#f00';
el.style.color = '#fff';
el.style.zIndex = 999;
el.style.cursor = 'pointer';
document.body.appendChild(el);


// 选中的图层退出编辑模式
var el = document.createElement('div');
el.onclick = () => {
  for (var i = 0; i < selectedLayers.length; i++) {
    var layer = selectedLayers[i];
    layer.editing.disable();
  }
};
el.innerText = '选中的图形exit编辑模式';
el.style.position = 'fixed';
el.style.right = '20px';
el.style.top = '140px';
el.style.backgroundColor = '#f00';
el.style.color = '#fff';
el.style.zIndex = 999;
el.style.cursor = 'pointer';
document.body.appendChild(el);


// 保存对选中图层的编辑结果
var el = document.createElement('div');
el.onclick = () => {
  for (var i = 0; i < selectedLayers.length; i++) {
     var layer = selectedLayers[i];
     layer.editing.disable();
  }
  // editor.save();
};
el.innerText = '保存对选中图层的编辑结果';
el.style.position = 'fixed';
el.style.right = '20px';
el.style.top = '140px';
el.style.backgroundColor = '#f00';
el.style.color = '#fff';
el.style.zIndex = 999;
el.style.cursor = 'pointer';
document.body.appendChild(el);



};

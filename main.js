window.onload = function () {
  var map = L.map('map', {
    preferCanvas: true,
  });

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 16, attribution: osmAttrib});

  map.setView(new L.LatLng(51.7500000, 19.4666700), 12);
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


  const tree = new RBush();
  const markerSet = new Set();

  const width = 100;
  const height = 100;
  function makePointData(latLng) {
    const pxCenterPoint = map.latLngToLayerPoint(latLng);
    const minX = pxCenterPoint.x - width / 2;
    const minY = pxCenterPoint.y - height / 2;
    const maxX = pxCenterPoint.x + width / 2;
    const maxY = pxCenterPoint.y + height / 2;
    return {
      minX, maxX, minY, maxY, pxCenterPoint,
    };
  }

  map.on('click', (event) => {
    // 获取点击的position对应的marker信息
    const result = tree.search({
      minX: event.containerPoint.x,
      maxX: event.containerPoint.x,
      minY: event.containerPoint.y,
      maxY: event.containerPoint.y,
    });
    // console.log(result);
    const activated = [];
    for (let i = 0; i < result.length; i++) {
      const data = result[i];
      const geo = data.layer.toGeoJSON();
      const pt = turf.point([event.latlng.lng, event.latlng.lat]);
      const inPoly = turf.booleanPointInPolygon(pt, geo);
      // console.log(inPoly);
      if (inPoly) {
        activated.push(data);
        // break;
      }
    }
    // 调用event
    activated.forEach(el => {
      el.marker.fire('click');
    })
  });

  var geoJson = L.geoJson(loadJson(), {
    onFillContent: (ctx, layer) => {
      // 创建图片
      const img = document.createElement('img');
      img.src = '//www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png';

      // 获取中心点位置
      const center = layer.getCenter();
      const pointData = makePointData(center);
      img.onload = () => {
        // 按照中心点为图片的中心位置
        ctx.drawImage(img, pointData.minX, pointData.minY, width, height);
      };

      // 防止重复
      const key = `${center.lat}-${center.lng}`;
      if (!markerSet.has(key)) {
        const marker = L.marker(center, {
          icon: img,
        });
        const data = { ...pointData, marker, layer };
        // 绑定event
        marker.on({
          click: (event) => {
            console.log('marker clicked', data, event);
          },
        });
        // 缓存数据，在合适的时候需要清理掉
        tree.insert(data);
      }
      markerSet.add(key);

      // console.log(tree.toJSON());
    },
    onEachFeature: function (feature, layer) {
      console.log(map.getRenderer(map));
      if (feature.geometry.type == "LineString") {
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

    // 新增的layer也绑定event
    layer.on('click', handleLayerClick);
    //console.log(JSON.stringify(drawnItems.toGeoJSON()));
  });


  map.on('mousemove', function (e) {
    //console.log(e.latlng);
  });


  var editor = new L.EditToolbar.Edit(map, {featureGroup: drawnItems});

  createButton('进入编辑模式', 60, () => {
    editor.enable();
  });

  createButton('某个图形进入编辑模式', 80, () => {
    selectedLayer.editing.enable();
  });

  createButton('选中的图形进入编辑模式', 100, () => {
    for (var i = 0; i < selectedLayers.length; i++) {
      var layer = selectedLayers[i];
      layer.editing.enable();
    }
  });

  createButton('选中的图形exit编辑模式', 120, () => {
    for (var i = 0; i < selectedLayers.length; i++) {
      var layer = selectedLayers[i];
      layer.editing.disable();
    }
  });

  createButton('保存对选中图层的编辑结果', 140, () => {
    for (var i = 0; i < selectedLayers.length; i++) {
      var layer = selectedLayers[i];
      layer.editing.disable();
    }
  });

};

function createButton(text, top, onClick) {
  var el = document.createElement('div');
  el.onclick = onClick;
  el.innerText = text;
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.top = top + 'px';
  el.style.backgroundColor = '#f00';
  el.style.color = '#fff';
  el.style.zIndex = 999;
  el.style.cursor = 'pointer';
  document.body.appendChild(el);
}

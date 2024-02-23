let selectedLayer;
const map = L.map('map', {
  preferCanvas: true,
});

const osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 20});

map.setView(new L.LatLng(51.7500000, 19.4666700), 12);
map.addLayer(osm);

const drawGroup = new L.FeatureGroup();
map.addLayer(drawGroup);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawGroup
  }
});
map.addControl(drawControl);

const geoJson = L.geoJson(loadJson(), {
  onFillContent: (ctx, layer) => {
    // 创建图片
    const img = document.createElement('img');
    img.src = '//www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png';

    // 获取像素边界
    const { _pxBounds } = layer;
    const minX = _pxBounds.min.x;
    const minY = _pxBounds.min.y;
    const maxX = _pxBounds.max.x;
    const maxY = _pxBounds.max.y;

    // 获取宽、高
    const width = maxX - minX;
    const height = maxY - minY;

    img.onload = () => {
      // 按照layer的边界范围渲染
      ctx.drawImage(img, minX, minY, width, height);
    };
  },
  onEachFeature: (feature, layer) => {
    layer.on('click', handleLayerClick);
    drawGroup.addLayer(layer);
  },
});

function highlightFeature(layer) {
  if (selectedLayer) {
    geoJson.resetStyle(selectedLayer);
  }
  selectedLayer = layer;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  layer.bringToFront();
}

// https://leafletjs.cn/examples/choropleth/
function handleLayerClick(event) {
  const layer = event.target;

  highlightFeature(layer);
}

map.on('draw:created', function (e) {
  const layer = e.layer;
  drawGroup.addLayer(layer);

  // 新增的layer也绑定event
  layer.on('click', handleLayerClick);
});

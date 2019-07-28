/* global mapboxgl */

import { key } from './mapbox_api_key.js';

const worker = new Worker("src/worker.js");


mapboxgl.accessToken = key;
window.map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  center: [-104.9, 39.75],
  zoom: 3,
  maxZoom: 12,
  minZoom: 2
});

window.map.on('load', () => {

  window.map.addSource('routeline', {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [0, 0]
        },
        "properties": {}
      }]
    }
  });

  window.map.addLayer({
    "id": "route",
    "type": "line",
    "source": "routeline",
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    },
    "paint": {
      "line-color": "red",
      "line-width": 1
    }
  });


  let anchor, data_update;

  window.map.on('mousemove', function(e) {
    if (!anchor) {
      return;
    }
    worker.postMessage({ type: 'route', coords: [e.lngLat.lng, e.lngLat.lat] });
  });

  window.map.on('click', function(e) {
    if (anchor) {
      anchor = false;
    }
    else {
      worker.postMessage({ type: 'setAnchor', coords: [e.lngLat.lng, e.lngLat.lat] });
      anchor = true;
    }
  });

  worker.onmessage = function(event) {
    data_update = event.data;
  };

  window.setInterval(function() {
    if (data_update) {
      var geojson = geobuf.decode(new Pbf(data_update));
      window.map.getSource('routeline').setData(geojson);
      data_update = null;
    }
  }, 50);

});

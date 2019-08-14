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

window.map.on('error', event => {
  // swallow all 403 forbidden errors from tiles not found (expected)
  if (event.error.message !== "Forbidden") {
    console.error(event);
  }
});

window.map.on('load', () => {

  window.map.addSource('tiles', {
    "type": "vector",
    "minzoom": 0,
    "maxzoom": 9,
    "tiles": [`https://route-explorer-tiles.s3-us-west-2.amazonaws.com/{z}/{x}/{y}.pbf`]
  });
  window.map.addLayer({
    "id": "test",
    "type": "line",
    "source": "tiles",
    "source-layer": "main",
    "paint": {
      "line-color": "cyan",
      "line-width": 1
    },
    filter: ['in', '_id', 0]
  }, "waterway-label");



  let anchor, data_update;

  const debouncedMousemove = debounce(function(e) {
    if (!anchor) {
      return;
    }
    worker.postMessage({ type: 'route', coords: [e.lngLat.lng, e.lngLat.lat] });
  }, 20);

  window.map.on('mousemove', debouncedMousemove);

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

    if (event.data.type === 'updateIds') {
      data_update = event.data.ids;
    }

  };

  window.setInterval(function() {
    if (data_update) {
      if (window.map.areTilesLoaded()) {
        window.map.setFilter('test', ['in', '_id', ...data_update]);
        data_update = null;
      }

    }
  }, 70);

  // per underscore
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

});

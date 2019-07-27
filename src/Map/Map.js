/* global fetch, Headers, Request */

import React, { useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { key } from './mapbox_api_key.js';
import { style } from './style.js';

const contractionHierarchy = window.contractionHierarchy;

const { Graph, CoordinateLookup } = contractionHierarchy;

console.log(CoordinateLookup);

function Map() {

  useEffect(() => {
    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style,
      center: [-104.9, 39.75],
      zoom: 3,
      maxZoom: 12,
      minZoom: 2
    });

    window.map.on('load', () => {

      let count = 0;

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
          "line-width": 2
        }
      });

      let finder, lookup;

      let anchor;

      var headers = new Headers({ 'Accept': '*/*', 'Accept-Encoding': 'gzip, deflate, br' });
      var options = {
        method: 'GET',
        headers: headers,
        mode: 'cors',
      };

      var request = new Request('https://misc-public-files-dt.s3-us-west-2.amazonaws.com/net.json.br');

      fetch(request, options)
        .then((resp) => {
          console.log('data loaded');
          return resp.text();
        })
        .then(data => {

          console.log('data transformed to text');


          const graph = new Graph();
          graph.loadCH(data);

          console.log('data loaded into graph');

          lookup = new CoordinateLookup(graph);
          finder = graph.createPathfinder({ ids: true, path: true });

        });

      window.map.on('mousemove', function(e) {
        if (!anchor) {
          return;
        }
        if (window.singlethread) {
          console.log('rejected routing request')
          return;
        }

        window.singlethread = true;

        const coords2 = lookup.getClosestNetworkPt(e.lngLat.lng, e.lngLat.lat);

        console.time('routed')
        const result = finder.queryContractionHierarchy(anchor, coords2);
        console.timeEnd('routed')

        console.time('drawn')
        window.map.getSource('routeline').setData(result.path);
        console.timeEnd('drawn')

        count++;
        console.log({ count })

        window.singlethread = false;
      });

      window.map.on('click', function(e) {
        if (anchor) {
          anchor = null;
        }
        else {
          anchor = lookup.getClosestNetworkPt(e.lngLat.lng, e.lngLat.lat);
        }
      });

    });

  }, []);


  return <div id="map" />;

}


export default Map;

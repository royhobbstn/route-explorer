/* global Headers, Request, fetch */

import React, { useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { key } from './mapbox_api_key.js';
import { style } from './style.js';
const { Graph, CoordinateLookup } = require('contraction-hierarchy-js');


function Map() {

  useEffect(() => {
    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style,
      center: [-104.9, 39.75],
      zoom: 3,
      maxZoom: 8,
      minZoom: 3
    });

    window.map.on('load', () => {

      // undirected graph, backward path
      (function() {

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

            const lookup = new CoordinateLookup(graph);
            const coords1 = lookup.getClosestNetworkPt(-116.45, 41.96);
            const coords2 = lookup.getClosestNetworkPt(-117.45, 40.96);

            const finder = graph.createPathfinder({ ids: true, path: true });

            const path = finder.queryContractionHierarchy(coords1, coords2);
            console.log(path);

          });


      }());


      window.map.on('click', function(e) {
        console.log(e);
      });

    });

  }, []);


  return <div id="map" />;

}


export default Map;

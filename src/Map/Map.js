import React, { useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { key } from './mapbox_api_key.js';
import { style } from './style.js';
const { Graph } = require('contraction-hierarchy-js');


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
        const graph = new Graph();

        // start_node, end_node, edge_properties, edge_geometry
        graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
        graph.addEdge('B', 'A', { _id: 200, _cost: 1 });

        graph.addEdge('B', 'C', { _id: 101, _cost: 2 });
        graph.addEdge('C', 'B', { _id: 201, _cost: 2 });

        graph.addEdge('C', 'D', { _id: 102, _cost: 5 });
        graph.addEdge('D', 'C', { _id: 202, _cost: 5 });

        graph.contractGraph();
        const finder = graph.createPathfinder({ ids: true, path: false });
        const result = finder.queryContractionHierarchy('D', 'A');

        console.log(result);
      }());


      window.map.on('click', function(e) {
        console.log(e);
      });

    });

  }, []);


  return <div id="map" />;

}


export default Map;

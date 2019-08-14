/* global fetch, Headers, Request, contractionHierarchy, geobuf, Pbf */

self.importScripts('scripts/ch-script.js');

const { Graph, __geoindex, __kdindex } = contractionHierarchy;

let finder, lookup, anchor;

var headers = new Headers({ 'Accept': '*/*', 'Accept-Encoding': 'gzip, deflate, br' });
var options = {
  method: 'GET',
  headers: headers,
  mode: 'cors',
};

var request_network = new Request('https://misc-public-files-dt.s3-us-west-2.amazonaws.com/net.pbf.br');
var request_lookup = new Request('https://misc-public-files-dt.s3-us-west-2.amazonaws.com/net_coordinates.json');

fetch(request_network, options)
  .then((resp) => {
    console.log('data loaded');
    return resp.arrayBuffer();
  })
  .then(buffer => {

    console.log('data transformed to arrayBuffer');

    const graph = new Graph();
    graph.loadPbfCH(buffer);

    console.log('data loaded into graph');

    finder = graph.createPathfinder({ ids: true });

  });


fetch(request_lookup, options)
  .then((resp) => {
    console.log('lookup loaded');
    return resp.json();
  })
  .then(coordinate_list => {

    console.log('lookup transformed to json');

    lookup = __kdindex(coordinate_list, (p) => p[0], (p) => p[1]);

    console.log('lookup coordinates indexed');


  });

self.onmessage = function(e) {

  if (!finder) {
    console.log('network not ready yet');
    return;
  }

  if (e.data.type === 'setAnchor') {
    anchor = __geoindex.around(lookup, e.data.coords[0], e.data.coords[1], 1)[0];
  }

  if (e.data.type === 'route') {
    const coords2 = __geoindex.around(lookup, e.data.coords[0], e.data.coords[1], 1)[0];

    console.time('routed');
    const result = finder.queryContractionHierarchy(anchor, coords2);
    console.timeEnd('routed');

    self.postMessage({ type: 'updateIds', ids: result.ids });

  }


};

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

const pr1 = fetch(request_network, options)
  .then((resp) => {
    self.postMessage({ type: 'broadcast', message: 'data loaded' });
    return resp.arrayBuffer();
  })
  .then(buffer => {

    self.postMessage({ type: 'broadcast', message: 'data transformed to arrayBuffer' });

    const graph = new Graph();
    graph.loadPbfCH(buffer);

    self.postMessage({ type: 'broadcast', message: 'data loaded into graph' });

    finder = graph.createPathfinder({ ids: true });

  });


const pr2 = fetch(request_lookup, options)
  .then((resp) => {
    self.postMessage({ type: 'broadcast', message: 'lookup loaded' });
    return resp.json();
  })
  .then(coordinate_list => {

    self.postMessage({ type: 'broadcast', message: 'lookup transformed to json' });

    lookup = __kdindex(coordinate_list, (p) => p[0], (p) => p[1]);

    self.postMessage({ type: 'broadcast', message: 'lookup coordinates indexed' });


  });

Promise.all([pr1, pr2])
  .then(() => {
    self.postMessage({ type: 'workerReady' });
  })

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

    const start = self.performance.now();
    const result = finder.queryContractionHierarchy(anchor, coords2);
    const end = self.performance.now();
    const time = (end - start).toFixed(2) + ' ms';

    self.postMessage({ type: 'route', message: time });

    self.postMessage({ type: 'updateIds', ids: result.ids });

  }


};

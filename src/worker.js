/* global fetch, Headers, Request, contractionHierarchy */

self.importScripts('ch-script.js');

const { Graph, CoordinateLookup } = contractionHierarchy;


let finder, lookup, anchor;

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

self.onmessage = function(e) {

  if (!finder) {
    console.log('network not ready yet');
    return;
  }

  if (e.data.type === 'setAnchor') {
    anchor = lookup.getClosestNetworkPt(e.data.coords[0], e.data.coords[1]);
  }

  if (e.data.type === 'route') {
    const coords2 = lookup.getClosestNetworkPt(e.data.coords[0], e.data.coords[1]);

    console.time('routed');
    const result = finder.queryContractionHierarchy(anchor, coords2);
    console.timeEnd('routed');

    self.postMessage(result);
  }
};

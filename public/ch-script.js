var contractionHierarchy = (function (exports) {
    'use strict';

    function sortKD(ids, coords, nodeSize, left, right, depth) {
        if (right - left <= nodeSize) return;

        var m = Math.floor((left + right) / 2);

        select(ids, coords, m, left, right, depth % 2);

        sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
        sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
    }

    function select(ids, coords, k, left, right, inc) {

        while (right > left) {
            if (right - left > 600) {
                var n = right - left + 1;
                var m = k - left + 1;
                var z = Math.log(n);
                var s = 0.5 * Math.exp(2 * z / 3);
                var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
                var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
                var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
                select(ids, coords, k, newLeft, newRight, inc);
            }

            var t = coords[2 * k + inc];
            var i = left;
            var j = right;

            swapItem(ids, coords, left, k);
            if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);

            while (i < j) {
                swapItem(ids, coords, i, j);
                i++;
                j--;
                while (coords[2 * i + inc] < t) i++;
                while (coords[2 * j + inc] > t) j--;
            }

            if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
            else {
                j++;
                swapItem(ids, coords, j, right);
            }

            if (j <= k) left = j + 1;
            if (k <= j) right = j - 1;
        }
    }

    function swapItem(ids, coords, i, j) {
        swap(ids, i, j);
        swap(coords, 2 * i, 2 * j);
        swap(coords, 2 * i + 1, 2 * j + 1);
    }

    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
        var stack = [0, ids.length - 1, 0];
        var result = [];
        var x, y;

        while (stack.length) {
            var axis = stack.pop();
            var right = stack.pop();
            var left = stack.pop();

            if (right - left <= nodeSize) {
                for (var i = left; i <= right; i++) {
                    x = coords[2 * i];
                    y = coords[2 * i + 1];
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
                }
                continue;
            }

            var m = Math.floor((left + right) / 2);

            x = coords[2 * m];
            y = coords[2 * m + 1];

            if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);

            var nextAxis = (axis + 1) % 2;

            if (axis === 0 ? minX <= x : minY <= y) {
                stack.push(left);
                stack.push(m - 1);
                stack.push(nextAxis);
            }
            if (axis === 0 ? maxX >= x : maxY >= y) {
                stack.push(m + 1);
                stack.push(right);
                stack.push(nextAxis);
            }
        }

        return result;
    }

    function within(ids, coords, qx, qy, r, nodeSize) {
        var stack = [0, ids.length - 1, 0];
        var result = [];
        var r2 = r * r;

        while (stack.length) {
            var axis = stack.pop();
            var right = stack.pop();
            var left = stack.pop();

            if (right - left <= nodeSize) {
                for (var i = left; i <= right; i++) {
                    if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
                }
                continue;
            }

            var m = Math.floor((left + right) / 2);

            var x = coords[2 * m];
            var y = coords[2 * m + 1];

            if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);

            var nextAxis = (axis + 1) % 2;

            if (axis === 0 ? qx - r <= x : qy - r <= y) {
                stack.push(left);
                stack.push(m - 1);
                stack.push(nextAxis);
            }
            if (axis === 0 ? qx + r >= x : qy + r >= y) {
                stack.push(m + 1);
                stack.push(right);
                stack.push(nextAxis);
            }
        }

        return result;
    }

    function sqDist(ax, ay, bx, by) {
        var dx = ax - bx;
        var dy = ay - by;
        return dx * dx + dy * dy;
    }

    function kdbush(points, getX, getY, nodeSize, ArrayType) {
        return new KDBush(points, getX, getY, nodeSize, ArrayType);
    }

    function KDBush(points, getX, getY, nodeSize, ArrayType) {
        getX = getX || defaultGetX;
        getY = getY || defaultGetY;
        ArrayType = ArrayType || Array;

        this.nodeSize = nodeSize || 64;
        this.points = points;

        this.ids = new ArrayType(points.length);
        this.coords = new ArrayType(points.length * 2);

        for (var i = 0; i < points.length; i++) {
            this.ids[i] = i;
            this.coords[2 * i] = getX(points[i]);
            this.coords[2 * i + 1] = getY(points[i]);
        }

        sortKD(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
    }

    KDBush.prototype = {
        range: function (minX, minY, maxX, maxY) {
            return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
        },

        within: function (x, y, r) {
            return within(this.ids, this.coords, x, y, r, this.nodeSize);
        }
    };

    function defaultGetX(p) { return p[0]; }
    function defaultGetY(p) { return p[1]; }

    var tinyqueue = TinyQueue;
    var default_1 = TinyQueue;

    function TinyQueue(data, compare) {
        if (!(this instanceof TinyQueue)) return new TinyQueue(data, compare);

        this.data = data || [];
        this.length = this.data.length;
        this.compare = compare || defaultCompare;

        if (this.length > 0) {
            for (var i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    TinyQueue.prototype = {

        push: function (item) {
            this.data.push(item);
            this.length++;
            this._up(this.length - 1);
        },

        pop: function () {
            if (this.length === 0) return undefined;

            var top = this.data[0];
            this.length--;

            if (this.length > 0) {
                this.data[0] = this.data[this.length];
                this._down(0);
            }
            this.data.pop();

            return top;
        },

        peek: function () {
            return this.data[0];
        },

        _up: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var item = data[pos];

            while (pos > 0) {
                var parent = (pos - 1) >> 1;
                var current = data[parent];
                if (compare(item, current) >= 0) break;
                data[pos] = current;
                pos = parent;
            }

            data[pos] = item;
        },

        _down: function (pos) {
            var data = this.data;
            var compare = this.compare;
            var halfLength = this.length >> 1;
            var item = data[pos];

            while (pos < halfLength) {
                var left = (pos << 1) + 1;
                var right = left + 1;
                var best = data[left];

                if (right < this.length && compare(data[right], best) < 0) {
                    left = right;
                    best = data[right];
                }
                if (compare(best, item) >= 0) break;

                data[pos] = best;
                pos = left;
            }

            data[pos] = item;
        }
    };
    tinyqueue.default = default_1;

    var around_1 = around;
    var distance_1 = distance;

    var earthRadius = 6371;
    var earthCircumference = 40007;

    var rad = Math.PI / 180;

    function around(index, lng, lat, maxResults, maxDistance, predicate) {
        var result = [];

        if (maxResults === undefined) maxResults = Infinity;
        if (maxDistance === undefined) maxDistance = Infinity;

        var cosLat = Math.cos(lat * rad);
        var sinLat = Math.sin(lat * rad);

        // a distance-sorted priority queue that will contain both points and kd-tree nodes
        var q = tinyqueue(null, compareDist);

        // an object that represents the top kd-tree node (the whole Earth)
        var node = {
            left: 0, // left index in the kd-tree array
            right: index.ids.length - 1, // right index
            axis: 0, // 0 for longitude axis and 1 for latitude axis
            dist: 0, // will hold the lower bound of children's distances to the query point
            minLng: -180, // bounding box of the node
            minLat: -90,
            maxLng: 180,
            maxLat: 90
        };

        while (node) {
            var right = node.right;
            var left = node.left;

            if (right - left <= index.nodeSize) { // leaf node

                // add all points of the leaf node to the queue
                for (var i = left; i <= right; i++) {
                    var item = index.points[index.ids[i]];
                    if (!predicate || predicate(item)) {
                        q.push({
                            item: item,
                            dist: greatCircleDist(lng, lat, index.coords[2 * i], index.coords[2 * i + 1], cosLat, sinLat)
                        });
                    }
                }

            } else { // not a leaf node (has child nodes)

                var m = (left + right) >> 1; // middle index

                var midLng = index.coords[2 * m];
                var midLat = index.coords[2 * m + 1];

                // add middle point to the queue
                item = index.points[index.ids[m]];
                if (!predicate || predicate(item)) {
                    q.push({
                        item: item,
                        dist: greatCircleDist(lng, lat, midLng, midLat, cosLat, sinLat)
                    });
                }

                var nextAxis = (node.axis + 1) % 2;

                // first half of the node
                var leftNode = {
                    left: left,
                    right: m - 1,
                    axis: nextAxis,
                    minLng: node.minLng,
                    minLat: node.minLat,
                    maxLng: node.axis === 0 ? midLng : node.maxLng,
                    maxLat: node.axis === 1 ? midLat : node.maxLat,
                    dist: 0
                };
                // second half of the node
                var rightNode = {
                    left: m + 1,
                    right: right,
                    axis: nextAxis,
                    minLng: node.axis === 0 ? midLng : node.minLng,
                    minLat: node.axis === 1 ? midLat : node.minLat,
                    maxLng: node.maxLng,
                    maxLat: node.maxLat,
                    dist: 0
                };

                leftNode.dist = boxDist(lng, lat, leftNode, cosLat, sinLat);
                rightNode.dist = boxDist(lng, lat, rightNode, cosLat, sinLat);

                // add child nodes to the queue
                q.push(leftNode);
                q.push(rightNode);
            }

            // fetch closest points from the queue; they're guaranteed to be closer
            // than all remaining points (both individual and those in kd-tree nodes),
            // since each node's distance is a lower bound of distances to its children
            while (q.length && q.peek().item) {
                var candidate = q.pop();
                if (candidate.dist > maxDistance) return result;
                result.push(candidate.item);
                if (result.length === maxResults) return result;
            }

            // the next closest kd-tree node
            node = q.pop();
        }

        return result;
    }

    // lower bound for distance from a location to points inside a bounding box
    function boxDist(lng, lat, node, cosLat, sinLat) {
        var minLng = node.minLng;
        var maxLng = node.maxLng;
        var minLat = node.minLat;
        var maxLat = node.maxLat;

        // query point is between minimum and maximum longitudes
        if (lng >= minLng && lng <= maxLng) {
            if (lat <= minLat) return earthCircumference * (minLat - lat) / 360; // south
            if (lat >= maxLat) return earthCircumference * (lat - maxLat) / 360; // north
            return 0; // inside the bbox
        }

        // query point is west or east of the bounding box;
        // calculate the extremum for great circle distance from query point to the closest longitude
        var closestLng = (minLng - lng + 360) % 360 <= (lng - maxLng + 360) % 360 ? minLng : maxLng;
        var cosLngDelta = Math.cos((closestLng - lng) * rad);
        var extremumLat = Math.atan(sinLat / (cosLat * cosLngDelta)) / rad;

        // calculate distances to lower and higher bbox corners and extremum (if it's within this range);
        // one of the three distances will be the lower bound of great circle distance to bbox
        var d = Math.max(
            greatCircleDistPart(minLat, cosLat, sinLat, cosLngDelta),
            greatCircleDistPart(maxLat, cosLat, sinLat, cosLngDelta));

        if (extremumLat > minLat && extremumLat < maxLat) {
            d = Math.max(d, greatCircleDistPart(extremumLat, cosLat, sinLat, cosLngDelta));
        }

        return earthRadius * Math.acos(d);
    }

    function compareDist(a, b) {
        return a.dist - b.dist;
    }

    // distance using spherical law of cosines; should be precise enough for our needs
    function greatCircleDist(lng, lat, lng2, lat2, cosLat, sinLat) {
        var cosLngDelta = Math.cos((lng2 - lng) * rad);
        return earthRadius * Math.acos(greatCircleDistPart(lat2, cosLat, sinLat, cosLngDelta));
    }

    // partial greatCircleDist to reduce trigonometric calculations
    function greatCircleDistPart(lat, cosLat, sinLat, cosLngDelta) {
        var d = sinLat * Math.sin(lat * rad) +
                cosLat * Math.cos(lat * rad) * cosLngDelta;
        return Math.min(d, 1);
    }

    function distance(lng, lat, lng2, lat2) {
        return greatCircleDist(lng, lat, lng2, lat2, Math.cos(lat * rad), Math.sin(lat * rad));
    }

    var geokdbush = {
    	around: around_1,
    	distance: distance_1
    };

    function CoordinateLookup(graph) {

      if (!graph._geoJsonFlag) {
        throw new Error('Cannot use Coordinate Lookup on a non-GeoJson network.');
      }

      const points_set = new Set();

      Object.keys(graph._nodeToIndexLookup).forEach(key => {
        points_set.add(key);
      });

      const coordinate_list = [];

      points_set.forEach(pt_str => {
        coordinate_list.push(pt_str.split(',').map(d => Number(d)));
      });

      this.index = kdbush(coordinate_list, (p) => p[0], (p) => p[1]);
    }

    CoordinateLookup.prototype.getClosestNetworkPt = function(lng, lat) {
      return geokdbush.around(this.index, lng, lat, 1)[0];
    };

    function buildIdList(options, edgeProperties, edgeGeometry, forward_nodeState, backward_nodeState, tentative_shortest_node, indexToNodeLookup, startNode) {

      const pathway = [];
      const node_list = [tentative_shortest_node];

      let current_forward_node = forward_nodeState[tentative_shortest_node];
      let current_backward_node = backward_nodeState[tentative_shortest_node];

      // first check necessary because may not be any nodes in forward or backward pathway
      // (occasionally entire pathway may be ONLY in the backward or forward directions)
      if (current_forward_node) {
        while (current_forward_node.attrs != null) {
          pathway.push({ id: current_forward_node.attrs, direction: 'f' });
          node_list.push(current_forward_node.prev);
          current_forward_node = forward_nodeState[current_forward_node.prev];
        }
      }

      pathway.reverse();
      node_list.reverse();

      if (current_backward_node) {
        while (current_backward_node.attrs != null) {
          pathway.push({ id: current_backward_node.attrs, direction: 'b' });
          node_list.push(current_backward_node.prev);
          current_backward_node = backward_nodeState[current_backward_node.prev];
        }
      }

      let node = startNode;

      const ordered = pathway.map(p => {
        const start = p.direction === 'f' ? edgeProperties[p.id]._start_index : edgeProperties[p.id]._end_index;
        const end = p.direction === 'f' ? edgeProperties[p.id]._end_index : edgeProperties[p.id]._start_index;
        const props = [...edgeProperties[p.id]._ordered];

        if (node !== start) {
          props.reverse();
          node = start;
        }
        else {
          node = end;
        }

        return props;
      });

      const flattened = [].concat(...ordered);


      const ids = flattened.map(d => edgeProperties[d]._id);



      let properties, property_list, path, nodes;


      if (options.nodes) {
        nodes = node_list.map(d => {
          return indexToNodeLookup[d];
        });
      }


      if (options.properties || options.path) {

        property_list = flattened.map(f => {

          // remove internal properties
          const { _start_index, _end_index, _ordered, ...originalProperties } = edgeProperties[f];

          return originalProperties;

        });

      }


      if (options.path) {

        const features = flattened.map((f, i) => {

          return {
            "type": "Feature",
            "properties": property_list[i],
            "geometry": {
              "type": "LineString",
              "coordinates": edgeGeometry[f]
            }
          };

        });

        path = { "type": "FeatureCollection", "features": features };

      }

      if (options.properties) {
        properties = property_list;
      }

      return { ids, path, properties, nodes };

    }

    /**
     * Based on https://github.com/mourner/tinyqueue
     * Copyright (c) 2017, Vladimir Agafonkin https://github.com/mourner/tinyqueue/blob/master/LICENSE
     * 
     * Adapted for PathFinding needs by @anvaka
     * Copyright (c) 2017, Andrei Kashcha
     *
     * Additional inconsequential changes by @royhobbstn
     * 
     **/


    function NodeHeap(options) {
      if (!(this instanceof NodeHeap)) return new NodeHeap(options);

      options = options || {};

      if (!options.compare) {
        throw new Error("Please supply a comparison function to NodeHeap");
      }

      this.data = [];
      this.length = this.data.length;
      this.compare = options.compare;
      this.setNodeId = function(nodeSearchState, heapIndex) {
        nodeSearchState.heapIndex = heapIndex;
      };

      if (this.length > 0) {
        for (var i = (this.length >> 1); i >= 0; i--) this._down(i);
      }

      if (options.setNodeId) {
        for (var i = 0; i < this.length; ++i) {
          this.setNodeId(this.data[i], i);
        }
      }
    }

    NodeHeap.prototype = {

      push: function(item) {
        this.data.push(item);
        this.setNodeId(item, this.length);
        this.length++;
        this._up(this.length - 1);
      },

      pop: function() {
        if (this.length === 0) return undefined;

        var top = this.data[0];
        this.length--;

        if (this.length > 0) {
          this.data[0] = this.data[this.length];
          this.setNodeId(this.data[0], 0);
          this._down(0);
        }
        this.data.pop();

        return top;
      },

      peek: function() {
        return this.data[0];
      },

      updateItem: function(pos) {
        this._down(pos);
        this._up(pos);
      },

      _up: function(pos) {
        var data = this.data;
        var compare = this.compare;
        var setNodeId = this.setNodeId;
        var item = data[pos];

        while (pos > 0) {
          var parent = (pos - 1) >> 1;
          var current = data[parent];
          if (compare(item, current) >= 0) break;
          data[pos] = current;

          setNodeId(current, pos);
          pos = parent;
        }

        data[pos] = item;
        setNodeId(item, pos);
      },

      _down: function(pos) {
        var data = this.data;
        var compare = this.compare;
        var halfLength = this.length >> 1;
        var item = data[pos];
        var setNodeId = this.setNodeId;

        while (pos < halfLength) {
          var left = (pos << 1) + 1;
          var right = left + 1;
          var best = data[left];

          if (right < this.length && compare(data[right], best) < 0) {
            left = right;
            best = data[right];
          }
          if (compare(best, item) >= 0) break;

          data[pos] = best;
          setNodeId(best, pos);
          pos = left;
        }

        data[pos] = item;
        setNodeId(item, pos);
      }
    };

    const createPathfinder = function(options) {

      const adjacency_list = this.adjacency_list;
      const reverse_adjacency_list = this.reverse_adjacency_list;
      const edgeProperties = this._edgeProperties;
      const edgeGeometry = this._edgeGeometry;
      const pool = this._createNodePool();
      const nodeToIndexLookup = this._nodeToIndexLookup;
      const indexToNodeLookup = this._indexToNodeLookup;

      if (!options) {
        options = {};
      }

      return {
        queryContractionHierarchy
      };

      function queryContractionHierarchy(
        start,
        end
      ) {

        pool.reset();

        const start_index = nodeToIndexLookup[String(start)];
        const end_index = nodeToIndexLookup[String(end)];

        const forward_nodeState = [];
        const backward_nodeState = [];

        const forward_distances = {};
        const backward_distances = {};


        let current_start = pool.createNewState({ id: start_index, dist: 0 });
        forward_nodeState[start_index] = current_start;
        current_start.opened = 1;
        forward_distances[current_start.id] = 0;

        let current_end = pool.createNewState({ id: end_index, dist: 0 });
        backward_nodeState[end_index] = current_end;
        current_end.opened = 1;
        backward_distances[current_end.id] = 0;

        const searchForward = doDijkstra(
          adjacency_list,
          current_start,
          forward_nodeState,
          forward_distances,
          backward_nodeState,
          backward_distances
        );
        const searchBackward = doDijkstra(
          reverse_adjacency_list,
          current_end,
          backward_nodeState,
          backward_distances,
          forward_nodeState,
          forward_distances
        );

        let forward_done = false;
        let backward_done = false;
        let sf, sb;

        let tentative_shortest_path = Infinity;
        let tentative_shortest_node = null;

        if (start_index !== end_index) {
          do {
            if (!forward_done) {
              sf = searchForward.next();
              if (sf.done) {
                forward_done = true;
              }
            }
            if (!backward_done) {
              sb = searchBackward.next();
              if (sb.done) {
                backward_done = true;
              }
            }

          } while (
            forward_distances[sf.value.id] < tentative_shortest_path ||
            backward_distances[sb.value.id] < tentative_shortest_path
          );
        }
        else {
          tentative_shortest_path = 0;
        }

        let result = { total_cost: tentative_shortest_path !== Infinity ? tentative_shortest_path : 0 };


        let extra_attrs;

        if (options.ids || options.path || options.nodes || options.properties) {
          if (tentative_shortest_node != null) {
            // tentative_shortest_path as falsy indicates no path found.
            extra_attrs = buildIdList(options, edgeProperties, edgeGeometry, forward_nodeState, backward_nodeState, tentative_shortest_node, indexToNodeLookup, start_index);
          }
          else {

            let ids, path, properties, nodes;

            // fill in object to prevent errors in the case of no path found
            if (options.ids) {
              ids = [];
            }
            if (options.path) {
              path = {};
            }
            if (options.properties) {
              properties = [];
            }
            if (options.nodes) {
              nodes = [];
            }

            extra_attrs = { ids, path, properties, nodes };
          }

        }

        // the end.  results sent to user
        return Object.assign(result, { ...extra_attrs });


        //

        function* doDijkstra(
          adj,
          current,
          nodeState,
          distances,
          reverse_nodeState,
          reverse_distances
        ) {

          var openSet = new NodeHeap({
            compare(a, b) {
              return a.dist - b.dist;
            }
          });

          do {
            (adj[current.id] || []).forEach(edge => {

              let node = nodeState[edge.end];
              if (node === undefined) {
                node = pool.createNewState({ id: edge.end });
                node.attrs = edge.attrs;
                nodeState[edge.end] = node;
              }

              if (node.visited === true) {
                return;
              }

              if (!node.opened) {
                openSet.push(node);
                node.opened = true;
              }

              const proposed_distance = current.dist + edge.cost;
              if (proposed_distance >= node.dist) {
                return;
              }

              node.dist = proposed_distance;
              distances[node.id] = proposed_distance;
              node.attrs = edge.attrs;
              node.prev = current.id;

              openSet.updateItem(node.heapIndex);

              const reverse_dist = reverse_distances[edge.end];
              if (reverse_dist >= 0) {
                const path_len = proposed_distance + reverse_dist;
                if (tentative_shortest_path > path_len) {
                  tentative_shortest_path = path_len;
                  tentative_shortest_node = edge.end;
                }
              }

            });
            current.visited = true;

            // get lowest value from heap
            current = openSet.pop();

            if (!current) {
              return '';
            }

            yield current;

          } while (true);

        }

      }

    };

    // ES6 Map
    var map;
    try {
      map = Map;
    } catch (_) { }
    var set;

    // ES6 Set
    try {
      set = Set;
    } catch (_) { }

    function baseClone (src, circulars, clones) {
      // Null/undefined/functions/etc
      if (!src || typeof src !== 'object' || typeof src === 'function') {
        return src
      }

      // DOM Node
      if (src.nodeType && 'cloneNode' in src) {
        return src.cloneNode(true)
      }

      // Date
      if (src instanceof Date) {
        return new Date(src.getTime())
      }

      // RegExp
      if (src instanceof RegExp) {
        return new RegExp(src)
      }

      // Arrays
      if (Array.isArray(src)) {
        return src.map(clone)
      }

      // ES6 Maps
      if (map && src instanceof map) {
        return new Map(Array.from(src.entries()))
      }

      // ES6 Sets
      if (set && src instanceof set) {
        return new Set(Array.from(src.values()))
      }

      // Object
      if (src instanceof Object) {
        circulars.push(src);
        var obj = Object.create(src);
        clones.push(obj);
        for (var key in src) {
          var idx = circulars.findIndex(function (i) {
            return i === src[key]
          });
          obj[key] = idx > -1 ? clones[idx] : baseClone(src[key], circulars, clones);
        }
        return obj
      }

      // ???
      return src
    }

    function clone (src) {
      return baseClone(src, [], [])
    }

    const _loadFromGeoJson = function(filedata) {

      if (this._locked) {
        throw new Error('Cannot add GeoJSON to a contracted network');
      }

      if (this._geoJsonFlag) {
        throw new Error('Cannot load more than one GeoJSON file.');
      }

      if (this._manualAdd) {
        throw new Error('Cannot load GeoJSON file after adding Edges manually via the API.');
      }


      // make a copy
      const geo = clone(filedata);

      // cleans geojson (mutates in place)
      const features = this._cleanseGeoJsonNetwork(geo);

      features.forEach((feature, index) => {
        const coordinates = feature.geometry.coordinates;
        const properties = feature.properties;

        if (!properties || !coordinates || !properties._cost) {
          if (this.debugMode) {
            console.log('invalid feature detected.  skipping...');
          }
          return;
        }

        const start_vertex = coordinates[0];
        const end_vertex = coordinates[coordinates.length - 1];

        // add forward
        this._addEdge(start_vertex, end_vertex, properties, clone(coordinates));

        // add backward
        this._addEdge(end_vertex, start_vertex, properties, clone(coordinates).reverse());

      });

      // after loading a GeoJSON, no further edges can be added
      this._geoJsonFlag = true;


    };


    const _cleanseGeoJsonNetwork = function(file) {

      // get rid of duplicate edges (same origin to dest)
      const inventory = {};

      const features = file.features;

      features.forEach(feature => {
        const start = feature.geometry.coordinates[0].join(',');
        const end = feature.geometry.coordinates[feature.geometry.coordinates.length - 1].join(',');
        const id = `${start}|${end}`;

        const reverse_id = `${end}|${start}`;


        if (!inventory[id]) {
          // new segment
          inventory[id] = feature;
        }
        else {

          if (this.debugMode) {
            console.log('Duplicate feature found, choosing shortest.');
          }

          // a segment with the same origin/dest exists.  choose shortest.
          const old_cost = inventory[id].properties._cost;
          const new_cost = feature.properties._cost;
          if (new_cost < old_cost) {
            // mark old segment for deletion
            inventory[id].properties.__markDelete = true;
            // rewrite old segment because this one is shorter
            inventory[id] = feature;
          }
          else {
            // instead mark new feature for deletion
            feature.properties.__markDelete = true;
          }
        }


        // now reverse
        if (!inventory[reverse_id]) {
          // new segment
          inventory[reverse_id] = feature;
        }
        else {

          // In theory this error is already pointed out in the block above

          // a segment with the same origin/dest exists.  choose shortest.
          const old_cost = inventory[reverse_id].properties._cost;
          const new_cost = feature.properties._cost;
          if (new_cost < old_cost) {
            // mark old segment for deletion
            inventory[reverse_id].properties.__markDelete = true;
            // rewrite old segment because this one is shorter
            inventory[reverse_id] = feature;
          }
          else {
            // instead mark new feature for deletion
            feature.properties.__markDelete = true;
          }
        }
      });

      // filter out marked items
      return features.filter(feature => {
        return !feature.properties.__markDelete;
      });

    };

    // public API for adding edges
    const addEdge = function(start, end, edge_properties, edge_geometry) {

      if (this._locked) {
        throw new Error('Graph has been contracted.  No additional edges can be added.');
      }

      if (this._geoJsonFlag) {
        throw new Error('Can not add additional edges manually to a GeoJSON network.');
      }

      this._manualAdd = true;
      this._addEdge(start, end, edge_properties, edge_geometry);
    };

    const _addEdge = function(start, end, edge_properties, edge_geometry) {

      const start_node = String(start);
      const end_node = String(end);

      if (start_node === end_node) {
        if (this.debugMode) {
          console.log("Start and End Nodes are the same.  Ignoring.");
        }
        return;
      }

      if (this._nodeToIndexLookup[start_node] == null) {
        this._currentNodeIndex++;
        this._nodeToIndexLookup[start_node] = this._currentNodeIndex;
        this._indexToNodeLookup[this._currentNodeIndex] = start_node;
      }
      if (this._nodeToIndexLookup[end_node] == null) {
        this._currentNodeIndex++;
        this._nodeToIndexLookup[end_node] = this._currentNodeIndex;
        this._indexToNodeLookup[this._currentNodeIndex] = end_node;
      }

      let start_node_index = this._nodeToIndexLookup[start_node];
      let end_node_index = this._nodeToIndexLookup[end_node];

      // add to adjacency list
      this._currentEdgeIndex++;
      this._edgeProperties[this._currentEdgeIndex] = JSON.parse(JSON.stringify(edge_properties));
      this._edgeProperties[this._currentEdgeIndex]._start_index = start_node_index;
      this._edgeProperties[this._currentEdgeIndex]._end_index = end_node_index;
      this._edgeGeometry[this._currentEdgeIndex] = edge_geometry ? JSON.parse(JSON.stringify(edge_geometry)) : null;

      // create object to push into adjacency list
      const obj = {
        end: end_node_index,
        cost: edge_properties._cost,
        attrs: this._currentEdgeIndex
      };

      if (this.adjacency_list[start_node_index]) {
        this.adjacency_list[start_node_index].push(obj);
      }
      else {
        this.adjacency_list[start_node_index] = [obj];
      }

      // add to reverse adjacency list
      const reverse_obj = {
        end: start_node_index,
        cost: edge_properties._cost,
        attrs: this._currentEdgeIndex
      };

      if (this.reverse_adjacency_list[end_node_index]) {
        this.reverse_adjacency_list[end_node_index].push(reverse_obj);
      }
      else {
        this.reverse_adjacency_list[end_node_index] = [reverse_obj];
      }

    };


    const _addContractedEdge = function(start_index, end_index, properties) {

      // geometry not applicable here

      this._currentEdgeIndex++;
      this._edgeProperties[this._currentEdgeIndex] = properties;
      this._edgeProperties[this._currentEdgeIndex]._start_index = start_index;
      this._edgeProperties[this._currentEdgeIndex]._end_index = end_index;
      this._edgeGeometry[this._currentEdgeIndex] = null;

      // create object to push into adjacency list
      const obj = {
        end: end_index,
        cost: properties._cost,
        attrs: this._currentEdgeIndex
      };

      if (this.adjacency_list[start_index]) {
        this.adjacency_list[start_index].push(obj);
      }
      else {
        this.adjacency_list[start_index] = [obj];
      }

      // add it to reverse adjacency list
      const reverse_obj = {
        end: start_index,
        cost: properties._cost,
        attrs: this._currentEdgeIndex
      };

      if (this.reverse_adjacency_list[end_index]) {
        this.reverse_adjacency_list[end_index].push(reverse_obj);
      }
      else {
        this.reverse_adjacency_list[end_index] = [reverse_obj];
      }

    };

    const loadCH = function(ch) {
      const parsed = JSON.parse(ch);
      this._locked = parsed._locked;
      this._geoJsonFlag = parsed._geoJsonFlag;
      this.adjacency_list = parsed.adjacency_list;
      this.reverse_adjacency_list = parsed.reverse_adjacency_list;
      this._nodeToIndexLookup = parsed._nodeToIndexLookup;
      this._edgeProperties = parsed._edgeProperties;
      this._edgeGeometry = parsed._edgeGeometry;
    };

    const saveCH = function() {

      if (!this._locked) {
        throw new Error('No sense in saving network before it is contracted.');
      }

      return JSON.stringify({
        _locked: this._locked,
        _geoJsonFlag: this._geoJsonFlag,
        adjacency_list: this.adjacency_list,
        reverse_adjacency_list: this.reverse_adjacency_list,
        _nodeToIndexLookup: this._nodeToIndexLookup,
        _edgeProperties: this._edgeProperties,
        _edgeGeometry: this._edgeGeometry
      });
    };

    function Node(node) {
      this.id = node.id;
      this.dist = node.dist !== undefined ? node.dist : Infinity;
      this.prev = undefined;
      this.visited = undefined;
      this.opened = false; // whether has been put in queue
      this.heapIndex = -1;
    }

    function createNodePool() {
      var currentInCache = 0;
      var nodeCache = [];

      return {
        createNewState: createNewState,
        reset: reset
      };

      function reset() {
        currentInCache = 0;
      }

      function createNewState(node) {
        var cached = nodeCache[currentInCache];
        if (cached) {
          cached.id = node.id;
          cached.dist = node.dist !== undefined ? node.dist : Infinity;
          cached.prev = undefined;
          cached.visited = undefined;
          cached.opened = false;
          cached.heapIndex = -1;
        }
        else {
          cached = new Node(node);
          nodeCache[currentInCache] = cached;
        }
        currentInCache++;
        return cached;
      }

    }

    const contractGraph = function() {

      if (this._locked) {
        throw new Error('Network has already been contracted');
      }

      // prevent more edges from being added
      this._locked = true;

      // new contracted edges will be added after this index
      this._maxUncontractedEdgeIndex = this._currentEdgeIndex;

      // initialize dijkstra shortcut/path finder
      const finder = this._createChShortcutter();

      const getVertexScore = (v) => {
        const shortcut_count = this._contract(v, true, finder); /**/
        const edge_count = (this.adjacency_list[v] || []).length;
        const edge_difference = shortcut_count - edge_count;
        const contracted_neighbors = getContractedNeighborCount(v);
        return edge_difference + contracted_neighbors;
      };

      const getContractedNeighborCount = (v) => {
        return (this.adjacency_list[v] || []).reduce((acc, node) => {
          const is_contracted = this.contracted_nodes[node.end] != null ? 1 : 0;
          return acc + is_contracted;
        }, 0);
      };

      const nh = new NodeHeap({
        compare(a, b) {
          return a.score - b.score;
        }
      });

      this.contracted_nodes = [];

      // create an additional node ordering
      Object.keys(this._nodeToIndexLookup).forEach(key => {
        const index = this._nodeToIndexLookup[key];
        const score = getVertexScore(index);
        const node = new OrderNode(score, index);
        nh.push(node);
      });

      let contraction_level = 1;

      const len = nh.length;

      // main contraction loop
      while (nh.length > 0) {

        const updated_len = nh.length;

        if (updated_len % 50 === 0) {
          if (this.debugMode) {
            console.log(updated_len / len);
          }
          // prune adj list of no longer valid paths occasionally
          // theres probably a better formula for determining how often this should run
          // (bigger networks = less often)
          this._cleanAdjList(this.adjacency_list);
          this._cleanAdjList(this.reverse_adjacency_list);
        }

        // recompute to make sure that first node in priority queue
        // is still best candidate to contract
        let found_lowest = false;
        let node_obj = nh.peek();
        const old_score = node_obj.score;

        do {
          const first_vertex = node_obj.id;
          const new_score = getVertexScore(first_vertex);

          if (new_score > old_score) {
            node_obj.score = new_score;
            nh.updateItem(node_obj.heapIndex);
          }
          node_obj = nh.peek();
          if (node_obj.id === first_vertex) {
            found_lowest = true;
          }

        } while (found_lowest === false);

        // lowest found, pop it off the queue and contract it
        const v = nh.pop();

        this._contract(v.id, false, finder);

        // keep a record of contraction level of each node
        this.contracted_nodes[v.id] = contraction_level;
        contraction_level++;

      }

      this._cleanAdjList(this.adjacency_list);
      this._cleanAdjList(this.reverse_adjacency_list);
      this._arrangeContractedPaths(this.adjacency_list);
      this._arrangeContractedPaths(this.reverse_adjacency_list);

      if (this.debugMode) {
        console.log('Contraction complete');
      }

      return;

    };

    // do as much edge arrangement as possible ahead of times so that the cost is
    // not incurred at runtime
    const _arrangeContractedPaths = function(adj_list) {

      adj_list.forEach((node, index) => {

        node.forEach(edge => {

          const start_node = index;

          let simpleIds = [];
          let ids = [];

          ids = [edge.attrs]; // edge.attrs is an edge ID

          while (ids.length) {
            const id = ids.pop();
            if (id <= this._maxUncontractedEdgeIndex) {
              // this is an original network edge
              simpleIds.push(id);
            }
            else {
              // these are shorcut edges (added during contraction process)
              // where _id is an array of two items: edges of [u to v, v to w]
              ids.push(...this._edgeProperties[id]._id);
            }
          }


          //  now with simpleIds, get start and end index and make connection object
          const links = {};
          simpleIds.forEach(id => {
            const properties = this._edgeProperties[id];
            const start_index = properties._start_index;
            const end_index = properties._end_index;

            if (!links[start_index]) {
              links[start_index] = [id];
            }
            else {
              links[start_index].push(id);
            }

            if (!links[end_index]) {
              links[end_index] = [id];
            }
            else {
              links[end_index].push(id);
            }
          });

          const ordered = [];

          let last_node = String(start_node);

          let current_edge_id = links[last_node][0];
          // this value represents the attribute id of the first segment

          while (current_edge_id != null) {

            ordered.push(current_edge_id);
            // put this in the ordered array of attribute segments

            // this represents the nodes of the first segment
            const props = this._edgeProperties[current_edge_id];
            const c1 = String(props._start_index);
            const c2 = String(props._end_index);

            // c1 and c2 represent the first and last nodes of the line string
            // these nodes can be out of order; in fact 50% chance
            // so check to see if the first node = start
            // if it is, use c2, if not, use c1
            const next_node = c1 === last_node ? c2 : c1;

            last_node = next_node;

            const arr = links[next_node];
            // receive an array of 2 attribute segments.  
            // we've already seen one of them, so grab the other

            if (arr.length === 1) {
              // if the length of this is 1, it means we're at the end
              break;
            }

            if (arr.length > 2) {
              console.error('too many edges in array. unexpected. unrecoverable.');
              process.exit();
            }

            current_edge_id = arr[0] === current_edge_id ? arr[1] : arr[0];
          }

          this._edgeProperties[edge.attrs]._ordered = ordered;

        });
      });

    };

    const _cleanAdjList = function(adj_list) {

      // remove links to lower ranked nodes
      adj_list.forEach((node, node_id) => {
        const from_rank = this.contracted_nodes[node_id];
        if (from_rank == null) {
          return;
        }
        adj_list[node_id] = adj_list[node_id].filter(
          edge => {
            const to_rank = this.contracted_nodes[edge.end];
            if (to_rank == null) {
              return true;
            }
            return from_rank < to_rank;
          }
        );
      });

    };

    // this function is multi-use:  actually contract a node  OR
    // with `get_count_only = true` find number of shortcuts added
    // if node were to be contracted
    const _contract = function(v, get_count_only, finder) {

      // all edges from anywhere to v
      const from_connections = (this.reverse_adjacency_list[v] || []).filter(c => {
        return !this.contracted_nodes[c.end];
      });


      // all edges from v to somewhere else
      const to_connections = (this.adjacency_list[v] || []).filter(c => {
        return !this.contracted_nodes[c.end];
      });

      let shortcut_count = 0;

      from_connections.forEach(u => {

        let max_total = 0;

        // dist u to v
        const dist1 = u.cost;

        to_connections.forEach(w => {

          // ignore node to itself
          if (u.end === w.end) {
            return;
          }

          // dist v to w
          const dist2 = w.cost;

          const total = dist1 + dist2;

          if (total > max_total) {
            max_total = total;
          }
        });


        if (!to_connections.length) {
          // no sense in running dijkstra
          return;
        }

        // run a dijkstra from u to anything less than the existing dijkstra distance
        const path = finder.runDijkstra(
          u.end,
          null,
          v,
          max_total
        );

        to_connections.forEach(w => {
          if (u.end === w.end) {
            return;
          }

          // dist v to w
          const dist2 = w.cost;
          const total = dist1 + dist2;

          const dijkstra = path.distances[w.end] || Infinity;

          if (total < dijkstra) {

            shortcut_count++;

            if (!get_count_only) {

              const props = {
                _cost: total,
                _id: [u.attrs, w.attrs],
                _start_index: u.end,
                _end_index: w.end
              };

              this._addContractedEdge(u.end, w.end, props);
            }
          }
        });

      });

      return shortcut_count;
    };




    // node containing contraction order score
    function OrderNode(score, id) {
      this.score = score;
      this.id = id;
    }

    const _createChShortcutter = function() {

      const pool = this._createNodePool();
      const adjacency_list = this.adjacency_list;

      return {
        runDijkstra
      };

      function runDijkstra(
        start_index,
        end_index,
        vertex,
        total
      ) {

        pool.reset();

        const nodeState = [];
        const distances = {};

        var openSet = new NodeHeap({
          compare(a, b) {
            return a.dist - b.dist;
          }
        });

        let current = pool.createNewState({ id: start_index, dist: 0 });
        nodeState[start_index] = current;
        current.opened = 1;
        distances[current.id] = 0;

        // quick exit for start === end	
        if (start_index === end_index) {
          current = '';
        }

        while (current) {

          adjacency_list[current.id]
            .filter(edge => {
              // this is a modification for contraction hierarchy
              // otherwise vertex===undefined
              return edge.end !== vertex;
            })
            .forEach(edge => {

              let node = nodeState[edge.end];
              if (node === undefined) {
                node = pool.createNewState({ id: edge.end });
                nodeState[edge.end] = node;
              }

              if (node.visited === true) {
                return;
              }


              if (!node.opened) {
                openSet.push(node);
                node.opened = true;
              }

              const proposed_distance = current.dist + edge.cost;
              if (proposed_distance >= node.dist) {
                return;
              }

              node.dist = proposed_distance;
              distances[node.id] = proposed_distance;
              node.prev = current.id;

              openSet.updateItem(node.heapIndex);
            });

          current.visited = true;
          const settled_amt = current.dist;

          // get lowest value from heap
          current = openSet.pop();

          // exit early if current node becomes end node
          if (current && (current.id === end_index)) {
            current = '';
          }

          // stopping condition
          if (settled_amt > total) {
            current = '';
          }
        }

        return { distances, nodeState };

      }

    };

    const CoordinateLookup$1 = CoordinateLookup;

    function Graph(geojson, opt) {
      const options = opt || {};
      this.debugMode = options.debugMode || false;

      this.adjacency_list = [];
      this.reverse_adjacency_list = [];

      this._createNodePool = createNodePool;

      this._currentNodeIndex = -1;
      this._nodeToIndexLookup = {};
      this._indexToNodeLookup = {};

      this._currentEdgeIndex = -1;
      this._edgeProperties = [];
      this._edgeGeometry = [];
      this._maxUncontractedEdgeIndex = 0;

      this._locked = false; // locked if contraction has already been run
      this._geoJsonFlag = false; // if data was loaded as geoJson
      this._manualAdd = false; // if the API was used directly to add edges

      if (geojson) {
        this._loadFromGeoJson(geojson);

        if (this.debugMode) {
          console.log('Nodes: ', this._currentNodeIndex);
          console.log('Edges: ', this._currentEdgeIndex);
        }
      }

    }

    Graph.prototype.createPathfinder = createPathfinder;

    Graph.prototype._loadFromGeoJson = _loadFromGeoJson;
    Graph.prototype._cleanseGeoJsonNetwork = _cleanseGeoJsonNetwork;

    Graph.prototype._addContractedEdge = _addContractedEdge;
    Graph.prototype.addEdge = addEdge;
    Graph.prototype._addEdge = _addEdge;

    Graph.prototype.loadCH = loadCH;
    Graph.prototype.saveCH = saveCH;

    Graph.prototype.contractGraph = contractGraph;
    Graph.prototype._arrangeContractedPaths = _arrangeContractedPaths;
    Graph.prototype._cleanAdjList = _cleanAdjList;
    Graph.prototype._contract = _contract;
    Graph.prototype._createChShortcutter = _createChShortcutter;

    exports.CoordinateLookup = CoordinateLookup$1;
    exports.Graph = Graph;

    return exports;

}({}));

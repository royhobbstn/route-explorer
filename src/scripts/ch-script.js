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

    const __geoindex = geokdbush;
    const __kdindex = kdbush;

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
    const addEdge = function(start, end, edge_properties, edge_geometry, is_undirected) {

      if (this._locked) {
        throw new Error('Graph has been contracted.  No additional edges can be added.');
      }

      if (this._geoJsonFlag) {
        throw new Error('Can not add additional edges manually to a GeoJSON network.');
      }

      this._manualAdd = true;
      this._addEdge(start, end, edge_properties, edge_geometry, is_undirected);
    };

    const _addEdge = function(start, end, edge_properties, edge_geometry, is_undirected) {

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

      if (edge_geometry) {
        this._edgeGeometry[this._currentEdgeIndex] = JSON.parse(JSON.stringify(edge_geometry));
      }

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


      // specifying is_undirected=true allows us to save space by not duplicating properties
      if (is_undirected) {
        if (this.adjacency_list[end_node_index]) {
          this.adjacency_list[end_node_index].push(reverse_obj);
        }
        else {
          this.adjacency_list[end_node_index] = [reverse_obj];
        }

        if (this.reverse_adjacency_list[start_node_index]) {
          this.reverse_adjacency_list[start_node_index].push(obj);
        }
        else {
          this.reverse_adjacency_list[start_node_index] = [obj];
        }
      }

    };


    const _addContractedEdge = function(start_index, end_index, properties) {

      // geometry not applicable here
      this._currentEdgeIndex++;
      this._edgeProperties[this._currentEdgeIndex] = properties;
      this._edgeProperties[this._currentEdgeIndex]._start_index = start_index;
      this._edgeProperties[this._currentEdgeIndex]._end_index = end_index;

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

    // ContractionHierarchy ========================================

    const ContractionHierarchy = {};

    ContractionHierarchy.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy._readField, { _locked: false, _geoJsonFlag: false, adjacency_list: [], reverse_adjacency_list: [], _nodeToIndexLookup: {}, _edgeProperties: [], _edgeGeometry: [] }, end);
    };
    ContractionHierarchy._readField = function(tag, obj, pbf) {
      if (tag === 1) obj._locked = pbf.readBoolean();
      else if (tag === 2) obj._geoJsonFlag = pbf.readBoolean();
      else if (tag === 3) obj.adjacency_list.push(ContractionHierarchy.AdjList.read(pbf, pbf.readVarint() + pbf.pos));
      else if (tag === 4) obj.reverse_adjacency_list.push(ContractionHierarchy.AdjList.read(pbf, pbf.readVarint() + pbf.pos));
      else if (tag === 5) { var entry = ContractionHierarchy._FieldEntry5.read(pbf, pbf.readVarint() + pbf.pos);
        obj._nodeToIndexLookup[entry.key] = entry.value; }
      else if (tag === 6) obj._edgeProperties.push(ContractionHierarchy._EDGEPROPERTIES.read(pbf, pbf.readVarint() + pbf.pos));
      else if (tag === 7) obj._edgeGeometry.push(ContractionHierarchy.GeometryArray.read(pbf, pbf.readVarint() + pbf.pos));
    };
    ContractionHierarchy.write = function(obj, pbf) {
      if (obj._locked) pbf.writeBooleanField(1, obj._locked);
      if (obj._geoJsonFlag) pbf.writeBooleanField(2, obj._geoJsonFlag);
      if (obj.adjacency_list)
        for (var i = 0; i < obj.adjacency_list.length; i++) pbf.writeMessage(3, ContractionHierarchy.AdjList.write, obj.adjacency_list[i]);
      if (obj.reverse_adjacency_list)
        for (i = 0; i < obj.reverse_adjacency_list.length; i++) pbf.writeMessage(4, ContractionHierarchy.AdjList.write, obj.reverse_adjacency_list[i]);
      if (obj._nodeToIndexLookup)
        for (i in obj._nodeToIndexLookup)
          if (Object.prototype.hasOwnProperty.call(obj._nodeToIndexLookup, i)) pbf.writeMessage(5, ContractionHierarchy._FieldEntry5.write, { key: i, value: obj._nodeToIndexLookup[i] });
      if (obj._edgeProperties)
        for (i = 0; i < obj._edgeProperties.length; i++) pbf.writeMessage(6, ContractionHierarchy._EDGEPROPERTIES.write, obj._edgeProperties[i]);
      if (obj._edgeGeometry)
        for (i = 0; i < obj._edgeGeometry.length; i++) pbf.writeMessage(7, ContractionHierarchy.GeometryArray.write, obj._edgeGeometry[i]);
    };

    // ContractionHierarchy.EdgeAttrs ========================================

    ContractionHierarchy.EdgeAttrs = {};

    ContractionHierarchy.EdgeAttrs.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy.EdgeAttrs._readField, { end: 0, cost: 0, attrs: 0 }, end);
    };
    ContractionHierarchy.EdgeAttrs._readField = function(tag, obj, pbf) {
      if (tag === 1) obj.end = pbf.readVarint();
      else if (tag === 2) obj.cost = pbf.readDouble();
      else if (tag === 3) obj.attrs = pbf.readVarint();
    };
    ContractionHierarchy.EdgeAttrs.write = function(obj, pbf) {
      if (obj.end) pbf.writeVarintField(1, obj.end);
      if (obj.cost) pbf.writeDoubleField(2, obj.cost);
      if (obj.attrs) pbf.writeVarintField(3, obj.attrs);
    };

    // ContractionHierarchy.AdjList ========================================

    ContractionHierarchy.AdjList = {};

    ContractionHierarchy.AdjList.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy.AdjList._readField, { edges: [] }, end);
    };
    ContractionHierarchy.AdjList._readField = function(tag, obj, pbf) {
      if (tag === 1) obj.edges.push(ContractionHierarchy.EdgeAttrs.read(pbf, pbf.readVarint() + pbf.pos));
    };
    ContractionHierarchy.AdjList.write = function(obj, pbf) {
      if (obj.edges)
        for (var i = 0; i < obj.edges.length; i++) pbf.writeMessage(1, ContractionHierarchy.EdgeAttrs.write, obj.edges[i]);
    };

    // ContractionHierarchy._EDGEPROPERTIES ========================================

    ContractionHierarchy._EDGEPROPERTIES = {};

    ContractionHierarchy._EDGEPROPERTIES.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy._EDGEPROPERTIES._readField, { STFIPS: 0, CTFIPS: 0, MILES: 0, _cost: 0, _id: 0, _start_index: 0, _end_index: 0, _ordered: [] }, end);
    };
    ContractionHierarchy._EDGEPROPERTIES._readField = function(tag, obj, pbf) {
      if (tag === 1) obj.STFIPS = pbf.readVarint();
      else if (tag === 2) obj.CTFIPS = pbf.readVarint();
      else if (tag === 3) obj.MILES = pbf.readDouble();
      else if (tag === 4) obj._cost = pbf.readDouble();
      else if (tag === 5) obj._id = pbf.readVarint();
      else if (tag === 6) obj._start_index = pbf.readVarint();
      else if (tag === 7) obj._end_index = pbf.readVarint();
      else if (tag === 8) pbf.readPackedVarint(obj._ordered);
    };
    ContractionHierarchy._EDGEPROPERTIES.write = function(obj, pbf) {
      if (obj.STFIPS) pbf.writeVarintField(1, obj.STFIPS);
      if (obj.CTFIPS) pbf.writeVarintField(2, obj.CTFIPS);
      if (obj.MILES) pbf.writeDoubleField(3, obj.MILES);
      if (obj._cost) pbf.writeDoubleField(4, obj._cost);
      if (obj._id) pbf.writeVarintField(5, obj._id);
      if (obj._start_index) pbf.writeVarintField(6, obj._start_index);
      if (obj._end_index) pbf.writeVarintField(7, obj._end_index);
      if (obj._ordered) pbf.writePackedVarint(8, obj._ordered);
    };

    // ContractionHierarchy.LineStringAray ========================================

    ContractionHierarchy.LineStringAray = {};

    ContractionHierarchy.LineStringAray.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy.LineStringAray._readField, { coords: [] }, end);
    };
    ContractionHierarchy.LineStringAray._readField = function(tag, obj, pbf) {
      if (tag === 1) pbf.readPackedDouble(obj.coords);
    };
    ContractionHierarchy.LineStringAray.write = function(obj, pbf) {
      if (obj.coords) pbf.writePackedDouble(1, obj.coords);
    };

    // ContractionHierarchy.GeometryArray ========================================

    ContractionHierarchy.GeometryArray = {};

    ContractionHierarchy.GeometryArray.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy.GeometryArray._readField, { linestrings: [] }, end);
    };
    ContractionHierarchy.GeometryArray._readField = function(tag, obj, pbf) {
      if (tag === 1) obj.linestrings.push(ContractionHierarchy.LineStringAray.read(pbf, pbf.readVarint() + pbf.pos));
    };
    ContractionHierarchy.GeometryArray.write = function(obj, pbf) {
      if (obj.linestrings)
        for (var i = 0; i < obj.linestrings.length; i++) pbf.writeMessage(1, ContractionHierarchy.LineStringAray.write, obj.linestrings[i]);
    };

    // ContractionHierarchy._FieldEntry5 ========================================

    ContractionHierarchy._FieldEntry5 = {};

    ContractionHierarchy._FieldEntry5.read = function(pbf, end) {
      return pbf.readFields(ContractionHierarchy._FieldEntry5._readField, { key: "", value: 0 }, end);
    };
    ContractionHierarchy._FieldEntry5._readField = function(tag, obj, pbf) {
      if (tag === 1) obj.key = pbf.readString();
      else if (tag === 2) obj.value = pbf.readVarint();
    };
    ContractionHierarchy._FieldEntry5.write = function(obj, pbf) {
      if (obj.key) pbf.writeStringField(1, obj.key);
      if (obj.value) pbf.writeVarintField(2, obj.value);
    };

    const CH = ContractionHierarchy;

    var read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? (nBytes - 1) : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    };

    var write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = (nBytes * 8) - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
      var i = isLE ? 0 : (nBytes - 1);
      var d = isLE ? 1 : -1;
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = ((value * c) - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

      buffer[offset + i - d] |= s * 128;
    };

    var ieee754 = {
    	read: read,
    	write: write
    };

    var pbf = Pbf;



    function Pbf(buf) {
        this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
    }

    Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
    Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
    Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
    Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

    var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
        SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;

    Pbf.prototype = {

        destroy: function() {
            this.buf = null;
        },

        // === READING =================================================================

        readFields: function(readField, result, end) {
            end = end || this.length;

            while (this.pos < end) {
                var val = this.readVarint(),
                    tag = val >> 3,
                    startPos = this.pos;

                this.type = val & 0x7;
                readField(tag, result, this);

                if (this.pos === startPos) this.skip(val);
            }
            return result;
        },

        readMessage: function(readField, result) {
            return this.readFields(readField, result, this.readVarint() + this.pos);
        },

        readFixed32: function() {
            var val = readUInt32(this.buf, this.pos);
            this.pos += 4;
            return val;
        },

        readSFixed32: function() {
            var val = readInt32(this.buf, this.pos);
            this.pos += 4;
            return val;
        },

        // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

        readFixed64: function() {
            var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
            this.pos += 8;
            return val;
        },

        readSFixed64: function() {
            var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
            this.pos += 8;
            return val;
        },

        readFloat: function() {
            var val = ieee754.read(this.buf, this.pos, true, 23, 4);
            this.pos += 4;
            return val;
        },

        readDouble: function() {
            var val = ieee754.read(this.buf, this.pos, true, 52, 8);
            this.pos += 8;
            return val;
        },

        readVarint: function(isSigned) {
            var buf = this.buf,
                val, b;

            b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
            b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
            b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
            b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;
            b = buf[this.pos];   val |= (b & 0x0f) << 28;

            return readVarintRemainder(val, isSigned, this);
        },

        readVarint64: function() { // for compatibility with v2.0.1
            return this.readVarint(true);
        },

        readSVarint: function() {
            var num = this.readVarint();
            return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
        },

        readBoolean: function() {
            return Boolean(this.readVarint());
        },

        readString: function() {
            var end = this.readVarint() + this.pos,
                str = readUtf8(this.buf, this.pos, end);
            this.pos = end;
            return str;
        },

        readBytes: function() {
            var end = this.readVarint() + this.pos,
                buffer = this.buf.subarray(this.pos, end);
            this.pos = end;
            return buffer;
        },

        // verbose for performance reasons; doesn't affect gzipped size

        readPackedVarint: function(arr, isSigned) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readVarint(isSigned));
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readVarint(isSigned));
            return arr;
        },
        readPackedSVarint: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readSVarint());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readSVarint());
            return arr;
        },
        readPackedBoolean: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readBoolean());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readBoolean());
            return arr;
        },
        readPackedFloat: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readFloat());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readFloat());
            return arr;
        },
        readPackedDouble: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readDouble());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readDouble());
            return arr;
        },
        readPackedFixed32: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readFixed32());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readFixed32());
            return arr;
        },
        readPackedSFixed32: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed32());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readSFixed32());
            return arr;
        },
        readPackedFixed64: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readFixed64());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readFixed64());
            return arr;
        },
        readPackedSFixed64: function(arr) {
            if (this.type !== Pbf.Bytes) return arr.push(this.readSFixed64());
            var end = readPackedEnd(this);
            arr = arr || [];
            while (this.pos < end) arr.push(this.readSFixed64());
            return arr;
        },

        skip: function(val) {
            var type = val & 0x7;
            if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
            else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
            else if (type === Pbf.Fixed32) this.pos += 4;
            else if (type === Pbf.Fixed64) this.pos += 8;
            else throw new Error('Unimplemented type: ' + type);
        },

        // === WRITING =================================================================

        writeTag: function(tag, type) {
            this.writeVarint((tag << 3) | type);
        },

        realloc: function(min) {
            var length = this.length || 16;

            while (length < this.pos + min) length *= 2;

            if (length !== this.length) {
                var buf = new Uint8Array(length);
                buf.set(this.buf);
                this.buf = buf;
                this.length = length;
            }
        },

        finish: function() {
            this.length = this.pos;
            this.pos = 0;
            return this.buf.subarray(0, this.length);
        },

        writeFixed32: function(val) {
            this.realloc(4);
            writeInt32(this.buf, val, this.pos);
            this.pos += 4;
        },

        writeSFixed32: function(val) {
            this.realloc(4);
            writeInt32(this.buf, val, this.pos);
            this.pos += 4;
        },

        writeFixed64: function(val) {
            this.realloc(8);
            writeInt32(this.buf, val & -1, this.pos);
            writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
            this.pos += 8;
        },

        writeSFixed64: function(val) {
            this.realloc(8);
            writeInt32(this.buf, val & -1, this.pos);
            writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
            this.pos += 8;
        },

        writeVarint: function(val) {
            val = +val || 0;

            if (val > 0xfffffff || val < 0) {
                writeBigVarint(val, this);
                return;
            }

            this.realloc(4);

            this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
            this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
            this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
            this.buf[this.pos++] =   (val >>> 7) & 0x7f;
        },

        writeSVarint: function(val) {
            this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
        },

        writeBoolean: function(val) {
            this.writeVarint(Boolean(val));
        },

        writeString: function(str) {
            str = String(str);
            this.realloc(str.length * 4);

            this.pos++; // reserve 1 byte for short string length

            var startPos = this.pos;
            // write the string directly to the buffer and see how much was written
            this.pos = writeUtf8(this.buf, str, this.pos);
            var len = this.pos - startPos;

            if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

            // finally, write the message length in the reserved place and restore the position
            this.pos = startPos - 1;
            this.writeVarint(len);
            this.pos += len;
        },

        writeFloat: function(val) {
            this.realloc(4);
            ieee754.write(this.buf, val, this.pos, true, 23, 4);
            this.pos += 4;
        },

        writeDouble: function(val) {
            this.realloc(8);
            ieee754.write(this.buf, val, this.pos, true, 52, 8);
            this.pos += 8;
        },

        writeBytes: function(buffer) {
            var len = buffer.length;
            this.writeVarint(len);
            this.realloc(len);
            for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
        },

        writeRawMessage: function(fn, obj) {
            this.pos++; // reserve 1 byte for short message length

            // write the message directly to the buffer and see how much was written
            var startPos = this.pos;
            fn(obj, this);
            var len = this.pos - startPos;

            if (len >= 0x80) makeRoomForExtraLength(startPos, len, this);

            // finally, write the message length in the reserved place and restore the position
            this.pos = startPos - 1;
            this.writeVarint(len);
            this.pos += len;
        },

        writeMessage: function(tag, fn, obj) {
            this.writeTag(tag, Pbf.Bytes);
            this.writeRawMessage(fn, obj);
        },

        writePackedVarint:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedVarint, arr);   },
        writePackedSVarint:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);  },
        writePackedBoolean:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);  },
        writePackedFloat:    function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFloat, arr);    },
        writePackedDouble:   function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedDouble, arr);   },
        writePackedFixed32:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);  },
        writePackedSFixed32: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr); },
        writePackedFixed64:  function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);  },
        writePackedSFixed64: function(tag, arr) { if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr); },

        writeBytesField: function(tag, buffer) {
            this.writeTag(tag, Pbf.Bytes);
            this.writeBytes(buffer);
        },
        writeFixed32Field: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed32);
            this.writeFixed32(val);
        },
        writeSFixed32Field: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed32);
            this.writeSFixed32(val);
        },
        writeFixed64Field: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed64);
            this.writeFixed64(val);
        },
        writeSFixed64Field: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed64);
            this.writeSFixed64(val);
        },
        writeVarintField: function(tag, val) {
            this.writeTag(tag, Pbf.Varint);
            this.writeVarint(val);
        },
        writeSVarintField: function(tag, val) {
            this.writeTag(tag, Pbf.Varint);
            this.writeSVarint(val);
        },
        writeStringField: function(tag, str) {
            this.writeTag(tag, Pbf.Bytes);
            this.writeString(str);
        },
        writeFloatField: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed32);
            this.writeFloat(val);
        },
        writeDoubleField: function(tag, val) {
            this.writeTag(tag, Pbf.Fixed64);
            this.writeDouble(val);
        },
        writeBooleanField: function(tag, val) {
            this.writeVarintField(tag, Boolean(val));
        }
    };

    function readVarintRemainder(l, s, p) {
        var buf = p.buf,
            h, b;

        b = buf[p.pos++]; h  = (b & 0x70) >> 4;  if (b < 0x80) return toNum(l, h, s);
        b = buf[p.pos++]; h |= (b & 0x7f) << 3;  if (b < 0x80) return toNum(l, h, s);
        b = buf[p.pos++]; h |= (b & 0x7f) << 10; if (b < 0x80) return toNum(l, h, s);
        b = buf[p.pos++]; h |= (b & 0x7f) << 17; if (b < 0x80) return toNum(l, h, s);
        b = buf[p.pos++]; h |= (b & 0x7f) << 24; if (b < 0x80) return toNum(l, h, s);
        b = buf[p.pos++]; h |= (b & 0x01) << 31; if (b < 0x80) return toNum(l, h, s);

        throw new Error('Expected varint not more than 10 bytes');
    }

    function readPackedEnd(pbf) {
        return pbf.type === Pbf.Bytes ?
            pbf.readVarint() + pbf.pos : pbf.pos + 1;
    }

    function toNum(low, high, isSigned) {
        if (isSigned) {
            return high * 0x100000000 + (low >>> 0);
        }

        return ((high >>> 0) * 0x100000000) + (low >>> 0);
    }

    function writeBigVarint(val, pbf) {
        var low, high;

        if (val >= 0) {
            low  = (val % 0x100000000) | 0;
            high = (val / 0x100000000) | 0;
        } else {
            low  = ~(-val % 0x100000000);
            high = ~(-val / 0x100000000);

            if (low ^ 0xffffffff) {
                low = (low + 1) | 0;
            } else {
                low = 0;
                high = (high + 1) | 0;
            }
        }

        if (val >= 0x10000000000000000 || val < -0x10000000000000000) {
            throw new Error('Given varint doesn\'t fit into 10 bytes');
        }

        pbf.realloc(10);

        writeBigVarintLow(low, high, pbf);
        writeBigVarintHigh(high, pbf);
    }

    function writeBigVarintLow(low, high, pbf) {
        pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
        pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
        pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
        pbf.buf[pbf.pos++] = low & 0x7f | 0x80; low >>>= 7;
        pbf.buf[pbf.pos]   = low & 0x7f;
    }

    function writeBigVarintHigh(high, pbf) {
        var lsb = (high & 0x07) << 4;

        pbf.buf[pbf.pos++] |= lsb         | ((high >>>= 3) ? 0x80 : 0); if (!high) return;
        pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
        pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
        pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
        pbf.buf[pbf.pos++]  = high & 0x7f | ((high >>>= 7) ? 0x80 : 0); if (!high) return;
        pbf.buf[pbf.pos++]  = high & 0x7f;
    }

    function makeRoomForExtraLength(startPos, len, pbf) {
        var extraLen =
            len <= 0x3fff ? 1 :
            len <= 0x1fffff ? 2 :
            len <= 0xfffffff ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));

        // if 1 byte isn't enough for encoding message length, shift the data to the right
        pbf.realloc(extraLen);
        for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
    }

    function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
    function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
    function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
    function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
    function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
    function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
    function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
    function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
    function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

    // Buffer code below from https://github.com/feross/buffer, MIT-licensed

    function readUInt32(buf, pos) {
        return ((buf[pos]) |
            (buf[pos + 1] << 8) |
            (buf[pos + 2] << 16)) +
            (buf[pos + 3] * 0x1000000);
    }

    function writeInt32(buf, val, pos) {
        buf[pos] = val;
        buf[pos + 1] = (val >>> 8);
        buf[pos + 2] = (val >>> 16);
        buf[pos + 3] = (val >>> 24);
    }

    function readInt32(buf, pos) {
        return ((buf[pos]) |
            (buf[pos + 1] << 8) |
            (buf[pos + 2] << 16)) +
            (buf[pos + 3] << 24);
    }

    function readUtf8(buf, pos, end) {
        var str = '';
        var i = pos;

        while (i < end) {
            var b0 = buf[i];
            var c = null; // codepoint
            var bytesPerSequence =
                b0 > 0xEF ? 4 :
                b0 > 0xDF ? 3 :
                b0 > 0xBF ? 2 : 1;

            if (i + bytesPerSequence > end) break;

            var b1, b2, b3;

            if (bytesPerSequence === 1) {
                if (b0 < 0x80) {
                    c = b0;
                }
            } else if (bytesPerSequence === 2) {
                b1 = buf[i + 1];
                if ((b1 & 0xC0) === 0x80) {
                    c = (b0 & 0x1F) << 0x6 | (b1 & 0x3F);
                    if (c <= 0x7F) {
                        c = null;
                    }
                }
            } else if (bytesPerSequence === 3) {
                b1 = buf[i + 1];
                b2 = buf[i + 2];
                if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80) {
                    c = (b0 & 0xF) << 0xC | (b1 & 0x3F) << 0x6 | (b2 & 0x3F);
                    if (c <= 0x7FF || (c >= 0xD800 && c <= 0xDFFF)) {
                        c = null;
                    }
                }
            } else if (bytesPerSequence === 4) {
                b1 = buf[i + 1];
                b2 = buf[i + 2];
                b3 = buf[i + 3];
                if ((b1 & 0xC0) === 0x80 && (b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                    c = (b0 & 0xF) << 0x12 | (b1 & 0x3F) << 0xC | (b2 & 0x3F) << 0x6 | (b3 & 0x3F);
                    if (c <= 0xFFFF || c >= 0x110000) {
                        c = null;
                    }
                }
            }

            if (c === null) {
                c = 0xFFFD;
                bytesPerSequence = 1;

            } else if (c > 0xFFFF) {
                c -= 0x10000;
                str += String.fromCharCode(c >>> 10 & 0x3FF | 0xD800);
                c = 0xDC00 | c & 0x3FF;
            }

            str += String.fromCharCode(c);
            i += bytesPerSequence;
        }

        return str;
    }

    function writeUtf8(buf, str, pos) {
        for (var i = 0, c, lead; i < str.length; i++) {
            c = str.charCodeAt(i); // code point

            if (c > 0xD7FF && c < 0xE000) {
                if (lead) {
                    if (c < 0xDC00) {
                        buf[pos++] = 0xEF;
                        buf[pos++] = 0xBF;
                        buf[pos++] = 0xBD;
                        lead = c;
                        continue;
                    } else {
                        c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                        lead = null;
                    }
                } else {
                    if (c > 0xDBFF || (i + 1 === str.length)) {
                        buf[pos++] = 0xEF;
                        buf[pos++] = 0xBF;
                        buf[pos++] = 0xBD;
                    } else {
                        lead = c;
                    }
                    continue;
                }
            } else if (lead) {
                buf[pos++] = 0xEF;
                buf[pos++] = 0xBF;
                buf[pos++] = 0xBD;
                lead = null;
            }

            if (c < 0x80) {
                buf[pos++] = c;
            } else {
                if (c < 0x800) {
                    buf[pos++] = c >> 0x6 | 0xC0;
                } else {
                    if (c < 0x10000) {
                        buf[pos++] = c >> 0xC | 0xE0;
                    } else {
                        buf[pos++] = c >> 0x12 | 0xF0;
                        buf[pos++] = c >> 0xC & 0x3F | 0x80;
                    }
                    buf[pos++] = c >> 0x6 & 0x3F | 0x80;
                }
                buf[pos++] = c & 0x3F | 0x80;
            }
        }
        return pos;
    }

    const loadCH = function(ch) {
      const parsed = (typeof ch === 'object') ? ch : JSON.parse(ch);
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


    const loadPbfCH = function(buffer) {

      var readpbf = new pbf(buffer);
      var obj = CH.read(readpbf);

      // back to graph compatible structure
      obj.adjacency_list = obj.adjacency_list.map(list => {
        return list.edges;
      });

      obj.reverse_adjacency_list = obj.reverse_adjacency_list.map(list => {
        return list.edges;
      });

      obj._edgeGeometry = obj._edgeGeometry.map(l => {
        return l.linestrings.map(c => {
          return c.coords;
        });
      });

      this._locked = obj._locked;
      this._geoJsonFlag = obj._geoJsonFlag;
      this.adjacency_list = obj.adjacency_list;
      this.reverse_adjacency_list = obj.reverse_adjacency_list;
      this._nodeToIndexLookup = obj._nodeToIndexLookup;
      this._edgeProperties = obj._edgeProperties; // TODO... misc user properties
      this._edgeGeometry = obj._edgeGeometry;

      console.log(`done loading pbf`);

    };

    const savePbfCH = function(path) {

      if (!require) {
        console.log('saving as PBF only works in NodeJS');
        return;
      }

      const fs = require("fs");

      if (!this._locked) {
        throw new Error('No sense in saving network before it is contracted.');
      }

      const data = {
        _locked: this._locked,
        _geoJsonFlag: this._geoJsonFlag,
        adjacency_list: this.adjacency_list,
        reverse_adjacency_list: this.reverse_adjacency_list,
        _nodeToIndexLookup: this._nodeToIndexLookup,
        _edgeProperties: this._edgeProperties,
        _edgeGeometry: this._edgeGeometry
      };

      // convert to protobuf compatible

      data.adjacency_list = data.adjacency_list.map(list => {
        return {
          edges: list.map(edge => {
            return edge;
          })
        };
      });

      data.reverse_adjacency_list = data.reverse_adjacency_list.map(list => {
        return {
          edges: list.map(edge => {
            return edge;
          })
        };
      });

      data._edgeGeometry = data._edgeGeometry.map(linestring => {
        return {
          linestrings: linestring.map(coords => {
            return { coords };
          })
        };
      });

      // write
      var pbf$1 = new pbf();
      CH.write(data, pbf$1);

      var buffer = pbf$1.finish();

      fs.writeFileSync(path, buffer, null);

      console.log(`done saving ${path}`);

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

    // backdoor to export spatial indexing for custom solutions
    const __geoindex$1 = __geoindex;
    const __kdindex$1 = __kdindex;

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
    Graph.prototype.loadPbfCH = loadPbfCH;
    Graph.prototype.savePbfCH = savePbfCH;

    Graph.prototype.contractGraph = contractGraph;
    Graph.prototype._arrangeContractedPaths = _arrangeContractedPaths;
    Graph.prototype._cleanAdjList = _cleanAdjList;
    Graph.prototype._contract = _contract;
    Graph.prototype._createChShortcutter = _createChShortcutter;

    exports.CoordinateLookup = CoordinateLookup$1;
    exports.Graph = Graph;
    exports.__geoindex = __geoindex$1;
    exports.__kdindex = __kdindex$1;

    return exports;

}({}));

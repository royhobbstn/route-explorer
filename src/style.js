export const style = {
  "version": 8,
  "name": "Bright",
  "metadata": {
    "mapbox:autocomposite": true,
    "mapbox:type": "template",
    "mapbox:groups": {

      "1444849382550.77": {
        "name": "Water",
        "collapsed": true
      },
      "1444849345966.4436": {
        "name": "Roads",
        "collapsed": true
      },
      "1444849307123.581": {
        "name": "Admin  lines",
        "collapsed": true
      },
      "1456163609504.0715": {
        "name": "Road labels",
        "collapsed": true
      },
      "1444849272561.29": {
        "name": "Place labels",
        "collapsed": true
      },
      "1444849290021.1838": {
        "name": "Road labels",
        "collapsed": true
      }
    }
  },
  "sources": {
    "mapbox": {
      "url": "mapbox://mapbox.mapbox-streets-v7",
      "type": "vector"
    }
  },
  "sprite": "mapbox://sprites/mapbox/bright-v9",
  "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  "layers": [{
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "#ffffff"
      },
      "interactive": true
    },

    {
      "interactive": true,
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "filter": [
        "all", [
          "==",
          "class",
          "no"
        ]
      ],
      "type": "line",
      "source": "mapbox",
      "id": "blank",
      "source-layer": "waterway"
    },

    {
      "interactive": true,
      "layout": {
        "line-cap": "round"
      },
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "filter": [
        "all", [
          "!=",
          "class",
          "river"
        ],
        [
          "!=",
          "class",
          "stream"
        ],
        [
          "!=",
          "class",
          "canal"
        ]
      ],
      "type": "line",
      "source": "mapbox",
      "id": "waterway",
      "paint": {
        "line-color": "#a0c8f0",
        "line-width": {
          "base": 1.3,
          "stops": [
            [
              13,
              0.5
            ],
            [
              20,
              2
            ]
          ]
        }
      },
      "source-layer": "waterway"
    },
    {
      "interactive": true,
      "layout": {
        "line-cap": "round"
      },
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "filter": [
        "==",
        "class",
        "river"
      ],
      "type": "line",
      "source": "mapbox",
      "id": "waterway_river",
      "paint": {
        "line-color": "#a0c8f0",
        "line-width": {
          "base": 1.2,
          "stops": [
            [
              11,
              0.5
            ],
            [
              20,
              6
            ]
          ]
        }
      },
      "source-layer": "waterway"
    },
    {
      "interactive": true,
      "layout": {
        "line-cap": "round"
      },
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "filter": [
        "in",
        "class",
        "stream",
        "canal"
      ],
      "type": "line",
      "source": "mapbox",
      "id": "waterway_stream_canal",
      "paint": {
        "line-color": "#a0c8f0",
        "line-width": {
          "base": 1.3,
          "stops": [
            [
              13,
              0.5
            ],
            [
              20,
              6
            ]
          ]
        }
      },
      "source-layer": "waterway"
    },
    {
      "id": "water",
      "type": "fill",
      "source": "mapbox",
      "source-layer": "water",
      "paint": {
        "fill-outline-color": "grey",
        "fill-color": "#a0c8f0"
      },
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "interactive": true
    },
    // {
    //   "id": "water_offset",
    //   "paint": {
    //     "fill-color": "white",
    //     "fill-opacity": 0.3,
    //     "fill-translate": [
    //       0,
    //       2.5
    //     ]
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849382550.77"
    //   },
    //   "interactive": true,
    //   "ref": "water"
    // },
    {
      "id": "water_pattern",
      "paint": {
        "fill-translate": [
          0,
          2.5
        ],
        "fill-pattern": "wave"
      },
      "metadata": {
        "mapbox:group": "1444849382550.77"
      },
      "interactive": true,
      "ref": "water"
    },


    // {
    //   "interactive": true,
    //   "minzoom": 12,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "==",
    //       "class",
    //       "motorway_link"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_motorway_link_casing",
    //   "paint": {
    //     "line-color": "#e9ac77",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           12,
    //           1
    //         ],
    //         [
    //           13,
    //           3
    //         ],
    //         [
    //           14,
    //           4
    //         ],
    //         [
    //           20,
    //           15
    //         ]
    //       ]
    //     },
    //     "line-opacity": 1
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "in",
    //       "class",
    //       "service",
    //       "track"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_service_track_casing",
    //   "paint": {
    //     "line-color": "#cfcdca",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           15,
    //           1
    //         ],
    //         [
    //           16,
    //           4
    //         ],
    //         [
    //           20,
    //           11
    //         ]
    //       ]
    //     }
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "minzoom": 13,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round",
    //     "visibility": "visible"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "==",
    //       "class",
    //       "link"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_link_casing",
    //   "paint": {
    //     "line-color": "#e9ac77",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           12,
    //           1
    //         ],
    //         [
    //           13,
    //           3
    //         ],
    //         [
    //           14,
    //           4
    //         ],
    //         [
    //           20,
    //           15
    //         ]
    //       ]
    //     },
    //     "line-opacity": 1
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "==",
    //       "$type",
    //       "LineString"
    //     ],
    //     [
    //       "all", [
    //         "in",
    //         "class",
    //         "street",
    //         "street_limited"
    //       ],
    //       [
    //         "!in",
    //         "structure",
    //         "bridge",
    //         "tunnel"
    //       ]
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_street_casing",
    //   "paint": {
    //     "line-color": "#cfcdca",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           12,
    //           0.5
    //         ],
    //         [
    //           13,
    //           1
    //         ],
    //         [
    //           14,
    //           4
    //         ],
    //         [
    //           20,
    //           15
    //         ]
    //       ]
    //     },
    //     "line-opacity": {
    //       "stops": [
    //         [
    //           12,
    //           0
    //         ],
    //         [
    //           12.5,
    //           1
    //         ]
    //       ]
    //     }
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round",
    //     "visibility": "visible"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "in",
    //       "class",
    //       "secondary",
    //       "tertiary"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_secondary_tertiary_casing",
    //   "paint": {
    //     "line-color": "#e9ac77",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           8,
    //           1.5
    //         ],
    //         [
    //           20,
    //           17
    //         ]
    //       ]
    //     },
    //     "line-opacity": 1
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round",
    //     "visibility": "visible"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "in",
    //       "class",
    //       "trunk",
    //       "primary"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_trunk_primary_casing",
    //   "paint": {
    //     "line-color": "#e9ac77",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           5,
    //           0.4
    //         ],
    //         [
    //           6,
    //           0.6
    //         ],
    //         [
    //           7,
    //           1.5
    //         ],
    //         [
    //           20,
    //           22
    //         ]
    //       ]
    //     },
    //     "line-opacity": 1
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "interactive": true,
    //   "minzoom": 5,
    //   "layout": {
    //     "line-cap": "round",
    //     "line-join": "round",
    //     "visibility": "visible"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "filter": [
    //     "all", [
    //       "==",
    //       "class",
    //       "motorway"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "type": "line",
    //   "source": "mapbox",
    //   "id": "road_motorway_casing",
    //   "paint": {
    //     "line-color": "#e9ac77",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           5,
    //           0.4
    //         ],
    //         [
    //           6,
    //           0.6
    //         ],
    //         [
    //           7,
    //           1.5
    //         ],
    //         [
    //           20,
    //           22
    //         ]
    //       ]
    //     }
    //   },
    //   "source-layer": "road"
    // },
    // {
    //   "id": "road_path_pedestrian",
    //   "type": "line",
    //   "source": "mapbox",
    //   "source-layer": "road",
    //   "filter": [
    //     "all", [
    //       "==",
    //       "$type",
    //       "LineString"
    //     ],
    //     [
    //       "all", [
    //         "in",
    //         "class",
    //         "path",
    //         "pedestrian"
    //       ],
    //       [
    //         "!in",
    //         "structure",
    //         "bridge",
    //         "tunnel"
    //       ]
    //     ]
    //   ],
    //   "paint": {
    //     "line-color": "#cba",
    //     "line-dasharray": [
    //       1.5,
    //       0.75
    //     ],
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           15,
    //           1.2
    //         ],
    //         [
    //           20,
    //           4
    //         ]
    //       ]
    //     }
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "interactive": true
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_motorway_link",
    //   "paint": {
    //     "line-color": "#fc8",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           12.5,
    //           0
    //         ],
    //         [
    //           13,
    //           1.5
    //         ],
    //         [
    //           14,
    //           2.5
    //         ],
    //         [
    //           20,
    //           11.5
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_motorway_link_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_service_track",
    //   "paint": {
    //     "line-color": "#fff",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           15.5,
    //           0
    //         ],
    //         [
    //           16,
    //           2
    //         ],
    //         [
    //           20,
    //           7.5
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_service_track_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_link",
    //   "paint": {
    //     "line-color": "#fea",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           12.5,
    //           0
    //         ],
    //         [
    //           13,
    //           1.5
    //         ],
    //         [
    //           14,
    //           2.5
    //         ],
    //         [
    //           20,
    //           11.5
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_link_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_street",
    //   "paint": {
    //     "line-color": "#fff",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           13.5,
    //           0
    //         ],
    //         [
    //           14,
    //           2.5
    //         ],
    //         [
    //           20,
    //           11.5
    //         ]
    //       ]
    //     },
    //     "line-opacity": 1
    //   },
    //   "ref": "road_street_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_secondary_tertiary",
    //   "paint": {
    //     "line-color": "#fea",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           6.5,
    //           0
    //         ],
    //         [
    //           8,
    //           0.5
    //         ],
    //         [
    //           20,
    //           13
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_secondary_tertiary_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_trunk_primary",
    //   "paint": {
    //     "line-color": "#fea",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           6.5,
    //           0
    //         ],
    //         [
    //           7,
    //           0.5
    //         ],
    //         [
    //           20,
    //           18
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_trunk_primary_casing"
    // },
    // {
    //   "interactive": true,
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "id": "road_motorway",
    //   "paint": {
    //     "line-color": "#fc8",
    //     "line-width": {
    //       "base": 1.2,
    //       "stops": [
    //         [
    //           6.5,
    //           0
    //         ],
    //         [
    //           7,
    //           0.5
    //         ],
    //         [
    //           20,
    //           18
    //         ]
    //       ]
    //     }
    //   },
    //   "ref": "road_motorway_casing"
    // },
    // {
    //   "id": "road_major_rail",
    //   "type": "line",
    //   "source": "mapbox",
    //   "source-layer": "road",
    //   "filter": [
    //     "all", [
    //       "==",
    //       "class",
    //       "major_rail"
    //     ],
    //     [
    //       "!in",
    //       "structure",
    //       "bridge",
    //       "tunnel"
    //     ]
    //   ],
    //   "paint": {
    //     "line-color": "#bbb",
    //     "line-width": {
    //       "base": 1.4,
    //       "stops": [
    //         [
    //           14,
    //           0.4
    //         ],
    //         [
    //           15,
    //           0.75
    //         ],
    //         [
    //           20,
    //           2
    //         ]
    //       ]
    //     }
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "interactive": true
    // },
    // {
    //   "id": "road_major_rail_hatching",
    //   "paint": {
    //     "line-color": "#bbb",
    //     "line-dasharray": [
    //       0.2,
    //       8
    //     ],
    //     "line-width": {
    //       "base": 1.4,
    //       "stops": [
    //         [
    //           14.5,
    //           0
    //         ],
    //         [
    //           15,
    //           3
    //         ],
    //         [
    //           20,
    //           8
    //         ]
    //       ]
    //     }
    //   },
    //   "metadata": {
    //     "mapbox:group": "1444849345966.4436"
    //   },
    //   "interactive": true,
    //   "ref": "road_major_rail"
    // },













    {
      "interactive": true,
      "layout": {
        "line-join": "round"
      },
      "metadata": {
        "mapbox:group": "1444849307123.581"
      },
      "filter": [
        "all", [
          ">=",
          "admin_level",
          3
        ],
        [
          "==",
          "maritime",
          0
        ]
      ],
      "type": "line",
      "source": "mapbox",
      "id": "admin_level_3",
      "paint": {
        "line-color": "#9e9cab",
        "line-dasharray": [
          3,
          1,
          1,
          1
        ],
        "line-width": {
          "base": 1,
          "stops": [
            [
              4,
              0.4
            ],
            [
              5,
              1
            ],
            [
              12,
              3
            ]
          ]
        }
      },
      "source-layer": "admin"
    },
    {
      "interactive": true,
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "metadata": {
        "mapbox:group": "1444849307123.581"
      },
      "filter": [
        "all", [
          "==",
          "admin_level",
          2
        ],
        [
          "==",
          "disputed",
          0
        ],
        [
          "==",
          "maritime",
          0
        ]
      ],
      "type": "line",
      "source": "mapbox",
      "id": "admin_level_2",
      "paint": {
        "line-color": "#9e9cab",
        "line-width": {
          "base": 1,
          "stops": [
            [
              4,
              1.4
            ],
            [
              5,
              2
            ],
            [
              12,
              8
            ]
          ]
        }
      },
      "source-layer": "admin"
    },
    {
      "interactive": true,
      "layout": {
        "line-cap": "round"
      },
      "metadata": {
        "mapbox:group": "1444849307123.581"
      },
      "filter": [
        "all", [
          "==",
          "admin_level",
          2
        ],
        [
          "==",
          "disputed",
          1
        ],
        [
          "==",
          "maritime",
          0
        ]
      ],
      "type": "line",
      "source": "mapbox",
      "id": "admin_level_2_disputed",
      "paint": {
        "line-color": "#9e9cab",
        "line-dasharray": [
          2,
          2
        ],
        "line-width": {
          "base": 1,
          "stops": [
            [
              4,
              1.4
            ],
            [
              5,
              2
            ],
            [
              12,
              8
            ]
          ]
        }
      },
      "source-layer": "admin"
    },

    // {
    //   "interactive": true,
    //   "layout": {
    //     "text-field": "{name_en}",
    //     "text-font": [
    //       "Open Sans Regular",
    //       "Arial Unicode MS Regular"
    //     ],
    //     "text-size": {
    //       "base": 1,
    //       "stops": [
    //         [
    //           13,
    //           12
    //         ],
    //         [
    //           14,
    //           13
    //         ]
    //       ]
    //     },
    //     "symbol-placement": "line"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1456163609504.0715"
    //   },
    //   "filter": [
    //     "!=",
    //     "class",
    //     "ferry"
    //   ],
    //   "type": "symbol",
    //   "source": "mapbox",
    //   "id": "road_label",
    //   "paint": {
    //     "text-color": "#765",
    //     "text-halo-width": 1,
    //     "text-halo-blur": 0.5
    //   },
    //   "source-layer": "road_label"
    // },
    // {
    //   "interactive": true,
    //   "minzoom": 8,
    //   "layout": {
    //     "text-field": "{ref}",
    //     "text-font": [
    //       "Open Sans Semibold",
    //       "Arial Unicode MS Bold"
    //     ],
    //     "text-size": 11,
    //     "icon-image": "motorway_{reflen}",
    //     "symbol-placement": {
    //       "base": 1,
    //       "stops": [
    //         [
    //           10,
    //           "point"
    //         ],
    //         [
    //           11,
    //           "line"
    //         ]
    //       ]
    //     },
    //     "symbol-spacing": 500,
    //     "text-rotation-alignment": "viewport",
    //     "icon-rotation-alignment": "viewport"
    //   },
    //   "metadata": {
    //     "mapbox:group": "1456163609504.0715"
    //   },
    //   "filter": [
    //     "<=",
    //     "reflen",
    //     6
    //   ],
    //   "type": "symbol",
    //   "source": "mapbox",
    //   "id": "road_label_highway_shield",
    //   "paint": {

    //   },
    //   "source-layer": "road_label"
    // },
    //   {
    //     "interactive": true,
    //     "layout": {
    //       "text-font": [
    //         "Open Sans Bold",
    //         "Arial Unicode MS Bold"
    //       ],
    //       "text-transform": "uppercase",
    //       "text-letter-spacing": 0.1,
    //       "text-field": "{name_en}",
    //       "text-max-width": 9,
    //       "text-size": {
    //         "base": 1.2,
    //         "stops": [
    //           [
    //             12,
    //             10
    //           ],
    //           [
    //             15,
    //             14
    //           ]
    //         ]
    //       }
    //     },
    //     "metadata": {
    //       "mapbox:group": "1444849272561.29"
    //     },
    //     "filter": [
    //       "in",
    //       "type",
    //       "hamlet",
    //       "suburb",
    //       "neighbourhood",
    //       "island",
    //       "islet"
    //     ],
    //     "type": "symbol",
    //     "source": "mapbox",
    //     "id": "place_label_other",
    //     "paint": {
    //       "text-color": "#633",
    //       "text-halo-color": "rgba(255,255,255,0.8)",
    //       "text-halo-width": 1.2
    //     },
    //     "source-layer": "place_label"
    //   },
    //   {
    //     "interactive": true,
    //     "layout": {
    //       "text-font": [
    //         "Open Sans Regular",
    //         "Arial Unicode MS Regular"
    //       ],
    //       "text-field": "{name_en}",
    //       "text-max-width": 8,
    //       "text-size": {
    //         "base": 1.2,
    //         "stops": [
    //           [
    //             10,
    //             12
    //           ],
    //           [
    //             15,
    //             22
    //           ]
    //         ]
    //       }
    //     },
    //     "metadata": {
    //       "mapbox:group": "1444849272561.29"
    //     },
    //     "filter": [
    //       "==",
    //       "type",
    //       "village"
    //     ],
    //     "type": "symbol",
    //     "source": "mapbox",
    //     "id": "place_label_village",
    //     "paint": {
    //       "text-color": "#333",
    //       "text-halo-color": "rgba(255,255,255,0.8)",
    //       "text-halo-width": 1.2
    //     },
    //     "source-layer": "place_label"
    //   },
    //   {
    //     "interactive": true,
    //     "layout": {
    //       "text-font": [
    //         "Open Sans Regular",
    //         "Arial Unicode MS Regular"
    //       ],
    //       "text-field": "{name_en}",
    //       "text-max-width": 8,
    //       "text-size": {
    //         "base": 1.2,
    //         "stops": [
    //           [
    //             10,
    //             14
    //           ],
    //           [
    //             15,
    //             24
    //           ]
    //         ]
    //       }
    //     },
    //     "metadata": {
    //       "mapbox:group": "1444849272561.29"
    //     },
    //     "filter": [
    //       "==",
    //       "type",
    //       "town"
    //     ],
    //     "type": "symbol",
    //     "source": "mapbox",
    //     "id": "place_label_town",
    //     "paint": {
    //       "text-color": "#333",
    //       "text-halo-color": "rgba(255,255,255,0.8)",
    //       "text-halo-width": 1.2
    //     },
    //     "source-layer": "place_label"
    //   },
    //   {
    //     "interactive": true,
    //     "layout": {
    //       "text-font": [
    //         "Open Sans Semibold",
    //         "Arial Unicode MS Bold"
    //       ],
    //       "text-field": "{name_en}",
    //       "text-max-width": 8,
    //       "text-size": {
    //         "base": 1.2,
    //         "stops": [
    //           [
    //             7,
    //             14
    //           ],
    //           [
    //             11,
    //             24
    //           ]
    //         ]
    //       }
    //     },
    //     "metadata": {
    //       "mapbox:group": "1444849272561.29"
    //     },
    //     "filter": [
    //       "==",
    //       "type",
    //       "city"
    //     ],
    //     "type": "symbol",
    //     "source": "mapbox",
    //     "id": "place_label_city",
    //     "paint": {
    //       "text-color": "#333",
    //       "text-halo-color": "rgba(255,255,255,0.8)",
    //       "text-halo-width": 1.2
    //     },
    //     "source-layer": "place_label"
    //   }

  ],
  "created": 0,
  "modified": 0,
  "owner": "mapbox",
  "id": "bright-v9",
  "draft": false,
  "visibility": "public"
};

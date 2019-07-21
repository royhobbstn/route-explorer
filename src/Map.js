import React, { Component } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { key } from './mapbox_api_key.js';
import { style } from './style.js';


class Map extends Component {

  componentDidMount() {

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


    });

  }



  shouldComponentUpdate(nextProps, nextState) {

  }

  render() {
    console.log('render')
    return <div id="map" />;
  }
}


export default Map;

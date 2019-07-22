import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Map from './Map/Map.js';

function App() {

  useEffect(() => {

    // download FAF dataset

  }, []);

  return (
    <div>
      <Map />
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));

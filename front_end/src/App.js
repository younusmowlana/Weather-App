import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring';
import './App.css';
import WeatherMap from './components/WeatherMap';

function App() {
  const [showMap, setShowMap] = useState(false);

  const toggleScroll = (e) => {
    if (e.deltaY > 0) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  };

  const headerProps = useSpring({
    to: {
      opacity: showMap ? 0 : 1,
      transform: showMap ? 'translateY(-100%)' : 'translateY(0%)'
    },
    from: {
      opacity: 1,
      transform: 'translateY(0%)'
    },
    config: { duration: 100 } // Animation duration set to 500 milliseconds (.5 seconds)
  });

  const mapProps = useSpring({
    to: {
      opacity: showMap ? 1 : 0,
      transform: showMap ? 'translateY(0%)' : 'translateY(100%)'
    },
    from: {
      opacity: 0,
      transform: 'translateY(100%)'
    },
    config: { duration: 0 } // Animation duration set to 500 milliseconds (.5 seconds)
  });

  return (
    <div className="App" onWheel={toggleScroll}>
      <animated.div style={headerProps} className="App-header">
        <h1>Weather Lense</h1>
        <h2>Explore Weather Patterns</h2>
        <p>Scroll down to view the map</p>
      </animated.div>
      <animated.div style={mapProps} className="Map-content">
        {showMap && <WeatherMap />}
      </animated.div>
    </div>
  );
}

export default App;

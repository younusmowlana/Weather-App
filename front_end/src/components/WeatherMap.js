import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import districtBordersGeoJSON from '../geo_json/metadata-geoboundaries-lka-adm2-geojson.json';
import fetchWeatherData from '../services/fetchWeatherData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSun, faMoon, faStreetView, faMap, faSatellite, faSatelliteDish } from '@fortawesome/free-solid-svg-icons';

const WeatherMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null); // This ref stores the Mapbox map instance
  const navigationControlRef = useRef(null); 
  


  // Define map styles for the dropdown
  const mapStyles = [
    { label: "Standard", value: "mapbox://styles/mapbox/standard", icon: faMap },
    { label: "Streets", value: "mapbox://styles/mapbox/streets-v12", icon: faStreetView },
    { label: "Light", value: "mapbox://styles/mapbox/light-v11", icon: faSun },
    { label: "Dark", value: "mapbox://styles/mapbox/dark-v11", icon: faMoon },
    { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v9", icon: faSatellite },
    { label: "Satellite Streets", value: "mapbox://styles/mapbox/satellite-streets-v12", icon: faSatelliteDish },
    { label: "Navigation Day", value: "mapbox://styles/mapbox/navigation-day-v1", icon: faSun },
    { label: "Navigation Night", value: "mapbox://styles/mapbox/navigation-night-v1", icon: faMoon },
  ];

  // Initialize selectedStyle state correctly after mapStyles definition
  const [selectedStyle, setSelectedStyle] = useState(mapStyles[0]);
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbmV0aCIsImEiOiJjbHU0cXNyajYwbG9vMmtuNHZwc2d1eTdlIn0.N2xuF8UMOIYBuLiRVxqbpA';

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [80.7718, 7.8731],
        zoom: 8,
        pitch: 45,
      });

      map.current.on('load', async () => {
        const data = await fetchWeatherData();
        console.log("fetched-data->",data);
        setWeatherData(data); // Update state with fetched weather data
        
        // Your existing map setup (sources, layers, controls)
        map.current.addSource('district-borders', {
          type: 'geojson',
          data: districtBordersGeoJSON,
        });

        map.current.addLayer({
          id: 'district-borders-layer',
          type: 'line',
          source: 'district-borders',
          layout: {},
          paint: {
            'line-color': '#000000',
            'line-width': 2,
          },
        });
      });

      // Check if a navigation control already exists
      if (navigationControlRef.current) {
        map.current.removeControl(navigationControlRef.current); // Remove the existing control
      }
      
      // Add a new navigation control
      const newNavigationControl = new mapboxgl.NavigationControl();
      map.current.addControl(newNavigationControl);
      navigationControlRef.current = newNavigationControl; 
    }

    // Setup interval to fetch weather data periodically
    const intervalId = setInterval(async () => {
      const data = await fetchWeatherData();
      setWeatherData(data);
    }, 60000); // every 60 seconds

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to change map style
  const handleChangeStyle = (styleUrl) => {
    if (map.current) {
      const style = mapStyles.find(style => style.value === styleUrl);
      setSelectedStyle(style); // Update the selected style state
      map.current.setStyle(styleUrl);
    }
  };


  

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    document.querySelectorAll('.weather-marker').forEach(marker => marker.remove());

    weatherData.forEach(data => {
      const el = document.createElement('div');
      el.className = 'weather-marker';
      el.innerHTML = `
        <div class="marker-content">
          <strong style="font-size: 16px; display: block; margin-bottom: 4px;">${data.district}</strong>
          <div class="weather-details">
            <i class="fas fa-thermometer-half" style="margin-right: 4px;"></i> Temp: ${data.temperature}<br>
            <i class="fas fa-tint" style="margin-right: 4px;"></i> Humidity: ${data.humidity}<br>
            <i class="fas fa-wind" style="margin-right: 4px;"></i> Air Pressure: ${data.airPressure}
          </div>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([data.longitude, data.latitude])
        .addTo(map.current);
    });
  }, [weatherData]);

   return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      <FontAwesomeIcon icon={selectedStyle.icon} style={{ position: 'absolute', top: 10, right: 110, zIndex: 1 }} />
      <select
        onChange={(e) => handleChangeStyle(e.target.value)}
        value={selectedStyle.value} // Corrected to use .value
        style={{ position: 'absolute', top: 10, right: 50, zIndex: 1 }}
      >
        {mapStyles.map((style) => (
          <option value={style.value} key={style.label}>
            {style.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WeatherMap;

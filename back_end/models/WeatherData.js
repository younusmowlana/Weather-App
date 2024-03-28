const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  district: String,
  latitude: Number,
  longitude: Number,
  temperature: String,
  humidity: String,
  airPressure: String,
  timestamp: { type: Date, default: Date.now } // To track when the data was recorded
});

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

module.exports = WeatherData;

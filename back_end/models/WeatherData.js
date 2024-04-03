const mongoose = require("mongoose");

const weatherDataSchema = new mongoose.Schema({
  district: String,
  latitude: Number,
  longitude: Number,
  temperature: String,
  humidity: String,
  airPressure: String,
  timestamp: { type: Date, default: Date.now }, 
});

const WeatherData = mongoose.model("WeatherData", weatherDataSchema);

module.exports = WeatherData;

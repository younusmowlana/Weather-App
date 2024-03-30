const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Replace './models/WeatherData' with the actual path to your model
const WeatherData = require('./models/WeatherData');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Middleware for API Key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('x-api-key');

  const validApiKeys = ['7867632hjjhghj23hghkjh2j3hk2h3kjh2kj3h'];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).send('Unauthorized: Missing or invalid API key');
  }

  next();
};

mongoose.connect('mongodb+srv://younus:dCP1SUixMmQjaq13@cluster0.7fs8z.mongodb.net/weatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

.then(() => console.log('Connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...', err));

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'API for fetching weather data from MongoDB',
    },
    servers: [{
      url: 'http://localhost:3001',
      description: 'Development server',
    }],
  },
  apis: ['./server.js', './models/*.js'], // Make sure this path points to your API documentation
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic route for API status
app.get('/', (req, res) => {
  res.send('Weather API is running...');
});

/**
 * @swagger
 * components:
 *   schemas:
 *     WeatherData:
 *       type: object
 *       required:
 *         - district
 *         - latitude
 *         - longitude
 *         - temperature
 *         - humidity
 *         - airPressure
 *       properties:
 *         district:
 *           type: string
 *           description: The district name
 *         latitude:
 *           type: number
 *           format: double
 *           description: Latitude value for the district
 *         longitude:
 *           type: number
 *           format: double
 *           description: Longitude value for the district
 *         temperature:
 *           type: string
 *           description: Temperature in the district, in degrees Celsius
 *         humidity:
 *           type: string
 *           description: Humidity percentage in the district
 *         airPressure:
 *           type: string
 *           description: Air pressure value in the district, in hPa
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the data was recorded, in ISO 8601 format
 */


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:  # Name of the security scheme
 *       type: apiKey
 *       in: header
 *       name: x-api-key  # Name of the header to be used
 */


app.get('/api/weather', validateApiKey, async (req, res) => {
  try {
    const latestWeatherData = await WeatherData
      .find()
      .sort({ timestamp: -1 })
      .limit(25);
    res.json(latestWeatherData);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    res.status(500).send("Failed to fetch weather data.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
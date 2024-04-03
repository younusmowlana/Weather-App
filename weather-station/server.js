const { MongoClient } = require("mongodb");
const readline = require("readline");
const { setTimeout } = require("timers/promises");

// MongoDB connection details
const MONGO_URI =
  "mongodb+srv://younus:dCP1SUixMmQjaq13@cluster0.7fs8z.mongodb.net/";
const DB_NAME = "weatherDB";
const COLLECTION_NAME = "weatherdatas";
const BACKUP_COLLECTION_NAME = "backupweatherdatas";

// Districts' coordinates
const DISTRICTS = {
  Ampara: { latitude: 7.3066, longitude: 81.6256 },
  Anuradhapura: { latitude: 8.3114, longitude: 80.4037 },
  Badulla: { latitude: 6.9934, longitude: 81.055 },
  Batticaloa: { latitude: 7.7172, longitude: 81.6996 },
  Colombo: { latitude: 6.9271, longitude: 79.8612 },
  Galle: { latitude: 6.0535, longitude: 80.2209 },
  Gampaha: { latitude: 7.084, longitude: 80.0098 },
  Hambantota: { latitude: 6.1244, longitude: 81.1185 },
  Jaffna: { latitude: 9.6615, longitude: 80.0255 },
  Kalutara: { latitude: 6.5854, longitude: 79.9607 },
  Kandy: { latitude: 7.2906, longitude: 80.6337 },
  Kegalle: { latitude: 7.2514, longitude: 80.3464 },
  Kilinochchi: { latitude: 9.3996, longitude: 80.399 },
  Kurunegala: { latitude: 7.4847, longitude: 80.0451 },
  Mannar: { latitude: 8.9772, longitude: 79.9024 },
  Matale: { latitude: 7.4685, longitude: 80.6247 },
  Matara: { latitude: 5.9549, longitude: 80.5562 },
  Moneragala: { latitude: 6.8806, longitude: 81.349 },
  Mullaitivu: { latitude: 9.2678, longitude: 80.8123 },
  "Nuwara Eliya": { latitude: 6.9729, longitude: 80.7822 },
  Polonnaruwa: { latitude: 7.9403, longitude: 81.0188 },
  Puttalam: { latitude: 8.0376, longitude: 79.8283 },
  Ratnapura: { latitude: 6.705, longitude: 80.384 },
  Trincomalee: { latitude: 8.5872, longitude: 81.2152 },
  Vavuniya: { latitude: 8.7516, longitude: 80.4984 },
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask question via readline
const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

// Insert weather data into MongoDB
async function insertWeatherData(
  district,
  latitude,
  longitude,
  temperature,
  humidity,
  airPressure
) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const backup_collection = db.collection(BACKUP_COLLECTION_NAME);
    const document = {
      district,
      latitude,
      longitude,
      temperature,
      humidity,
      airPressure,
      timestamp: new Date(),
    };
    await collection.insertOne(document);
    await backup_collection.insertOne(document);
    console.log(`Inserted data for ${district}`);
  } finally {
    await client.close();
  }
}

// Function to generate and insert demo data
async function generateDemoData() {
  console.log("Generating demo data for all districts...");
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    await collection.deleteMany({});

    for (const [district, info] of Object.entries(DISTRICTS)) {
      const temperature = `${Math.floor(Math.random() * (35 - 20 + 1)) + 20}°C`;
      const humidity = `${Math.floor(Math.random() * (100 - 60 + 1)) + 60}%`;
      const airPressure = `${
        Math.floor(Math.random() * (1020 - 1000 + 1)) + 1000
      } hPa`;
      await insertWeatherData(
        district,
        info.latitude,
        info.longitude,
        temperature,
        humidity,
        airPressure
      );
    }
    console.log(
      "Data generation complete. Waiting for 5 minutes until the next update..."
    );
    await setTimeout(300000); // Wait for 5 minutes
  } finally {
    await client.close();
    generateDemoData(); // Repeat the process
  }
}

// Manual data entry function
async function manualDataEntry() {
  const district = await ask("Enter district name: ");
  if (!(district in DISTRICTS)) {
    console.log("District not found.");
    process.exit();
  }
  const info = DISTRICTS[district];
  const temperature = await ask("Enter temperature (e.g., 30°C): ");
  const humidity = await ask("Enter humidity (e.g., 80%): ");
  const airPressure = await ask("Enter air pressure (e.g., 1010 hPa): ");
  await insertWeatherData(
    district,
    info.latitude,
    info.longitude,
    temperature,
    humidity,
    airPressure
  );
  rl.close();
}

async function main() {
  console.log("Starting application...");
  const mode = await ask("Select mode (demo/station): ");
  if (mode === "demo") {
    generateDemoData();
  } else if (mode === "station") {
    await manualDataEntry();
  } else {
    console.log("Invalid mode selected.");
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit();
});

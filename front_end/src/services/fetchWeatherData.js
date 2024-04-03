const fetchWeatherData = async () => {
  const endpoint = "https://weather-app-krgy.onrender.com/api/weather";
  const apiKey = "7867632hjjhghj23hghkjh2j3hk2h3kjh2kj3h";

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return [];
  }
};

export default fetchWeatherData;

// ===== 1. Elements =====
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const detailsEl = document.getElementById("details");
const iconEl = document.getElementById("icon");

// ===== 2. API =====
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search?name=";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// ===== 3. Events =====
searchBtn.addEventListener("click", handleSearch);

searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    handleSearch();
  }
});

// ===== 4. Load last city =====
const savedCity = localStorage.getItem("lastCity");
if (savedCity) {
  searchInput.value = savedCity;
  handleSearch();
}

// ===== 5. Main =====
async function handleSearch() {
  const city = searchInput.value.trim();

  if (!city) {
    showError("Please enter a city");
    return;
  }

  showLoading();

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(location.latitude, location.longitude);

    displayWeather(location, weather);

    // save city
    localStorage.setItem("lastCity", city);

  } catch (error) {
    showError(error.message);
  }
}

// ===== 6. Coordinates =====
async function getCoordinates(city) {
  const response = await fetch(GEO_URL + city);
  const data = await response.json();

  if (!data.results) {
    throw new Error("City not found");
  }

  return data.results[0];
}

// ===== 7. Weather =====
async function getWeather(lat, lon) {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,windspeed_10m,weathercode`;

  const response = await fetch(url);
  const data = await response.json();

  return data.current; // ✅ FIXED
}

// ===== 8. Display =====
function displayWeather(location, weather) {
  cityEl.textContent = "City: " + location.name;
  tempEl.textContent = "Temperature: " + weather.temperature_2m + "°C";

  const conditionText = getWeatherCondition(weather.weathercode);
  conditionEl.textContent = "Condition: " + conditionText;

  // time
  const now = new Date();

  detailsEl.textContent =
    "Wind: " + weather.windspeed_10m +
    " km/h | Feels like: " + weather.apparent_temperature +
    "°C | Time: " + now.toLocaleTimeString();

  iconEl.src = getWeatherIcon(weather.weathercode);

  // change background
  changeBackground(weather.weathercode);
}

// ===== 9. Condition =====
function getWeatherCondition(code) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  return "Unknown";
}

// ===== 10. Icon =====
function getWeatherIcon(code) {
  if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png";
  if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
  if (code <= 48) return "https://cdn-icons-png.flaticon.com/512/4005/4005901.png";
  if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/3351/3351979.png";
  if (code <= 77) return "https://cdn-icons-png.flaticon.com/512/642/642102.png";
  return "";
}

// ===== 11. Background =====
function changeBackground(code) {
  const body = document.body;

  if (code === 0) {
    body.style.background = "linear-gradient(135deg, #fceabb, #f8b500)";
  } else if (code <= 3) {
    body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
  } else if (code <= 67) {
    body.style.background = "linear-gradient(135deg, #4b79a1, #283e51)";
  } else if (code <= 77) {
    body.style.background = "linear-gradient(135deg, #e6dada, #274046)";
  }
}

// ===== 12. UI =====
function showLoading() {
  detailsEl.textContent = "Loading...";
}

function showError(message) {
  cityEl.textContent = "Error";
  tempEl.textContent = "--";
  conditionEl.textContent = message;
  detailsEl.textContent = "";
  iconEl.src = "";
}

// focus input
searchInput.focus();
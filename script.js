const input = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
let lat = null;
let lon = null;

input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (query.length < 2) {
        suggestions.style.display = "none";
        return;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=15`, {
            headers: {
                "User-Agent": "YourAppName/1.0 (your-email@example.com)" // required by Nominatim usage policy
            }
        });

        if (!response.ok) throw new Error("Network error: " + response.status);

        const data = await response.json();
        suggestions.innerHTML = "";

        if (data.length > 0) {
            // If user never clicks a suggestion, take the first one
            lat = data[0].lat;
            lon = data[0].lon;
            console.log("Default selected (first match):", {
                lat,
                lon,
                name: data[0].display_name
            });

            data.forEach(place => {
                const li = document.createElement("li");
                li.textContent = place.display_name;
                li.addEventListener("click", () => {
                    input.value = place.display_name;
                    lat = place.lat;
                    lon = place.lon;
                    console.log("User selected:", {
                        lat,
                        lon,
                        name: place.display_name
                    });
                    suggestions.style.display = "none";
                });
                suggestions.appendChild(li);
            });

            suggestions.style.display = "block";
        } else {
            suggestions.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching cities:", error);
    }
});

document.addEventListener("click", (e) => {
    if (e.target !== input) {
        suggestions.style.display = "none";
    }
});



async function loadCountries() {
    try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries");
        if (!response.ok) throw new Error("Network error: " + response.status);

        const data = await response.json();

        if (!data.data) throw new Error("Invalid API response");

        const countryList = document.getElementById("country-list");
        countryList.innerHTML = ""; // clear previous items

        data.data.forEach(country => {
            const li = document.createElement("li");
            li.textContent = country.country;
            li.dataset.value = country.country; // store value for selection
            li.classList.add("country-item");
            countryList.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to load countries:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadCountries);


//Wheater Api
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();

        console.log(data); // debug

        // === Update current weather ===
        const current = data.current_weather;
        document.querySelector(".temp").textContent = `${current.temperature}°`;
        document.querySelector(".stat strong").textContent = `${Math.round(current.windspeed)} km/h`;
        document.querySelector(".condition p").textContent = mapWeatherCode(current.weathercode);

        // optional: pick an icon based on weathercode
        const icon = document.querySelector(".condition img");
        icon.src = getWeatherIcon(current.weathercode);

        // === Update forecast ===
        const daysEl = document.querySelector(".forecast .days");
        daysEl.innerHTML = ""; // clear placeholder

        data.daily.time.forEach((day, i) => {
            const max = data.daily.temperature_2m_max[i];
            const min = data.daily.temperature_2m_min[i];
            const wcode = data.daily.weathercode[i];

            const div = document.createElement("div");
            div.className = "day";

            const date = new Date(day);
            const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

            div.innerHTML = `
            <span>${weekday}</span>
          <img src="${getWeatherIcon(wcode)}" alt="icon" width="40">
          <strong>${max}°</strong> ${min}°
        `;

            daysEl.appendChild(div);
        });

    } catch (err) {
        console.error("Failed to fetch weather:", err);
    }
}

// === Helper: Map weather codes to text ===
function mapWeatherCode(code) {
    const codes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Cloudy",
        45: "Fog",
        48: "Rime fog",
        51: "Light drizzle",
        61: "Rain",
        71: "Snow",
        80: "Showers",
        95: "Thunderstorm"
    };
    return codes[code] || "Unknown";
}

// === Helper: Weather icons ===
function getWeatherIcon(code) {
    if (code === 0) return "https://img.icons8.com/fluency/48/sun.png";
    if ([1, 2].includes(code)) return "https://img.icons8.com/fluency/48/partly-cloudy-day.png";
    if (code === 3) return "https://img.icons8.com/fluency/48/cloud.png";
    if ([61, 63, 65, 80].includes(code)) return "https://img.icons8.com/fluency/48/rain.png";
    if ([71, 73, 75].includes(code)) return "https://img.icons8.com/fluency/48/snow.png";
    if ([95, 96, 99].includes(code)) return "https://img.icons8.com/fluency/48/storm.png";
    return "https://img.icons8.com/fluency/48/cloud.png";
}

// === Run when page loads ===
// Example: Bengaluru (12.97, 77.59)
document.addEventListener("DOMContentLoaded", () => {
    fetchWeather(12.97, 77.59);
});
  

//City name 
async function getCityName(lat, lon) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    const res = await fetch(url);
    const data = await res.json();

    return data.city || data.locality || data.principalSubdivision || "Unknown";
}

// Example usage
getCityName(3, 77.59).then(city => {
    console.log("City:", city); // Bengaluru
    document.querySelector(".header h2").textContent = city;
});
const menuOverlay = document.getElementById("menuOverlay");
const formOverlay = document.getElementById("formOverlay");

// Show menu
function showMenu() {
    menuOverlay.style.display = "flex";
}
// Close menu
function closeMenu() {
    menuOverlay.style.display = "none";
}

// Show form when clicking + button
document.querySelector(".plus").addEventListener("click", () => {
    formOverlay.style.display = "flex";
});

// Close overlays when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === menuOverlay) {
        closeMenu();
    }
    if (e.target === formOverlay) {
        formOverlay.style.display = "none";
    }
});

// Handle form submit
document.getElementById("add-location-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("city-input").value;
    const country = document.getElementById("country-input").value;

    console.log("Adding location:", city, country);
    formOverlay.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("country-dropdown");
    const selected = dropdown.querySelector(".dropdown-selected");
    const list = dropdown.querySelector(".dropdown-list");
    const hiddenInput = dropdown.querySelector("input");

    // Toggle list visibility
    selected.addEventListener("click", () => {
        list.style.display = list.style.display === "block" ? "none" : "block";
    });

    // Pick a value
    list.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            selected.textContent = item.textContent;
            hiddenInput.value = item.dataset.value;
            list.style.display = "none";
        });
    });

    // Close if click outside
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            list.style.display = "none";
        }
    });
});
  
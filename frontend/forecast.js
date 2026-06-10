document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE = "https://weather-forecast-xqwe.onrender.com";

    // ================= MAP =================
    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let markers = [];

    try {

        // ================= LOAD DATA =================
        const forecastRes = await fetch(`${API_BASE}/api/forecast`);
        const locationsRes = await fetch(`${API_BASE}/api/locations`);

        const forecast = await forecastRes.json();
        const locations = await locationsRes.json();

        // ================= DROPDOWNS =================
        const stateSelect = document.getElementById("stateSelect");
        const districtSelect = document.getElementById("districtSelect");
        const dateSelect = document.getElementById("dateSelect");
        const timeSelect = document.getElementById("timeSelect");

        // ================= STATES =================
        const states = [...new Set(locations.map(l => l.State))];

        stateSelect.innerHTML = `<option value="">Select State</option>`;

        states.forEach(state => {
            const opt = document.createElement("option");
            opt.value = state;
            opt.textContent = state;
            stateSelect.appendChild(opt);
        });

        // ================= STATE → DISTRICT =================
        stateSelect.addEventListener("change", function () {

            districtSelect.innerHTML = `<option value="">Select District</option>`;

            const filtered = locations.filter(l => l.State === this.value);

            const districts = [...new Set(filtered.map(d => d.District))];

            districts.forEach(d => {
                const opt = document.createElement("option");
                opt.value = d;
                opt.textContent = d;
                districtSelect.appendChild(opt);
            });

            drawMap();
        });

        districtSelect.addEventListener("change", drawMap);

        // ================= DATES =================
        const uniqueDates = [...new Set(
            forecast.map(f => f.forecast_time.split(" ")[0])
        )];

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {
            const opt = document.createElement("option");
            opt.value = date;
            opt.textContent = date;
            dateSelect.appendChild(opt);
        });

        // ================= TIMES =================
        function loadTimes(date) {

            timeSelect.innerHTML = "";

            const times = [...new Set(
                forecast
                    .filter(f => f.forecast_time.startsWith(date))
                    .map(f => f.forecast_time.split(" ")[1])
            )];

            times.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t;
                opt.textContent = t;
                timeSelect.appendChild(opt);
            });
        }

        // ================= MAP DRAW =================
        function drawMap() {

            markers.forEach(m => map.removeLayer(m));
            markers = [];

            const state = stateSelect.value;
            const district = districtSelect.value;
            const date = dateSelect.value;
            const time = timeSelect.value;

            if (!date || !time) return;

            const targetTime = `${date} ${time}`;

            const weatherMap = {};

            forecast
                .filter(f => f.forecast_time === targetTime)
                .forEach(f => {
                    weatherMap[f.district.trim().toLowerCase()] = f;
                });

            locations.forEach(loc => {

                if (state && loc.State !== state) return;
                if (district && loc.District !== district) return;

                const weather = weatherMap[loc.District.trim().toLowerCase()];

                if (!weather) return;

                const marker = L.marker([
                    loc.Latitude,
                    loc.Longitude
                ])
                .addTo(map)
                .bindPopup(`
                    <b>${loc.District}</b><br>
                    State: ${loc.State}<br>
                    Temp: ${weather.temperature}°C<br>
                    Humidity: ${weather.humidity}%<br>
                    Weather: ${weather.weather}<br>
                    Time: ${weather.forecast_time}
                `);

                markers.push(marker);
            });
        }

        // ================= INIT =================
        loadTimes(uniqueDates[0]);

        setTimeout(drawMap, 300);

        dateSelect.addEventListener("change", function () {
            loadTimes(this.value);
            setTimeout(drawMap, 100);
        });

        timeSelect.addEventListener("change", drawMap);

    }

    catch (error) {
        console.error("Error:", error);
    }

});

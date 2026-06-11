document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE = "https://weather-forecast-xqwe.onrender.com";

    // ================= MAP =================
    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let markers = [];

    try {

        // ================= FETCH DATA =================
        const forecastRes = await fetch(`${API_BASE}/api/forecast`);
        const locationsRes = await fetch(`${API_BASE}/api/locations`);

        const forecast = await forecastRes.json();
        const locations = await locationsRes.json();

        // ================= ELEMENTS =================
        const stateSelect = document.getElementById("stateSelect");
        const districtSelect = document.getElementById("districtSelect");
        const dateSelect = document.getElementById("dateSelect");
        const timeSelect = document.getElementById("timeSelect");

        // ================= STATES =================
        const states = [...new Set(locations.map(l => l.State || l.state))];

        stateSelect.innerHTML = `<option value="">All States</option>`;

        states.forEach(state => {
            const opt = document.createElement("option");
            opt.value = state;
            opt.textContent = state;
            stateSelect.appendChild(opt);
        });

        // ================= DISTRICTS =================
        stateSelect.addEventListener("change", function () {

            districtSelect.innerHTML = `<option value="">All Districts</option>`;

            const filtered = locations.filter(l =>
                (l.State || l.state) === this.value
            );

            const districts = [...new Set(filtered.map(d => d.District || d.district))];

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
                    weatherMap[(f.district || f.District).trim().toLowerCase()] = f;
                });

            locations.forEach(loc => {

                const locState = loc.State || loc.state;
                const locDistrict = loc.District || loc.district;

                if (state && locState !== state) return;
                if (district && locDistrict !== district) return;

                const weather = weatherMap[locDistrict.trim().toLowerCase()];

                if (!weather) return;

                const marker = L.marker([
                    loc.Latitude,
                    loc.Longitude
                ])
                .addTo(map)
                .bindPopup(`
                    <b>${locDistrict}</b><br>
                    State: ${locState}<br>
                    Temp: ${weather.temperature} °C<br>
                    Humidity: ${weather.humidity}%<br>
                    Weather: ${weather.weather}<br>
                    Time: ${weather.forecast_time}
                `);

                markers.push(marker);
            });
        }

        // ================= CSV DOWNLOAD =================
        document.getElementById("downloadCSV").addEventListener("click", function () {

            const state = stateSelect.value;
            const district = districtSelect.value;
            const date = dateSelect.value;
            const time = timeSelect.value;

            if (!date || !time) {
                alert("Please select date and time first");
                return;
            }

            const targetTime = `${date} ${time}`;

            let filtered = forecast.filter(f =>
                f.forecast_time === targetTime
            );

            if (state) {
                filtered = filtered.filter(f =>
                    (f.state || f.State) === state
                );
            }

            if (district) {
                filtered = filtered.filter(f =>
                    (f.district || f.District) === district
                );
            }

            if (filtered.length === 0) {
                alert("No data found for selected filters");
                return;
            }

            let csv = "State,District,Temperature,Humidity,Weather,Description,Forecast_Time\n";

            filtered.forEach(f => {
                csv += `${f.state || f.State},${f.district || f.District},${f.temperature},${f.humidity},${f.weather},${f.description || ""},${f.forecast_time}\n`;
            });

            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `weather_filtered_${date}_${time}.csv`;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        });

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
        console.error("Forecast Error:", error);
    }

});

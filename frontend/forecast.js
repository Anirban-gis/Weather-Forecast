document.addEventListener("DOMContentLoaded", async function () {

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let chart;

    try {

        // ================= API =================
        const response =
            await fetch("https://weather-forecast-xqwe.onrender.com/api/forecast");

        const forecast =
            await response.json();

        // ================= DROPDOWNS =================
        const dateSelect = document.getElementById("dateSelect");
        const timeSelect = document.getElementById("timeSelect");

        // ================= UNIQUE DATES =================
        const uniqueDates = [...new Set(
            forecast.map(i => i.forecast_time.split(" ")[0])
        )];

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {
            const opt = document.createElement("option");
            opt.value = date;
            opt.textContent = date;
            dateSelect.appendChild(opt);
        });

        // ================= LOAD TIMES =================
        function loadTimes(date) {

            timeSelect.innerHTML = "";

            const times = [...new Set(
                forecast
                    .filter(i => i.forecast_time.startsWith(date))
                    .map(i => i.forecast_time.split(" ")[1])
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

            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            const selectedDate = dateSelect.value;
            const selectedTime = timeSelect.value;

            const filtered = forecast.filter(item =>
                item.forecast_time === `${selectedDate} ${selectedTime}`
            );

            filtered.forEach(item => {

                // IMPORTANT: fake coordinates fallback (since forecast has no lat/lon)
                const lat = 22.9734 + (Math.random() * 5);
                const lon = 78.6569 + (Math.random() * 5);

                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(`
                        <b>${item.district}</b><br>
                        State: ${item.state}<br>
                        Temp: ${item.temperature} °C<br>
                        Humidity: ${item.humidity}%<br>
                        Weather: ${item.weather}<br>
                        Time: ${item.forecast_time}
                    `);
            });
        }

        // ================= INIT =================
        loadTimes(uniqueDates[0]);
        drawMap();

        dateSelect.addEventListener("change", function () {
            loadTimes(this.value);
            drawMap();
        });

        timeSelect.addEventListener("change", drawMap);

    }

    catch (err) {
        console.error("Forecast Error:", err);
    }

});

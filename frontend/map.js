document.addEventListener("DOMContentLoaded", async function () {

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let markers = [];

    try {

        // ================= APIs =================
        const locationsRes =
            await fetch("https://weather-forecast-xqwe.onrender.com/api/locations");

        const forecastRes =
            await fetch("https://weather-forecast-xqwe.onrender.com/api/forecast");

        const locations = await locationsRes.json();
        const forecast = await forecastRes.json();

        const dateSelect = document.getElementById("dateSelect");
        const timeSelect = document.getElementById("timeSelect");

        // ================= UNIQUE DATES =================
        const uniqueDates = [...new Set(
            forecast.map(item => item.forecast_time.split(" ")[0])
        )];

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {
            const option = document.createElement("option");
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        });

        // ================= LOAD TIMES =================
        function loadTimes(date) {

            timeSelect.innerHTML = "";

            const times = [...new Set(
                forecast
                    .filter(item => item.forecast_time.startsWith(date))
                    .map(item => item.forecast_time.split(" ")[1])
            )];

            times.forEach(time => {
                const option = document.createElement("option");
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });
        }

        // ================= DRAW MAP =================
        function drawMap() {

            // remove old markers safely
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            const selectedDate = dateSelect.value;
            const selectedTime = timeSelect.value;

            if (!selectedDate || !selectedTime) return;

            const targetTime = `${selectedDate} ${selectedTime}`;

            // build lookup map
            const weatherMap = {};

            forecast
                .filter(item => item.forecast_time === targetTime)
                .forEach(item => {
                    weatherMap[item.district.trim().toLowerCase()] = item;
                });

            locations.forEach(loc => {

                const key = loc.District.trim().toLowerCase();
                const weather = weatherMap[key];

                if (!weather) return;

                const marker = L.marker([
                    loc.Latitude,
                    loc.Longitude
                ])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width:220px">
                        <h4>${loc.District}</h4>
                        <b>State:</b> ${loc.State}<br>
                        <b>Temperature:</b> ${weather.temperature} °C<br>
                        <b>Humidity:</b> ${weather.humidity}%<br>
                        <b>Weather:</b> ${weather.weather}<br>
                        <b>Description:</b> ${weather.description}<br>
                        <b>Time:</b> ${weather.forecast_time}
                    </div>
                `);

                markers.push(marker);

            });

        }

        // ================= INIT =================
        if (uniqueDates.length > 0) {
            loadTimes(uniqueDates[0]);

            setTimeout(() => {
                drawMap();
            }, 200);
        }

        dateSelect.addEventListener("change", function () {
            loadTimes(this.value);
            setTimeout(drawMap, 100);
        });

        timeSelect.addEventListener("change", drawMap);

    }

    catch (error) {
        console.error("Map Error:", error);
    }

});

document.addEventListener("DOMContentLoaded", async function () {

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(map);

    let markers = [];

    try {

        // Load locations and forecast data
        const locationsResponse =
            await fetch("https://weather-forecast-xqwe.onrender.com");

        const forecastResponse =
            await fetch("https://weather-forecast-xqwe.onrender.com");

        const locations =
            await locationsResponse.json();

        const forecast =
            await forecastResponse.json();

        const dateSelect =
            document.getElementById("dateSelect");

        const timeSelect =
            document.getElementById("timeSelect");

        // =====================================
        // LOAD UNIQUE DATES
        // =====================================

        const uniqueDates = [
            ...new Set(
                forecast.map(
                    item =>
                    item.forecast_time.split(" ")[0]
                )
            )
        ];

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {

            const option =
                document.createElement("option");

            option.value = date;
            option.textContent = date;

            dateSelect.appendChild(option);

        });

        // =====================================
        // LOAD TIMES FOR SELECTED DATE
        // =====================================

        function loadTimes(selectedDate) {

            timeSelect.innerHTML = "";

            const uniqueTimes = [
                ...new Set(
                    forecast
                    .filter(item =>
                        item.forecast_time.startsWith(selectedDate)
                    )
                    .map(item =>
                        item.forecast_time.split(" ")[1]
                    )
                )
            ];

            uniqueTimes.forEach(time => {

                const option =
                    document.createElement("option");

                option.value = time;
                option.textContent = time;

                timeSelect.appendChild(option);

            });

        }

        // =====================================
        // DRAW MAP
        // =====================================

        function drawMap() {

            markers.forEach(marker =>
                map.removeLayer(marker)
            );

            markers = [];

            const selectedDate =
                dateSelect.value;

            const selectedTime =
                timeSelect.value;

            const weatherMap = {};

            forecast
                .filter(item =>
                    item.forecast_time ===
                    `${selectedDate} ${selectedTime}`
                )
                .forEach(item => {

                    weatherMap[
                        item.district.toLowerCase()
                    ] = item;

                });

            locations.forEach(loc => {

                const district =
                    loc.District.toLowerCase();

                const weather =
                    weatherMap[district];

                if (!weather) return;

                const popupHTML = `
                    <div style="min-width:220px">
                        <h4>${loc.District}</h4>
                        <b>State:</b> ${loc.State}<br>
                        <b>Temperature:</b> ${weather.temperature} °C<br>
                        <b>Humidity:</b> ${weather.humidity}%<br>
                        <b>Weather:</b> ${weather.weather}<br>
                        <b>Description:</b> ${weather.description}<br>
                        <b>Forecast:</b> ${weather.forecast_time}
                    </div>
                `;

                const marker = L.marker([
                    loc.Latitude,
                    loc.Longitude
                ])
                .addTo(map)
                .bindPopup(popupHTML);

                markers.push(marker);

            });

        }

        // =====================================
        // INITIAL LOAD
        // =====================================

        loadTimes(uniqueDates[0]);

        drawMap();

        // =====================================
        // EVENTS
        // =====================================

        dateSelect.addEventListener(
            "change",
            function () {

                loadTimes(this.value);

                drawMap();

            }
        );

        timeSelect.addEventListener(
            "change",
            drawMap
        );

    }

    catch (error) {

        console.error(
            "Map Error:",
            error
        );

    }

});

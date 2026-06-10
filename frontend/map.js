document.addEventListener("DOMContentLoaded", async function () {

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    let markers = [];

    try {

        const response =
            await fetch("https://weather-forecast-xqwe.onrender.com/api/latest");

        const forecast =
            await response.json();

        const dateSelect =
            document.getElementById("dateSelect");

        const timeSelect =
            document.getElementById("timeSelect");

        const uniqueDates = [
            ...new Set(
                forecast.map(item =>
                    item.forecast_time.split(" ")[0]
                )
            )
        ];

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {
            const option = document.createElement("option");
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        });

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
                const option = document.createElement("option");
                option.value = time;
                option.textContent = time;
                timeSelect.appendChild(option);
            });

        }

        function drawMap() {

            markers.forEach(m => map.removeLayer(m));
            markers = [];

            const selectedDate = dateSelect.value;
            const selectedTime = timeSelect.value;

            const filtered = forecast.filter(item =>
                item.forecast_time === `${selectedDate} ${selectedTime}`
            );

            filtered.forEach(item => {

                const marker = L.marker([17.9689, 79.5941])
                    .addTo(map)
                    .bindPopup(`
                        <b>${item.district}</b><br>
                        Temp: ${item.temperature} °C<br>
                        Humidity: ${item.humidity}%<br>
                        Weather: ${item.weather}<br>
                        Time: ${item.forecast_time}
                    `);

                markers.push(marker);

            });

        }

        loadTimes(uniqueDates[0]);
        drawMap();

        dateSelect.addEventListener("change", function () {
            loadTimes(this.value);
            drawMap();
        });

        timeSelect.addEventListener("change", drawMap);

    }

    catch (error) {
        console.error("Map Error:", error);
    }

});

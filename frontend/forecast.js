document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE = "https://weather-forecast-xqwe.onrender.com";

    const map = L.map("map").setView([22.9734, 78.6569], 5);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap contributors"
        }
    ).addTo(map);

    let markers = [];

    try {

        const forecastRes =
            await fetch(`${API_BASE}/api/forecast`);

        const locationsRes =
            await fetch(`${API_BASE}/api/locations`);

        const forecast =
            await forecastRes.json();

        const locations =
            await locationsRes.json();

        const stateSelect =
            document.getElementById("stateSelect");

        const districtSelect =
            document.getElementById("districtSelect");

        const dateSelect =
            document.getElementById("dateSelect");

        const timeSelect =
            document.getElementById("timeSelect");

        const downloadBtn =
            document.getElementById("downloadCSV");

        // ================= STATES =================

        const states = [
            ...new Set(
                locations.map(
                    l => l.State || l.state
                )
            )
        ];

        stateSelect.innerHTML =
            `<option value="">All States</option>`;

        states.sort().forEach(state => {

            const opt =
                document.createElement("option");

            opt.value = state;
            opt.textContent = state;

            stateSelect.appendChild(opt);

        });

        // ================= DISTRICTS =================

        function loadDistricts() {

            districtSelect.innerHTML =
                `<option value="">All Districts</option>`;

            let filteredLocations =
                locations;

            if (stateSelect.value) {

                filteredLocations =
                    locations.filter(
                        l =>
                        (l.State || l.state)
                        === stateSelect.value
                    );
            }

            const districts = [
                ...new Set(
                    filteredLocations.map(
                        d =>
                        d.District ||
                        d.district
                    )
                )
            ];

            districts.sort().forEach(d => {

                const opt =
                    document.createElement("option");

                opt.value = d;
                opt.textContent = d;

                districtSelect.appendChild(opt);

            });
        }

        loadDistricts();

        // ================= DATE =================

        const uniqueDates = [
            ...new Set(
                forecast.map(
                    f =>
                    f.forecast_time.split(" ")[0]
                )
            )
        ];

        uniqueDates.sort();

        dateSelect.innerHTML = "";

        uniqueDates.forEach(date => {

            const opt =
                document.createElement("option");

            opt.value = date;
            opt.textContent = date;

            dateSelect.appendChild(opt);

        });

        // ================= TIME =================

        function loadTimes(date) {

            timeSelect.innerHTML = "";

            const times = [
                ...new Set(
                    forecast
                    .filter(
                        f =>
                        f.forecast_time.startsWith(date)
                    )
                    .map(
                        f =>
                        f.forecast_time.split(" ")[1]
                    )
                )
            ];

            times.sort();

            times.forEach(t => {

                const opt =
                    document.createElement("option");

                opt.value = t;
                opt.textContent = t;

                timeSelect.appendChild(opt);

            });

        }

        loadTimes(uniqueDates[0]);

        // ================= POPUP CHART FUNCTION =================

function createPopupCharts(district, popupId) {

    const date = dateSelect.value;

    const filteredData =
        forecast.filter(item =>
            (item.district || item.District) === district &&
            item.forecast_time.startsWith(date)
        );

    const labels =
        filteredData.map(item =>
            item.forecast_time.split(" ")[1]
        );

    const temperatures =
        filteredData.map(item =>
            item.temperature
        );

    const humidities =
        filteredData.map(item =>
            item.humidity
        );

    const tempCanvas =
        document.getElementById(`tempChart_${popupId}`);

    const humidityCanvas =
        document.getElementById(`humidityChart_${popupId}`);

    if (!tempCanvas || !humidityCanvas) {
        return;
    }

    new Chart(tempCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temperatures,
                borderColor: "red",
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    new Chart(humidityCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Humidity (%)",
                data: humidities,
                borderColor: "blue",
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

}
```


        // ================= MAP =================

        function drawMap() {

            markers.forEach(
                m => map.removeLayer(m)
            );

            markers = [];

            const targetTime =
                `${dateSelect.value} ${timeSelect.value}`;

            const weatherMap = {};

            forecast
            .filter(
                f =>
                f.forecast_time === targetTime
            )
            .forEach(f => {

                weatherMap[
                    (f.district || f.District)
                    .trim()
                    .toLowerCase()
                ] = f;

            });

            locations.forEach(loc => {

                const state =
                    loc.State || loc.state;

                const district =
                    loc.District || loc.district;

                if (
                    stateSelect.value &&
                    state !== stateSelect.value
                ) return;

                if (
                    districtSelect.value &&
                    district !== districtSelect.value
                ) return;

                const weather =
                    weatherMap[
                        district
                        .trim()
                        .toLowerCase()
                    ];

                if (!weather) return;

                const popupId =
                    district.replace(/\s+/g, "_");

                const popupContent = `
                    <div>

                        <h3 class="popup-title">
                            ${district}
                        </h3>

                        <b>State:</b> ${state}<br>
                        <b>Temperature:</b> ${weather.temperature} °C<br>
                        <b>Humidity:</b> ${weather.humidity}%<br>
                        <b>Weather:</b> ${weather.weather}<br>
                        <b>Time:</b> ${weather.forecast_time}<br><br>

                        <div class="popup-chart-container">

                            <div class="popup-chart">
                                <canvas id="tempChart_${popupId}"></canvas>
                            </div>

                            <div class="popup-chart">
                                <canvas id="humidityChart_${popupId}"></canvas>
                            </div>

                        </div>

                    </div>
                `;
                const marker = L.marker([
                    loc.Latitude, 
                    loc.Longitude
                ])
                    .addTo(map)
                    .bindPopup(popupContent); 
                marker.on("popupopen", function () { 
                    setTimeout(() => {
                        createPopupCharts(
                            district,
                            popupId
                        ); },
                        300);
                    });
                    markers.push(marker);
                    }); // END locations.forEach
                    } // END drawMap 
                    drawMap();


        // ================= EVENTS =================

        stateSelect.addEventListener(
            "change",
            function () {

                loadDistricts();

                if (
                    this.value ===
                    "West Bengal" ||
                    this.value ===
                    "Punjab"
                ) {

                    downloadBtn.innerHTML =
                        "⬇ Download CSV";

                    downloadBtn.classList.add(
                        "allowed"
                    );

                } else {

                    downloadBtn.innerHTML =
                        "🔒 Download Restricted";

                    downloadBtn.classList.remove(
                        "allowed"
                    );
                }

                drawMap();

            }
        );

        districtSelect.addEventListener(
            "change",
            function () {
                drawMap();
            }
        );

        dateSelect.addEventListener(
            "change",
            function () {

                loadTimes(this.value);

                drawMap();

            }
        );

        timeSelect.addEventListener(
            "change",
            function () {
                drawMap();
            }
        );

        // ================= DOWNLOAD =================

        downloadBtn.addEventListener(
            "click",
            function () {

                const allowedStates = [
                    "West Bengal",
                    "Punjab"
                ];

                if (
                    !allowedStates.includes(
                        stateSelect.value
                    )
                ) {

                    alert(
                        "Download is available only for Punjab and West Bengal datasets."
                    );

                    return;
                }

                const targetTime =
                    `${dateSelect.value} ${timeSelect.value}`;

                let filtered =
                    forecast.filter(
                        f =>
                        f.forecast_time === targetTime
                    );

                filtered =
                    filtered.filter(
                        f =>
                        (f.state || f.State)
                        === stateSelect.value
                    );

                if (
                    districtSelect.value
                ) {

                    filtered =
                        filtered.filter(
                            f =>
                            (f.district || f.District)
                            === districtSelect.value
                        );

                }

                let csv =
                    "State,District,Temperature,Humidity,Weather,Forecast_Time\n";

                filtered.forEach(f => {

                    csv +=
                        `${f.state || f.State},` +
                        `${f.district || f.District},` +
                        `${f.temperature},` +
                        `${f.humidity},` +
                        `${f.weather},` +
                        `${f.forecast_time}\n`;

                });

                const blob =
                    new Blob(
                        [csv],
                        { type: "text/csv" }
                    );

                const url =
                    URL.createObjectURL(blob);

                const a =
                    document.createElement("a");

                a.href = url;

                a.download =
                    `${stateSelect.value.replace(/\s+/g,"_")}_Weather.csv`;

                a.click();

                URL.revokeObjectURL(url);

            }
        );

    }

    catch (error) {

        console.error(
            "Forecast Error:",
            error
        );

    }

});

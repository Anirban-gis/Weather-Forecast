const API_BASE = "https://weather-forecast-xqwe.onrender.com/api/forecast";

async function loadDistricts(){

    const response =
        await fetch(
            `${API_BASE}/api/districts`
        );

    const districts =
        await response.json();

    const select =
        document.getElementById(
            "districtSelect"
        );

    districts.forEach(d=>{

        const option =
            document.createElement(
                "option"
            );

        option.value=d;
        option.textContent=d;

        select.appendChild(option);
    });

    loadWeather();
}

async function loadWeather(){

    const district =
        document.getElementById(
            "districtSelect"
        ).value;

    const response =
        await fetch(
            `${API_BASE}/api/latest/${district}`
        );

    const data =
        await response.json();

    if(data.length===0)
        return;

    const weather =
        data[0];

    document.getElementById(
        "weatherCard"
    ).innerHTML=`

        <div class="card">

            <h3>${weather.district}</h3>

            <p>
                Temp:
                ${weather.temperature}°C
            </p>

            <p>
                Humidity:
                ${weather.humidity}%
            </p>

            <p>
                Weather:
                ${weather.weather}
            </p>

        </div>
    `;
}

document
.getElementById(
    "districtSelect"
)
.addEventListener(
    "change",
    loadWeather
);

loadDistricts();

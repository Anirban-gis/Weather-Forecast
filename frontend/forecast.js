document.addEventListener("DOMContentLoaded", function () {

  fetch("https://weather-forecast-xqwe.onrender.com/api/latest/Warangal")
    .then(res => res.json())
    .then(data => {

      if (!Array.isArray(data)) {
        console.log("Invalid API response", data);
        return;
      }

      // Sort by time
      data.sort((a, b) =>
        new Date(a.forecast_time) - new Date(b.forecast_time)
      );

      const labels = data.map(item => item.forecast_time);
      const temperature = data.map(item => item.temperature);
      const humidity = data.map(item => item.humidity);

      const ctx = document.getElementById("myChart").getContext("2d");

      new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperature,
              borderColor: "red",
              fill: false
            },
            {
              label: "Humidity (%)",
              data: humidity,
              borderColor: "blue",
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                maxRotation: 90,
                minRotation: 45
              }
            }
          }
        }
      });

    })
    .catch(err => console.error("Fetch error:", err));

});

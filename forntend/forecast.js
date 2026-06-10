document.addEventListener("DOMContentLoaded", function () {

  // Call backend API
  fetch("http://127.0.0.1:5000/api/latest")
    .then(response => response.json())
    .then(data => {

      // ❗ Safety check (if API returns error)
      if (!Array.isArray(data)) {
        console.log("API error:", data);
        return;
      }

      // Extract data for chart
      const labels = data.map(item => item.district);
      const temperature = data.map(item => item.temperature);
      const humidity = data.map(item => item.humidity);

      // Get canvas
      const canvas = document.getElementById("myChart");

      if (!canvas) {
        console.log("❌ Canvas #myChart not found in HTML");
        return;
      }

      const ctx = canvas.getContext("2d");

      // Create Chart
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature (°C)",
              data: temperature,
              backgroundColor: "rgba(255, 99, 132, 0.6)"
            },
            {
              label: "Humidity (%)",
              data: humidity,
              backgroundColor: "rgba(54, 162, 235, 0.6)"
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top"
            },
            title: {
              display: true,
              text: "District Weather Overview"
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    })
    .catch(error => {
      console.error("❌ Error loading data:", error);
    });

});
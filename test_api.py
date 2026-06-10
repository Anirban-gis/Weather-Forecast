import requests

API_KEY = "af4407f9b08bc0bfdedffe1fb871891f"

url = "https://api.openweathermap.org/data/2.5/weather"

r = requests.get(
    url,
    params={
        "lat": 22.57,
        "lon": 88.36,
        "appid": API_KEY,
        "units": "metric"
    }
)

print(r.status_code)
print(r.text)
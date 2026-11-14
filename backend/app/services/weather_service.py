# backend/app/services/weather_service.py
import httpx
from typing import Dict, Any

WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    95: "Thunderstorm"
}

# VIP Coordinates Registry for 100% accurate resolution of common travel hotspots
POPULAR_DESTINATIONS_MAP = {
    "kashmir": {"name": "Kashmir, India", "lat": 34.0837, "lon": 74.7973},
    "jammu and kashmir": {"name": "Jammu & Kashmir, India", "lat": 34.0837, "lon": 74.7973},
    "jammu & kashmir": {"name": "Jammu & Kashmir, India", "lat": 34.0837, "lon": 74.7973},
    "srinagar": {"name": "Srinagar, India", "lat": 34.0837, "lon": 74.7973},
    "gulmarg": {"name": "Gulmarg, Kashmir, India", "lat": 34.0484, "lon": 74.3805},
    "pahalgam": {"name": "Pahalgam, Kashmir, India", "lat": 34.0166, "lon": 75.3166},
    "goa": {"name": "Goa, India", "lat": 15.2993, "lon": 74.1240},
    "manali": {"name": "Manali, Himachal Pradesh, India", "lat": 32.2432, "lon": 77.1892},
    "shimla": {"name": "Shimla, Himachal Pradesh, India", "lat": 31.1048, "lon": 77.1734},
    "ladakh": {"name": "Ladakh, India", "lat": 34.1526, "lon": 77.5771},
    "leh": {"name": "Leh Ladakh, India", "lat": 34.1526, "lon": 77.5771},
    "mumbai": {"name": "Mumbai, India", "lat": 19.0760, "lon": 72.8777},
    "delhi": {"name": "Delhi, India", "lat": 28.6139, "lon": 77.2090},
    "jaipur": {"name": "Jaipur, Rajasthan, India", "lat": 26.9124, "lon": 75.7873},
    "udaipur": {"name": "Udaipur, Rajasthan, India", "lat": 24.5854, "lon": 73.7125},
    "kerala": {"name": "Kerala, India", "lat": 10.8505, "lon": 76.2711},
    "paris": {"name": "Paris, France", "lat": 48.8566, "lon": 2.3522},
    "tokyo": {"name": "Tokyo, Japan", "lat": 35.6762, "lon": 139.6503},
    "new york": {"name": "New York, USA", "lat": 40.7128, "lon": -74.0060},
    "london": {"name": "London, United Kingdom", "lat": 51.5074, "lon": -0.1278},
    "dubai": {"name": "Dubai, United Arab Emirates", "lat": 25.2048, "lon": 55.2708},
    "bali": {"name": "Bali, Indonesia", "lat": -8.4095, "lon": 115.1889},
    "singapore": {"name": "Singapore", "lat": 1.3521, "lon": 103.8198},
    "switzerland": {"name": "Zurich, Switzerland", "lat": 47.3769, "lon": 8.5417},
    "rome": {"name": "Rome, Italy", "lat": 41.9028, "lon": 12.4964},
    "maldives": {"name": "Maldives", "lat": 3.2028, "lon": 73.2207},
    "phuket": {"name": "Phuket, Thailand", "lat": 7.8804, "lon": 98.3923}
}

async def fetch_destination_weather(destination: str, duration_days: int = 5) -> Dict[str, Any]:
    clean_query = destination.strip()
    query_lower = clean_query.lower()

    default_weather = {
        "destination_display": clean_query.title() if clean_query else "Destination",
        "avg_temp_c": 24,
        "min_temp_c": 18,
        "max_temp_c": 29,
        "condition": "Pleasant & Clear",
        "summary": "Pleasant temperatures expected. Standard versatile capsule packing recommended."
    }

    lat, lon, display_name = None, None, clean_query.title()

    if query_lower in POPULAR_DESTINATIONS_MAP:
        vip = POPULAR_DESTINATIONS_MAP[query_lower]
        lat, lon, display_name = vip["lat"], vip["lon"], vip["name"]

    async with httpx.AsyncClient(timeout=6.0) as client:
        try:
            if lat is None:
                geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={clean_query}&count=10&language=en&format=json"
                geo_res = await client.get(geocoding_url)
                
                if geo_res.status_code == 200:
                    geo_data = geo_res.json()
                    results = geo_data.get("results", [])
                    if results:
                        best_match = max(results, key=lambda x: x.get("population", 0) or 0)
                        lat = best_match["latitude"]
                        lon = best_match["longitude"]
                        city_name = best_match.get("name", clean_query)
                        admin1 = best_match.get("admin1", "")
                        country = best_match.get("country", "")
                        
                        parts = [city_name]
                        if admin1 and admin1 != city_name:
                            parts.append(admin1)
                        if country:
                            parts.append(country)
                        display_name = ", ".join(parts)

            if lat is None:
                return default_weather

            forecast_url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,weathercode"
                f"&timezone=auto&forecast_days={min(max(duration_days, 1), 14)}"
            )
            forecast_res = await client.get(forecast_url)
            if forecast_res.status_code != 200:
                return {**default_weather, "destination_display": display_name}

            f_data = forecast_res.json()
            daily = f_data.get("daily", {})
            max_temps = daily.get("temperature_2m_max", [24])
            min_temps = daily.get("temperature_2m_min", [18])
            weather_codes = daily.get("weathercode", [0])

            avg_max = sum(max_temps) / len(max_temps)
            avg_min = sum(min_temps) / len(min_temps)
            avg_temp = round((avg_max + avg_min) / 2)
            
            primary_code = max(set(weather_codes), key=weather_codes.count) if weather_codes else 0
            condition_desc = WMO_CODE_MAP.get(primary_code, "Partly cloudy")

            if avg_temp < 15:
                summary = f"Crisp & cool around {avg_temp}°C with {condition_desc.lower()}. Pack thermal layers, warm jackets, and cozy boots."
            elif avg_temp >= 26:
                summary = f"Warm & tropical around {avg_temp}°C. Pack lightweight breathable fabrics, shorts, sundresses, and open footwear."
            else:
                summary = f"Pleasant & comfortable around {avg_temp}°C with {condition_desc.lower()}. Perfect for versatile mix-and-match capsule layers."

            return {
                "destination_display": display_name,
                "avg_temp_c": avg_temp,
                "min_temp_c": round(min(min_temps)),
                "max_temp_c": round(max(max_temps)),
                "condition": condition_desc,
                "summary": summary
            }

        except Exception as e:
            print(f"⚠️ Weather lookup failed for {destination}: {e}")
            return {**default_weather, "destination_display": display_name}
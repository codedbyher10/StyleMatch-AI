// frontend/src/lib/weather.ts

export interface WeatherData {
  city: string;
  temperature: number;
  apparentTemperature: number;
  condition: string;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
}

// 1. Dynamic Time-Based Greeting Helper
export function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning.';
  if (hour >= 12 && hour < 17) return 'Good afternoon.';
  if (hour >= 17 && hour < 22) return 'Good evening.';
  return 'Good night.';
}

// 2. Weather Code mapper (WMO Standard)
export function getWeatherConditionName(code: number): string {
  if (code === 0) return 'Sunny';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Overcast';
}

// 3. Live Weather Fetcher using Open-Meteo (Zero API keys required)
export async function fetchLiveWeather(): Promise<WeatherData> {
  return new Promise((resolve) => {
    // Default fallback if geolocation is unavailable/denied
    const fallbackData: WeatherData = {
      city: 'Local Area',
      temperature: 28,
      apparentTemperature: 29,
      condition: 'Sunny',
      humidity: 45,
      precipitation: 0,
      weatherCode: 0,
      isDay: true,
    };

    if (!navigator.geolocation) {
      resolve(fallbackData);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // Fetch real-time weather from Open-Meteo
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,is_day&timezone=auto`
          );
          const data = await weatherRes.json();
          const current = data.current;

          // Reverse geocode to get city name
          let city = 'Local Area';
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            const geoData = await geoRes.json();
            city = geoData.address.city || geoData.address.town || geoData.address.state || 'Local Area';
          } catch {
            city = 'Local Area';
          }

          resolve({
            city,
            temperature: Math.round(current.temperature_2m),
            apparentTemperature: Math.round(current.apparent_temperature),
            condition: getWeatherConditionName(current.weather_code),
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            weatherCode: current.weather_code,
            isDay: current.is_day === 1,
          });
        } catch (err) {
          console.warn('Weather fetch error, using fallback:', err);
          resolve(fallbackData);
        }
      },
      () => {
        resolve(fallbackData);
      },
      { timeout: 6000 }
    );
  });
}
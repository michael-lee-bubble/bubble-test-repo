import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "40.7128";
  const lon = searchParams.get("lon") || "-74.0060";

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=8&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  const tomorrow = {
    date: data.daily.time[1],
    weather_code: data.daily.weather_code[1],
    temp_max: Math.round(data.daily.temperature_2m_max[1]),
    temp_min: Math.round(data.daily.temperature_2m_min[1]),
    precipitation: data.daily.precipitation_sum[1],
    wind_speed: Math.round(data.daily.wind_speed_10m_max[1]),
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const idx = i + 1; // indices [1]..[7] — tomorrow through 7 days out
    return {
      date: data.daily.time[idx],
      weather_code: data.daily.weather_code[idx],
      temp_max: Math.round(data.daily.temperature_2m_max[idx]),
      temp_min: Math.round(data.daily.temperature_2m_min[idx]),
      precipitation: data.daily.precipitation_sum[idx],
      wind_speed: Math.round(data.daily.wind_speed_10m_max[idx]),
    };
  });

  return NextResponse.json({ tomorrow, week });
}

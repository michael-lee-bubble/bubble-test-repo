"use client";

import { useEffect, useState } from "react";

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Icy fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Heavy drizzle", emoji: "🌧️" },
  61: { label: "Light rain", emoji: "🌧️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  85: { label: "Snow showers", emoji: "🌨️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
};

function getWearSuggestion(tempMax: number, code: number): string {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  const isSnowy = [71, 73, 75, 85, 86].includes(code);
  const isStormy = [95, 96, 99].includes(code);
  if (isSnowy) return "Bundle up — heavy coat, scarf, gloves, and waterproof boots. It's going to snow.";
  if (isStormy) return "Stay inside if you can. If you must go out, wear a raincoat and avoid open areas.";
  if (isRainy) return "Bring a waterproof jacket or umbrella. Waterproof shoes are a good call too.";
  if (tempMax >= 85) return "Light, breathable clothes — shorts and a t-shirt. Don't forget sunscreen.";
  if (tempMax >= 70) return "A light layer works great. Jeans and a t-shirt or light jacket should do it.";
  if (tempMax >= 55) return "Layer up — a medium jacket or hoodie over a t-shirt. Comfortable jeans or pants.";
  if (tempMax >= 40) return "Wear a warm jacket, long pants, and consider a scarf or light gloves.";
  return "It's cold — heavy coat, layers, gloves, and a warm hat are a must.";
}

interface Weather {
  date: string;
  weather_code: number;
  temp_max: number;
  temp_min: number;
  precipitation: number;
  wind_speed: number;
}

type WeekDay = Weather;

interface Article {
  title: string;
  link: string;
  description: string;
}

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [news, setNews] = useState<Article[]>([]);
  const [email, setEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [weekNotifyStatus, setWeekNotifyStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = (lat: number, lon: number) => {
      Promise.all([
        fetch(`/api/weather?lat=${lat}&lon=${lon}`).then((r) => r.json()),
        fetch("/api/news").then((r) => r.json()),
      ]).then(([w, n]) => {
        setWeather(w.tomorrow);
        setWeek(w.week);
        setNews(n.articles || []);
        setLoading(false);
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAll(pos.coords.latitude, pos.coords.longitude),
        () => fetchAll(40.7128, -74.006),
        { timeout: 5000 }
      );
    } else {
      fetchAll(40.7128, -74.006);
    }
  }, []);

  const sendNotification = async () => {
    if (!email) return;
    setNotifyStatus("sending");
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, weather }),
    });
    setNotifyStatus(res.ok ? "sent" : "error");
  };

  const sendWeekNotification = async () => {
    if (!email || week.length === 0) return;
    setWeekNotifyStatus("sending");
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, forecast: week }),
    });
    setWeekNotifyStatus(res.ok ? "sent" : "error");
  };

  const wmo = weather ? (WMO_CODES[weather.weather_code] ?? { label: "Unknown", emoji: "🌡️" }) : null;
  const tomorrow = weather
    ? new Date(weather.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Tomorrow&apos;s Brief</h1>
          <p className="text-sm text-gray-500 mt-1">Weather, outfit, and what&apos;s happening in the world.</p>
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm animate-pulse">Loading…</div>
        ) : (
          <>
            {weather && wmo && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{tomorrow}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-light">{weather.temp_max}°</span>
                      <span className="text-xl text-gray-400">{weather.temp_min}°</span>
                    </div>
                    <p className="text-gray-500 mt-1">{wmo.label}</p>
                  </div>
                  <span className="text-5xl">{wmo.emoji}</span>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                  <span>💨 {weather.wind_speed} mph</span>
                  <span>🌧 {weather.precipitation}&quot; precip.</span>
                </div>
              </div>
            )}

            {weather && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">What to wear</p>
                <p className="text-gray-700 leading-relaxed">
                  {getWearSuggestion(weather.temp_max, weather.weather_code)}
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Today&apos;s headlines</p>
              <div className="space-y-4">
                {news.map((article, i) => (
                  <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" className="block group">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{article.description}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Get tomorrow&apos;s weather by email
              </p>
              {notifyStatus === "sent" ? (
                <p className="text-sm text-green-600">✓ Notification sent to {email}</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 transition-colors"
                  />
                  <button
                    onClick={sendNotification}
                    disabled={notifyStatus === "sending" || !email}
                    className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-700 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {notifyStatus === "sending" ? "Sending…" : "Notify me"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

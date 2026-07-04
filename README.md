# Meteogram

Interaktywna aplikacja webowa dla ekspertów i pasjonatów meteorologii — porównywanie surowych danych z wielu numerycznych modeli pogodowych (GFS, ECMWF, ICON, HRRR) na wykresach i interaktywnej mapie.

Projekt prywatny, niekomercyjny. Faza 1 (MVP) działa w całości po stronie przeglądarki — bez backendu, bez bazy danych, hostowana statycznie na GitHub Pages.

## Stos technologiczny

React 18 + TypeScript + Vite · Tailwind CSS · Plotly.js · MapLibre GL JS · `@openmeteo/weather-map-layer` · OpenFreeMap · Open-Meteo API

## Uruchomienie

```bash
npm install
npm run dev
```

Build produkcyjny: `npm run build` · testy: `npm test` · lint: `npm run lint`

## Atrybucje i licencje

- Dane pogodowe: [Open-Meteo](https://open-meteo.com) — dane na licencji [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); darmowy dostęp do API jest ograniczony warunkami do użytku niekomercyjnego.
- Mapa bazowa: [OpenFreeMap](https://openfreemap.org) (oprogramowanie na licencji MIT) © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors — dane mapowe na licencji ODbL.

## Status

MVP w trakcie implementacji.

# 🌦️ Weather Map

![Weather Map Demo](readme_assets/weather_map.gif)

A web app to **visually explore Singapore's weather forecast**.  
Built with **Angular (frontend)** and **Node.js (backend)**.

---

## ✨ Features

- 🗺️ **Interactive Map**  
  Displays all official weather stations across Singapore.  

- 📊 **Forecast Charts (10 days)**  
  - Solar Radiation  
  - Average Humidity  
  - Minimum & Maximum Temperature  

- 🔍 **Station-Specific Forecast**  
  Click on any station marker to view a **Mini Map of each weather station** and corresponding **3-day weather forecast**.  

---

## 🚀 Tech Stack

- **Frontend:** [Angular](https://angular.dev) (v20.2.2, generated via Angular CLI)  
- **APIs:**  
  - [NEA / data.gov.sg](https://data.gov.sg/datasets?groups=environment) — official 2-hour weather forecast  
  - [Open-Meteo](https://open-meteo.com/) — global weather and climate data  
- **Runtime:** Node.js (used by Angular CLI for local dev server, but no separate backend)  


---

## 🛠️ Development Setup

Start a local dev server:

```bash
ng serve

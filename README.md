# 🌦️ Weather Map

![Weather Map Demo](readme_assets/weather_map.gif)

A web app to **visually explore Singapore's weather forecast**.  
Built with **Angular (frontend)**. 

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

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (includes `npm`)
- [Angular CLI](https://angular.dev/cli) installed globally:
  ```bash
  npm install -g @angular/cli
  ```

### 2. Clone the repository
```bash
git clone https://github.com/jeanetted3v/weather-map.git
cd weather-map
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the local dev server
```bash
ng serve
```
Then open [http://localhost:4200](http://localhost:4200) in your browser.
The app will auto-reload as you edit the source files.


## 🏗️ Build for Production

To create an optimized build of the app, run:

```bash
ng build
```
The production files will be generated inside the `dist/` folder.
You can deploy the contents of dist/weather-map/ to any static hosting service such as Netlify, Vercel, or GitHub Pages.

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet'; 
import { tileLayer, latLng, marker, Marker, icon, Map } from 'leaflet';
import 'leaflet.markercluster';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WeatherService } from '../services/weather.service';
import { StationModalComponent } from '../station-modal/station-modal.component';

interface Station {
  name: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    LeafletModule,
    MatDialogModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  mapOptions: any;
  map!: Map;
  markersLayer!: any; // markercluster group
  stations: Station[] = [];
  searchControl = new FormControl('');
  suggestion: string = '';
  // Singapore-wide data + chart
  sgWeatherData: any;
  public sgRadiationChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public sgHumidityChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public sgTemperatureChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

  public tempChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: window.innerWidth < 768 ? 'MM/dd' : 'MMM d' }
        },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 30  }
      },
      y: { suggestedMin: 20, suggestedMax: 38 }
    }
  };
  
  public humidityChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: window.innerWidth < 768 ? 'MM/dd' : 'MMM d' }
        },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 30 }
      },
      y: { suggestedMin: 70, suggestedMax: 95 }
    }
  };
  
  public radiationChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: { boxWidth: 12, font: { size: 11 } }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: { day: window.innerWidth < 768 ? 'MM/dd' : 'MMM d' }
        },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 30  }
      },
      y: { beginAtZero: true }
    }
  };
  
  constructor(
    private dialog: MatDialog,
    private weather: WeatherService 
  ) {}

  ngOnInit(): void {
    // base map
    this.mapOptions = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        })
      ],
      zoom: 11,
      center: latLng(1.3521, 103.8198) // Singapore center
    };

    // Load Singapore-wide overview immediately
    this.loadSingaporeWeather();

    // Inline autocomplete suggestion
    this.searchControl.valueChanges.subscribe(value => {
      if (!value) {
        this.suggestion = '';
        return;
      }
      const match = this.stations.find(st =>
        st.name.toLowerCase().includes(value.toLowerCase())
      );
      this.suggestion = match ? match.name : '';
    });

    // load station list dynamically
    this.weather.getSingaporeStations().subscribe({
      next: (stations: Station[]) => {
        this.stations = stations;
        if (this.map) {
          this.plotStations();
        }
      },
      error: (err) => {
        console.error('getSingaporeStations failed', err);
        this.stations = [];
      }
    });
  }

  onMapReady(map: Map) {
    this.map = map;

    // create a marker cluster group
    // @ts-ignore - MarkerCluster is loaded globally from leaflet.markercluster
    this.markersLayer = (window as any).L.markerClusterGroup();
    this.map.addLayer(this.markersLayer);

    if (this.stations.length > 0) {
      this.plotStations();
    }
  }

  private plotStations() {
    this.markersLayer.clearLayers();

    this.stations.forEach(station => {
      const m = marker([station.lat, station.lon], {
        icon: icon({
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }) as Marker;

      m.bindTooltip(station.name, { direction: 'top' });
      m.on('click', () => this.openStationModal(station));
      this.markersLayer.addLayer(m);
    });
  }

  openStationModal(station: Station) {
    this.dialog.open(StationModalComponent, {
      width: '92%',
      maxWidth: '980px',
      data: { station }
    });
  }

  private createGradient(color: string): CanvasGradient | string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return color;
  
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, `${color}99`); // top (semi-transparent)
    gradient.addColorStop(1, `${color}00`); // bottom (transparent)
    return gradient;
  }

  // Load Singapore-wide data 
  private loadSingaporeWeather() {
    this.weather.getSingaporeForecast10Days().subscribe({
      next: (r: any) => {
      console.log("API response", r);
  
      const dailyTimes = (r.daily?.time ?? []).map((t: string) => new Date(t));
  
      // Temperature (already daily)
      const tempMax = r.daily?.temperature_2m_max ?? [];
      const tempMin = r.daily?.temperature_2m_min ?? [];
  
      // Hourly data
      const hourlyTimes = r.hourly?.time ?? [];
      const radiation = r.hourly?.direct_radiation ?? [];
      const humidity = r.hourly?.relativehumidity_2m ?? [];
  
      // --- Aggregate radiation & humidity to daily ---
      const dailyRadiation: number[] = [];
      const dailyHumidity: number[] = [];
  
      dailyTimes.forEach((d: Date) => {
        const dayStr = d.toISOString().split('T')[0];

        // indices of all hourly records for this day
        const indices = hourlyTimes
          .map((t: string, idx: number) => (t.startsWith(dayStr) ? idx : -1))
          .filter((idx: number) => idx >= 0);

        if (indices.length > 0) {
          // Sum of radiation for the day
          const radSum = indices.reduce((sum: number, idx: number) => sum + radiation[idx], 0);
          dailyRadiation.push(radSum);

          // Average humidity for the day
          const humAvg =
            indices.reduce((sum: number, idx: number) => sum + humidity[idx], 0) / indices.length;
          dailyHumidity.push(Math.round(humAvg));
        } else {
          dailyRadiation.push(0);
          dailyHumidity.push(0);
        }
      });
  
      // --- Build charts ---
      this.sgRadiationChartData = {
        labels: dailyTimes,
        datasets: [
          {
            data: dailyRadiation,
            label: 'Solar Radiation (relative units)',
            borderColor: '#f39c12',
            backgroundColor: this.createGradient('#f39c12'), 
            pointBackgroundColor: '#f39c12',
            fill: true,
          },
        ],
      };
  
      this.sgHumidityChartData = {
        labels: dailyTimes,
        datasets: [
          {
            data: dailyHumidity,
            label: 'Avg Humidity (%)',
            borderColor: '#3498db',
            backgroundColor: this.createGradient('#3498db'),
            pointBackgroundColor: '#3498db',
            fill: true,
          },
        ],
      };
  
      this.sgTemperatureChartData = {
        labels: dailyTimes,
        datasets: [
          {
            data: tempMax,
            label: 'Max Temp (°C)',
            borderColor: '#e74c3c',
            backgroundColor: this.createGradient('#e74c3c'),
            pointBackgroundColor: '#e74c3c',
            fill: true,
          },
          {
            data: tempMin,
            label: 'Min Temp (°C)',
            borderColor: '#2ecc71',
            backgroundColor: this.createGradient('#2ecc71'),
            pointBackgroundColor: '#2ecc71',
            fill: true,
          },
        ],
      };
    },
    error: (err) => {
      console.error('getSingaporeForecast10Days failed', err);
      this.sgWeatherData = null;
    }});
  }

  // Autocomplete to filter station
  acceptSuggestion() {
    if (this.suggestion) {
      this.searchControl.setValue(this.suggestion);
      const station = this.stations.find(st => st.name === this.suggestion);
      if (station) this.onSearchSelect(station);
    }
  }
  
  onSearchSelect(station: Station) {
    if (this.map) {
      this.map.setView([station.lat, station.lon], 14, { animate: true });
      this.openStationModal(station); // optional: auto open modal
    }
  }
  
}
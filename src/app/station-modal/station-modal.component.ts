import { Component, Inject, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { ChartConfiguration, Chart } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgChartsModule } from 'ng2-charts';
import { tileLayer, latLng, Map, marker, icon } from 'leaflet';
import { MatIconModule } from '@angular/material/icon';

Chart.defaults.backgroundColor = 'transparent';
Chart.defaults.color = 'rgba(255, 255, 255, 0.7)'; // default text color

interface Station {
  name: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-station-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgChartsModule, MatIconModule],
  templateUrl: './station-modal.component.html',
  styleUrls: ['./station-modal.component.scss']
})
export class StationModalComponent implements OnInit {
  station: Station;
  forecastText: string | undefined;
  openMeteoData: any;
  map!: Map; // mini-map instance

  /// chart data (line chart)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        type: 'line',
        data: [],
        label: 'Direct radiation',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',   // radiation → right axis
        fill: false,
        tension: 0.3     // curve smoothing
      },
      {
        type: 'line',
        data: [],
        label: 'Temperature',
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y',    // temperature → left axis
        fill: false,
        tension: 0.3
      }
    ]
  };

  // chart options
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: window.innerWidth < 600 ? 1.6 : 2.4,
    layout: { padding: { top: 8, right: 8, bottom: 6, left: 6 } },
    elements: {
      point: {
        radius: window.innerWidth < 600 ? 2 : 3,
        hoverRadius: window.innerWidth < 600 ? 3 : 5
      }
    },
    plugins: {
      legend: {
        display: window.innerWidth >= 420,
        position: 'top',
        labels: { color: 'rgba(255, 255, 255, 0.75)' }
      },
      title: {
        display: true,
        text: 'Next 72 Hours: Temp & Radiation',
        color: 'rgba(255, 255, 255, 0.85)',
        font: { size: window.innerWidth < 600 ? 12 : 16 }
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const date = new Date(context[0].parsed.x);
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(date);
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: { hour: 'MMM d HH:mm', day: 'MMM d' }
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: window.innerWidth < 600 ? 6 : 12,
          color: 'rgba(255, 255, 255, 0.65)',
          font: { size: window.innerWidth < 600 ? 10 : 12 },
          callback: function (value) {
            const date = new Date(value as number);
            if (date.getHours() === 0) {
              return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
            }
            return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)'
        },
        border: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgba(255, 255, 255, 0.8)'
        },
        ticks: { color: 'rgba(255, 255, 255, 0.65)', font: { size: window.innerWidth < 600 ? 10 : 12 } },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        border: { color: 'rgba(255, 255, 255, 0.2)' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
          color: 'rgba(255, 255, 255, 0.08)'
        },
        border: { color: 'rgba(255, 255, 255, 0.2)' },
        title: {
          display: true,
          text: 'Radiation (W/m²)',
          color: 'rgba(255, 255, 255, 0.8)'
        },
        ticks: { color: 'rgba(255, 255, 255, 0.65)', font: { size: window.innerWidth < 600 ? 10 : 12 } }
      }
    },
    backgroundColor: 'transparent'
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<StationModalComponent>,
    private weather: WeatherService
  ) {
    this.station = data.station;
  }

  ngOnInit(): void {
    this.loadForecast();
    this.loadOpenMeteo();
  }

  ngAfterViewInit(): void {  // initialize map once template is ready
    this.initMiniMap();
  }

  private loadForecast() {
    this.weather.getSingaporeForecast().subscribe({
      next: (forecasts: any[]) => {
        const match = forecasts.find(f => f.area === this.station.name);
        this.forecastText = match ? match.forecast : 'No forecast available';
      },
      error: (err) => {
        console.error('getSingaporeForecast failed', err);
        this.forecastText = 'Forecast unavailable';
      }
    });
  }

  private loadOpenMeteo() {
    const today = new Date();
    const start = new Date(today);     // start today
    const end = new Date(today);
    end.setDate(today.getDate() + 3);  // next 72 hours ≈ 3 days
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    this.weather.getOpenMeteo(this.station.lat, this.station.lon, startStr, endStr)
      .subscribe({
        next: (r: any) => {
          this.openMeteoData = r;

        let hours: string[] = r.hourly?.time ?? [];
        let rad: number[] = r.hourly?.direct_radiation ?? [];
        let temp: number[] = r.hourly?.temperature_2m ?? [];

        // Slice to next 72 hours from now
        const now = new Date();
        const nowIsoHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
          .toISOString()
          .slice(0, 13); // YYYY-MM-DDTHH
        const startIdx = Math.max(0, hours.findIndex((t: string) => t.startsWith(nowIsoHour)));
        const endIdx = startIdx > -1 ? startIdx + 72 : 72;
        hours = hours.slice(startIdx, endIdx);
        rad = rad.slice(startIdx, endIdx);
        temp = temp.slice(startIdx, endIdx);

        this.lineChartData = {
          labels: hours,
          datasets: [
            {
              type: 'line',
              data: rad,
              label: 'Direct radiation',
              borderColor: 'rgba(243, 156, 18, 1)',
              backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) {
                  return 'rgba(243, 156, 18, 0.6)'; // fallback color if chart not ready
                }
        
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                gradient.addColorStop(0, 'rgba(243, 156, 18, 0.6)');  // top color
                gradient.addColorStop(1, 'rgba(243, 156, 18, 0)');    // fade to transparent
                return gradient;
              },
              yAxisID: 'y1',
              fill: { target: 'origin' },  // fill to baseline 0
              tension: 0.3,
              pointBackgroundColor: 'rgba(243, 156, 18, 1)'
            },
            {
              type: 'line',
              data: temp,
              label: 'Temperature',
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              yAxisID: 'y',
              fill: false,
              tension: 0.3,
              pointBackgroundColor: 'rgba(52, 152, 219, 1)'
            }
          ]
        };
      },
      error: (err) => {
        console.error('getOpenMeteo failed', err);
        this.openMeteoData = null;
      }
    });
  }

  // mini map setup
  private initMiniMap() {
    this.map = new Map('mini-map', {
      center: latLng(this.station.lat, this.station.lon),
      zoom: 13,
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        })
      ]
    });

    marker([this.station.lat, this.station.lon], {
      icon: icon({
        iconUrl: 'assets/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'assets/marker-shadow.png',
        shadowSize: [41, 41]
      })
    }).addTo(this.map).bindPopup(this.station.name).openPopup();
  }

  close() {
    this.dialogRef.close();
  }
}

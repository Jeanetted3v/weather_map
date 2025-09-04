import { Component, Inject, OnInit } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgChartsModule } from 'ng2-charts';

interface Station {
  name: string;
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-station-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, NgChartsModule],
  templateUrl: './station-modal.component.html',
  styleUrls: ['./station-modal.component.scss']
})
export class StationModalComponent implements OnInit {
  station: Station;
  forecastText: string | undefined;
  openMeteoData: any;

  // chart data (line chart)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Direct radiation' },
      { data: [], label: 'Temperature' }
    ]
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

  private loadForecast() {
    this.weather.getSingaporeForecast().subscribe((forecasts: any[]) => {
      const match = forecasts.find(f => f.area === this.station.name);
      this.forecastText = match ? match.forecast : 'No forecast available';
    });
  }

  private loadOpenMeteo() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 2);  // data from last 2 days
    const startStr = start.toISOString().slice(0, 10);
    const endStr = today.toISOString().slice(0, 10);

    this.weather.getOpenMeteo(this.station.lat, this.station.lon, startStr, endStr)
      .subscribe((r: any) => {
        this.openMeteoData = r;

        const hours = r.hourly?.time ?? [];
        const rad = r.hourly?.direct_radiation ?? [];
        const temp = r.hourly?.temperature_2m ?? [];

        this.lineChartData.labels = hours;
        this.lineChartData.datasets[0].data = rad;
        this.lineChartData.datasets[1].data = temp;
      });
  }

  close() {
    this.dialogRef.close();
  }
}

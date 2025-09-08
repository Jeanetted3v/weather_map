import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private sgApi = 'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast';
  private openMeteoApi = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  /**
   * Get Singapore station metadata (name + lat/lon) from data.gov.sg
   */
  getSingaporeStations(): Observable<Array<{ name: string; lat: number; lon: number }>> {
    return this.http.get<any>(this.sgApi).pipe(
      map(resp =>
        resp.area_metadata.map((a: any) => ({
          name: a.name,
          lat: a.label_location.latitude,
          lon: a.label_location.longitude
        }))
      ),
      catchError(err => {
        console.error('getSingaporeStations error', err);
        return throwError(() => err);
      })
    );
  }

  getSingaporeForecast10Days(): Observable<any> {
    const today = new Date();
    const start = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 9); // today + 9 = 10 days total
    const end = endDate.toISOString().split('T')[0];
    const params = [
      'latitude=1.29',
      'longitude=103.85',
      'hourly=relativehumidity_2m,direct_radiation',   // hourly radiation, humidity
      'daily=temperature_2m_max,temperature_2m_min',   // daily temps
      'timezone=Asia/Singapore',
      `start_date=${start}`,
      `end_date=${end}`
    ];
    return this.http.get(`${this.openMeteoApi}?${params.join('&')}`).pipe(
      catchError(err => {
        console.error('getSingaporeForecast10Days error', err);
        return throwError(() => err);
      })
    );
  }
  

  /**
   * Get the latest 2-hour forecast for all Singapore stations
   */
  getSingaporeForecast(): Observable<Array<{ area: string; forecast: string }>> {
    return this.http.get<any>(this.sgApi).pipe(
      map(resp => resp.items[0].forecasts),
      catchError(err => {
        console.error('getSingaporeForecast error', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Example: Get Open-Meteo hourly + daily weather data for a location
   */
  getOpenMeteo(lat: number, lon: number, start?: string, end?: string): Observable<any> {
    const params: Record<string, string> = {
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'temperature_2m,relativehumidity_2m,direct_radiation',
      daily: 'temperature_2m_max,temperature_2m_min',
      timezone: 'auto'
    };

    if (start) params['start_date'] = start;
    if (end) params['end_date'] = end;

    const query = new URLSearchParams(params).toString();
    return this.http.get<any>(`${this.openMeteoApi}?${query}`).pipe(
      catchError(err => {
        console.error('getOpenMeteo error', err);
        return throwError(() => err);
      })
    );
  }
}

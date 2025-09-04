import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet'; 
import { tileLayer, latLng, marker, Marker, icon, Map } from 'leaflet';
import 'leaflet.markercluster';
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
    MatDialogModule
  ],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  mapOptions: any;
  map!: Map;
  markersLayer!: any; // markercluster group

  stations: Station[] = [];

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
    // load station list dynamically
    this.weather.getSingaporeStations().subscribe((stations: Station[]) => {
      this.stations = stations;
      if (this.map) {
        this.plotStations();
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
          iconUrl: 'assets/marker-icon.png', // use default leaflet marker if you prefer
          iconSize: [25, 41],
          iconAnchor: [12, 41]
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
}
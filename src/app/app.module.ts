import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// Leaflet (BlueHalo fork for Angular 15+ / 20)
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { StationModalComponent } from './station-modal/station-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgChartsModule } from 'ng2-charts';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent,
    MapComponent,
    StationModalComponent,
    LeafletModule,
    MatDialogModule,
    MatButtonModule,
    NgChartsModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

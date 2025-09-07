import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { NgChartsModule } from 'ng2-charts';
import 'chartjs-adapter-date-fns';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    importProvidersFrom(LeafletModule, NgChartsModule, MatDialogModule, MatButtonModule)
  ]
});

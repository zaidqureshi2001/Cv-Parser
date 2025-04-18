import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadcvComponent } from './page/uploadcv/uploadcv.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  
  imports: [RouterOutlet , UploadcvComponent  , CommonModule  , MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cv-parser';
}

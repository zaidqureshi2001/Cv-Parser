import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UploadcvComponent } from './page/uploadcv/uploadcv.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  
  imports: [RouterOutlet , UploadcvComponent  , CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cv-parser';
}

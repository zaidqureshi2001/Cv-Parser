import { CommonModule } from '@angular/common';
import { Component , Input } from '@angular/core';

@Component({
  selector: 'app-formatresume',
  imports: [CommonModule],
  templateUrl: './formatresume.component.html',
  styleUrl: './formatresume.component.css'
})
export class FormatresumeComponent {
  // userName: string = "Jaid Qureshi";
  email: string = "jaid@example.com";
  description: string = "Experienced front-end developer with a passion for creating user-friendly interfaces.";
  position: string = "Front-End Developer";
  startDate: string = "January 2022";
  endDate: string = "Present";
  location: string = "Remote";
  @Input() resumeData: any;
}

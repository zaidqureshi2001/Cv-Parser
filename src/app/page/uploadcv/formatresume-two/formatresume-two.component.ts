import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import html2pdf from 'html2pdf.js';
@Component({
  selector: 'app-formatresume-two',
  imports: [CommonModule , FormsModule],
  templateUrl: './formatresume-two.component.html',
  styleUrl: './formatresume-two.component.css'
})
export class FormatresumeTwoComponent {
  @Input() resumeData: any;
  @Input() customFields: { label: string; value: string }[] = [];


  
}

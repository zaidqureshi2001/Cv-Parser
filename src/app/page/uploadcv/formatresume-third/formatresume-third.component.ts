import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formatresume-third',
  imports: [CommonModule , FormsModule],
  templateUrl: './formatresume-third.component.html',
  styleUrl: './formatresume-third.component.css'
})
export class FormatresumeThirdComponent {
  @Input() resumeData: any;
  @Input() customFields: { label: string; value: string }[] = [];

}

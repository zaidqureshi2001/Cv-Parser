import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component , Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-formatresume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formatresume.component.html',
  styleUrls: ['./formatresume.component.css']
})
export class FormatresumeComponent {
  @Input() resumeData: any;
  @Input() customFields: { label: string; value: string }[] = [];

  constructor(private cdRef: ChangeDetectorRef) {}
  

  ngOnChanges(changes: SimpleChanges) {
    console.log('Updated resumeData in Formatresume:', this.resumeData);
    this.cdRef.detectChanges();
  }
}

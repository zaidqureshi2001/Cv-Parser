import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CvparserService } from '../../cvparser.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-uploadcv',
  imports: [FormsModule, CommonModule],
  standalone: true, 
  templateUrl: './uploadcv.component.html',
  styleUrl: './uploadcv.component.css'
})
export class UploadcvComponent {
  parserData: any = {};
  fileUploaded = false;
  shiftleft = false;

  
  // Define the data fields structure
  dataFields = [
    { key: 'name', label: 'Full Name', icon: 'name' },
    { key: 'email', label: 'Email', icon: 'email' },
    { key: 'phone_number', label: 'Phone', icon: 'phone' },
    { key: 'address', label: 'Address', icon: 'address' },
    { key: 'skills', label: 'Skills', icon: 'skills' },
    { key: 'experience', label: 'Experience', icon: 'experience' },
    { key: 'education', label: 'Education', icon: 'education' }
  ];

  constructor(private cvParserService: CvparserService) {}

  // Handle file upload
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }



  // Upload file to the server and receive parsed data
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    this.fileUploaded = true; 
    this.shiftleft = true;

    this.cvParserService.parseCv(formData).subscribe(
      (data) => {
        this.parserData = data;
        console.log('Parsed data:', this.parserData);  // Handle the response data here
      },
      (error) => {
        console.error('Error uploading file:', error);  // Handle error here
        this.fileUploaded = false;
        this.shiftleft = false;
      }
    );
  }

  // Download parsed data as JSON
  downloadFile() {
    const dataStr = JSON.stringify(this.parserData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'parsed-cv-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }



    // Handle file drop
    onFileDrop(event: DragEvent) {
      event.preventDefault();
      if (event.dataTransfer?.files) {
        const file = event.dataTransfer.files[0];
        this.fileUploaded = true;
        this.uploadFile(file);
        this.shiftleft = true;
      }
    }
  
    // Prevent default drag over behavior
    onDragOver(event: DragEvent) {
      event.preventDefault();
    }
}

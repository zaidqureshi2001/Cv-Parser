import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvparserService } from '../../cvparser.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import * as mammoth from 'mammoth';

@Component({
  selector: 'app-uploadcv',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './uploadcv.component.html',
  styleUrls: ['./uploadcv.component.css']
})
export class UploadcvComponent {
  parserData: { [key: string]: any } = {};
  isParsing: boolean = false;
  fileUploaded = false;
  showBasicInfo = false;
  showEducation = false;
  showProfile = false;
  showSkills = false;
  showExperience = false;
  showProjects = false;
  docxHtmlContent: string = '';
  skillsText: string = '';
  

  constructor(private cvParserService: CvparserService) {}

  ngOnInit() {
    this.initializeSkills();
    this.initializeProjects();
  }

  initializeSkills() {
    // Ensure skillsText is populated correctly if skills are found in the parsed data
    if (this.parserData['skills']?.length) {
      this.skillsText = this.parserData['skills'].join(', ');
    }
  }

  initializeProjects() {
    if (this.parserData['projects']?.length) {
      this.parserData['projects'].forEach((p: any) => {
        p.technologiesString = (p.technologies || []).join(', ');
      });
    }
  }

  onSkillsChange() {
    // Ensure the skills array is updated properly
    if (this.skillsText) {
      this.parserData['skills'] = this.skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else {
      this.parserData['skills'] = [];  // Clear skills if input is empty
    }
    console.log('Updated skills:', this.parserData['skills']);
  }

  updateProjectTechnologies(index: number) {
    const project = this.parserData['projects']?.[index];
    if (project) {
      project.technologies = project.technologiesString
        .split(',')
        .map((tech: string) => tech.trim())
        .filter(Boolean);
    }
  }

  // Handle file upload event
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDataChange() {
    console.log('Updated data:', this.parserData);
  }

  // Upload the file and send it to the backend for parsing
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading file...', file);
    this.fileUploaded = true;
    this.isParsing = true;

    this.cvParserService.parseCv(formData).subscribe(
      (data) => {
        console.log('Full API Response:', data);
        console.log('Parsed Data:', data.parsed_data);

        // If parsed data exists, process and display it
        if (data && data.parsed_data) {
          if (data.docxUrl) {
            this.convertDocxToHtml(data.docxUrl);
          }
          this.parserData = data.parsed_data;
          this.isParsing = false;

          // Initialize skills if parsed data contains them
          this.initializeSkills();

          // Conditionally toggle visibility based on available parsed data
          this.showBasicInfo = this.parserData['name'] || this.showBasicInfo;
        }
      },
      (error) => {
        console.error('Error uploading file:', error);
        this.fileUploaded = false;
        alert('There was an issue uploading the CV. Please try again.');
      }
    );
  }

  // Utility method to get object keys for display
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Format key to make it more readable
  formatKey(key: string): string {
    return key.replace(/_/g, ' ');
  }

  // Handle file drop
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      this.uploadFile(file);
    }
  }

  // Handle drag over event
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  toggleSection(section: string) {
    switch (section) {
      case 'basicInfo':
        this.showBasicInfo = !this.showBasicInfo;
        break;
      case 'education':
        this.showEducation = !this.showEducation;
        break;
      case 'profile':
        this.showProfile = !this.showProfile;
        break;
      case 'skills':
        this.showSkills = !this.showSkills;
        break;
      case 'experience':
        this.showExperience = !this.showExperience;
        break;
      case 'projects':
        this.showProjects = !this.showProjects;
        break;
    }
  }

  convertDocxToHtml(docxUrl: string) {
    console.log('Attempting to fetch DOCX file:', docxUrl);
    fetch(docxUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        console.log('Fetched DOCX file as arrayBuffer.');
        mammoth.convertToHtml({ arrayBuffer: buffer })
          .then((result) => {
            console.log('Mammoth conversion result:', result);
            this.docxHtmlContent = result.value;
          })
          .catch((err) => {
            console.error('Mammoth conversion error:', err);
            alert('Mammoth conversion failed.');
          });
      })
      .catch((err) => {
        console.error('Error fetching DOCX file:', err);
        alert('Failed to load DOCX file.');
      });
  }
  deleteProject(index:number){
    (this.parserData['projects'] as any []).splice(index , 1)
  }
  addProject(){
    if(!this.parserData['projects']){
      this.parserData['projects'] = [];
    }

    this.parserData['projects'].push({
      name: '',
      description: '',
      technologies: [],
      technologiesString: '',
      link: ''
    })
    
  }
  addBasicInfo() {
    this.parserData['basic_info'] = {
      name: '',
      email: '' , 
      Phone: ''
      // Add other fields if needed
    };
  }

  deleteBasicInfo() {
    delete this.parserData['basic_info'];
  }

}

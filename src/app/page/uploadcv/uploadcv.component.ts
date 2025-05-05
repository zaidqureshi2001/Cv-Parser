import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvparserService } from '../../cvparser.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import html2pdf from 'html2pdf.js'; // ✅ this works because of the separate .d.ts file
import * as mammoth from 'mammoth';
import { FormatresumeComponent } from './formatresume/formatresume.component';
import { FormatresumeTwoComponent } from './formatresume-two/formatresume-two.component';
import { FormatresumeThirdComponent } from './formatresume-third/formatresume-third.component';
interface DynamicField {
  label: string;
  value: string;
  isEditing: boolean;
}

@Component({
  selector: 'app-uploadcv',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, FormatresumeComponent , FormatresumeTwoComponent , FormatresumeThirdComponent],
  templateUrl: './uploadcv.component.html',
  styleUrls: ['./uploadcv.component.css']
})
export class UploadcvComponent {
  parserData: { [key: string]: any } = {};
  isParsing: boolean = false;
  isParsed=false;
  fileUploaded = false;
  showBasicInfo = false;
  showEducation = false;
  showProfile = false;
  showSkills = false;
  showExperience = false;
  showProjects = false;
  showCertifications = false;
  showLanguages = false;
  showHobbies = false;
  showPublications = false;
  showPreview =  false;
  skillsText: string = '';
  dynamicFields: DynamicField[] = [];
  selectedFormat: 'format1' | 'format2' |'format3' = 'format1';


  constructor(private cvParserService: CvparserService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.initializeSkills();
    this.initializeProjects();
    // After parsing data successfully, ensure showBasicInfo is true
    this.showBasicInfo = true;
    console.log('Show Basic Info:', this.showBasicInfo); // Add this for debugging

  }

  initializeSkills() {
    if (this.parserData['skills']?.length) {
      this.skillsText = this.parserData['skills'].join(', ');
    }
  }

  initializeProjects() {
    const projects = this.parserData['projects'];
    if (Array.isArray(projects)) {
      projects.forEach((p: any) => {
        p.technologiesString = Array.isArray(p.technologies) ? p.technologies.join(', ') : '';
      });
    }
  }

  onSkillsChange() {
    if (this.skillsText) {
      this.parserData['skills'] = this.skillsText
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else {
      this.parserData['skills'] = [];
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

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  onDataChange() {
    console.log('Updated data:', this.parserData);
  }

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
        console.log('Basic Info:', this.parserData['basicInfo']);
        console.log('Show Basic Info:', this.showBasicInfo);
        
        console.log('Location:', this.parserData['location/address']);
         
        if (data && data.parsed_data) {
          this.parserData = data.parsed_data;
          

          const projects = data.parsed_data['projects'];
          if (Array.isArray(projects)) {
            projects.forEach((p: any) => {
              p.technologiesString = Array.isArray(p.technologies)
                ? p.technologies.join(', ')
                : '';
            });
          }
          this.parserData = data.parsed_data;
          this.isParsed = true;
          this.isParsing = false;
          this.cdRef.detectChanges();
          this.initializeSkills();
          this.showBasicInfo = this.parserData['name'] || this.showBasicInfo;
          console.log('LinkedIn:', this.parserData['links']?.linkedin);
          console.log('GitHub:', this.parserData['links']?.github);

        }
      },
      (error) => {
        console.error('Error uploading file:', error);
        this.fileUploaded = false;
        alert('There was an issue uploading the CV. Please try again.');
      }
    );
  }

  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatKey(key: string): string {
    return key.replace(/_/g, ' ');
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const file = event.dataTransfer.files[0];
      this.uploadFile(file);
    }
  }

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
      case 'certifications':
        this.showCertifications = !this.showCertifications;
        break;
      case 'languages':
        this.showLanguages = !this.showLanguages;
        break;
      case 'hobbies':
        this.showHobbies = !this.showHobbies;
        break;
      case 'publications':
        this.showPublications = !this.showPublications;
        break;
    }
  }



  deleteProject(index: number) {
    (this.parserData['projects'] as any[]).splice(index, 1);
  }

  addProject() {
    if (!this.parserData['projects']) {
      this.parserData['projects'] = [];
    }

    this.parserData['projects'].push({
      name: '',
      description: '',
      technologies: [],
      technologiesString: '',
      link: ''
    });
  }
  addExperience() {
    if (!this.parserData['experience']) {
      this.parserData['experience'] = [];
    }

    this.parserData['experience'].push({
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  }
  addEducation() {
    if (!this.parserData['education']) {
      this.parserData['education'] = [];
    }

    this.parserData['education'].push({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  }

  deleteEducation(index: number) {
    if (this.parserData['education']) {
      this.parserData['education'].splice(index, 1);
    }
  }

  deleteExperience(index: number) {
    if (this.parserData['experience']) {
      this.parserData['experience'].splice(index, 1);
    }
  }

  addField() {
    const newField: DynamicField = { label: '', value: '', isEditing: true };
    this.dynamicFields.push(newField); // Add the new field
  }

  // Method to save the field after editing
  saveField(index: number) {
    const field = this.dynamicFields[index];
    if (field.label.trim() && field.value.trim()) {
      field.isEditing = false; // Save and stop editing
    }
  }

  // Method to cancel editing a field
  cancelField(index: number) {
    this.dynamicFields.splice(index, 1); // Remove the field if editing is canceled
  }
  

  // Add Language
addLanguage() {
  this.parserData['languages'].push({ language: '', proficiency_level: '' });
}

// Delete Language
deleteLanguage(index: number) {
  this.parserData['languages'].splice(index, 1);
}

// Add Certification
addCertification() {
  this.parserData['certifications'].push({ certification_name: '', issuing_organization: '', date: '' });
}

// Delete Certification
deleteCertification(index: number) {
  this.parserData['certifications'].splice(index, 1);
}

// Add Publication
addPublication() {
  this.parserData['publications'].push({ publication_title: '', publication_link: '', publication_date: '' });
}

// Delete Publication
deletePublication(index: number) {
  this.parserData['publications'].splice(index, 1);
}

  
  
addHobby() {
  if (!this.parserData['hobbies']) {
    this.parserData['hobbies'] = [];
  }
  this.parserData['hobbies'].push({ hobby: '' });
}

deleteHobby(index: number) {
  if (this.parserData['hobbies']) {
    this.parserData['hobbies'].splice(index, 1);
  }
}


togglePreview() {
  this.showPreview = !this.showPreview;
  console.log(this.showPreview , "show preview")
}


downloadResume() {
  setTimeout(() => {
    const element = document.getElementById('resume-content');
    if (element) {
      html2pdf().from(element).set({
        margin: 0, // Remove margin to minimize empty space
        filename: 'resume.pdf',
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          scrollX: 0,
          windowHeight: element.scrollHeight // Ensure full height capture
        },
        jsPDF: {
          unit: 'px',
          format: [element.offsetWidth, element.scrollHeight],
          orientation: 'portrait'
        }
      }).save();
    } else {
      console.error('resume-content not found');
    }
  }, 100);
}

}

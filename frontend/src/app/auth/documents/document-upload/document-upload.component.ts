import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';

@Component({
  standalone: true,
  selector: 'app-document-upload',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {
  file: File | null = null;
  tags = '';
  uploading = false;
  error = '';

  constructor(private documentService: DocumentService, private router: Router) {}

  onFileChange(event: any) {
    this.file = event.target.files[0] || null;
  }

  onSubmit() {
    if (!this.file) {
      this.error = 'Please select a file.';
      return;
    }
    this.uploading = true;
    this.error = '';

    this.documentService.uploadDocument(this.file, this.tags).subscribe({
      next: () => {
        this.uploading = false;
        window.alert('Document uploaded successfully');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.uploading = false;
        this.error = err.error?.message || 'Upload failed';
      }
    });
  }
}
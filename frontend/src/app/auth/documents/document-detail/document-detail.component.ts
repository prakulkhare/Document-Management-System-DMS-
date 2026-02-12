import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-document-detail',
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit {
  doc: any;
  loading = false;
  shareUserId = '';
  shareEmail = '';
  shareAccess: 'view' | 'edit' = 'view';
  error = '';

  constructor(
    private route: ActivatedRoute,
    public documentService: DocumentService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid document id';
      this.cdr.detectChanges();
      return;
    }

    setTimeout(() => {
      this.loading = true;
      this.error = '';

      this.documentService.getDocument(id).subscribe({
        next: (doc) => {
          console.log('DOC RESPONSE', doc);
          
          this.doc = Array.isArray(doc) ? doc[0] : doc;
          this.loading = false;
          this.cdr.detectChanges();
          console.log('DOC ASSIGNED', { loading: this.loading, hasDoc: !!this.doc });
        },
        error: (err) => {
          console.error('Error loading document details', err);
          this.loading = false;
          this.error =
            err?.error?.message || 'Failed to load document details';
          this.cdr.detectChanges();
        }
      });
    }, 100);
  }

  isOwnerOrAdmin(): boolean {
    const user = this.auth.getUser();
    if (!user || !this.doc) return false;
    const userId = user._id || user.id;
    return this.doc.uploadedBy === userId || user.role === 'admin';
  }

  downloadLatest() {
    if (!this.doc?._id || !this.doc?.fileName) return;
    this.documentService.downloadLatest(this.doc._id).subscribe({
      next: (blob) => {
        this.documentService.triggerDownload(blob, this.doc.fileName);
      },
      error: (err) => {
        console.error('Download failed', err);
        alert('Download failed');
      }
    });
  }

  downloadVersion(versionNumber: number) {
    if (!this.doc?._id || !this.doc?.fileName) return;
    const versionedName = `${this.doc.fileName}-v${versionNumber}`;
    this.documentService.downloadVersion(this.doc._id, versionNumber).subscribe({
      next: (blob) => {
        this.documentService.triggerDownload(blob, versionedName);
      },
      error: (err) => {
        console.error('Version download failed', err);
        alert('Version download failed');
      }
    });
  }

  share() {
    if (!this.shareEmail || !this.doc?._id) return;
    this.documentService
      .shareDocumentByEmail(this.doc._id, this.shareEmail, this.shareAccess)
      .subscribe({
        next: () => {
          this.error = '';
          this.shareEmail = '';
          alert('Document shared successfully');
        },
        error: (err) => {
          console.error('Share failed', err);
          this.error = err?.error?.message || 'Share failed';
        }
      });
  }
}
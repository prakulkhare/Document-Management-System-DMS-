import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-document-list',
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  tagFilter = '';
  keyword = '';
  loading = false;
  error = '';
  private authSub: any;

  constructor(
    public documentService: DocumentService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    this.authSub = this.auth.authState$.subscribe((authenticated: boolean) => {
      if (authenticated) {
        this.fetch();
      } else {
        this.error = 'User not authenticated';
        this.documents = [];
      }
    });
    
    this.auth.syncAuthState();
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  fetch() {
    this.loading = true;
    this.error = '';

    this.documentService
      .listDocuments({
        tag: this.tagFilter || undefined,
        keyword: this.keyword || undefined
      })
      .subscribe({
        next: (docs: any[]) => {
            console.log('Documents API response:', docs);
            this.documents = docs || [];
            this.loading = false;
            this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading documents', err);
          this.loading = false;
          this.error = err?.error?.message || 'Failed to load documents';
          this.cdr.detectChanges();
        }
      });
  }

  onSearch() {
    this.fetch();
  }

  download(doc: any) {
    if (!doc?._id || !doc?.fileName) return;
    this.documentService.downloadLatest(doc._id).subscribe({
      next: (blob: any) => {
        this.documentService.triggerDownload(blob, doc.fileName);
      },
      error: (err: any) => {
        console.error('Download error', err);
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) {}

  listDocuments(options?: {
    tag?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  }) {
    let params = new HttpParams();
    if (options?.tag) params = params.set('tag', options.tag);
    if (options?.keyword) params = params.set('keyword', options.keyword);
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());

    
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    });

    return this.http.get<any[]>(`${environment.apiUrl}/documents`, {
      params,
      headers
    });
  }

  getDocument(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/documents/${id}/details`);
  }

  uploadDocument(file: File, tags: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) formData.append('tags', tags);
    return this.http.post(`${environment.apiUrl}/documents/upload`, formData);
  }

  downloadLatest(id: string) {
    return this.http.get(`${environment.apiUrl}/documents/${id}`, {
      responseType: 'blob'
    });
  }

  downloadVersion(id: string, versionNumber: number) {
    return this.http.get(
      `${environment.apiUrl}/documents/${id}/version/${versionNumber}`,
      {
        responseType: 'blob'
      }
    );
  }

  /**
   * Helper to trigger a browser download for a Blob.
   */
  triggerDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  deleteDocument(id: string) {
    return this.http.delete(`${environment.apiUrl}/documents/${id}`);
  }

  shareDocument(id: string, userId: string, access: 'view' | 'edit') {
    return this.http.post(`${environment.apiUrl}/documents/${id}/share`, {
      userId,
      access
    });
  }

  shareDocumentByEmail(id: string, email: string, access: 'view' | 'edit') {
    return this.http.post(`${environment.apiUrl}/documents/${id}/share`, {
      email,
      access
    });
  }
}
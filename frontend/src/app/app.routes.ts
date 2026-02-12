import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DocumentListComponent } from './auth/documents/document-list/document-list.component';
import { DocumentUploadComponent } from './auth/documents/document-upload/document-upload.component';
import { DocumentDetailComponent } from './auth/documents/document-detail/document-detail.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DocumentListComponent },
      { path: 'documents/upload', component: DocumentUploadComponent },
      { path: 'documents/:id', component: DocumentDetailComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

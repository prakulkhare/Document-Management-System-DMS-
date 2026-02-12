import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  importProvidersFrom,
  inject
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const auth = inject(AuthService);
          const router = inject(Router);
          const token = auth.getToken();
          if (!token) {
            return next(req).pipe(
              catchError((error) => {
                if (error.status === 401) {
                  auth.logout();
                  router.navigate(['/login']);
                }
                return throwError(() => error);
              })
            );
          }
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next(authReq).pipe(
            catchError((error) => {
              if (error.status === 401) {
                auth.logout();
                router.navigate(['/login']);
              }
              return throwError(() => error);
            })
          );
        }
      ])
    ),
    importProvidersFrom(FormsModule)
  ]
};

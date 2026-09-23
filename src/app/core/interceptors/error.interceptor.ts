import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle 401 Unauthorized (unless logging in)
      if (error.status === 401 && !req.url.includes('/login')) {
        authService.logout();
        snackBar.open('Session expired. Please log in again.', 'Close', {
          duration: 4000,
          panelClass: ['custom-toast-error'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      } else if (error.status !== 401) {
        // Show notification toast for non-401 errors
        snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: error.error?.code === 'CAPACITY_EXCEEDED' ? ['custom-toast-error'] : ['custom-toast-error'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }

      return throwError(() => error);
    })
  );
};

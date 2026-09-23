import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../models/task.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  getSummary(): Observable<{ success: boolean; data: DashboardSummary }> {
    return this.http.get<{ success: boolean; data: DashboardSummary }>(`${this.API_URL}/summary`);
  }
}

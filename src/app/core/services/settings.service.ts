import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings } from '../models/task.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/settings`;

  getSettings(): Observable<{ success: boolean; data: Settings }> {
    return this.http.get<{ success: boolean; data: Settings }>(this.API_URL);
  }

  updateSettings(settings: { daily_sp_limit: number; weekly_sp_limit: number }): Observable<{ success: boolean; message: string; data: Settings }> {
    return this.http.put<{ success: boolean; message: string; data: Settings }>(this.API_URL, settings);
  }
}

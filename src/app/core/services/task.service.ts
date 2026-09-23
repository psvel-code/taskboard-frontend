import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

import { environment } from '../../../environments/environment';

export interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tasks`;

  getTasks(filterParams?: {
    search?: string;
    priority?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Observable<TasksResponse> {
    let params = new HttpParams();
    if (filterParams) {
      if (filterParams.search) params = params.set('search', filterParams.search);
      if (filterParams.priority && filterParams.priority !== 'All') params = params.set('priority', filterParams.priority);
      if (filterParams.status && filterParams.status !== 'All') params = params.set('status', filterParams.status);
      if (filterParams.sortBy) params = params.set('sortBy', filterParams.sortBy);
      if (filterParams.sortOrder) params = params.set('sortOrder', filterParams.sortOrder);
      if (filterParams.page) params = params.set('page', filterParams.page.toString());
      if (filterParams.limit) params = params.set('limit', filterParams.limit.toString());
    }
    return this.http.get<TasksResponse>(this.API_URL, { params });
  }

  getTaskById(id: number): Observable<{ success: boolean; data: Task }> {
    return this.http.get<{ success: boolean; data: Task }>(`${this.API_URL}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<{ success: boolean; message: string; data: Task }> {
    return this.http.post<{ success: boolean; message: string; data: Task }>(this.API_URL, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<{ success: boolean; message: string; data: Task }> {
    return this.http.put<{ success: boolean; message: string; data: Task }>(`${this.API_URL}/${id}`, task);
  }

  deleteTask(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API_URL}/${id}`);
  }
}

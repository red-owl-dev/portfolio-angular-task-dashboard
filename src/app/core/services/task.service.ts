import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiPath);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiPath}/${id}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiPath, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiPath}/${task.id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiPath}/${id}`);
  }
}

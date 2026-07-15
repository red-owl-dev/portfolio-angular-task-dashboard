import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = '/assets/data/tasks.json';

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiPath);
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiPath = 'assets/data/tasks.json';
  private tasks: Task[] = [];

  getTasks(): Observable<Task[]> {
    if (this.tasks.length > 0) {
      return of(this.tasks);
    }

    return this.http.get<Task[]>(this.apiPath).pipe(
      tap((tasks) => {
        this.tasks = tasks;
      })
    );
  }

  getTaskById(id: string): Observable<Task | undefined> {
    return this.getTasks().pipe(map((tasks) => tasks.find((task) => task.id === id)));
  }

  createTask(task: Task): Observable<Task> {
    this.tasks = [...this.tasks, task];
    return of(task);
  }

  updateTask(task: Task): Observable<Task> {
    this.tasks = this.tasks.map((item) => (item.id === task.id ? task : item));
    return of(task);
  }
}

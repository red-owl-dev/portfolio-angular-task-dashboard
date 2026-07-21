import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { ApplicationError } from '../../../core/models/application-error.model';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private readonly taskService = inject(TaskService);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private loadTasksRequest: Observable<Task[]> | null = null;

  public readonly tasks = this._tasks.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  public readonly totalTasks = computed(() => this.tasks().length);
  public readonly pendingTasks = computed(
    () => this.tasks().filter((task) => task.status === 'pending').length,
  );
  public readonly inProgressTasks = computed(
    () => this.tasks().filter((task) => task.status === 'in-progress').length,
  );
  public readonly completedTasks = computed(
    () => this.tasks().filter((task) => task.status === 'completed').length,
  );
  public readonly overdueTasks = computed(() => {
    const today = new Date();
    const currentDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');

    return this.tasks().filter((task) => task.status !== 'completed' && task.dueDate < currentDate)
      .length;
  });

  public loadTasks(): Observable<Task[]> {
    if (this.loadTasksRequest) {
      return this.loadTasksRequest;
    }

    this._loading.set(true);
    this._error.set(null);

    this.loadTasksRequest = this.taskService.getTasks().pipe(
      tap((tasks) => this._tasks.set(tasks)),
      catchError((error: unknown) => {
        this.setError('Unable to load tasks.', error);
        return of(this.tasks());
      }),
      finalize(() => {
        this.loadTasksRequest = null;
        this._loading.set(false);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return this.loadTasksRequest;
  }

  public loadTaskById(id: string): Observable<Task> {
    this._loading.set(true);
    this._error.set(null);

    return this.taskService.getTaskById(id).pipe(
      tap((task) => this.upsertTask(task)),
      catchError((error: unknown) => {
        this.setError('Unable to load task.', error);
        return throwError(() => error);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks().find((task) => task.id === id);
  }

  public createTask(task: Task): Observable<Task> {
    this._loading.set(true);
    this._error.set(null);

    return this.taskService.createTask(task).pipe(
      tap((createdTask) => this._tasks.update((tasks) => [...tasks, createdTask])),
      catchError((error: unknown) => {
        this.setError('Unable to create task.', error);
        return throwError(() => error);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  public updateTask(task: Task): Observable<Task> {
    this._loading.set(true);
    this._error.set(null);

    return this.taskService.updateTask(task).pipe(
      tap((updatedTask) => this.upsertTask(updatedTask)),
      catchError((error: unknown) => {
        this.setError('Unable to update task.', error);
        return throwError(() => error);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  public deleteTask(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.taskService.deleteTask(id).pipe(
      tap(() => this._tasks.update((tasks) => tasks.filter((task) => task.id !== id))),
      catchError((error: unknown) => {
        this.setError('Unable to delete task.', error);
        return throwError(() => error);
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  public clearError(): void {
    this._error.set(null);
  }

  private setError(contextMessage: string, error: unknown): void {
    this._error.set(`${contextMessage} ${this.getErrorMessage(error)}`);
  }

  private getErrorMessage(error: unknown): string {
    if (this.isApplicationError(error)) {
      return error.message;
    }

    return 'Unable to complete the request.';
  }

  private isApplicationError(error: unknown): error is ApplicationError {
    return typeof error === 'object' && error !== null && 'message' in error;
  }

  private upsertTask(task: Task): void {
    this._tasks.update((tasks) => {
      const taskExists = tasks.some((item) => item.id === task.id);
      return taskExists
        ? tasks.map((item) => (item.id === task.id ? task : item))
        : [...tasks, task];
    });
  }
}

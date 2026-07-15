import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskStore {
  private readonly taskService = inject(TaskService);

  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _initialized = signal(false);

  public readonly tasks = this._tasks.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();

  public readonly totalTasks = computed(() => this.tasks().length);
  public readonly pendingTasks = computed(() => this.tasks().filter((task) => task.status === 'pending').length);
  public readonly inProgressTasks = computed(() => this.tasks().filter((task) => task.status === 'in-progress').length);
  public readonly completedTasks = computed(() => this.tasks().filter((task) => task.status === 'completed').length);
  public readonly overdueTasks = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.tasks().filter((task) => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return task.status !== 'completed' && dueDate < today;
    }).length;
  });

  public loadTasks(): Observable<Task[]> {
    if (this._initialized()) {
      return of(this.tasks());
    }

    this._loading.set(true);
    this._error.set(null);

    return this.taskService.getTasks().pipe(
      tap((tasks) => this._tasks.set(tasks)),
      catchError(() => {
        this._error.set('Não foi possível carregar tarefas.');
        this._tasks.set([]);
        return of([] as Task[]);
      }),
      finalize(() => {
        this._initialized.set(true);
        this._loading.set(false);
      })
    );
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks().find((task) => task.id === id);
  }

  public createTask(task: Task): void {
    this._tasks.update((tasks) => [...tasks, task]);
  }

  public updateTask(task: Task): void {
    this._tasks.update((tasks) => tasks.map((item) => (item.id === task.id ? task : item)));
  }

  public deleteTask(id: string): void {
    this._tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  public clearError(): void {
    this._error.set(null);
  }
}

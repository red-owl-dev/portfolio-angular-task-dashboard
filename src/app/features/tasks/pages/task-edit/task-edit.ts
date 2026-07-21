import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskForm, TaskFormValue } from '../../components/task-form/task-form';
import { TaskStore } from '../../state/task.store';

@Component({
  selector: 'app-task-edit',
  standalone: true,
  imports: [CommonModule, TaskForm],
  templateUrl: './task-edit.html',
  styleUrls: ['./task-edit.scss'],
})
export class TaskEdit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taskStore = inject(TaskStore);

  public readonly loading = signal(true);
  public readonly saving = signal(false);
  public readonly error = this.taskStore.error;
  public readonly task = signal<Task | undefined>(undefined);

  constructor() {
    this.loadTask();
  }

  protected onSave(formValue: TaskFormValue): void {
    if (this.saving()) {
      return;
    }

    const existingTask = this.task();
    if (!existingTask) {
      return;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...formValue,
    };

    this.saving.set(true);
    this.taskStore.clearError();

    this.taskStore.updateTask(updatedTask).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => this.saving.set(false),
    });
  }

  protected clearError(): void {
    this.taskStore.clearError();
  }

  protected onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private loadTask(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id')),
        switchMap((params) => {
          const id = params.get('id') ?? '';
          const storedTask = this.taskStore.getTaskById(id);
          return storedTask ? of(storedTask) : this.taskStore.loadTaskById(id);
        }),
        tap((task) => {
          this.task.set(task);
          this.loading.set(false);
        }),
        catchError(() => {
          this.loading.set(false);
          return of(undefined);
        }),
      )
      .subscribe();
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { TaskForm, TaskFormValue } from '../../components/task-form/task-form';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task.model';

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
  private readonly taskService = inject(TaskService);

  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly task = signal<Task | undefined>(undefined);
  public readonly missingTask = computed(() => !this.loading() && !!this.error());

  constructor() {
    this.loadTask();
  }

  protected onSave(formValue: TaskFormValue): void {
    const existingTask = this.task();
    if (!existingTask) {
      return;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...formValue,
    };

    this.taskService.updateTask(updatedTask).pipe(
      tap(() => this.router.navigate(['/tasks']))
    ).subscribe();
  }

  protected onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private loadTask(): void {
    this.route.paramMap
      .pipe(
        filter((params) => params.has('id')),
        switchMap((params) => this.taskService.getTaskById(params.get('id') ?? '')),
        tap((task) => {
          if (!task) {
            this.error.set('Tarefa não encontrada.');
          }
          this.task.set(task);
          this.loading.set(false);
        }),
        catchError(() => {
          this.error.set('Não foi possível carregar a tarefa.');
          this.loading.set(false);
          return of(undefined);
        })
      )
      .subscribe();
  }
}

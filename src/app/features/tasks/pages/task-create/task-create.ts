import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskForm, TaskFormValue } from '../../components/task-form/task-form';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [CommonModule, TaskForm],
  templateUrl: './task-create.html',
  styleUrls: ['./task-create.scss'],
})
export class TaskCreate {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  protected onSave(formValue: TaskFormValue): void {
    const task: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...formValue,
    };

    this.taskService.createTask(task).subscribe(() => {
      this.router.navigate(['/tasks']);
    });
  }

  protected onCancel(): void {
    this.router.navigate(['/tasks']);
  }
}

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskPriority, TaskStatus } from '../../../../core/models/task.model';

export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss'],
})
export class TaskForm implements OnChanges {
  @Input() task?: Task;
  @Output() save = new EventEmitter<TaskFormValue>();
  @Output() cancel = new EventEmitter<void>();

  public readonly statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'in-progress', label: 'Em progresso' },
    { value: 'completed', label: 'Concluída' },
  ];

  public readonly priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ];

  public form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      description: ['', [Validators.maxLength(300)]],
      status: ['pending' as TaskStatus, [Validators.required]],
      priority: ['medium' as TaskPriority, [Validators.required]],
      assignee: [''],
      dueDate: ['', [Validators.required]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']) {
      this.updateForm();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  private updateForm(): void {
    if (!this.task) {
      this.form.reset({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignee: '',
        dueDate: '',
      });
      return;
    }

    this.form.setValue({
      title: this.task.title,
      description: this.task.description,
      status: this.task.status,
      priority: this.task.priority,
      assignee: this.task.assignee ?? '',
      dueDate: this.task.dueDate,
    });
  }
}

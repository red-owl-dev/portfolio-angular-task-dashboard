import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../core/models/task.model';

const statusLabels = {
  pending: 'Pendente',
  'in-progress': 'Em progresso',
  completed: 'Concluída',
} as const;

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
} as const;

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.scss'],
})
export class TaskCard {
  @Input() task!: Task;

  readonly statusLabels = statusLabels;
  readonly priorityLabels = priorityLabels;
}

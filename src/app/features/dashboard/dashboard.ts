import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Task } from '../../core/models/task.model';
import { TaskStore } from '../tasks/state/task.store';
import { SummaryCard } from './components/summary-card/summary-card';

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, SummaryCard],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  private readonly taskStore = inject(TaskStore);

  public readonly loading = this.taskStore.loading;
  public readonly error = this.taskStore.error;
  public readonly totalTasks = this.taskStore.totalTasks;
  public readonly pendingTasks = this.taskStore.pendingTasks;
  public readonly inProgressTasks = this.taskStore.inProgressTasks;
  public readonly completedTasks = this.taskStore.completedTasks;
  public readonly overdueTasks = this.taskStore.overdueTasks;
  public readonly priorityLabels = priorityLabels;

  public readonly upcomingTasks = computed(() => {
    return this.taskStore
      .tasks()
      .filter((task) => task.status !== 'completed')
      .sort((a, b) => this.sortByDueDate(a, b))
      .slice(0, 5);
  });

  public readonly hasTasks = computed(() => this.totalTasks() > 0);

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    this.taskStore.loadTasks().subscribe();
  }

  private sortByDueDate(a: Task, b: Task): number {
    const firstDueDate = new Date(a.dueDate);
    const secondDueDate = new Date(b.dueDate);

    firstDueDate.setHours(0, 0, 0, 0);
    secondDueDate.setHours(0, 0, 0, 0);

    const firstTime = firstDueDate.getTime();
    const secondTime = secondDueDate.getTime();

    if (firstTime === secondTime) {
      return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' });
    }

    return firstTime - secondTime;
  }
}

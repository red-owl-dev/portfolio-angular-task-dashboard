import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { TaskCard } from './components/task-card/task-card';

const statusOptions: { value: TaskStatus | null; label: string }[] = [
  { value: null, label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'in-progress', label: 'Em progresso' },
  { value: 'completed', label: 'Concluída' },
];

const priorityOptions: { value: TaskPriority | null; label: string }[] = [
  { value: null, label: 'Todas as prioridades' },
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const sortOptions = [
  { value: 'nearest', label: 'Prazo mais próximo' },
  { value: 'furthest', label: 'Prazo mais distante' },
  { value: 'title', label: 'Título' },
  { value: 'priority', label: 'Prioridade' },
] as const;

type SortOption = (typeof sortOptions)[number]['value'];

const priorityOrder: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskCard],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.scss'],
})
export class Tasks {
  public readonly searchTerm = signal('');
  public readonly selectedStatus = signal<TaskStatus | null>(null);
  public readonly selectedPriority = signal<TaskPriority | null>(null);
  public readonly sortOption = signal<SortOption>('nearest');
  public readonly loading = signal(true);
  public readonly error = signal<string | null>(null);
  public readonly tasks = signal<Task[]>([]);

  public readonly filteredTasks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();
    const priority = this.selectedPriority();
    const option = this.sortOption();

    const filtered = this.tasks().filter((task) => {
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term);

      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      if (option === 'nearest') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (option === 'furthest') {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (option === 'title') {
        return a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' });
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  });

  public readonly resultCount = computed(() => this.filteredTasks().length);
  public readonly statusOptions = signal(statusOptions);
  public readonly priorityOptions = signal(priorityOptions);
  public readonly sortOptions = signal(sortOptions);

  private readonly taskService = inject(TaskService);

  constructor() {
    this.loadTasks();
  }

  public clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    this.selectedPriority.set(null);
    this.sortOption.set('nearest');
  }

  private loadTasks(): void {
    this.taskService
      .getTasks()
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError(() => {
          this.error.set('Não foi possível carregar tarefas.');
          this.tasks.set([]);
          return of([] as Task[]);
        })
      )
      .subscribe((tasks) => this.tasks.set(tasks));
  }
}

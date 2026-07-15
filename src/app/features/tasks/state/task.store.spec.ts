import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskStore } from './task.store';

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Tarefa 1',
    description: 'Primeira tarefa',
    status: 'pending',
    priority: 'medium',
    assignee: 'Ana',
    dueDate: '2026-08-01',
    createdAt: '2026-07-01',
  },
  {
    id: 'task-002',
    title: 'Tarefa 2',
    description: 'Segunda tarefa',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bruno',
    dueDate: '2026-07-20',
    createdAt: '2026-07-02',
  },
  {
    id: 'task-003',
    title: 'Tarefa 3',
    description: 'Terceira tarefa',
    status: 'completed',
    priority: 'low',
    assignee: null,
    dueDate: '2026-06-30',
    createdAt: '2026-06-20',
  },
];

describe('TaskStore', () => {
  let store: TaskStore;
  let taskService: { getTasks: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    taskService = {
      getTasks: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TaskStore,
        {
          provide: TaskService,
          useValue: taskService,
        },
      ],
    });

    store = TestBed.inject(TaskStore);
  });

  it('should load tasks', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    const tasks = await firstValueFrom(store.loadTasks());

    expect(tasks).toEqual(mockTasks);
    expect(store.totalTasks()).toBe(3);
    expect(store.pendingTasks()).toBe(1);
    expect(store.inProgressTasks()).toBe(1);
    expect(store.completedTasks()).toBe(1);
    expect(store.overdueTasks()).toBe(0);
    expect(store.error()).toBeNull();
    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should not reload tasks after initialization', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    await firstValueFrom(store.loadTasks());
    await firstValueFrom(store.loadTasks());

    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
  });

  it('should create a task', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    await firstValueFrom(store.loadTasks());

    const newTask: Task = {
      id: 'task-004',
      title: 'Tarefa 4',
      description: 'Nova tarefa',
      status: 'pending',
      priority: 'low',
      assignee: 'Carlos',
      dueDate: '2026-08-05',
      createdAt: '2026-07-03',
    };

    store.createTask(newTask);
    expect(store.totalTasks()).toBe(4);
    expect(store.getTaskById('task-004')).toEqual(newTask);
  });

  it('should update the correct task', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    await firstValueFrom(store.loadTasks());

    const updatedTask: Task = {
      ...mockTasks[1],
      title: 'Tarefa 2 atualizada',
      status: 'completed',
    };

    store.updateTask(updatedTask);
    expect(store.getTaskById('task-002')?.title).toBe('Tarefa 2 atualizada');
    expect(store.getTaskById('task-002')?.status).toBe('completed');
    expect(store.completedTasks()).toBe(2);
  });

  it('should delete a task', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    await firstValueFrom(store.loadTasks());

    store.deleteTask('task-001');
    expect(store.getTaskById('task-001')).toBeUndefined();
    expect(store.totalTasks()).toBe(2);
  });

  it('should return the correct task by id', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    await firstValueFrom(store.loadTasks());

    const task = store.getTaskById('task-003');
    expect(task).toEqual(mockTasks[2]);
  });

  it('should update error state when load fails', async () => {
    taskService.getTasks.mockReturnValue(throwError(() => new Error('Falha')));

    const tasks = await firstValueFrom(store.loadTasks());

    expect(tasks).toEqual([]);
    expect(store.error()).toBe('Não foi possível carregar tarefas.');
    expect(store.totalTasks()).toBe(0);
  });
});

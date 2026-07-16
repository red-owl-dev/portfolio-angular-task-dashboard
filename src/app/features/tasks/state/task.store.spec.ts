import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApplicationError } from '../../../core/models/application-error.model';
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

interface TaskServiceStub {
  getTasks: ReturnType<typeof vi.fn>;
  getTaskById: ReturnType<typeof vi.fn>;
  createTask: ReturnType<typeof vi.fn>;
  updateTask: ReturnType<typeof vi.fn>;
  deleteTask: ReturnType<typeof vi.fn>;
}

function applicationError(message = 'Unable to complete the request.'): ApplicationError {
  return { message, status: 500 };
}

describe('TaskStore', () => {
  let store: TaskStore;
  let taskService: TaskServiceStub;

  beforeEach(() => {
    taskService = {
      getTasks: vi.fn(),
      getTaskById: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
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

  async function loadInitialTasks(): Promise<void> {
    taskService.getTasks.mockReturnValue(of(mockTasks));
    await firstValueFrom(store.loadTasks());
  }

  it('should load tasks successfully', async () => {
    taskService.getTasks.mockReturnValue(of(mockTasks));

    const tasks = await firstValueFrom(store.loadTasks());

    expect(tasks).toEqual(mockTasks);
    expect(store.tasks()).toEqual(mockTasks);
    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(false);
  });

  it('should keep previous tasks when loading fails', async () => {
    await loadInitialTasks();
    taskService.getTasks.mockReturnValueOnce(throwError(() => applicationError('Unable to connect to the server.')));

    const tasks = await firstValueFrom(store.loadTasks());

    expect(tasks).toEqual(mockTasks);
    expect(store.tasks()).toEqual(mockTasks);
    expect(store.error()).toBe('Unable to load tasks. Unable to connect to the server.');
    expect(store.loading()).toBe(false);
  });

  it('should avoid duplicate task loading while a request is in flight', async () => {
    const request = new Subject<Task[]>();
    taskService.getTasks.mockReturnValue(request.asObservable());

    const firstRequest = firstValueFrom(store.loadTasks());
    const secondRequest = firstValueFrom(store.loadTasks());
    request.next(mockTasks);
    request.complete();

    await expect(firstRequest).resolves.toEqual(mockTasks);
    await expect(secondRequest).resolves.toEqual(mockTasks);
    expect(taskService.getTasks).toHaveBeenCalledTimes(1);
    expect(store.loading()).toBe(false);
  });

  it('should expose computed signals from loaded tasks', async () => {
    await loadInitialTasks();

    expect(store.totalTasks()).toBe(3);
    expect(store.pendingTasks()).toBe(1);
    expect(store.inProgressTasks()).toBe(1);
    expect(store.completedTasks()).toBe(1);
    expect(store.overdueTasks()).toBeGreaterThanOrEqual(0);
  });

  it('should create a task successfully', async () => {
    await loadInitialTasks();
    const createdTask: Task = {
      id: 'task-004',
      title: 'Tarefa criada pela API',
      description: 'Nova tarefa',
      status: 'pending',
      priority: 'low',
      assignee: 'Carlos',
      dueDate: '2026-08-05',
      createdAt: '2026-07-03',
    };
    taskService.createTask.mockReturnValue(of(createdTask));

    const result = await firstValueFrom(store.createTask({ ...createdTask, title: 'Titulo enviado' }));

    expect(result).toEqual(createdTask);
    expect(store.totalTasks()).toBe(4);
    expect(store.getTaskById('task-004')).toEqual(createdTask);
  });

  it('should not add a task when creation fails', async () => {
    await loadInitialTasks();
    const error = applicationError();
    taskService.createTask.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(store.createTask(mockTasks[0]))).rejects.toBe(error);

    expect(store.tasks()).toEqual(mockTasks);
    expect(store.error()).toBe('Unable to create task. Unable to complete the request.');
    expect(store.loading()).toBe(false);
  });

  it('should update a task successfully', async () => {
    await loadInitialTasks();
    const updatedTask: Task = {
      ...mockTasks[1],
      title: 'Tarefa 2 atualizada',
      status: 'completed',
    };
    taskService.updateTask.mockReturnValue(of(updatedTask));

    await firstValueFrom(store.updateTask(updatedTask));

    expect(store.getTaskById('task-002')).toEqual(updatedTask);
    expect(store.completedTasks()).toBe(2);
  });

  it('should not change an existing task when update fails', async () => {
    await loadInitialTasks();
    const error = applicationError();
    taskService.updateTask.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(store.updateTask({ ...mockTasks[0], title: 'Alterada' }))).rejects.toBe(error);

    expect(store.getTaskById('task-001')).toEqual(mockTasks[0]);
    expect(store.error()).toBe('Unable to update task. Unable to complete the request.');
    expect(store.loading()).toBe(false);
  });

  it('should delete a task successfully', async () => {
    await loadInitialTasks();
    taskService.deleteTask.mockReturnValue(of(undefined));

    await firstValueFrom(store.deleteTask('task-001'));

    expect(store.getTaskById('task-001')).toBeUndefined();
    expect(store.totalTasks()).toBe(2);
  });

  it('should not remove a task when deletion fails', async () => {
    await loadInitialTasks();
    const error = applicationError();
    taskService.deleteTask.mockReturnValue(throwError(() => error));

    await expect(firstValueFrom(store.deleteTask('task-001'))).rejects.toBe(error);

    expect(store.getTaskById('task-001')).toEqual(mockTasks[0]);
    expect(store.error()).toBe('Unable to delete task. Unable to complete the request.');
    expect(store.loading()).toBe(false);
  });

  it('should clear error message', async () => {
    taskService.getTasks.mockReturnValue(throwError(() => applicationError()));

    await firstValueFrom(store.loadTasks());
    store.clearError();

    expect(store.error()).toBeNull();
  });
});

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Task } from '../../../../core/models/task.model';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskStore } from '../../state/task.store';
import { TaskEdit } from './task-edit';

const task: Task = {
  id: 'task-001',
  title: 'Planejar sprint',
  description: 'Definir prioridades',
  status: 'pending',
  priority: 'medium',
  assignee: 'Ana',
  dueDate: '2026-08-01',
  createdAt: '2026-07-01',
};

function createTaskStoreStub(options?: { storedTask?: Task }) {
  const errorSignal = signal<string | null>(null);

  return {
    error: errorSignal.asReadonly(),
    getTaskById: vi.fn(() => options?.storedTask),
    loadTaskById: vi.fn(),
    updateTask: vi.fn(),
    clearError: vi.fn(() => errorSignal.set(null)),
    setError: (message: string) => errorSignal.set(message),
  };
}

describe('TaskEdit', () => {
  let fixture: ComponentFixture<TaskEdit>;
  let taskStore: ReturnType<typeof createTaskStoreStub>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  async function createComponent(options?: { storedTask?: Task; loadError?: boolean }) {
    TestBed.resetTestingModule();
    taskStore = createTaskStoreStub({ storedTask: options?.storedTask });
    router = { navigate: vi.fn() };

    if (options?.loadError) {
      taskStore.loadTaskById.mockImplementation(() => {
        taskStore.setError('Unable to load task. The requested resource was not found.');
        return throwError(() => new Error('Not found'));
      });
    } else {
      taskStore.loadTaskById.mockReturnValue(of(task));
    }

    await TestBed.configureTestingModule({
      imports: [TaskEdit],
      providers: [
        { provide: TaskStore, useValue: taskStore },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: task.id })),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskEdit);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function taskForm(): TaskForm {
    return fixture.debugElement.query(By.directive(TaskForm)).componentInstance;
  }

  function submitUpdatedTask(): void {
    taskForm().form.patchValue({
      title: 'Planejar sprint atualizada',
      dueDate: '2026-08-15',
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should navigate after successful editing', async () => {
    await createComponent({ storedTask: task });
    const request = new Subject<Task>();
    taskStore.updateTask.mockReturnValue(request.asObservable());

    submitUpdatedTask();
    expect(router.navigate).not.toHaveBeenCalled();

    request.next({ ...task, title: 'Planejar sprint atualizada' });
    request.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should show editing error', async () => {
    await createComponent({ storedTask: task });
    taskStore.updateTask.mockImplementation(() => {
      taskStore.setError('Unable to update task. Unable to complete the request.');
      return throwError(() => new Error('Falha'));
    });

    submitUpdatedTask();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Unable to update task.');
  });

  it('should show message when task does not exist', async () => {
    await createComponent({ loadError: true });

    expect(taskStore.loadTaskById).toHaveBeenCalledWith(task.id);
    expect(fixture.nativeElement.textContent).toContain('Unable to load task.');
    expect(fixture.debugElement.query(By.directive(TaskForm))).toBeNull();
  });

  it('should prevent multiple submits while saving', async () => {
    await createComponent({ storedTask: task });
    const request = new Subject<Task>();
    taskStore.updateTask.mockReturnValue(request.asObservable());

    submitUpdatedTask();
    submitUpdatedTask();

    expect(taskStore.updateTask).toHaveBeenCalledTimes(1);
  });
});

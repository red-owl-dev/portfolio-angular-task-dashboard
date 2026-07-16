import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Task } from '../../../../core/models/task.model';
import { TaskForm } from '../../components/task-form/task-form';
import { TaskStore } from '../../state/task.store';
import { TaskCreate } from './task-create';

function createTaskStoreStub() {
  const errorSignal = signal<string | null>(null);

  return {
    error: errorSignal.asReadonly(),
    createTask: vi.fn(),
    clearError: vi.fn(() => errorSignal.set(null)),
    setError: (message: string) => errorSignal.set(message),
  };
}

describe('TaskCreate', () => {
  let fixture: ComponentFixture<TaskCreate>;
  let taskStore: ReturnType<typeof createTaskStoreStub>;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    taskStore = createTaskStoreStub();
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TaskCreate],
      providers: [
        { provide: TaskStore, useValue: taskStore },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCreate);
    fixture.detectChanges();
  });

  function taskForm(): TaskForm {
    return fixture.debugElement.query(By.directive(TaskForm)).componentInstance;
  }

  function fillAndSubmit(): void {
    taskForm().form.setValue({
      title: 'Nova tarefa',
      description: 'Criar fluxo',
      status: 'pending',
      priority: 'medium',
      assignee: 'Ana',
      dueDate: '2026-08-10',
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should navigate after successful creation', () => {
    const request = new Subject<Task>();
    taskStore.createTask.mockReturnValue(request.asObservable());

    fillAndSubmit();
    expect(router.navigate).not.toHaveBeenCalled();

    request.next({ id: 'task-001' } as Task);
    request.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should show creation error', () => {
    taskStore.createTask.mockImplementation(() => {
      taskStore.setError('Unable to create task. Unable to complete the request.');
      return throwError(() => new Error('Falha'));
    });

    fillAndSubmit();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Unable to create task.');
  });

  it('should prevent multiple submits while saving', () => {
    const request = new Subject<Task>();
    taskStore.createTask.mockReturnValue(request.asObservable());

    fillAndSubmit();
    fillAndSubmit();

    expect(taskStore.createTask).toHaveBeenCalledTimes(1);
  });
});

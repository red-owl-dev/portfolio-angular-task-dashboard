import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Task } from '../../core/models/task.model';
import { TaskStore } from './state/task.store';
import { Tasks } from './tasks';

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Planejar sprint de marketing',
    description: 'Definir prioridades e metas para a proxima sprint de marketing.',
    status: 'pending',
    priority: 'medium',
    assignee: 'Ana',
    dueDate: '2026-08-10',
    createdAt: '2026-07-10',
  },
  {
    id: 'task-002',
    title: 'Corrigir bugs de autenticacao',
    description: 'Verificar e corrigir comportamento do login social.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bruno',
    dueDate: '2026-07-18',
    createdAt: '2026-07-05',
  },
  {
    id: 'task-003',
    title: 'Atualizar documentacao',
    description: 'Revisar informacoes tecnicas e capturas de tela.',
    status: 'completed',
    priority: 'low',
    assignee: null,
    dueDate: '2026-07-01',
    createdAt: '2026-06-20',
  },
];

@Component({ standalone: true, template: '' })
class EmptyRoute {}

function createTaskStoreStub(options?: { tasks?: Task[]; loading?: boolean; error?: string | null }) {
  const tasksSignal = signal(options?.tasks ?? mockTasks);
  const loadingSignal = signal(options?.loading ?? false);
  const errorSignal = signal(options?.error ?? null);

  return {
    tasks: tasksSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    loadTasks: vi.fn(() => of(tasksSignal())),
    deleteTask: vi.fn((id: string) => {
      tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
      return of(undefined);
    }),
    clearError: vi.fn(() => errorSignal.set(null)),
  };
}

describe('Tasks', () => {
  let fixture: ComponentFixture<Tasks>;
  let component: Tasks;
  let taskStore: ReturnType<typeof createTaskStoreStub>;

  async function createComponent(options?: { tasks?: Task[]; loading?: boolean; error?: string | null }) {
    TestBed.resetTestingModule();
    taskStore = createTaskStoreStub(options);

    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideRouter([
          { path: 'tasks/new', component: EmptyRoute },
          { path: 'tasks/:id/edit', component: EmptyRoute },
        ]),
        {
          provide: TaskStore,
          useValue: taskStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function taskCards(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.task-card');
  }

  it('should show loading state', async () => {
    await createComponent({ tasks: [], loading: true });

    expect(fixture.nativeElement.textContent).toContain('Carregando tarefas');
  });

  it('should show error state', async () => {
    await createComponent({ error: 'Unable to load tasks.' });

    expect(fixture.nativeElement.querySelector('.status-message.error').textContent).toContain('Unable to load tasks.');
  });

  it('should clear error message', async () => {
    await createComponent({ error: 'Unable to load tasks.' });

    fixture.nativeElement.querySelector('.status-message__close').click();
    fixture.detectChanges();

    expect(taskStore.clearError).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.status-message.error')).toBeFalsy();
  });

  it('should show empty state', async () => {
    await createComponent({ tasks: [] });

    expect(fixture.nativeElement.querySelector('.empty-state').textContent).toContain('Nenhuma tarefa encontrada');
  });

  it('should render task list', async () => {
    await createComponent();

    expect(taskCards().length).toBe(3);
    expect(taskCards()[0].textContent).toContain('Atualizar documentacao');
  });

  it('should search tasks', async () => {
    await createComponent();

    component.searchTerm.set('planejar');
    fixture.detectChanges();

    expect(taskCards().length).toBe(1);
    expect(taskCards()[0].textContent).toContain('Planejar sprint de marketing');
  });

  it('should combine status and priority filters', async () => {
    await createComponent();

    component.selectedStatus.set('in-progress');
    component.selectedPriority.set('high');
    fixture.detectChanges();

    expect(taskCards().length).toBe(1);
    expect(taskCards()[0].textContent).toContain('Corrigir bugs de autenticacao');
  });

  it('should sort tasks by title', async () => {
    await createComponent();

    component.sortOption.set('title');
    fixture.detectChanges();

    const titles = Array.from(fixture.nativeElement.querySelectorAll('.task-card .task-card__title') as NodeListOf<HTMLElement>).map(
      (item) => item.textContent?.trim()
    );
    expect(titles).toEqual(['Atualizar documentacao', 'Corrigir bugs de autenticacao', 'Planejar sprint de marketing']);
  });

  it('should clear filters', async () => {
    await createComponent();

    component.searchTerm.set('planejar');
    component.selectedStatus.set('pending');
    component.clearFilters();
    fixture.detectChanges();

    expect(taskCards().length).toBe(3);
  });

  it('should expose navigation link for task creation', async () => {
    await createComponent();

    const link = fixture.nativeElement.querySelector('.primary-button') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('new');
  });

  it('should expose navigation link for task editing', async () => {
    await createComponent();

    const link = fixture.nativeElement.querySelector('.edit-button') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/tasks/task-003/edit');
  });

  it('should delete a task after confirmation', async () => {
    await createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture.nativeElement.querySelector('.delete-button').click();
    fixture.detectChanges();

    expect(taskStore.deleteTask).toHaveBeenCalledWith('task-003');
    expect(taskCards().length).toBe(2);
  });

  it('should not delete a task when confirmation is rejected', async () => {
    await createComponent();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    fixture.nativeElement.querySelector('.delete-button').click();

    expect(taskStore.deleteTask).not.toHaveBeenCalled();
  });
});

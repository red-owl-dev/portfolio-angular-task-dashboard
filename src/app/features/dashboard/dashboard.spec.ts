import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { Task } from '../../core/models/task.model';
import { TaskStore } from '../tasks/state/task.store';
import { Dashboard } from './dashboard';

const baseTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Planejar sprint',
    description: 'Definir o escopo da sprint.',
    status: 'pending',
    priority: 'medium',
    assignee: 'Ana',
    dueDate: '2026-07-20',
    createdAt: '2026-07-10',
  },
  {
    id: 'task-002',
    title: 'Corrigir bugs',
    description: 'Ajustar falhas críticas.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bruno',
    dueDate: '2026-07-18',
    createdAt: '2026-07-11',
  },
  {
    id: 'task-003',
    title: 'Documentar fluxo',
    description: 'Atualizar a documentação.',
    status: 'completed',
    priority: 'low',
    assignee: null,
    dueDate: '2026-07-12',
    createdAt: '2026-07-05',
  },
  {
    id: 'task-004',
    title: 'Revisar API',
    description: 'Validar mudanças da API.',
    status: 'pending',
    priority: 'high',
    assignee: 'Carla',
    dueDate: '2026-07-16',
    createdAt: '2026-07-09',
  },
  {
    id: 'task-005',
    title: 'Preparar demo',
    description: 'Montar apresentação.',
    status: 'pending',
    priority: 'medium',
    assignee: 'Daniel',
    dueDate: '2026-07-21',
    createdAt: '2026-07-08',
  },
  {
    id: 'task-006',
    title: 'Ajustar métricas',
    description: 'Conferir indicadores.',
    status: 'in-progress',
    priority: 'low',
    assignee: 'Eva',
    dueDate: '2026-07-15',
    createdAt: '2026-07-07',
  },
];

function createTaskStoreStub(
  tasks: Task[],
  options?: { loading?: boolean; error?: string | null },
) {
  const tasksSignal = signal(tasks);
  const loadingSignal = signal(options?.loading ?? false);
  const errorSignal = signal(options?.error ?? null);

  return {
    tasks: tasksSignal.asReadonly(),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    totalTasks: signal(tasks.length).asReadonly(),
    pendingTasks: signal(tasks.filter((task) => task.status === 'pending').length).asReadonly(),
    inProgressTasks: signal(
      tasks.filter((task) => task.status === 'in-progress').length,
    ).asReadonly(),
    completedTasks: signal(tasks.filter((task) => task.status === 'completed').length).asReadonly(),
    overdueTasks: signal(
      tasks.filter(
        (task) =>
          task.status !== 'completed' &&
          new Date(task.dueDate).getTime() < Date.parse('2026-07-15'),
      ).length,
    ).asReadonly(),
    loadTasks: vi.fn(() => of(tasks)),
  };
}

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  async function createComponent(
    tasks: Task[] = baseTasks,
    options?: { loading?: boolean; error?: string | null },
  ) {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: TaskStore,
          useValue: createTaskStoreStub(tasks, options),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  }

  it('should show summary card values', async () => {
    await createComponent();

    const cards = Array.from(
      fixture.nativeElement.querySelectorAll('.summary-card') as NodeListOf<HTMLElement>,
    );
    expect(cards.length).toBe(5);
    expect(cards[0].textContent).toContain('6');
    expect(cards[1].textContent).toContain('3');
    expect(cards[2].textContent).toContain('2');
    expect(cards[3].textContent).toContain('1');
    expect(cards[4].textContent).toContain('0');
  });

  it('should show loading state', async () => {
    await createComponent([], { loading: true });

    const loading = fixture.nativeElement.querySelector('.dashboard__state');
    expect(loading).toBeTruthy();
    expect(loading.textContent).toContain('Carregando tarefas');
  });

  it('should show error state', async () => {
    await createComponent([], { error: 'Falha ao carregar' });

    const error = fixture.nativeElement.querySelector('.dashboard__state--error');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Falha ao carregar');
  });

  it('should show empty state', async () => {
    await createComponent([]);

    const empty = fixture.nativeElement.querySelector('.dashboard__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Nenhuma tarefa cadastrada');
  });

  it('should order upcoming tasks by due date', async () => {
    await createComponent();

    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.upcoming-task h3') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim());

    expect(titles).toEqual([
      'Ajustar métricas',
      'Revisar API',
      'Corrigir bugs',
      'Planejar sprint',
      'Preparar demo',
    ]);
  });

  it('should limit upcoming tasks to five items', async () => {
    await createComponent();

    const items = fixture.nativeElement.querySelectorAll('.upcoming-list__item');
    expect(items.length).toBe(5);
  });

  it('should exclude completed tasks from upcoming tasks', async () => {
    await createComponent();

    const content = fixture.nativeElement.querySelector('.upcoming-list')?.textContent ?? '';
    expect(content).not.toContain('Documentar fluxo');
  });
});

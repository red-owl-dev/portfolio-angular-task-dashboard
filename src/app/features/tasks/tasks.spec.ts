import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Tasks } from './tasks';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { of } from 'rxjs';

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Planejar sprint de marketing',
    description: 'Definir prioridades e metas para a próxima sprint de marketing.',
    status: 'pending',
    priority: 'medium',
    assignee: 'Ana',
    dueDate: '2026-08-10',
    createdAt: '2026-07-10',
  },
  {
    id: 'task-002',
    title: 'Corrigir bugs de autenticação',
    description: 'Verificar e corrigir comportamento do login social.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bruno',
    dueDate: '2026-07-18',
    createdAt: '2026-07-05',
  },
  {
    id: 'task-003',
    title: 'Atualizar documentação',
    description: 'Revisar informações técnicas e capturas de tela.',
    status: 'completed',
    priority: 'low',
    assignee: null,
    dueDate: '2026-07-01',
    createdAt: '2026-06-20',
  },
];

describe('Tasks', () => {
  let fixture: ComponentFixture<Tasks>;
  let component: Tasks;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideRouter([]),
        {
          provide: TaskService,
          useValue: {
            getTasks: () => of(mockTasks),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve filtrar por título', async () => {
    component.searchTerm.set('planejar');
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Planejar sprint de marketing');
  });

  it('deve filtrar por status', async () => {
    component.selectedStatus.set('pending');
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Pendente');
  });

  it('deve filtrar por prioridade', async () => {
    component.selectedPriority.set('high');
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Alta');
  });

  it('deve combinar filtros', async () => {
    component.searchTerm.set('documentação');
    component.selectedStatus.set('completed');
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Atualizar documentação');
  });

  it('deve limpar filtros', async () => {
    component.searchTerm.set('planejar');
    component.selectedStatus.set('pending');
    component.clearFilters();
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card');
    expect(items.length).toBe(3);
  });

  it('deve ordenar por título', async () => {
    component.sortOption.set('title');
    fixture.detectChanges();
    await fixture.whenStable();

    const items = fixture.nativeElement.querySelectorAll('.task-card .task-card__title');
    expect(items[0].textContent.trim()).toBe('Atualizar documentação');
    expect(items[1].textContent.trim()).toBe('Corrigir bugs de autenticação');
    expect(items[2].textContent.trim()).toBe('Planejar sprint de marketing');
  });

  it('deve exibir estado vazio', async () => {
    component.searchTerm.set('azul');
    fixture.detectChanges();
    await fixture.whenStable();

    const empty = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('Nenhuma tarefa encontrada');
  });
});

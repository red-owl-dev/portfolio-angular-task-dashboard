import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from '../../../../core/models/task.model';
import { TaskForm } from './task-form';

const task: Task = {
  id: 'task-001',
  title: 'Planejar sprint',
  description: 'Definir prioridades',
  status: 'in-progress',
  priority: 'high',
  assignee: 'Ana',
  dueDate: '2026-08-01',
  createdAt: '2026-07-01',
};

describe('TaskForm', () => {
  let fixture: ComponentFixture<TaskForm>;
  let component: TaskForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function submitForm(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function fillValidForm(): void {
    component.form.setValue({
      title: 'Nova tarefa',
      description: 'Descricao curta',
      status: 'pending',
      priority: 'medium',
      assignee: 'Bruno',
      dueDate: '2026-08-10',
    });
    fixture.detectChanges();
  }

  it('should be invalid initially', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate required title', () => {
    component.form.controls['title'].setValue('');
    component.form.controls['title'].markAsTouched();

    expect(component.form.controls['title'].errors?.['required']).toBeTruthy();
  });

  it('should validate title minimum length', () => {
    component.form.controls['title'].setValue('ab');

    expect(component.form.controls['title'].errors?.['minlength']).toBeTruthy();
  });

  it('should validate title maximum length', () => {
    component.form.controls['title'].setValue('a'.repeat(81));

    expect(component.form.controls['title'].errors?.['maxlength']).toBeTruthy();
  });

  it('should validate description maximum length', () => {
    component.form.controls['description'].setValue('a'.repeat(301));

    expect(component.form.controls['description'].errors?.['maxlength']).toBeTruthy();
  });

  it('should validate required due date', () => {
    component.form.controls['dueDate'].setValue('');
    component.form.controls['dueDate'].markAsTouched();

    expect(component.form.controls['dueDate'].errors?.['required']).toBeTruthy();
  });

  it('should fill form when editing a task', () => {
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
    });
  });

  it('should emit value on valid submit', () => {
    const spy = vi.spyOn(component.taskSaved, 'emit');
    fillValidForm();

    submitForm();

    expect(spy).toHaveBeenCalledWith(component.form.getRawValue());
  });

  it('should not emit value on invalid submit', () => {
    const spy = vi.spyOn(component.taskSaved, 'emit');

    submitForm();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit cancel event', () => {
    const spy = vi.spyOn(component.canceled, 'emit');

    fixture.nativeElement.querySelector('.secondary-button').click();

    expect(spy).toHaveBeenCalled();
  });
});

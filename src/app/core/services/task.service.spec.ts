import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Task } from '../models/task.model';
import { TaskService } from './task.service';

const apiUrl = 'http://localhost:5000/api/tasks';

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

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TaskService],
    });

    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should call GET /tasks', () => {
    service.getTasks().subscribe((tasks) => {
      expect(tasks).toEqual([task]);
    });

    const request = http.expectOne(apiUrl);
    expect(request.request.method).toBe('GET');
    request.flush([task]);
  });

  it('should call GET /tasks/{id}', () => {
    service.getTaskById(task.id).subscribe((result) => {
      expect(result).toEqual(task);
    });

    const request = http.expectOne(`${apiUrl}/${task.id}`);
    expect(request.request.method).toBe('GET');
    request.flush(task);
  });

  it('should call POST /tasks with the task payload', () => {
    service.createTask(task).subscribe((result) => {
      expect(result).toEqual(task);
    });

    const request = http.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(task);
    request.flush(task);
  });

  it('should call PUT /tasks/{id} with the task payload', () => {
    service.updateTask(task).subscribe((result) => {
      expect(result).toEqual(task);
    });

    const request = http.expectOne(`${apiUrl}/${task.id}`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(task);
    request.flush(task);
  });

  it('should call DELETE /tasks/{id}', () => {
    service.deleteTask(task.id).subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = http.expectOne(`${apiUrl}/${task.id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});

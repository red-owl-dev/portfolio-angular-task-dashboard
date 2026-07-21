import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';

const host = 'localhost';
const port = Number(process.env.MOCK_API_PORT ?? 5000);
const allowedOrigins = new Set([
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);
const maximumBodySize = 1024 * 1024;

function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const createdAt = new Date().toISOString();
let tasks = [
  {
    id: 'task-001',
    title: 'Revisar documentação da release',
    description: 'Conferir comandos, links e observações de deploy.',
    status: 'pending',
    priority: 'high',
    assignee: 'Ana',
    dueDate: dateFromToday(-2),
    createdAt,
  },
  {
    id: 'task-002',
    title: 'Validar pipeline de CI',
    description: 'Executar lint, testes e o build de produção.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bruno',
    dueDate: dateFromToday(1),
    createdAt,
  },
  {
    id: 'task-003',
    title: 'Revisar layout responsivo',
    description: 'Conferir o dashboard e as páginas de tarefas no mobile.',
    status: 'pending',
    priority: 'medium',
    assignee: null,
    dueDate: dateFromToday(2),
    createdAt,
  },
  {
    id: 'task-004',
    title: 'Testar cadastro de tarefa',
    description: 'Confirmar que uma nova tarefa é persistida via HTTP.',
    status: 'pending',
    priority: 'medium',
    assignee: 'Carla',
    dueDate: dateFromToday(3),
    createdAt,
  },
  {
    id: 'task-005',
    title: 'Testar edição de tarefa',
    description: 'Confirmar que as alterações são retornadas pela API.',
    status: 'in-progress',
    priority: 'low',
    assignee: 'Diego',
    dueDate: dateFromToday(4),
    createdAt,
  },
  {
    id: 'task-006',
    title: 'Concluir revisão dos testes',
    description: 'Verificar os principais fluxos de sucesso e erro.',
    status: 'completed',
    priority: 'low',
    assignee: 'Eva',
    dueDate: dateFromToday(-1),
    createdAt,
  },
];

function corsHeaders(request) {
  const origin = request.headers.origin;

  return origin && allowedOrigins.has(origin)
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {};
}

function send(response, request, status, body) {
  const headers = corsHeaders(request);

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }

  response.writeHead(status, headers);
  response.end(body === undefined ? undefined : JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBodySize) {
      throw new Error('Request body is too large.');
    }
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      ...corsHeaders(request),
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    });
    response.end();
    return;
  }

  const path = new URL(request.url ?? '/', `http://${request.headers.host ?? host}`).pathname;
  const route = path.match(/^\/api\/tasks(?:\/([^/]+))?$/);

  if (!route) {
    send(response, request, 404, { message: 'The requested resource was not found.' });
    return;
  }

  const id = route[1] ? decodeURIComponent(route[1]) : undefined;

  try {
    if (request.method === 'GET' && !id) {
      send(response, request, 200, tasks);
      return;
    }

    if (request.method === 'GET' && id) {
      const task = tasks.find((item) => item.id === id);
      send(response, request, task ? 200 : 404, task ?? { message: 'Task not found.' });
      return;
    }

    if (request.method === 'POST' && !id) {
      const task = await readJson(request);
      const createdTask = { ...task, id: task.id || randomUUID() };
      tasks = [...tasks, createdTask];
      send(response, request, 201, createdTask);
      return;
    }

    if (request.method === 'PUT' && id) {
      const index = tasks.findIndex((item) => item.id === id);
      if (index < 0) {
        send(response, request, 404, { message: 'Task not found.' });
        return;
      }

      const task = await readJson(request);
      tasks = tasks.map((item, itemIndex) => (itemIndex === index ? { ...task, id } : item));
      send(response, request, 200, tasks[index]);
      return;
    }

    if (request.method === 'DELETE' && id) {
      const taskExists = tasks.some((item) => item.id === id);
      if (!taskExists) {
        send(response, request, 404, { message: 'Task not found.' });
        return;
      }

      tasks = tasks.filter((item) => item.id !== id);
      send(response, request, 204);
      return;
    }

    send(response, request, 405, { message: 'Method not allowed.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    send(response, request, 400, { message });
  }
});

server.listen(port, host, () => {
  console.log(`Mock task API running at http://${host}:${port}/api`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

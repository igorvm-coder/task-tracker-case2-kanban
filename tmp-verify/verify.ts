import { moveTask, getColumnTasks } from '../src/lib/taskUtils'
import type { Task, TaskStatus } from '../src/types/task'

let failures = 0

function check(name: string, condition: boolean, extra?: unknown) {
  if (condition) {
    console.log(`  ✓ ${name}`)
  } else {
    failures += 1
    console.log(`  ✗ ${name}`, extra ?? '')
  }
}

function makeTask(id: string, status: TaskStatus, position: number, completedAt: string | null = null): Task {
  return {
    id,
    title: id,
    description: '',
    status,
    priority: 'medium',
    assigneeId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    dueDate: null,
    completedAt,
    tags: [],
    position,
  }
}

const tasks: Task[] = [
  makeTask('a', 'backlog', 0),
  makeTask('b', 'backlog', 1),
  makeTask('c', 'backlog', 2),
  makeTask('d', 'in_progress', 0),
  makeTask('e', 'done', 0, '2026-01-02T00:00:00.000Z'),
]

console.log('Порядок внутри колонки (arrayMove-семантика)')
{
  const next = moveTask(tasks, 'a', 'backlog', 2)
  const ids = getColumnTasks(next, 'backlog').map((t) => t.id)
  check('a перемещён на место c', JSON.stringify(ids) === JSON.stringify(['b', 'c', 'a']), ids)
  check('позиции пересчитаны', getColumnTasks(next, 'backlog').every((t, i) => t.position === i))
  check('количество задач не изменилось', next.length === tasks.length)
}

console.log('Перенос в другую колонку')
{
  const next = moveTask(tasks, 'b', 'in_progress', 0)
  const progress = getColumnTasks(next, 'in_progress')
  check('статус изменён', next.find((t) => t.id === 'b')?.status === 'in_progress')
  check('b стал первым в колонке', progress[0].id === 'b', progress.map((t) => t.id))
  check('d сдвинулся на вторую позицию', progress[1].id === 'd' && progress[1].position === 1)
  check('карточка не потеряна', next.length === tasks.length && next.filter((t) => t.id === 'b').length === 1)
  check('completedAt очищен', next.find((t) => t.id === 'b')?.completedAt === null)
}

console.log('Правила даты завершения')
{
  const toDone = moveTask(tasks, 'd', 'done', 1)
  const done = toDone.find((t) => t.id === 'd')
  check('completedAt заполнен при переходе в done', Boolean(done?.completedAt))

  const insideDone = moveTask(toDone, 'd', 'done', 0)
  check('completedAt не меняется внутри done', insideDone.find((t) => t.id === 'd')?.completedAt === done?.completedAt)

  const outOfDone = moveTask(toDone, 'd', 'backlog', 0)
  check('completedAt очищается при выходе из done', outOfDone.find((t) => t.id === 'd')?.completedAt === null)

  const backToDone = moveTask(outOfDone, 'd', 'done', 0)
  check('повторное завершение фиксирует новую дату', Boolean(backToDone.find((t) => t.id === 'd')?.completedAt))
  check(
    'дата повторного завершения отличается',
    backToDone.find((t) => t.id === 'd')?.completedAt !== done?.completedAt,
  )
}

console.log('Граничные случаи')
{
  const next = moveTask(tasks, 'c', 'done', 99)
  check('индекс за пределами списка обрезается', getColumnTasks(next, 'done').map((t) => t.id).join(',') === 'e,c')
  const missing = moveTask(tasks, 'nope', 'done', 0)
  check('несуществующая задача не ломает данные', missing === tasks)
}

console.log(failures === 0 ? '\nВсе проверки пройдены' : `\nПровалено проверок: ${failures}`)
if (failures > 0) process.exit(1)

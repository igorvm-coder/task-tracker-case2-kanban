import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import { isTaskStatus } from '../constants/columns'
import { getColumnTasks } from '../lib/taskUtils'
import type { Task, TaskStatus } from '../types/task'

/** Куда именно будет помещена карточка: колонка и индекс внутри неё. */
export interface DropTarget {
  status: TaskStatus
  index: number
}

export interface UseDragAndDropOptions {
  tasks: Task[]
  /** Применяется только после успешного завершения перетаскивания. */
  onMoveTask: (taskId: string, toStatus: TaskStatus, toIndex: number) => void
}

export interface UseDragAndDropResult {
  sensors: ReturnType<typeof useSensors>
  /** Задача, которая сейчас перетаскивается (для DragOverlay). */
  activeTask: Task | null
  /** Колонка и позиция, куда попадёт карточка при отпускании. */
  dropTarget: DropTarget | null
  isDragging: boolean
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
  /** True, если только что завершилось перетаскивание — чтобы не открывать карточку кликом. */
  wasJustDragged: () => boolean
}

/** Колонка, которой принадлежит элемент (id карточки или id колонки). */
function findContainer(id: string, tasks: Task[]): TaskStatus | null {
  if (isTaskStatus(id)) return id
  return tasks.find((task) => task.id === id)?.status ?? null
}

interface ResolveIndexParams {
  tasks: Task[]
  activeId: string
  overId: string
  overStatus: TaskStatus
  overRect: RectLike | null
  activeRect: RectLike | null
}

/** Минимальная часть прямоугольника, нужная для расчёта позиции вставки. */
interface RectLike {
  top: number
  height: number
}

/**
 * Индекс, куда встанет карточка в целевой колонке (без учёта самой перетаскиваемой карточки).
 * Внутри одной колонки используется логика arrayMove — карточка занимает место карточки,
 * над которой её отпустили. При переносе в другую колонку позиция считается
 * по вертикальному положению указателя относительно карточки под ним.
 */
function resolveInsertIndex({
  tasks,
  activeId,
  overId,
  overStatus,
  overRect,
  activeRect,
}: ResolveIndexParams): number {
  const column = getColumnTasks(tasks, overStatus)
  const isSameColumn = column.some((task) => task.id === activeId)
  const lengthWithoutActive = column.filter((task) => task.id !== activeId).length

  // Карточка отпущена на фоне колонки — отправляем её в конец.
  if (overId === overStatus) return lengthWithoutActive

  const overIndex = column.findIndex((task) => task.id === overId)
  if (overIndex === -1) return lengthWithoutActive

  if (isSameColumn) return overIndex

  if (!overRect || !activeRect) return overIndex

  const activeCenter = activeRect.top + activeRect.height / 2
  const overCenter = overRect.top + overRect.height / 2
  return activeCenter > overCenter ? overIndex + 1 : overIndex
}

/**
 * Логика перетаскивания карточек: между колонками и внутри колонки.
 * Данные не меняются до момента отпускания карточки.
 */
export function useDragAndDrop({
  tasks,
  onMoveTask,
}: UseDragAndDropOptions): UseDragAndDropResult {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const tasksRef = useRef(tasks)
  const lastDragEndAt = useRef(0)

  // Актуальный список задач для обработчиков перетаскивания.
  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  const sensors = useSensors(
    // Мышь: небольшой порог, чтобы клик не превращался в перетаскивание.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Тач: долгое нажатие запускает перетаскивание, обычный свайп остаётся скроллом.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    // Клавиатура: Space — начать перетаскивание, Escape — отмена.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Tab'] },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id))
    setDropTarget(null)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setDropTarget(null)
      return
    }

    const current = tasksRef.current
    const activeId = String(active.id)
    const overId = String(over.id)

    const activeStatus = findContainer(activeId, current)
    const overStatus = findContainer(overId, current)
    if (!activeStatus || !overStatus) {
      setDropTarget(null)
      return
    }

    const index = resolveInsertIndex({
      tasks: current,
      activeId,
      overId,
      overStatus,
      overRect: over.rect,
      activeRect: active.rect.current.translated,
    })

    setDropTarget({ status: overStatus, index })
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      const activeId = String(active.id)

      lastDragEndAt.current = Date.now()
      setActiveTaskId(null)
      setDropTarget(null)

      if (!over) return

      const current = tasksRef.current
      const overId = String(over.id)
      const activeStatus = findContainer(activeId, current)
      const overStatus = findContainer(overId, current)
      if (!activeStatus || !overStatus) return

      const index = resolveInsertIndex({
        tasks: current,
        activeId,
        overId,
        overStatus,
        overRect: over.rect,
        activeRect: active.rect.current.translated,
      })

      if (activeStatus === overStatus) {
        const column = getColumnTasks(current, activeStatus)
        const currentIndex = column.findIndex((task) => task.id === activeId)
        if (currentIndex === -1 || currentIndex === index) return
      }

      onMoveTask(activeId, overStatus, index)
    },
    [onMoveTask],
  )

  const handleDragCancel = useCallback(() => {
    lastDragEndAt.current = Date.now()
    setActiveTaskId(null)
    setDropTarget(null)
  }, [])

  const wasJustDragged = useCallback(() => Date.now() - lastDragEndAt.current < 300, [])

  const activeTask = useMemo(
    () => (activeTaskId ? (tasks.find((task) => task.id === activeTaskId) ?? null) : null),
    [activeTaskId, tasks],
  )

  return {
    sensors,
    activeTask,
    dropTarget,
    isDragging: activeTaskId !== null,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    wasJustDragged,
  }
}

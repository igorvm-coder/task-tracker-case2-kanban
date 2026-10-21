import { useRef, useState } from 'react'
import { Trash2, X } from 'lucide-react'

import { PRIORITIES } from '../../constants/priorities'
import type { Assignee, Task } from '../../types/task'
import {
  emptyTaskForm,
  taskToFormValues,
  validateTaskForm,
} from '../../lib/taskValidation'
import type { TaskFormErrors, TaskFormValues } from '../../lib/taskValidation'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { Select } from '../ui/Select'
import { TagInput } from './TagInput'

interface TaskModalProps {
  mode: 'create' | 'edit'
  /** Задача, которую редактируем (только в режиме edit). */
  task?: Task
  assignees: Assignee[]
  onSave: (values: TaskFormValues) => void
  /** Удаление запускается из модального окна, подтверждается отдельным диалогом. */
  onDelete?: (task: Task) => void
  onClose: () => void
  /** Блокировка Esc и клика вне окна, пока открыт диалог подтверждения. */
  dismissible?: boolean
}

/** Модальное окно создания и редактирования задачи. */
export function TaskModal({
  mode,
  task,
  assignees,
  onSave,
  onDelete,
  onClose,
  dismissible = true,
}: TaskModalProps) {
  const isEdit = mode === 'edit' && task !== undefined
  const [values, setValues] = useState<TaskFormValues>(() =>
    isEdit ? taskToFormValues(task) : emptyTaskForm(),
  )
  const [errors, setErrors] = useState<TaskFormErrors>({})
  const titleRef = useRef<HTMLInputElement | null>(null)

  const setField = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => (previous[key] ? { ...previous, [key]: undefined } : previous))
  }

  const handleSubmit = () => {
    const nextErrors = validateTaskForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      titleRef.current?.focus()
      return
    }
    onSave({ ...values, title: values.title.trim(), tags: values.tags })
  }

  return (
    <Modal
      label={isEdit ? 'Редактирование задачи' : 'Создание задачи'}
      onClose={onClose}
      dismissible={dismissible}
      initialFocusRef={titleRef}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="pt-0.5 text-[15px] font-semibold text-ink">
            {isEdit ? 'Редактирование задачи' : 'Новая задача'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-m-1 rounded-md p-1 text-ink-subtle transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <Field label="Название" error={errors.title}>
          {(id) => (
            <Input
              id={id}
              ref={titleRef}
              value={values.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Что нужно сделать?"
              autoComplete="off"
            />
          )}
        </Field>

        <Field label="Описание" hint="необязательно">
          {(id) => (
            <Textarea
              id={id}
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
              placeholder="Детали, ссылки, критерии готовности…"
            />
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Приоритет">
            {(id) => (
              <Select
                id={id}
                value={values.priority}
                onChange={(event) =>
                  setField('priority', event.target.value as TaskFormValues['priority'])
                }
                options={Object.entries(PRIORITIES).map(([value, meta]) => ({
                  value,
                  label: meta.label,
                }))}
              />
            )}
          </Field>

          <Field label="Исполнитель">
            {(id) => (
              <Select
                id={id}
                value={values.assigneeId ?? ''}
                onChange={(event) => setField('assigneeId', event.target.value || null)}
                placeholder="Не назначен"
                options={assignees.map((assignee) => ({
                  value: assignee.id,
                  label: assignee.name,
                }))}
              />
            )}
          </Field>

          <Field label="Срок" hint="необязательно" error={errors.dueDate}>
            {(id) => (
              <Input
                id={id}
                type="date"
                value={values.dueDate}
                onChange={(event) => setField('dueDate', event.target.value)}
              />
            )}
          </Field>

          <Field label="Теги" hint="через запятую">
            {() => <TagInput tags={values.tags} onChange={(tags) => setField('tags', tags)} />}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
          <div>
            {isEdit && task && onDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={() => onDelete(task)}
              >
                Удалить
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" variant="primary">
              {isEdit ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

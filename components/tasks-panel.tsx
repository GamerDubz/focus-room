'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Task } from '@/lib/types'
import styles from './tasks-panel.module.css'

type TasksPanelProps = {
  tasks: Task[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TasksPanel({ tasks, onAdd, onToggle, onDelete }: TasksPanelProps) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onAdd(text)
    setDraft('')
  }

  return (
    <div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What are you working on?"
          className={styles.input}
          aria-label="New task"
        />
        <button type="submit" className={styles.addButton} aria-label="Add task">
          <Plus size={18} aria-hidden="true" />
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className={styles.empty}>No tasks yet — add what you&rsquo;d like to get done this session.</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <li key={task.id} className={styles.item}>
              <label className={styles.checkboxHit}>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggle(task.id)}
                  className={styles.checkbox}
                  aria-label={task.done ? `Mark "${task.text}" as not done` : `Mark "${task.text}" as done`}
                />
              </label>
              <span className={`${styles.text} ${task.done ? styles.textDone : ''}`}>{task.text}</span>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className={styles.deleteButton}
                aria-label={`Delete "${task.text}"`}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import styles from './panel-drawer.module.css'

type PanelDrawerProps = {
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/** A slide-over panel that tucks secondary content (tasks, sounds) away from the main room. */
export function PanelDrawer({ title, open, onClose, children }: PanelDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={`Close ${title}`}
            tabIndex={open ? 0 : -1}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </>
  )
}

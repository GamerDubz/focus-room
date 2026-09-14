import styles from './session-dots.module.css'

const MAX_VISIBLE_DOTS = 8

type SessionDotsProps = {
  sessions: number
}

/** A quiet tally of completed focus sessions — a row of small dots, not a stat card. */
export function SessionDots({ sessions }: SessionDotsProps) {
  const dotCount = Math.min(sessions, MAX_VISIBLE_DOTS) || 1
  const filled = Math.min(sessions, MAX_VISIBLE_DOTS)

  return (
    <div className={styles.row} aria-label={`${sessions} focus session${sessions === 1 ? '' : 's'} completed today`}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i < filled ? styles.dotFilled : ''}`} aria-hidden="true" />
      ))}
      {sessions > 0 && <span className={styles.count}>{sessions}</span>}
    </div>
  )
}

import { formatTime } from '@/lib/time'
import styles from './timer-ring.module.css'

const RADIUS = 46
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type TimerRingProps = {
  timeLeft: number
  progress: number
  running: boolean
  /** e.g. "Focus", "Short Break · Paused", "Long Break · Ready" */
  statusLabel: string
}

/**
 * The room's single focal point: a breathing ring around a large tabular
 * time readout. The clay accent only appears while a session is actively
 * running — everywhere else the ring reads in quiet charcoal.
 */
export function TimerRing({ timeLeft, progress, running, statusLabel }: TimerRingProps) {
  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className={`${styles.wrap} ${running ? styles.breathing : ''}`}>
      <svg className={styles.svg} viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.track} cx="50" cy="50" r={RADIUS} />
        <circle
          className={`${styles.progress} ${running ? styles.progressActive : ''}`}
          cx="50"
          cy="50"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.center}>
        <span
          className={`${styles.time} tabular ${running ? styles.timeActive : ''}`}
          role="timer"
          aria-live="off"
        >
          {formatTime(timeLeft)}
        </span>
        <span className={styles.phaseLabel}>{statusLabel}</span>
      </div>
    </div>
  )
}

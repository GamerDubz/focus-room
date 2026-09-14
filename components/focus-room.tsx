'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BellOff, ListTodo, Wind } from 'lucide-react'
import { Logo } from '@/components/logo'
import { TimerRing } from '@/components/timer-ring'
import { SessionDots } from '@/components/session-dots'
import { PanelDrawer } from '@/components/panel-drawer'
import { TasksPanel } from '@/components/tasks-panel'
import { SoundsPanel } from '@/components/sounds-panel'
import { PHASE_CONFIG, PHASE_ORDER, DEFAULT_DURATIONS, type Phase } from '@/lib/phases'
import { createNoise, SOUNDS } from '@/lib/noise'
import { generateId } from '@/lib/id'
import type { Task } from '@/lib/types'
import styles from './focus-room.module.css'

type SoundNode = { source: AudioBufferSourceNode; gain: GainNode }

export function FocusRoom() {
  const [phase, setPhase] = useState<Phase>('focus')
  const [customDurations] = useState(DEFAULT_DURATIONS)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.focus * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [volumes, setVolumes] = useState<Record<string, number>>({ rain: 0, white: 0, deep: 0 })
  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [tasksOpen, setTasksOpen] = useState(false)
  const [soundsOpen, setSoundsOpen] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Record<string, SoundNode>>({})

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const setVolume = useCallback(
    (id: string, vol: number) => {
      setVolumes((v) => ({ ...v, [id]: vol }))
      const ctx = getAudioCtx()
      const sound = SOUNDS.find((s) => s.id === id)
      if (!sound) return
      if (vol > 0) {
        if (!nodesRef.current[id]) {
          const source = createNoise(ctx, sound.type)
          const gain = ctx.createGain()
          gain.gain.value = vol / 100
          source.connect(gain)
          gain.connect(ctx.destination)
          source.start()
          nodesRef.current[id] = { source, gain }
        } else {
          nodesRef.current[id].gain.gain.value = vol / 100
        }
      } else if (nodesRef.current[id]) {
        nodesRef.current[id].gain.gain.value = 0
      }
    },
    [getAudioCtx]
  )

  const switchPhase = useCallback(
    (p: Phase) => {
      setPhase(p)
      setTimeLeft(customDurations[p] * 60)
      setRunning(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
    },
    [customDurations]
  )

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === 'focus') {
              setSessions((s) => s + 1)
              if (notifyEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification('Focus session complete', { body: 'Time for a break.' })
              }
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, phase, notifyEnabled])

  const total = customDurations[phase] * 60
  const progress = 1 - timeLeft / total
  const isFresh = timeLeft === total

  const toggleRunning = () => {
    setRunning((r) => !r)
    if (!running && audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  const toggleNotifications = async () => {
    if (notifyEnabled) {
      setNotifyEnabled(false)
      return
    }
    if ('Notification' in window) {
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
      setNotifyEnabled(permission === 'granted')
    }
  }

  const addTask = (text: string) => {
    setTasks((t) => [...t, { id: generateId(), text, done: false }])
  }
  const toggleTask = (id: string) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  const deleteTask = (id: string) => {
    setTasks((ts) => ts.filter((t) => t.id !== id))
  }

  const openTaskCount = tasks.filter((t) => !t.done).length
  const statusLabel = running
    ? PHASE_CONFIG[phase].label
    : isFresh
      ? `${PHASE_CONFIG[phase].label} · Ready`
      : `${PHASE_CONFIG[phase].label} · Paused`

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Logo size={22} className={styles.brandMark} />
          <span className={styles.brandName}>Focus Room</span>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.iconButton} ${notifyEnabled ? styles.iconButtonOn : ''}`}
            onClick={toggleNotifications}
            aria-pressed={notifyEnabled}
            aria-label={notifyEnabled ? 'Disable session notifications' : 'Enable session notifications'}
          >
            {notifyEnabled ? <Bell size={19} aria-hidden="true" /> : <BellOff size={19} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setSoundsOpen(true)}
            aria-label="Open ambient sounds"
          >
            <Wind size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setTasksOpen(true)}
            aria-label={openTaskCount > 0 ? `Open tasks, ${openTaskCount} remaining` : 'Open tasks'}
          >
            <ListTodo size={19} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <nav className={styles.phaseSwitcher} aria-label="Session phase">
          {PHASE_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => switchPhase(p)}
              className={`${styles.phaseButton} ${phase === p ? styles.phaseButtonActive : ''}`}
              aria-current={phase === p ? 'true' : undefined}
            >
              {PHASE_CONFIG[p].label}
            </button>
          ))}
        </nav>

        <TimerRing timeLeft={timeLeft} progress={progress} running={running} statusLabel={statusLabel} />

        <div className={styles.controls}>
          <button
            type="button"
            onClick={toggleRunning}
            className={`${styles.primaryButton} ${running ? styles.primaryButtonRunning : ''}`}
          >
            {running ? 'Pause' : isFresh ? 'Begin' : 'Resume'}
          </button>
          <button type="button" onClick={() => switchPhase(phase)} className={styles.secondaryButton}>
            Reset
          </button>
        </div>

        <SessionDots sessions={sessions} />

        <p className={styles.footerNote}>
          {phase === 'focus'
            ? 'Stay with one thing until the ring closes.'
            : 'Step away from the screen for a moment.'}
        </p>
      </main>

      <PanelDrawer title="Ambient Sound" open={soundsOpen} onClose={() => setSoundsOpen(false)}>
        <SoundsPanel volumes={volumes} onChange={setVolume} />
      </PanelDrawer>

      <PanelDrawer title="Session Tasks" open={tasksOpen} onClose={() => setTasksOpen(false)}>
        <TasksPanel tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
      </PanelDrawer>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Phase = 'focus' | 'short' | 'long'
type Task = { id: string; text: string; done: boolean }

const PHASE_CONFIG: Record<Phase, { label: string; duration: number; color: string; bg: string }> = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#ef4444', bg: 'from-red-950/30 to-neutral-950' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#22c55e', bg: 'from-green-950/30 to-neutral-950' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#3b82f6', bg: 'from-blue-950/30 to-neutral-950' },
}

// Web Audio noise generator
function createNoise(ctx: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    if (type === 'white') { data[i] = white }
    else if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    } else {
      b0 = (b0 + (0.02 * white)) / 1.02
      data[i] = b0 * 3.5
    }
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

const SOUNDS = [
  { id: 'rain', label: '🌧 Rain', type: 'pink' as const },
  { id: 'white', label: '📻 White Noise', type: 'white' as const },
  { id: 'deep', label: '🌊 Ocean', type: 'brown' as const },
]

function genId() { return Math.random().toString(36).slice(2) }

function formatTime(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function FocusRoomPage() {
  const [phase, setPhase] = useState<Phase>('focus')
  const [timeLeft, setTimeLeft] = useState(PHASE_CONFIG.focus.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [volumes, setVolumes] = useState<Record<string, number>>({ rain: 0, white: 0, deep: 0 })
  const [customDurations, setCustomDurations] = useState({ focus: 25, short: 5, long: 15 })
  const [notifyEnabled, setNotifyEnabled] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Record<string, { source: AudioBufferSourceNode; gain: GainNode }>>({})

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const setVolume = useCallback((id: string, vol: number) => {
    setVolumes((v) => ({ ...v, [id]: vol }))
    const ctx = getAudioCtx()
    const sound = SOUNDS.find((s) => s.id === id)!
    if (vol > 0) {
      if (!nodesRef.current[id]) {
        const source = createNoise(ctx, sound.type)
        const gain = ctx.createGain()
        gain.gain.value = vol / 100
        source.connect(gain); gain.connect(ctx.destination)
        source.start()
        nodesRef.current[id] = { source, gain }
      } else {
        nodesRef.current[id].gain.gain.value = vol / 100
      }
    } else if (nodesRef.current[id]) {
      nodesRef.current[id].gain.gain.value = 0
    }
  }, [getAudioCtx])

  const switchPhase = useCallback((p: Phase) => {
    setPhase(p)
    setTimeLeft(customDurations[p] * 60)
    setRunning(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [customDurations])

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
                new Notification('Focus session complete! Time for a break.')
              }
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, notifyEnabled])

  const cfg = PHASE_CONFIG[phase]
  const total = customDurations[phase] * 60
  const progress = 1 - timeLeft / total

  const addTask = () => {
    if (!newTask.trim()) return
    setTasks((t) => [...t, { id: genId(), text: newTask.trim(), done: false }])
    setNewTask('')
  }

  return (
    <div className={`min-h-screen bg-linear-to-b ${cfg.bg} text-neutral-100 flex flex-col items-center justify-start pt-16 px-4 transition-all duration-1000`}>
      <div className="w-full max-w-md">
        <h1 className="text-center text-xl font-semibold text-neutral-400 mb-8 tracking-wide">Focus Room</h1>

        {/* Phase selector */}
        <div className="flex rounded-xl bg-neutral-900/60 border border-neutral-800 p-1 mb-8">
          {(Object.keys(PHASE_CONFIG) as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => switchPhase(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${phase === p ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              style={phase === p ? { background: cfg.color + '30', color: cfg.color } : {}}
            >
              {PHASE_CONFIG[p].label}
            </button>
          ))}
        </div>

        {/* Timer ring */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-56 h-56">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#1a1a1a" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke={cfg.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tabular-nums tracking-tight" style={{ color: cfg.color }}>{formatTime(timeLeft)}</span>
              <span className="text-xs text-neutral-600 mt-1 uppercase tracking-widest">{cfg.label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={() => { setRunning(!running); if (!running && audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume() }}
            className="px-10 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{ background: cfg.color, color: 'white' }}
          >
            {running ? 'Pause' : timeLeft === total ? 'Start' : 'Resume'}
          </button>
          <button onClick={() => switchPhase(phase)} className="px-6 py-3 rounded-xl font-semibold text-sm bg-neutral-800 hover:bg-neutral-700 transition-all">
            Reset
          </button>
        </div>

        <div className="text-center text-sm text-neutral-600 mb-8">
          Sessions completed: <span className="text-neutral-300 font-semibold">{sessions}</span>
        </div>

        {/* Ambient sounds */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-neutral-400 mb-4">Ambient Sounds</h2>
          <div className="space-y-3">
            {SOUNDS.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-sm w-28 text-neutral-400">{s.label}</span>
                <input
                  type="range" min={0} max={100} value={volumes[s.id] ?? 0}
                  onChange={(e) => setVolume(s.id, Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                  aria-label={`${s.label} volume`}
                />
                <span className="text-xs text-neutral-600 w-8 text-right tabular-nums">{volumes[s.id] ?? 0}%</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-700 mt-3">Sounds generated locally using Web Audio API</p>
        </div>

        {/* Tasks */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-400 mb-3">Session Tasks</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text" value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTask() }}
              placeholder="Add a task…"
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-neutral-500 text-neutral-200"
              aria-label="New task"
            />
            <button onClick={addTask} className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm">Add</button>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <input
                  type="checkbox" checked={t.done}
                  onChange={() => setTasks((ts) => ts.map((x) => x.id === t.id ? { ...x, done: !x.done } : x))}
                  className="w-4 h-4 rounded accent-blue-500"
                  aria-label={`Mark "${t.text}" as done`}
                />
                <span className={`text-sm flex-1 ${t.done ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>{t.text}</span>
                <button onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))} className="text-neutral-700 hover:text-red-400 transition-colors" aria-label="Delete task">×</button>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-xs text-neutral-700">No tasks yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

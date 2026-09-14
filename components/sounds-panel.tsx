'use client'

import { CloudRain, Radio, Waves } from 'lucide-react'
import { SOUNDS } from '@/lib/noise'
import styles from './sounds-panel.module.css'

const ICONS: Record<string, React.ElementType> = {
  rain: CloudRain,
  white: Radio,
  deep: Waves,
}

type SoundsPanelProps = {
  volumes: Record<string, number>
  onChange: (id: string, volume: number) => void
}

export function SoundsPanel({ volumes, onChange }: SoundsPanelProps) {
  return (
    <div>
      <div className={styles.list}>
        {SOUNDS.map((sound) => {
          const Icon = ICONS[sound.id]
          const value = volumes[sound.id] ?? 0
          return (
            <div className={styles.row} key={sound.id}>
              <div className={styles.rowHead}>
                {Icon && <Icon size={17} className={styles.icon} aria-hidden />}
                <span className={styles.label}>{sound.label}</span>
                <span className={styles.value}>{value}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onChange(sound.id, Number(e.target.value))}
                className={styles.slider}
                aria-label={`${sound.label} volume`}
              />
            </div>
          )
        })}
      </div>
      <p className={styles.note}>Ambient sound is generated locally in your browser — nothing is streamed or recorded.</p>
    </div>
  )
}

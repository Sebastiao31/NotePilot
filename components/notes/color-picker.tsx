"use client"
import React, { useMemo, useState } from 'react'

const COLORS = [
  { key: 'red', value: '#ef4444' },
  { key: 'orange', value: '#FAA307' },
  { key: 'yellow', value: '#FFD900' },
  { key: 'brown', value: '#AD7A51' },
  { key: 'green', value: '#AACC00' },
  { key: 'turquoise', value: '#71C1A0' },
  { key: 'blue', value: '#0096C7' },
  { key: 'purple', value: '#A06CD5' },
  { key: 'pink', value: '#FF7096' },
]

type ColorPickerProps = {
  value?: string
  onChange?: (color: string) => void
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [internal, setInternal] = useState<string>(COLORS[0].value)
  const selected = value ?? internal

  return (
    <main className='flex gap-2 justify-center py-6'>
      {COLORS.map((c) => (
        <button
          key={c.key}
          onClick={() => (onChange ? onChange(c.value) : setInternal(c.value))}
          aria-label={`Select ${c.key}`}
          className={`p-1 rounded-full ${selected === c.value ? 'bg-black' : 'bg-gray-200'} w-fit transition-colors cursor-pointer`}
        >
          <span
            className='h-8 w-8 rounded-full border-4 block'
            style={{ backgroundColor: c.value, borderColor: '#ffffff' }}
          />
        </button>
      ))}
    </main>
  )
}

export default ColorPicker
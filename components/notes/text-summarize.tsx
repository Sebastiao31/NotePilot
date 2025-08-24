import React from 'react'
import { Textarea } from '../ui/textarea'

type Props = {
  value: string
  onChange: (value: string) => void
}

const TextSummarize: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div>
        <Textarea
          placeholder='Enter your text here...'
          className='h-full'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
    </div>
  )
}

export default TextSummarize
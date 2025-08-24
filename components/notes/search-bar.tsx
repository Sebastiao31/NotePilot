"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { IconSearch } from '@tabler/icons-react'
import { useDebounce } from '../../hooks/use-debounce'

type Props = {
  value?: string
  onChange?: (q: string) => void
}

const SearchBar: React.FC<Props> = ({ value = '', onChange }) => {
  const [q, setQ] = useState(value)
  const debounced = useDebounce(q, 300)

  useEffect(() => { onChange?.(debounced) }, [debounced, onChange])

  return (
    <div className='flex items-center gap-2'>
      <Input
        type='text'
        placeholder='Search notes…'
        className='w-64'
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button variant='outline' onClick={() => onChange?.(q)}>
        <IconSearch />
      </Button>
    </div>
  )
}

export default SearchBar
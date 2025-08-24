import React from 'react'
import { CardContent } from '../ui/card'
import { cn } from '@/lib/utils'
import { IconMicrophone, IconLetterCase, IconLink, IconVolume } from '@tabler/icons-react';

type NoteTypeId = 'record-audio' | 'upload-document' | 'web-link' | 'upload-audio'


interface NoteTypeContainerProps {
  selectedType: NoteTypeId
  onChange: (type: NoteTypeId) => void
}

const NoteTypeContainer: React.FC<NoteTypeContainerProps> = ({ selectedType, onChange }) => {
  const inputMethods = [
    { 
      id: 'record-audio' as NoteTypeId, 
      name: 'Record Audio', 
      icon: IconMicrophone, 
      description: 'AI takes notes of what you are hearing',
      gradient: 'from-[#F43535] to-[#B72424]',
      border: 'border-[#EE5050]'
    },
    { 
      id: 'upload-document' as NoteTypeId, 
      name: 'Upload Document/Text', 
      icon: IconLetterCase, 
      description: 'Summarize PDF, TXT & DOCX files',
      gradient: 'from-[#B0D20A] to-[#6A9A15]',
      border: 'border-[#CBEF29]'
    },
    { 
      id: 'web-link' as NoteTypeId, 
      name: 'Web Link', 
      icon: IconLink, 
      description: 'YouTube, Google Drive, websites, etc.',
      gradient: 'from-[#0AB0E6] to-[#056AAD]',
      border: 'border-[#1CB9F0]'
    },
    { 
      id: 'upload-audio' as NoteTypeId, 
      name: 'Upload Audio', 
      icon: IconVolume, 
      description: 'Summarize an audio file',
      gradient: 'from-[#FFD900] to-[#FCBA04]',
      border: 'border-[#FFEA79]'
    },
  ];

  return (
    <div>
      <CardContent className="space-y-3 ">
        {inputMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedType === method.id
          return (
            <button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all  text-left group hover:shadow-subtle",
                isSelected ? 'border-primary bg-accent/50' : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-r border-3 transition-transform group-hover:scale-110",
                  method.gradient, method.border
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1  min-w-0">
                  <div className="font-medium text-lg  ">{method.name}</div>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </div>
  )
}

export type { NoteTypeId }
export default NoteTypeContainer
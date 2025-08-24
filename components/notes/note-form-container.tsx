"use client"
import React from 'react'
import type { NoteTypeId } from './note-type-container'
import RecordAudioForm from './record-audio-form'
import UploadDocForm from './upload-doc-form'
import WebLinkForm from './web-link-form'
import UploadAudioForm from './upload-audio-form'

interface NoteFormContainerProps {
  selectedType: NoteTypeId
}

const NoteFormContainer: React.FC<NoteFormContainerProps> = ({ selectedType }) => {
  const renderForm = () => {
    switch (selectedType) {
      case 'record-audio':
        return <RecordAudioForm />
      case 'upload-document':
        return <UploadDocForm />
      case 'web-link':
        return <WebLinkForm />
      case 'upload-audio':
        return <UploadAudioForm />
      default:
        return <RecordAudioForm />
    }
  }

  return (
    <div className="h-full">{renderForm()}</div>
  )
}

export default NoteFormContainer
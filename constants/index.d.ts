export type SummarizePromptConfig = {
  system: string
  userTemplate: string
}

export declare const SUMMARIZE_PROMPT: SummarizePromptConfig

export type NoteSourceType = "text" | "document" | "audio" | "link" 

export type Note = {
  id: string
  userId: string
  title: string
  content: string
  summary: string
  sourceType: NoteSourceType
  folderId?: string | null
  createdAt?: unknown
  updatedAt?: unknown
}


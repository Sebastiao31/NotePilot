export type SummarizePromptConfig = {
  system: string
  userTemplate: string
}

export const SUMMARIZE_PROMPT: SummarizePromptConfig = {
  system: String.raw`
### Role
You turn raw content (transcripts, documents, links) into clear, professionally structured notes.

### Goals
1) Preserve core meaning and important details
2) Make notes scannable with topical sections and bullets
3) Use rich, readable Markdown (GFM) for hierarchy and clarity
4) ALWAYS write in the language of the source content

### AI Output Guidelines (Markdown only)
- Use topical headings (not generic labels). Prefer "What this is", "How it works", "Results", "Limitations", etc.
- Headings: use #, ##, ### for hierarchy (h1/h2/h3). Keep 2–6 sections total.
- In the h1, try to use words, like "Overview", "Summary" and respected words of the language that the summarie is written in.
- Prefer short paragraphs and bullet lists. Use numbered lists for steps.
- Emphasize key terms with **bold**; nuance with _italics_; short code with ` + "`code`" + `.
- Use horizontal rules (---) to split major sections when appropriate.
- Callouts using this pattern:
  > [!TIP] Title\nBody text...
  > [!INFO] Title\nBody text...
  > [!WARNING] Title\nBody text...
- Checklists when tasks exist: "- [ ] item" or "- [x] item".
- Tables with standard GitHub‑Flavored Markdown for comparisons.
- Math: Wrap inline equations in \`$...$\` and block/display equations in \`$$...$$\`. Use standard LaTeX math commands (e.g., \`\\frac{...}{...}\`, \`\\cdot\`, superscripts \`^\`, subscripts \`_\`). Example inline: \`$A=\\pi r^2$\`. Example block:
  > $$ blockdisplay equations $$ (detect the best way to display a math equation)
  > $ inlineequations $ (detect the best way to display a math equation)
  
- Return valid Markdown only; no HTML wrappers.
- Do NOT add boilerplate like "Here are your notes".

### What to produce
- A brief opening paragraph (3–5 sentences) describing the topic and outcome
- 2–5 additional topical sections with bullets/steps as needed
- Optional: a comparison table or checklist if the source suggests it
- Optional: callouts (TIP/INFO/WARNING) where they add value
`,
  userTemplate:
    "Summarize the following content following the system instructions written in the language of the source content and output format.\n\n---\n{text}\n---",
}

export const TITLE_PROMPT = String.raw`
You generate a concise, specific and human-friendly title for notes based on the provided content.

Rules:
- 3 to 8 words, maximum 60 characters.
- No quotes, no emojis, no trailing punctuation.
- Be specific to the topic and key outcome.

Return only the title text.`

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



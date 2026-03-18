import * as React from "react"
import { Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import type { UploadFormValues } from "./schema"

const maleVoices: Array<{
  id: UploadFormValues["voice"]
  name: string
  hint: string
}> = [
  { id: "dave", name: "Dave", hint: "Young male, British. Ease, witty, conversational" },
  { id: "daniel", name: "Daniel", hint: "Middle-aged male, British. Authoritative but warm" },
  { id: "chris", name: "Chris", hint: "Male, casual & easy-going" },
]

const femaleVoices: Array<{
  id: UploadFormValues["voice"]
  name: string
  hint: string
}> = [
  { id: "rachel", name: "Rachel", hint: "Young female, American, calm & clear" },
  { id: "sarah", name: "Sarah", hint: "Young female, American, soft & approachable" },
]

function VoiceOption({
  id,
  name,
  hint,
  selected,
  onSelect,
}: {
  id: UploadFormValues["voice"]
  name: string
  hint: string
  selected: boolean
  onSelect: (id: UploadFormValues["voice"]) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "voice-selector-option",
        selected ? "voice-selector-option-selected" : "voice-selector-option-default"
      )}
      aria-pressed={selected}
    >
      <div className="flex flex-col items-start min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[var(--text-primary)]">
            {name}
          </span>
        </div>
        <span className="text-sm text-[var(--text-secondary)] line-clamp-2">
          {hint}
        </span>
      </div>
    </button>
  )
}

export function VoiceSelector({
  value,
  onChange,
}: {
  value: UploadFormValues["voice"]
  onChange: (value: UploadFormValues["voice"]) => void
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[var(--text-secondary)]" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Male voices
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {maleVoices.map((v) => (
            <VoiceOption
              key={v.id}
              id={v.id}
              name={v.name}
              hint={v.hint}
              selected={value === v.id}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[var(--text-secondary)]" />
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            Female voices
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {femaleVoices.map((v) => (
            <VoiceOption
              key={v.id}
              id={v.id}
              name={v.name}
              hint={v.hint}
              selected={value === v.id}
              onSelect={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


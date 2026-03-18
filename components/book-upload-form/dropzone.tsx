import * as React from "react"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export function Dropzone({
  value,
  onChange,
  label,
  hint,
  icon,
  accept,
  required,
}: {
  value?: File
  onChange: (file?: File) => void
  label: string
  hint: string
  icon: React.ReactNode
  accept: string
  required?: boolean
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const openPicker = () => inputRef.current?.click()

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    onChange(file)
  }

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      className={cn(
        "upload-dropzone border-2 border-dashed border-[var(--border-subtle)]",
        value && "upload-dropzone-uploaded"
      )}
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openPicker()
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={onPick}
      />

      {!value ? (
        <>
          <div className="upload-dropzone-icon">{icon}</div>
          <p className="upload-dropzone-text">{label}</p>
          <p className="upload-dropzone-hint">
            {hint}
            {required ? "*" : ""}
          </p>
        </>
      ) : (
        <div className="w-full px-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="upload-dropzone-text text-left truncate">{value.name}</p>
            <p className="upload-dropzone-hint text-left">
              {`${(value.size / (1024 * 1024)).toFixed(1)}MB`}
            </p>
          </div>
          <button
            type="button"
            className="upload-dropzone-remove"
            aria-label="Remove file"
            onClick={remove}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}


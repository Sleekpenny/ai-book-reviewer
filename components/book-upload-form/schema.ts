import { z } from "zod"

export const MAX_PDF_BYTES = 50 * 1024 * 1024
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const

export const VOICE_IDS = ["dave", "daniel", "chris", "rachel", "sarah"] as const

export const bookUploadSchema = z.object({
  pdf: z
    .instanceof(File, { message: "Please upload a PDF file." })
    .refine((f) => f.type === "application/pdf", "File must be a PDF.")
    .refine((f) => f.size <= MAX_PDF_BYTES, "PDF must be 50MB or smaller."),
  cover: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_IMAGE_BYTES, "Image sie must be less than 10MB")
    .refine((f) => !f || ACCEPTED_IMAGE_TYPES.includes(f.type as (typeof ACCEPTED_IMAGE_TYPES)[number]), "Cover image must be PNG, JPG, or WebP.")
    .optional(),
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author name is required."),
  voice: z.enum(VOICE_IDS, { message: "Please choose an assistant voice." }),
})

export type UploadFormValues = z.infer<typeof bookUploadSchema>


"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FileText, Image as ImageIcon, LoaderCircle } from "lucide-react"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shad-ui/form"
import { Button } from "@/components/shad-ui/button"

import { Dropzone } from "@/components/book-upload-form/dropzone"
import { VoiceSelector } from "@/components/book-upload-form/voice-selector"
import {
  bookUploadSchema,
  type UploadFormValues,
} from "@/components/book-upload-form/schema"

export default function BookUploadForm() {
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(bookUploadSchema),
    defaultValues: {
      pdf: undefined as unknown as File,
      cover: undefined,
      title: "",
      author: "",
      voice: "rachel",
    },
    mode: "onSubmit",
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: UploadFormValues) {
    // TODO: replace with real upload/book creation logic.
    await new Promise((r) => setTimeout(r, 900))
    void values
  }

  return (
    <>
      {isSubmitting ? (
        <div className="loading-wrapper" aria-live="polite" aria-busy="true">
          <div className="loading-shadow-wrapper auth-shadow">
            <div className="loading-shadow">
              <LoaderCircle className="loading-animation w-12 h-12 text-[var(--color-brand)]" />
              <div className="text-center space-y-1">
                <p className="loading-title">Creating your book…</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Uploading files & preparing your assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <FormControl>
                  <Dropzone
                    value={field.value}
                    onChange={field.onChange}
                    label="Click to upload PDF"
                    hint="PDF file (max 50MB)"
                    required
                    accept="application/pdf"
                    icon={<FileText className="w-full h-full" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                <FormControl>
                  <Dropzone
                    value={field.value}
                    onChange={field.onChange}
                    label="Click to upload cover image"
                    hint="Leave empty to auto-generate from PDF"
                    accept="image/png,image/jpeg,image/webp"
                    icon={<ImageIcon className="w-full h-full" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="form-input shadow-soft-sm border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[rgba(33,42,59,0.10)]"
                    placeholder="ex: Rich Dad Poor Dad"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="form-input shadow-soft-sm border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[rgba(33,42,59,0.10)]"
                    placeholder="ex: Robert Kiyosaki"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                <FormControl>
                  <VoiceSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="form-btn" disabled={isSubmitting}>
            Begin Synthesis
          </Button>
        </form>
      </Form>
    </>
  )
}


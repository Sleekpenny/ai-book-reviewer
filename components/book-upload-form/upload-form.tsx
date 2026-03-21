"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FileText, Image as ImageIcon, LoaderCircle } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/shad-ui/form"
import { Button } from "@/components/shad-ui/button"
import { Dropzone } from "@/components/book-upload-form/dropzone"
import { VoiceSelector } from "@/components/book-upload-form/voice-selector"
import { bookUploadSchema, type UploadFormValues } from "@/components/book-upload-form/schema"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { checkIfBookExit, createBook, saveBookSegments } from "@/lib/actions/book.actions"
import { useRouter } from "next/navigation"
import { parsePDFFile } from "@/lib/utils"
import { upload } from '@vercel/blob/client'

export default function UploadForm() {

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(bookUploadSchema),
    defaultValues: {
      pdf: undefined as unknown as File,
      cover: undefined,
      title: "",
      voice: "daniel",
      author: "",
    },
    mode: "onSubmit",
  })

  const isSubmitting = form.formState.isSubmitting;
  const { userId } = useAuth();
  const router = useRouter();

  const  onSubmit = async (data: UploadFormValues) => {
    if(!userId) return toast.error('You need to login to upload a book');

    try {
      const checkIfBookExist = await checkIfBookExit(data.title);
      if(checkIfBookExist.exists && checkIfBookExist.book) {
        toast.info('Book already exists');
        router.push(`/books/${checkIfBookExist.book.slug}`)
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
      const pdfFile = data.pdf;

      const parsedPDF = await parsePDFFile(pdfFile);
      if (parsedPDF.content.length === 0) {
        toast.error('Failed to parse PDF. Please try again with a differnt file');
        return;
      }

      const uploadPDFBlob = await upload(fileTitle, pdfFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'application/pdf'
      });

    let _coverUrl:string;

    if (data.cover) {
      const coverFile = data.cover;
      const uploadCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: coverFile.type
      })
      _coverUrl = uploadCoverBlob.url;
    } else {
      const coverImageResponse = await fetch(parsedPDF.cover);
      const blob = await coverImageResponse.blob();

      const uploadCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        contentType: 'image/png',
      })
      _coverUrl = uploadCoverBlob.url;
    }

    const book = await createBook({
      clerkId: userId,
      title: data.title,
      author: data.author,
      voice: data.voice,
      fileURL: uploadPDFBlob.url,
      fileBlobKey: uploadPDFBlob.pathname,
      coverURL: _coverUrl,
      fileSize: pdfFile.size
    })
    //await new Promise((r) => setTimeout(r, 900));
   if (!book.success) throw new Error('Failed to create book');
   if (book.alreadyExits) {
    toast.info('Book already exists');
    router.push(`/books/${checkIfBookExist.book.slug}`)
    form.reset();
    return;
   }

   const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);
   if(!segments.success) {
      toast.error('Failed to save book segments');
      throw new Error('Failed to save book segments')
   }

   form.reset();
   router.push('/');

  } catch (e) {
    toast.error(`Failed to upload book. Please try again later + ${e}`);    
  } finally {

  }

  }

  return (
    <>
      {isSubmitting ? (
        <div className="loading-wrapper" aria-live="polite" aria-busy="true">
          <div className="loading-shadow-wrapper auth-shadow">
            <div className="loading-shadow">
              <LoaderCircle className="loading-animation w-12 h-12 text-(--color-brand)" />
              <div className="text-center space-y-1">
                <p className="loading-title">Creating your book…</p>
                <p className="text-sm text-(--text-secondary)">
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
                    className="form-input shadow-soft-sm border border-(--border-subtle) focus:outline-none focus:ring-2 focus:ring-[rgba(33,42,59,0.10)]"
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
                    className="form-input shadow-soft-sm border border-(--border-subtle) focus:outline-none focus:ring-2 focus:ring-[rgba(33,42,59,0.10)]"
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


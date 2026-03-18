import UploadForm from '@/components/book-upload-form/upload-form'
import React from 'react'

const Page = () => {
  return (
    <div className="wrapper container">
        <div className="new-book-wrapper">
          <section className="flex flex-col gap-5">
            <h1 className="page-title-xl">Add a New Book</h1>
            <h2 className="subtitle">
              Upload a PDF to generate your interactive interview
            </h2>
          </section>

          <UploadForm />
        </div>
    </div>
  )
}

export default Page
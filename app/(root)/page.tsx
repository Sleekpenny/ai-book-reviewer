import BookHero from '@/components/book-hero'
import BookCard from '@/components/book-card'
import React from 'react'
import { getAllBooks } from '@/lib/actions/book.actions'

export const dynamic = 'force-dynamic'

const Page = async () => {
  const books = await getAllBooks();
  const booksData = books.success ? books.data ?? [] : [];

  return (
    <div className='wrapper'>    
    <BookHero />

    <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-5 mt-10">
      { booksData.map(( {slug, title, author, _id, coverURL} )=> (        
          <BookCard title={title} key={_id} slug={slug} author={author} coverURL={coverURL} />
      ))}
    </div>
    </div>
  )
}

export default Page
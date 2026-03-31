import BookHero from '@/components/book-hero'
import BookCard from '@/components/book-card'
import React from 'react'
import { getAllBooks } from '@/lib/actions/book.actions'
import Search from '@/components/search'

export const dynamic = 'force-dynamic'

const Page = async () => {
  const books = await getAllBooks();
  const booksData = books.success ? books.data ?? [] : [];

  return (
    <div className='wrapper'>    
    <BookHero />

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10 mt-10">
                <h2 className="text-3xl font-serif font-bold text-[#212a3b]">Recent Books</h2>
                <Search />
            </div>

    <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-5 mt-10">
      { booksData.map(( {slug, title, author, _id, coverURL} )=> (        
          <BookCard title={title} key={_id} slug={slug} author={author} coverURL={coverURL} />
      ))}
    </div>
    </div>
  )
}

export default Page
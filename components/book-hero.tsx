import React from 'react'
import Image from 'next/image'
import Link from "next/link";

const BookHero = () => {
    const reviewOrder = [
        { n: 1, title: "Upload PDF", desc: "Add your book file" },
        { n: 2, title: "AI Processing", desc: "We analyse the content" },
        { n: 3, title: "Voice Chat", desc: "Discuss with AI" },
      ]

  return (
    <div className="library-hero-card py-4 w-full md justify-between md:flex-row flex-col gap-5 md:gap-0">
    {/* LEFT: Text + CTA */}
    <div className="library-hero-text">
      <h1 className="library-hero-title">Your Library</h1>
      <p className="library-hero-description">
        Convert your books into interactive AI conversations.<br />
        Listen, learn, and discuss your favorite reads.
      </p>
      <Link href="/books/new" className="library-cta-primary w-fit">
        <span className="text-xl">+</span>
        Add new book
      </Link>
    </div>

    {/* CENTER: Illustration Desktop*/}
    <div className="library-hero-illustration-desktop flex-1 max-w-70">
        <Image src="/assets/hero-illustration.png" alt="vintage books and a globe" width={380} height={380} className="object-contain" />
    </div>

    
    {/* CENTER: Illustration Mobile*/}
    <div className='library-hero-illustration'>
    <Image src="/assets/hero-illustration.png" alt="vintage books and a globe" width={280} height={280} className="object-contain" />
    </div>

    {/* RIGHT: Steps card */}
    <div className="library-steps-card flex flex-col gap-4 min-w-47.5 max-w-52.5 shrink-0 self-center">
      {reviewOrder.map(({ n, title, desc }) => (
        <div key={n} className="library-step-item">
          <span className="library-step-number">{n}</span>
          <div>
            <p className="library-step-title">{title}</p>
            <p className="library-step-description">{desc}</p>
          </div>
        </div>
      ))}
    </div>

  </div>
  )
}

export default BookHero
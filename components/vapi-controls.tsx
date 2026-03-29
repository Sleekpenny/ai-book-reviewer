"use client"

import { useVapi } from '@/hooks/usevapi'
import { IBook } from '@/lib/types'
import { Mic, MicOff } from 'lucide-react';
import Transcript from './transcript'
import Image from 'next/image' 

const VapiControls = ( {book}: {book: IBook}) => {

    const {status, messages, isActive, currentMessage, currentUserMessage, duration, start, stop, clearErrors, limitError } = useVapi(book)
  
    return (
          <div className=" space-y-4">
            <div className="vapi-header-card">
              <div className="vapi-card-layout">
                
                {/* Book Cover with Mic Button Overlay */}
                <div className="vapi-cover-wrapper">
                  <Image
                    src={book.coverURL}
                    alt={book.title}
                    width={130}
                    height={195}
                    className="vapi-cover-image"
                    priority 
                  />
                  
                  <div className="vapi-mic-wrapper relative">
                    <button 
                      className="vapi-mic-btn vapi-mic-btn-inactive"
                      aria-label="Toggle microphone"
                      onClick={isActive ? start : stop } disabled={ status === 'connecting...' }
                    >
                      {isActive ? (
                        <Mic className="size-7 bg-neutral-100" />                        
                      ) : (                        
                        <MicOff className="size-7 text-[#212a3b]" />
                      )}
                    </button>
                  </div>
                </div>
     
                {/* Book Details */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {/* Title and Author */}
                  <div className="space-y-1">
                    <h1 className="book-title-lg">
                      {book.title}
                    </h1>
                    <p className="text-(--text-secondary) text-sm sm:text-base">
                      by {book.author}
                    </p>
                  </div>
     
                  {/* Status Pills Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Indicator */}
                    <div className="vapi-status-indicator">
                      <span className="vapi-status-dot vapi-status-dot-ready"></span>
                      <span className="vapi-status-text">{ status }</span>
                    </div>
     
                    {/* Voice Label */}
                    <div className="vapi-badge-ai">
                      <span className="vapi-badge-ai-text">
                        Voice: {book.persona || 'rachel'}
                      </span>
                    </div>
     
                    {/* Timer */}
                    <div className="vapi-badge-ai">
                      <span className="vapi-badge-ai-text text-(--success) tabular-nums">
                        0:00/15:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
     
            <div className="vapi-transcript-wrapper">
          <Transcript 
            messages={messages}
            currentUserMessage={currentUserMessage}
            currentMessage={currentMessage}
          />
        </div>
       
          </div>
  )
}

export default VapiControls
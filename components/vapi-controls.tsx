"use client"

import { useVapi } from '@/hooks/usevapi'
import { IBook } from '@/lib/types'
import { Mic, MicOff } from 'lucide-react';
import Transcript from './transcript'
import Image from 'next/image' 
import { useEffect } from 'react';
import { toast } from 'sonner';
import {useRouter} from "next/navigation";

const statusDotClass: Record<string, string> = {
  'idle': 'vapi-status-dot-ready',
  'connecting...': 'vapi-status-dot-connecting',
  'starting': 'vapi-status-dot-connecting',
  'listening': 'vapi-status-dot-listening',
  'thinking': 'vapi-status-dot-thinking',
  'speaking': 'vapi-status-dot-speaking',
};

const VapiControls = ( {book}: {book: IBook}) => {
 
  
    const {status, messages, isActive, currentMessage, currentUserMessage, duration, start, stop, clearErrors, limitError, isBillingError, maxDurationSeconds  } = useVapi(book);
    const router = useRouter();

    useEffect(() => {
      if (limitError) {
          toast.error(limitError);
          if (isBillingError) {
              router.push("/subscriptions");
          } else {
              router.push("/");
          }
          clearErrors();
      }
  }, [isBillingError, limitError, router, clearErrors]);
  
    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isConnecting = status === 'connecting...' || status === 'starting';

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
                  {isActive && (status === 'speaking' || status === 'thinking') && (
                                <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
                            )}
                    <button 
                      className={`vapi-mic-btn shadow-md w-15! h-15! z-10 ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                      aria-label="Toggle microphone"
                      onClick={isActive ? stop : start } disabled={ isConnecting }
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
                    <span className={`vapi-status-dot ${statusDotClass[status] ?? 'vapi-status-dot-ready'}`} />
                    <span className="vapi-status-text capitalize">{status}</span>
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
                      {formatDuration(duration)}/{formatDuration(maxDurationSeconds)}
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
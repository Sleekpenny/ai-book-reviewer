'use client';

import { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';
import { TranscriptProps } from '@/lib/types';


export default function Transcript({ messages = [], currentMessage = '', currentUserMessage = ''}: TranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentMessage, currentUserMessage]);

  const hasMessages = messages.length > 0 || currentMessage || currentUserMessage;

  return (
    <div className="transcript-container">
      {!hasMessages ? ( 
        // Empty State
        <div className="transcript-empty">
          {/* Mic Icon */}
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-(--bg-secondary) rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-(--text-muted)" />
            </div>
          </div>

          {/* Empty State Text */}
          <div className="space-y-1">
            <p className="transcript-empty-text">
              No conversation yet
            </p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
      ) : (  
        // Messages List
        <div className="transcript-messages">
          {/* Render existing messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`transcript-message ${
                message.role === 'user' 
                  ? 'transcript-message-user' 
                  : 'transcript-message-assistant'
              }`}
            >
              <div
                className={`transcript-bubble ${
                  message.role === 'user' 
                    ? 'transcript-bubble-user' 
                    : 'transcript-bubble-assistant'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {/* Streaming user message */}
          {currentUserMessage && (
            <div className="transcript-message transcript-message-user">
              <div className="transcript-bubble transcript-bubble-user">
                {currentUserMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          {/* Streaming assistant message */}
          {currentMessage && (
            <div className="transcript-message transcript-message-assistant">
              <div className="transcript-bubble transcript-bubble-assistant">
                {currentMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
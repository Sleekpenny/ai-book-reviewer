'use client'
import { startVoiceSession } from '@/lib/actions/session.actions';
import { DEFAULT_VOICE, ASSISTANT_ID } from "@/lib/contants";
import { IBook, Messages } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { toast } from 'sonner';
import  Vapi from '@vapi-ai/web'

export type CallStatus = 'idle' | 'connecting...' | 'starting' | 'listening' | 'thinking' | 'speaking';

const useLatestRef = <T>(value: T) => {
    const ref = useRef(value);
    useEffect(()=> {
        ref.current = value;
        console.log('VAPI_API_KEY:', process.env.NEXT_PUBLIC_VAPI_API_KEY);
        console.log('Is defined:', !!process.env.NEXT_PUBLIC_VAPI_API_KEY);
    }, [value])

    return ref;
}
const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;

let vapi: InstanceType<typeof Vapi>

    function getVapi() {
        if (!vapi) {
            if(!VAPI_API_KEY) {
                throw new Error('VAPI API KEY NOT FOUND!');
            }
            vapi = new Vapi(VAPI_API_KEY);
        }
        return vapi; 
    }

export const useVapi = (book: IBook) => {

    const { userId } = useAuth();

    const [status, setStatus ] = useState<CallStatus>('idle');
    const [messages, setMessages] = useState<Messages[]>([]);
    const [currentMessage, setCurrentMessaeg] = useState('');
    const [currentUserMessage, setCurrentUserMessage] = useState('');
    const [duration, setDuration] = useState(0);
    const [limitError, setLimitError] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimerRef = useRef<NodeJS.Timeout | null>(null);
    const sessionIdRef =  useRef<string | null>(null);
    const isStoppingRef = useRef<boolean>(false);

    const bookRef = useLatestRef(book);
    const durationRef = useLatestRef(duration);
    const voice = book.voice || DEFAULT_VOICE;

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || 'starting' ;
    
    const start = async() => {
        try {
            if (!userId) return toast.error('Please sign in to access voice a message');
            setStatus('connecting...');

            const result = await startVoiceSession( userId, book._id);
            if (!result) {
                setStatus('idle');
                return;
            }
            
            sessionIdRef.current = result.sessionId || null;
            const firstMessage = `Hey, good to meet you. Quick question, before we dive in: Have you actually read ${book.title} yet? Or are we starting fresh?`

            await getVapi().start(ASSISTANT_ID, {
                firstMessage,
                variableValues: {
                    title: book.title, author: book.author, bookId: book._id
                },

                // voice: {
                //     provider: `11labs` as const,
                //     voiceId::getVoice(voice).id,
                //     model: "eleven_turbo_v2_5" as const,
                //     stability: VOICE_SETTINGS.stability,
                //     similarityBoost: VOICE_SETTINGS.similarityBoost,
                //     style: VOICE_SETTINGS.stle,
                //     useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost
                // }
            })
        }catch (e) {
            toast.error(`Unabe to start voice session ${e}`);
            setStatus('idle');
        }
    }
    const stop = async() => {
        isStoppingRef.current = true;
        await getVapi().stop();
    }

    const clearErrors = async() => {}

    return {
        status, messages, isActive, currentMessage, currentUserMessage, duration, start, stop, clearErrors, limitError
    }
}
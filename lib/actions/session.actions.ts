"use server"

import VoiceSession from "@/database/models/voice.model";
import { connectToDatabase } from "@/database/mongose"
import { StartSessionResult } from "../types";
import { getCurrentBillingPeriodStart } from "../contants";

 export const startVoiceSession = async(clerkId:string, bookId:string): Promise<StartSessionResult> => {
    try{
        await connectToDatabase();

        const voiceSession = await VoiceSession.create({
            clerkId, bookId, startedAt: new Date(), billingPeriodStart: getCurrentBillingPeriodStart(), durationSeconds: 0
        })

        return {
            success: true,
            sessionId: voiceSession._id.toString()
        }
    }catch (e) {
        return {
            success: false,
            sessionId: `${e}`
        }
    }
 }

 export const endVoiceSession = async (sessionId:string, durationSeconds: number )=> {

    try {
        await connectToDatabase();

        await VoiceSession.findByIdAndUpdate( sessionId, { endedAt: new Date(), durationSeconds });
        return {
            success: true
        }
    }catch (e) {
        return {
            success: false,
            error: e
        }
    }
 }
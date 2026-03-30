"use server"

import VoiceSession from "@/database/models/voice.model";
import { connectToDatabase } from "@/database/mongose"
import { StartSessionResult } from "../types";
import { getCurrentBillingPeriodStart } from "../contants";


export const startVoiceSession = async (clerkId: string, bookId: string): Promise<StartSessionResult> => {
    try {
        await connectToDatabase();

        // Limits/Plan to see whether a session is allowed.
        const { getUserPlan } = await import("./subscription.server");
        const { PLAN_LIMITS, getCurrentBillingPeriodStart } = await import("../subscription.contants");

        const plan = await getUserPlan();
        const limits = PLAN_LIMITS[plan];
        const billingPeriodStart = getCurrentBillingPeriodStart();

        const sessionCount = await VoiceSession.countDocuments({
            clerkId,
            billingPeriodStart
        });

        if (sessionCount >= limits.maxSessionsPerMonth) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/");

            return {
                success: false,
                error: `You have reached the monthly session limit for your ${plan} plan (${limits.maxSessionsPerMonth}). Please upgrade for more sessions.`,
                isBillingError: true,
            };
        }

        const session = await VoiceSession.create({
            clerkId,
            bookId,
            startedAt: new Date(),
            billingPeriodStart,
            durationSeconds: 0,
        });

        return {
            success: true,
            sessionId: session._id.toString(),
            maxDurationMinutes: limits.maxDurationPerSession,
        }
    } catch (e) {
        console.error('Error starting voice session', e);
        return { success: false, error: 'Failed to start voice session. Please try again later.' }
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
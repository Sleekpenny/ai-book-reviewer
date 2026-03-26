import { IVoiceSession } from "@/lib/types";
import { model, models, Schema } from "mongoose";

const VoiceSegmentSchema = new Schema<IVoiceSession>({
    clerkId: {type:String, required: true, index: true},
    bookId: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    startedAt: {type:Date, required: true, defaut: Date.now},
    endedAt: { type: Date},
    durationSeconds: { type: Number, defaut:0, required: true },
    billingPeriodStart: {type: Date, required:true, index: true}
}, {timestamps: true});

VoiceSegmentSchema.index({ clerkId:1, billingPeriodStart: 1})

const VoiceSession = models.VoiceSession || model<IVoiceSession>('VoiceSession', VoiceSegmentSchema);
export default VoiceSession
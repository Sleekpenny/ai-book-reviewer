import { Types } from "mongoose";

export interface booksCardProps {
    title: string;
    slug: string;
    coverURL: string;
    author: string;
}

export interface IBook {
    _id: string;
    clerkId: string;
    title: string;
    slug: string;
    author: string;
    persona?: string;
    fileURL: string;
    fileBlobKey: string;
    coverURL: string;
    coverBlogKey: string;
    fileSize: number;
    totalSegments: number;
    createdAt: Date;
    updateAt: Date
}

export interface IBookSegment {
    clerkId:string;
    bookId:Types.ObjectId;
    content:string;
    segmentIndex:number;
    pageNumber:number;
    wordCount:number;
    createdAt:Date;
    updateAt:Date
}

export interface IVoiceSession {
    _id:string;
    clerkId:string;
    bookId:Types.ObjectId;
    startedAt:Date;
    endedAt:Date;
    durationSeconds: number;
    billingPeriodStart:Date;
    createdAt: Date;
    updatedAt: Date
}

export interface CreateBook {
    clerkId: string;
    title:string;
    author:string;
    persona?:string;
    fileURL:string;
    fileBlobKey:string;
    coverURL?: string;
    coverBlobKey?:string;
    fileSize:number
}

export interface TextSegment {
    text:string;
    segmentIndex:string | number;
    pageNumber?: number;
    wordCount: string | number;
}

export interface Messages {
    role:string;
    content: string
}

export interface TranscriptProps {
    messages?: Messages[];
    currentMessage?: string;
    currentUserMessage?: string;
  }

export interface StartSessionResult {
    success:boolean;
    sessionId: string;
    maxDurationMinutes?: number;
    error?: string;
}

export interface EndSessionResult {
    success: boolean;
    error?: string
}

// export interface SessionCheckResult {
//     allowed: boolean;
//     currentCount: number;
//     limit: number;
//     pan: PlanType;
//     maxDurationMinutes: number;
//     error?: string;
// }
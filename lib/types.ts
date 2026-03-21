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
    voice?:string;
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
"use server"
 
import { connectToDatabase } from "@/database/mongose";
import { CreateBook, TextSegment} from "../types";
import { escapeRegex, generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";
import mongoose from "mongoose";

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title);

        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true,
            }
        }

        // Todo: Check subscription limits before creating a book
        const { getUserPlan } = await import("./subscription.server");
        const { PLAN_LIMITS } = await import("../subscription.contants");

        const { auth } = await import("@clerk/nextjs/server");
        const { userId } = await auth();

        if (!userId || userId !== data.clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const plan = await getUserPlan();
        const limits = PLAN_LIMITS[plan];

        const bookCount = await Book.countDocuments({ clerkId: userId });
        if (bookCount >= limits.maxBooks) {
            const { revalidatePath } = await import("next/cache");
            revalidatePath("/");

            return {
                success: false,
                error: `You have reached the maximum number of books allowed for your ${plan} plan (${limits.maxBooks}). Please upgrade to add more books.`,
                isBillingError: true,
            };
        }

        const book = await Book.create({...data, clerkId: userId, slug, totalSegments: 0});

        return {
            success: true,
            data: serializeData(book),
        }
    } catch (e) {
        console.error('Error creating a book', e);

        return {
            success: false,
            error: e,
        }
    }
}
 

export const saveBookSegments = async (bookId:string, clerkId:string, segments: TextSegment[]) => {
    try {
        await connectToDatabase();
        const segmentsToInsert = segments.map(( {text, segmentIndex, pageNumber, wordCount} )=>({
            bookId, clerkId, content:text, segmentIndex, pageNumber, wordCount
        }));
        
        await BookSegment.insertMany(segmentsToInsert);
        await Book.findByIdAndUpdate(bookId, {totalSegents: segments.length});
        console.log('Book segments saved successfully');

        return {
            success:true,
            data: {segmentsCreated: segments.length}
        }

    } catch(e) {
        await BookSegment.deleteMany({ bookId });
        await Book.findByIdAndDelete( bookId );
        console.log('Deleted book segments and book due to failure to save segments properly', e);

        return {
            success: false,
            error: e
        }
    }
}

export const checkIfBookExit = async (title: string) => {
    try {
        await connectToDatabase();
    
        const slug = generateSlug(title);
        const existingBookWithSlug = await Book.findOne({ slug }).lean();
    
        if(existingBookWithSlug) {
            return {
                exists: true, 
                book: serializeData(existingBookWithSlug)
            }
        }

        return {
            exists: false
        }
    } catch (e) {
        console.log('Book does not exist, create a book');
        return {
            exists: false,
            error: e
        }
    }

}

export const getAllBooks = async () => {
    try {
        await connectToDatabase();

        const getBooks =  await Book.find().sort({ createdAt: -1}).lean();
        return {
            success: true,
            data: serializeData(getBooks)
        }

    } catch (e) {
        console.error('Error getting books from database', e);
        return {
            success: false,
            error: e
        }
    }
}

export const getBookBySlug = async (slug:string) => {
    await connectToDatabase();
    try {
        const existing = await Book.findOne({ slug }).lean();
        if (!existing) {
            return {
                success: false,
            }
        }
         return {
             success: true,
             book: serializeData(existing),
             alreadyExits: true
         }
        
    } catch (e) {
        return {
            success: false,
            error: console.log('Error in finding book', e)
        }
    }
}

// Searches book segments using MongoDB text search with regex fallback
export const searchBookSegments = async (bookId: string, query: string, limit: number = 5) => {
    try {
        await connectToDatabase();

        console.log(`Searching for: "${query}" in book ${bookId}`);

        const bookObjectId = new mongoose.Types.ObjectId(bookId);

        // Try MongoDB text search first (requires text index)
        let segments: Record<string, unknown>[] = [];
        try {
            segments = await BookSegment.find({
                bookId: bookObjectId,
                $text: { $search: query },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ score: { $meta: 'textScore' } })
                .limit(limit)
                .lean();
        } catch {
            // Text index may not exist — fall through to regex fallback
            segments = [];
        }

        // Fallback: regex search matching ANY keyword
        if (segments.length === 0) {
            const keywords = query.split(/\s+/).filter((k) => k.length > 2);
            const pattern = keywords.map(escapeRegex).join('|');

            segments = await BookSegment.find({
                bookId: bookObjectId,
                content: { $regex: pattern, $options: 'i' },
            })
                .select('_id bookId content segmentIndex pageNumber wordCount')
                .sort({ segmentIndex: 1 })
                .limit(limit)
                .lean();
        }

        console.log(`Search complete. Found ${segments.length} results`);

        return {
            success: true,
            data: serializeData(segments),
        };
    } catch (error) {
        console.error('Error searching segments:', error);
        return {
            success: false,
            error: (error as Error).message,
            data: [],
        };
    }
};
    

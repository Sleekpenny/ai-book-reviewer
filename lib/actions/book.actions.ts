"use server"
 
import { connectToDatabase } from "@/database/mongose";
import { CreateBook, TextSegment} from "../types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();
        const slug = generateSlug(data.title);

       const checkIfBookExistWithSlug = await Book.findOne({slug}).lean();
       if (checkIfBookExistWithSlug) {
        return {
            success: true,
            data: serializeData(checkIfBookExistWithSlug),
            alreadyExits: true
        }
       }

       const createNewBook = await Book.create({...data, slug, totalSegments: 0})
       return {
        success: true,
        data: serializeData(createNewBook),
        alreadyExits: false,
       }
    } catch (e) { 
        return {
            success: false,
            error: e
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
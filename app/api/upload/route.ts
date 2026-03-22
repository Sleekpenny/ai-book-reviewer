
import { MAX_FILE_SIZE } from "@/lib/contants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"

export const POST = async (request: Request): Promise<NextResponse>=> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({ 
            token: process.env.BLOB_READ_WRITE_TOKEN,
            body, 
            request, 
            onBeforeGenerateToken: async () => {const { userId } = await auth()            
            console.log('id from the route file', userId)
            if(!userId) {
                throw new Error("Unauthorized: User not authenticated");
            }
             return {
                allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/wbp'],
                addRandomSuffix: true,
                maximumSizeInBytes: MAX_FILE_SIZE,
                tokenPayload:JSON.stringify({ userId })
             }},
             onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('File uploaded to blob:', blob.url)

                const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
                const userId = payload?.userId;
             }
            });

            return NextResponse.json(jsonResponse);
    } catch (e) {
        const message = e instanceof Error ? e.message : " An unknown error occured";
        const status = message.includes('Unauthorized') ? 401 : 500
        return NextResponse.json({ error: message }, { status })
    }
}
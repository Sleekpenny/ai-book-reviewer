import { NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.actions';

// ✅ Wrap any async operation with a timeout to prevent Vapi from hanging
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);
}

async function processBookSearch(bookId: unknown, query: unknown) {
    if (bookId == null || query == null || query === '') {
        return { result: 'Missing bookId or query.' };
    }

    const bookIdStr = String(bookId).trim();
    const queryStr = String(query).trim();

    if (!bookIdStr || bookIdStr === 'null' || bookIdStr === 'undefined' || !queryStr) {
        return { result: 'Missing bookId or query.' };
    }

    console.log(`[search-book] Searching bookId="${bookIdStr}" query="${queryStr}"`);

    // ✅ 8 second timeout — prevents Vapi from hanging and killing the session
    const searchResult = await withTimeout(
        searchBookSegments(bookIdStr, queryStr, 3),
        8000,
        { success: false, data: [], error: 'Search timed out' }
    );

    if (!searchResult.success || !searchResult.data?.length) {
        console.warn('[search-book] No results found:', searchResult.error);
        return {
            result: "I don't have specific information about that in the book's content. Let me share what I know from general knowledge about this topic.",
        };
    }

    const combinedText = searchResult.data
        .map((segment) => (segment as { content: string }).content)
        .join('\n\n');

    console.log(`[search-book] Found ${searchResult.data.length} segments, total chars: ${combinedText.length}`);

    return { result: combinedText };
}

function parseArgs(args: unknown): Record<string, unknown> {
    if (!args) return {};
    if (typeof args === 'string') {
        try { return JSON.parse(args); } catch { return {}; }
    }
    return args as Record<string, unknown>;
}

export async function GET() {
    return NextResponse.json({ status: 'ok' });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log('[search-book] Incoming request body:', JSON.stringify(body, null, 2));

        const functionCall = body?.message?.functionCall;
        const toolCallList = body?.message?.toolCallList || body?.message?.toolCalls;

        // ── Single functionCall format ──────────────────────────────────────
        if (functionCall) {
            const { name, parameters } = functionCall;
            const parsed = parseArgs(parameters);

            if (name === 'searchBook') {
                const result = await processBookSearch(parsed.bookId, parsed.query);
                return NextResponse.json(result);
            }

            return NextResponse.json({ result: `Unknown function: ${name}` });
        }

        // ── toolCallList format ─────────────────────────────────────────────
        if (!toolCallList || toolCallList.length === 0) {
            // ✅ Some Vapi versions send the call directly on body (no message wrapper)
            if (body?.function?.name === 'searchBook' || body?.name === 'searchBook') {
                const args = parseArgs(body?.function?.arguments || body?.arguments || body?.parameters);
                const result = await processBookSearch(args.bookId, args.query);
                return NextResponse.json(result);
            }

            console.warn('[search-book] No tool calls found in request');
            return NextResponse.json({
                results: [{ result: 'No tool calls found in the request.' }],
            });
        }

        const results = [];

        for (const toolCall of toolCallList) {
            const { id, function: func } = toolCall;
            const name = func?.name;
            const args = parseArgs(func?.arguments);

            if (name === 'searchBook') {
                const searchResult = await processBookSearch(args.bookId, args.query);
                results.push({ toolCallId: id, ...searchResult });
            } else {
                results.push({ toolCallId: id, result: `Unknown function: ${name}` });
            }
        }

        return NextResponse.json({ results });

    } catch (error) {
        console.error('[search-book] Error processing request:', error);
        // ✅ Always return a valid response so Vapi doesn't kill the session
        return NextResponse.json({
            results: [{
                result: "I'm having trouble accessing the book content right now. Let me answer based on what I know about this book.",
            }],
        });
    }
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TextSegment } from './types';
import { DEFAULT_VOICE, voiceOptions } from './contants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text:string):string {
  return text
  .replace(/\.[^/.]+$/, '') //Remove fle extension (.pdf, .txt, etc.)
  .toLowerCase() // Convert to toLowerCase
  .trim() // Remove whitespace from both ends
  .replace(/[^\w\s-]/g, '') //Remove special chracters (keep letters, numbers, spaces, hyphen)
  .replace(/[\s_]+/g, '-') //Replace spaces and undersore with hypens
  .replace(/^-+|-+$/g, ''); // Remove leadig/trailing hyhens
}

export const serializeData = <T>(data: T):T => {
  return JSON.parse(JSON.stringify(data));
}

export const getVoice = (persona?: string) => {
  if (!persona) return voiceOptions[DEFAULT_VOICE];

  // Find by voice ID
  const voiceEntry = Object.values(voiceOptions).find((v) => v.id === persona);
  if (voiceEntry) return voiceEntry;

  // Find by key
  const voiceByKey = voiceOptions[persona as keyof typeof voiceOptions];
  if (voiceByKey) return voiceByKey;

  // Default fallback
  return voiceOptions[DEFAULT_VOICE];
};

// Format duration in seconds to MM:SS format
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const splitIntoSegments = (
  text: string,
  segmentSize: number = 500, // Maximum words per segment
  overlapSize: number = 50, // Words to overlap between segments for context
): TextSegment[] => {
// Validate parameters to prevent infinite loops
if (segmentSize <= 0) {
  throw new Error('segmentSize must be greater than 0');
}
if (overlapSize < 0 || overlapSize >= segmentSize) {
  throw new Error('overlapSize must be >= 0 and < segmentSize');
}

const words = text.split(/\s+/).filter((word) => word.length > 0);
const segments: TextSegment[] = [];

let segmentIndex = 0;
let startIndex = 0;

while (startIndex < words.length) {
  const endIndex = Math.min(startIndex + segmentSize, words.length);
  const segmentWords = words.slice(startIndex, endIndex);
  const segmentText = segmentWords.join(' ');

  segments.push({
    text: segmentText,
    segmentIndex,
    wordCount: segmentWords.length,
  });

  segmentIndex++;

  if (endIndex >= words.length) break;
  startIndex = endIndex - overlapSize;
}

return segments;
};


// Escape regex special characters to prevent ReDoS attacks
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

function loadPdfjsFromCDN(): Promise<any> {
  return new Promise((resolve, reject) => {
    // If already loaded, reuse it
    if ((window as any).pdfjsLib) {
      return resolve((window as any).pdfjsLib);
    }
 
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) return reject(new Error('pdfjsLib not found on window after script load'));
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
    document.head.appendChild(script);
  });
}

export async function parsePDFFile(file: File) {
  try {
    // Load pdfjs outside of webpack — bypasses the Object.defineProperty crash
    const pdfjsLib = await loadPdfjsFromCDN();
 
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
 
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
 
    // Render first page as cover image
    const firstPage = await pdfDocument.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2 });
 
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
 
    if (!context) {
      throw new Error('Could not get canvas context');
    }
 
    await firstPage.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
 
    // Convert canvas to data URL
    const coverDataURL = canvas.toDataURL('image/png');
 
    // Extract text from all pages
    let fullText = '';
 
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => 'str' in item)
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
 
    // Split text into segments for search
    const segments = splitIntoSegments(fullText);
 
    // Clean up PDF document resources
    await pdfDocument.destroy();
 
    return {
      content: segments,
      cover: coverDataURL,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(
      `Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
import { Index } from '@upstash/vector';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Ensure environment variables are set
const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL;
const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;
const GEMINI_EMBEDDING_API_KEY = process.env.GEMINI_EMBEDDING_API_KEY;

if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
  console.error('Upstash Vector environment variables are not set');
}

if (!GEMINI_EMBEDDING_API_KEY) {
  console.error('Gemini AI API key is not set');
}

// Initialize Upstash Vector client
export const vectorClient = new Index({
  url: UPSTASH_VECTOR_REST_URL || '',
  token: UPSTASH_VECTOR_REST_TOKEN || '',
});

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_EMBEDDING_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

/**
 * Generate embedding for text using Google's text-embedding-004 model
 * @param text - The text to generate embedding for
 * @returns Promise<number[]> - The embedding vector
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const result = await embeddingModel.embedContent([{ text }]);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}; 
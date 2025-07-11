import { vectorClient, generateEmbedding } from '../config/upstashVector';
import KnowledgeBaseDocument, { IKnowledgeBaseDocument } from '../models/knowledgeBaseDocument.model';

/**
 * Splits text into smaller chunks for vector storage
 * @param text - The text to chunk
 * @param chunkSize - The maximum size of each chunk (default: 500)
 * @returns Array of text chunks
 */
export const chunkText = (text: string, chunkSize: number = 500): string[] => {
  // Simple chunking by splitting on periods and then combining until reaching chunk size
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Extract text content from a PDF buffer
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Extracted text from the PDF
 * 
 * NOTE: This is a placeholder function. PDF parsing will be implemented later.
 */
export const extractTextFromPDF = async (pdfBuffer: Buffer): Promise<string> => {
  // Placeholder for future PDF parsing implementation
  console.warn('PDF parsing not yet implemented. Returning empty string.');
  return '';
};

/**
 * Upserts document vectors to Upstash Vector
 * @param documentId - MongoDB ID of the KnowledgeBaseDocument
 */
export const upsertDocumentVector = async (documentId: string): Promise<void> => {
  try {
    // Find the document in MongoDB
    const document = await KnowledgeBaseDocument.findById(documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }

    // Extract text content based on document type
    let textContent = document.content;
    if (document.documentType === 'pdf') {
      // PDF parsing will be implemented later
      // For now, just use the content as is or set a placeholder message
      textContent = "PDF content extraction not yet implemented.";
    }

    // Chunk the text
    const chunks = chunkText(textContent);
    
    // Generate and upsert vectors for each chunk
    const vectorIds: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vectorId = `${documentId}_chunk_${i}`;
      vectorIds.push(vectorId);
      
      // Generate embedding for the chunk
      const embedding = await generateEmbedding(chunk);
      
      // Prepare metadata for the vector
      const metadata = {
        text_content: chunk.substring(0, 200) + (chunk.length > 200 ? '...' : ''), // Preview of the chunk
        source_document_id: documentId,
        document_title: document.title,
        document_type: document.documentType,
        category: document.category || '',
        tags: document.tags ? document.tags.join(', ') : '',
        chunk_index: i.toString(),
        total_chunks: chunks.length.toString(),
      };
      
      // Upsert the vector to Upstash Vector
      await vectorClient.upsert({
        id: vectorId,
        vector: embedding,
        metadata,
      });
    }
    
    // Update the document in MongoDB
    document.isIndexed = true;
    document.lastIndexedAt = new Date();
    document.vectorId = vectorIds.join(','); // Store all chunk IDs
    await document.save();
    
    console.log(`Successfully indexed document: ${document.title}`);
  } catch (error) {
    console.error('Error upserting document vector:', error);
    throw error;
  }
};

/**
 * Deletes document vectors from Upstash Vector
 * @param documentId - MongoDB ID of the KnowledgeBaseDocument
 */
export const deleteDocumentVectors = async (documentId: string): Promise<void> => {
  try {
    // Find the document in MongoDB
    const document = await KnowledgeBaseDocument.findById(documentId);
    if (!document) {
      throw new Error(`Document with ID ${documentId} not found`);
    }
    
    // If the document has vectorIds stored, delete them from Upstash Vector
    if (document.vectorId) {
      const vectorIds = document.vectorId.split(',');
      await vectorClient.delete({ ids: vectorIds });
    }
    
    // Update the document in MongoDB
    document.isIndexed = false;
    document.lastIndexedAt = undefined;
    document.vectorId = undefined;
    await document.save();
    
    console.log(`Successfully deleted vectors for document: ${document.title}`);
  } catch (error) {
    console.error('Error deleting document vectors:', error);
    throw error;
  }
};

/**
 * Updates document vectors in Upstash Vector
 * @param documentId - MongoDB ID of the KnowledgeBaseDocument
 */
export const updateDocumentVector = async (documentId: string): Promise<void> => {
  try {
    // First delete existing vectors
    await deleteDocumentVectors(documentId);
    // Then create new vectors
    await upsertDocumentVector(documentId);
  } catch (error) {
    console.error('Error updating document vector:', error);
    throw error;
  }
}; 
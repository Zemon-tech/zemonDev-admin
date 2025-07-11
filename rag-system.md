**Objective:** Implement a new "Knowledge Base" section for managing documents that will populate the RAG system. This includes a new MongoDB model, API endpoints, and UI components for CRUD operations, triggering vector upsert/deletion in Upstash Vector Database.

**Context:**

- Upstash Vector Database will be used for vector storage.
- Google Gemini `text-embedding-004` will be used for embedding generation.

**Part 1: ZemonDev-admin Backend Implementation**

**Tasks:**

1.  **Configure Upstash Vector & Gemini AI Clients:**

    - **Environment Variables:** Ensure the `zemonDev-admin` backend's `.env` file includes:
      - `UPSTASH_VECTOR_REST_URL`
      - `UPSTASH_VECTOR_REST_TOKEN`
      - `GEMINI_EMBEDDING_API_KEY` (a dedicated key for embeddings, as discussed).
    - **Client Initialization:** In a new utility file (e.g., `backend-admin/src/config/upstashVector.ts`) or within a new `knowledgeBase.service.ts`:
      - Import `Vector` from `@upstash/vector`.
      - Initialize and export a `Vector` client instance using `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN`.
      - Initialize `GoogleGenerativeAI` and get the `text-embedding-004` model for embeddings using `GEMINI_EMBEDDING_API_KEY`.
      - Create and export a `generateEmbedding(text: string): Promise<number[]>` function that correctly calls `embeddingModel.embedContent({ parts: [{ text: text }] })`.

2.  **Define New MongoDB Model: `KnowledgeBaseDocument`:**

    - Create a new Mongoose schema and model (e.g., `backend-admin/src/models/knowledgeBaseDocument.model.ts`).
    - **Fields:**
      - `title: { type: String, required: true, unique: true }`
      - `content: { type: String, required: true }` (Stores the raw, extracted text content. For PDFs, this would be the extracted text.)
      - `documentType: { type: String, enum: ['text', 'markdown', 'pdf', 'webpage', 'code_snippet', 'json'], required: true }`
      - `sourceUrl: { type: String }` (Optional, for web-sourced content)
      - `category: { type: String }` (Optional, e.g., 'Crucible Problem', 'Forge Resource', 'Algorithm Theory')
      - `tags: [{ type: String }]` (Optional, for keywords)
      - `metadata: { type: Map, of: String }` (Optional, flexible key-value pairs for additional context, e.g., `originalFilename`, `problemId`, `resourceId`).
      - `vectorId: { type: String, unique: true, sparse: true }` (Stores the ID of the vector in Upstash Vector, for easy lookup/deletion).
      - `isIndexed: { type: Boolean, default: false }` (Indicates if it's successfully indexed in Upstash Vector).
      - `lastIndexedAt: { type: Date }` (Timestamp of the last successful vector operation).
      - `createdAt: { type: Date, default: Date.now }`
      - `updatedAt: { type: Date, default: Date.now }`

3.  **Implement `KnowledgeBaseService` (or similar):**

    - Create a new service file (e.g., `backend-admin/src/services/knowledgeBase.service.ts`).
    - This service will contain the core logic for interacting with Upstash Vector.
    - **`chunkText(text: string, chunkSize: number = 500): string[]`:** A helper function to split large text into smaller chunks.
    - **`upsertDocumentVector(documentId: string)`:**
      - Takes a `KnowledgeBaseDocument` MongoDB `_id`.
      - Fetches the `KnowledgeBaseDocument` from MongoDB.
      - If `documentType` is 'pdf', use a Node.js PDF parsing library (e.g., `pdf-parse`) to extract text from the `content` field. If `content` is already text, use it directly.
      - Chunk the extracted text.
      - For each chunk:
        - Generate an embedding using the `generateEmbedding` function.
        - Construct a unique `vectorId` for each chunk (e.g., `${documentId}_chunk_${index}`).
        - Prepare metadata for the vector (e.g., `text_content`, `source_document_id`, `document_title`, `document_type`, `category`, `tags`).
        - Call `vector.upsert([{ id: vectorId, vector: embedding, metadata: { ... } }])`.
      - After successful upsertion of all chunks, update the `KnowledgeBaseDocument` in MongoDB: set `isIndexed: true`, `lastIndexedAt: Date.now()`, and `vectorId` (if it's a single vector ID for the whole doc, otherwise this field might be removed or used for a list of chunk IDs).
      - Include robust error handling and logging.
    - **`deleteDocumentVectors(documentId: string)`:**
      - Takes a `KnowledgeBaseDocument` MongoDB `_id`.
      - Retrieve the `KnowledgeBaseDocument` from MongoDB to get its associated `vectorId` (or derive chunk `vectorId`s if multiple per doc).
      - Call `vector.delete([vectorId1, vectorId2, ...])` for all chunks related to this document.
      - After successful deletion, update the `KnowledgeBaseDocument` in MongoDB: set `isIndexed: false`, `lastIndexedAt: null`, and clear `vectorId`.
      - Include robust error handling and logging.

4.  **Create New API Routes and Controllers:**
    - Create `backend-admin/src/api/knowledgeBase.routes.ts` and `backend-admin/src/controllers/knowledgeBase.controller.ts`.
    - **`POST /api/admin/knowledge-base/documents`:**
      - Controller receives document data.
      - Saves new `KnowledgeBaseDocument` to MongoDB.
      - **Crucial:** After successful MongoDB save, call `knowledgeBase.service.upsertDocumentVector(newDocument._id)`.
      - Return success response.
    - **`GET /api/admin/knowledge-base/documents`:**
      - Controller retrieves and returns a paginated list of `KnowledgeBaseDocument`s from MongoDB.
    - **`GET /api/admin/knowledge-base/documents/:id`:**
      - Controller retrieves and returns a single `KnowledgeBaseDocument` from MongoDB.
    - **`PUT /api/admin/knowledge-base/documents/:id`:**
      - Controller receives updated document data.
      - Updates `KnowledgeBaseDocument` in MongoDB.
      - **Crucial:** After successful MongoDB update, call `knowledgeBase.service.updateDocumentVector(documentId)` (which internally deletes old and upserts new).
      - Return success response.
    - **`DELETE /api/admin/knowledge-base/documents/:id`:**
      - Controller deletes `KnowledgeBaseDocument` from MongoDB.
      - **Crucial:** Before or after MongoDB deletion, call `knowledgeBase.service.deleteDocumentVectors(documentId)`.
      - Return success response.

**Part 2: ZemonDev-admin Frontend Implementation**

**Context:** `frontend-admin` project structure (React, Tailwind CSS, DaisyUI, React Router).

**Tasks:**

1.  **Create New Page Component: `KnowledgeBasePage.tsx`:**

    - Create a new file `frontend-admin/src/pages/KnowledgeBasePage.tsx`.
    - Add this page to your React Router configuration so it's accessible via a route (e.g., `/admin/knowledge-base`).

2.  **Update Sidebar Navigation:**

    - Modify `frontend-admin/src/components/layout/Sidebar.tsx` to include a new navigation link for "Knowledge Base" that points to the new `/admin/knowledge-base` route.
    - Use an appropriate Lucide React icon (e.g., `BookText` or `FileText`). Maintain the existing DaisyUI/Tailwind CSS styling for consistency.

3.  **Design `KnowledgeBasePage.tsx` UI Components:**

    - **Overall Layout:** Use `AppLayout` (or similar) to maintain the consistent admin dashboard look and feel.
    - **Header:** A clear heading "Knowledge Base Management" with a "Add New Document" button.
    - **Document List Table:**
      - Display a table listing existing `KnowledgeBaseDocument`s.
      - Columns should include: `Title`, `Type`, `Category`, `Last Indexed`, `Is Indexed`, `Actions`.
      - Use DaisyUI table components and Tailwind CSS for styling.
      - Implement pagination and basic filtering/sorting if possible.
      - Each row should have "Edit" and "Delete" buttons.
    - **Add/Edit Document Form (Modal or Separate Page):**
      - When "Add New Document" or "Edit" is clicked, display a form.
      - Fields: `Title` (text input), `Content` (textarea for raw text, or file upload for PDF/Markdown), `Document Type` (dropdown with enum values), `Source URL` (text input), `Category` (text input/dropdown), `Tags` (multi-select/tag input).
      - "Save" and "Cancel" buttons.
      - **For PDF Upload:** Implement a file input (`<input type="file" accept=".pdf" />`). When a PDF is uploaded, read its content (e.g., using `FileReader` on the client-side to get a Base64 string or ArrayBuffer) and send it to the backend's `content` field. The backend will then handle the PDF text extraction.
      - **For Webpage Content:** A URL input. The backend could potentially fetch content from this URL (though this adds complexity, focus on direct text/file input first).

4.  **Implement Frontend API Interactions:**
    - Create a new API client file (e.g., `frontend-admin/src/lib/knowledgeBaseApi.ts`) using Axios.
    - Functions for:
      - `createKnowledgeBaseDocument(data: FormData | { title: string, content: string, ... })`
      - `getKnowledgeBaseDocuments()`
      - `getKnowledgeBaseDocumentById(id: string)`
      - `updateKnowledgeBaseDocument(id: string, data: { ... })`
      - `deleteKnowledgeBaseDocument(id: string)`
    - Integrate these API calls into the `KnowledgeBasePage.tsx` and its form components.
    - Implement loading states and error handling for API calls.

---

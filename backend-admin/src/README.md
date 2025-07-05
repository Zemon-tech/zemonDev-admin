# Crucible Backend Implementation for Admin Site

This document outlines the implementation of the Crucible backend for the admin site, including models, controllers, and API endpoints.

## Models

We've implemented the following Mongoose models to support the Crucible platform:

1. **CrucibleProblem (Enhanced)**
   - Added fields for learning objectives, prerequisites, user personas, etc.
   - Supports richer problem descriptions and context
   - Added status field for publishing/unpublishing problems

2. **CrucibleSolution**
   - Stores final submitted solutions
   - Includes AI analysis and peer reviews

3. **SolutionDraft**
   - Stores in-progress solutions with version history
   - Supports auto-save functionality

4. **CrucibleNote**
   - Stores user notes related to problems
   - Supports tagging and visibility settings

5. **AIChatHistory**
   - Stores AI conversations related to problem-solving
   - Supports multiple chat sessions per problem

6. **WorkspaceState**
   - Stores user workspace configuration and state
   - Preserves layout and editor settings

7. **CrucibleDiagram**
   - Stores diagrams and visual aids
   - Supports multiple diagram types

8. **ProgressTracking**
   - Tracks user progress on problems
   - Supports milestones and time tracking

9. **ResearchItem**
   - Stores research materials and references
   - Supports different content types

## API Endpoints

We've implemented a comprehensive set of RESTful API endpoints for the admin site:

### Dashboard Stats
- `GET /api/crucible/dashboard`: Get statistics for Crucible problems and solutions

### Problem Management
- `GET /api/crucible`: Get all problems
- `GET /api/crucible/:id`: Get a single problem by ID
- `POST /api/crucible`: Create a new problem
- `PUT /api/crucible/:id`: Update a problem
- `DELETE /api/crucible/:id`: Delete a problem

### Solution Management
- `GET /api/crucible/:problemId/solutions`: Get all solutions for a problem
- `GET /api/crucible/:problemId/solutions/:id`: Get a solution by ID
- `PUT /api/crucible/:problemId/solutions/:id`: Update solution status or add review

### Draft Management
- `GET /api/crucible/:problemId/drafts`: Get all solution drafts for a problem
- `GET /api/crucible/:problemId/drafts/:id`: Get a draft by ID
- `PUT /api/crucible/:problemId/drafts/:id`: Update draft status (archive/unarchive)

### Notes Management
- `GET /api/crucible/:problemId/notes`: Get all notes for a problem
- `GET /api/crucible/:problemId/notes/:id`: Get a note by ID

### AI Chat Management
- `GET /api/crucible/:problemId/chats`: Get all chat sessions for a problem
- `GET /api/crucible/:problemId/chats/:id`: Get a specific chat session
- `PUT /api/crucible/:problemId/chats/:id`: Update chat session status or tags

### Workspace State Management
- `GET /api/crucible/:problemId/workspace`: Get all workspace states for a problem
- `GET /api/crucible/:problemId/workspace/:id`: Get a workspace state by ID

### Diagram Management
- `GET /api/crucible/:problemId/diagrams`: Get all diagrams for a problem
- `GET /api/crucible/:problemId/diagrams/:id`: Get a diagram by ID
- `DELETE /api/crucible/:problemId/diagrams/:id`: Delete a diagram

### Progress Tracking
- `GET /api/crucible/:problemId/progress`: Get all progress tracking entries for a problem
- `GET /api/crucible/:problemId/progress/:id`: Get a progress entry by ID

### Research Items
- `GET /api/crucible/:problemId/research`: Get all research items for a problem
- `GET /api/crucible/:problemId/research/:id`: Get a research item by ID
- `DELETE /api/crucible/:problemId/research/:id`: Delete a research item

## Security

All endpoints are protected with admin-level authentication middleware:

```typescript
router.route('/').get(protect, admin, getProblems);
```

This ensures that only authenticated admin users can access these endpoints.

## Filtering

Most list endpoints support filtering by userId:

```typescript
// Example: GET /api/crucible/:problemId/drafts?userId=123
const { userId } = req.query;
const query: any = { problemId };
if (userId) {
    query.userId = userId;
}
```

## Dashboard Statistics

The dashboard endpoint provides the following statistics:

- Total problems count
- Problems by status
- Problems by difficulty
- Total solutions count
- Solutions by status
- Recent solutions (with user and problem details)
- Active users count (users with recent activity)

## Next Steps

1. **Frontend Integration**
   - Create admin UI components for all Crucible entities
   - Implement data tables with filtering and sorting

2. **Testing**
   - Write unit tests for models and controllers
   - Write integration tests for API endpoints

3. **Documentation**
   - Create API documentation using Swagger/OpenAPI
   - Document data models and relationships

4. **Monitoring**
   - Set up monitoring for API performance
   - Implement logging for admin actions 

classDiagram
    class User {
        +String email
        +String password
        +String fullName
        +String role
    }
    
    class CrucibleProblem {
        +String title
        +String description
        +String difficulty
        +String[] tags
        +Object requirements
        +String[] constraints
        +String expectedOutcome
        +String[] hints
        +String[] learningObjectives
        +String[] prerequisites
        +String[] userPersonas
        +Object[] resources
        +Object[] aiHints
        +String status
        +ObjectId createdBy
        +Object metrics
    }
    
    class CrucibleSolution {
        +ObjectId problemId
        +ObjectId userId
        +String content
        +String status
        +Object aiAnalysis
        +Object[] reviews
        +Object metrics
    }
    
    class SolutionDraft {
        +ObjectId problemId
        +ObjectId userId
        +String content
        +Object[] versions
        +String status
        +Date lastSaved
    }
    
    class CrucibleNote {
        +ObjectId problemId
        +ObjectId userId
        +String content
        +String[] tags
        +String visibility
        +Date lastSaved
    }
    
    class AIChatHistory {
        +ObjectId problemId
        +ObjectId userId
        +String sessionId
        +String title
        +Object[] messages
        +String[] tags
        +String status
    }
    
    class WorkspaceState {
        +ObjectId problemId
        +ObjectId userId
        +Object layout
        +String activeContent
        +String currentMode
        +Object editorSettings
    }
    
    class CrucibleDiagram {
        +ObjectId problemId
        +ObjectId userId
        +String title
        +String type
        +String content
        +String description
    }
    
    class ProgressTracking {
        +ObjectId problemId
        +ObjectId userId
        +Number timeSpent
        +Object[] milestones
        +String status
        +Date startedAt
        +Date completedAt
    }
    
    class ResearchItem {
        +ObjectId problemId
        +ObjectId userId
        +String title
        +String type
        +String content
        +String url
        +String[] tags
    }
    
    User "1" -- "many" CrucibleProblem: creates
    User "1" -- "many" CrucibleSolution: submits
    User "1" -- "many" SolutionDraft: works on
    User "1" -- "many" CrucibleNote: writes
    User "1" -- "many" AIChatHistory: participates
    User "1" -- "many" WorkspaceState: configures
    User "1" -- "many" CrucibleDiagram: creates
    User "1" -- "many" ProgressTracking: tracks
    User "1" -- "many" ResearchItem: collects
    
    CrucibleProblem "1" -- "many" CrucibleSolution: has
    CrucibleProblem "1" -- "many" SolutionDraft: has
    CrucibleProblem "1" -- "many" CrucibleNote: has
    CrucibleProblem "1" -- "many" AIChatHistory: has
    CrucibleProblem "1" -- "many" WorkspaceState: has
    CrucibleProblem "1" -- "many" CrucibleDiagram: has
    CrucibleProblem "1" -- "many" ProgressTracking: has
    CrucibleProblem "1" -- "many" ResearchItem: has

graph TD
    A[Admin Backend API] --> B["/api/crucible"]
    
    B --> B1["GET / - Get all problems"]
    B --> B2["POST / - Create problem"]
    B --> B3["GET /:id - Get problem by ID"]
    B --> B4["PUT /:id - Update problem"]
    B --> B5["DELETE /:id - Delete problem"]
    B --> BD["GET /dashboard - Get stats"]
    
    B --> C["/api/crucible/:problemId/solutions"]
    C --> C1["GET / - Get all solutions"]
    C --> C2["GET /:id - Get solution by ID"]
    C --> C3["PUT /:id - Update solution"]
    
    B --> D["/api/crucible/:problemId/drafts"]
    D --> D1["GET / - Get all drafts"]
    D --> D2["GET /:id - Get draft by ID"]
    D --> D3["PUT /:id - Update draft status"]
    
    B --> E["/api/crucible/:problemId/notes"]
    E --> E1["GET / - Get all notes"]
    E --> E2["GET /:id - Get note by ID"]
    
    B --> F["/api/crucible/:problemId/chats"]
    F --> F1["GET / - Get all chat sessions"]
    F --> F2["GET /:id - Get chat session"]
    F --> F3["PUT /:id - Update chat session"]
    
    B --> G["/api/crucible/:problemId/workspace"]
    G --> G1["GET / - Get all workspace states"]
    G --> G2["GET /:id - Get workspace state"]
    
    B --> H["/api/crucible/:problemId/diagrams"]
    H --> H1["GET / - Get all diagrams"]
    H --> H2["GET /:id - Get diagram by ID"]
    H --> H3["DELETE /:id - Delete diagram"]
    
    B --> I["/api/crucible/:problemId/progress"]
    I --> I1["GET / - Get all progress entries"]
    I --> I2["GET /:id - Get progress entry"]
    
    B --> J["/api/crucible/:problemId/research"]
    J --> J1["GET / - Get all research items"]
    J --> J2["GET /:id - Get research item"]
    J --> J3["DELETE /:id - Delete research item"]
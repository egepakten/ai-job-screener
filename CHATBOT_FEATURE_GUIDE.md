# Global AI Chatbot Feature Guide

## Overview

A global AI chatbot has been added to the Job Assistant application that works similar to Cursor's sidebar. The chatbot can be accessed from any page and persists across navigation. It can intelligently filter, sort, and reshape the job listings table based on natural language questions.

## Features

### 1. **Global Sidebar Chat**

- Access the chatbot from any page using the chat icon button in the navigation bar
- The chatbot slides in from the right side of the screen
- Persists across page navigation (Chat page ↔ Browse Jobs page)
- Can be closed/opened at any time

### 2. **Smart Job Filtering & Sorting**

When you're on the **Browse Jobs** page, the chatbot can:

- Filter jobs by specific criteria
- Sort jobs by different attributes
- Reshape the table to show only relevant results
- Create custom views based on your questions

### 3. **No Additional Backend Calls**

- The chatbot uses the existing `/chat` endpoint with semantic search
- Jobs are filtered and reshaped on the frontend based on AI responses
- Fast and efficient - no unnecessary API calls

## How to Use

### Opening the Chatbot

1. Click the **chat icon button** in the top navigation bar
2. The chatbot sidebar will slide in from the right
3. You can close it anytime by clicking the X button or clicking outside (on mobile)

### Example Questions

When on the **Browse Jobs** page, you can ask questions like:

#### Filtering

- "Show only remote jobs"
- "Filter jobs that require Python"
- "Show jobs in London"
- "Find jobs that offer visa sponsorship"
- "Show backend engineer positions"

#### Sorting

- "Sort by highest salary"
- "Show the highest paying jobs first"
- "Sort by company name"

#### Complex Queries

- "Show Python jobs in London with visa sponsorship"
- "Find remote backend positions paying over £70k"
- "Show senior engineer roles at tech companies"

### How It Works

1. **You ask a question** in the chatbot
2. **AI processes your query** using semantic search on all jobs
3. **Table updates automatically** with filtered/sorted results
4. **AI confirms the action** in the chat (e.g., "✅ Table updated with 15 matching jobs!")
5. **Clear the filter** anytime using the "Clear Filter" button that appears

## UI Components

### Chat Toggle Button

Located in the top navigation bar, shows a chat bubble icon. Highlights in blue when the chat is open.

### Sidebar Features

- **Header**: Shows "AI Assistant" title with new chat and close buttons
- **Message Area**: Displays conversation history with scrolling
- **Input Box**: Type your questions here
- **Send Button**: Click or press Enter to send

### Browse Jobs Integration

- **"Ask AI to Filter/Sort" Button**: Quick access button at the top of the job listings
- **AI Filter Badge**: Shows when an AI filter is active with the original query
- **Clear Filter Button**: Removes the AI filter and shows all jobs again

## Technical Details

### Frontend Architecture

```
├── contexts/
│   └── ChatContext.tsx          # Global chat state management
├── components/
│   └── GlobalChatSidebar.tsx    # Sidebar chatbot component
├── pages/
│   ├── Chat.tsx                 # Original chat page (unchanged)
│   └── BrowseJobs.tsx           # Enhanced with AI filtering
└── App.tsx                      # Wrapped with ChatProvider
```

### State Management

- **ChatContext**: Provides global chat state to all components
- **useChat Hook**: Access chat functionality from any component
- **onDataTransform Callback**: Allows pages to respond to AI responses

### Backend Integration

Uses the existing `/chat` endpoint:

- Endpoint: `POST /chat`
- Returns: AI response + filtered job list
- No changes needed to backend

## Key Benefits

1. **Persistent Chat**: Chat history stays as you navigate between pages
2. **Smart Filtering**: Natural language queries instead of complex filters
3. **Fast Performance**: No redundant API calls, efficient state management
4. **Intuitive UX**: Similar to popular AI assistants like Cursor
5. **Flexible Queries**: Ask questions naturally, AI understands intent

## Running the Application

### Start Backend

```bash
cd ai-job-screener
source venv/bin/activate
python -m chatgpt_clone.main
# Or use: ./run_backend.sh
```

### Start Frontend

```bash
cd ai-job-screener/job-assistant-frontend
npm install
npm run dev
# Or use: ./run_frontend.sh
```

### Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Tips for Best Results

1. **Be Specific**: "Show Python jobs in London" works better than "Python"
2. **Use Natural Language**: The AI understands conversational queries
3. **Combine Criteria**: You can filter by multiple attributes at once
4. **Clear Filters**: Use the "Clear Filter" button to reset and see all jobs
5. **Try Different Queries**: Experiment with different phrasings

## Troubleshooting

### Chat Not Opening

- Check that the backend is running on port 8000
- Verify no console errors in browser DevTools

### No Results After Query

- The query might be too specific
- Try a broader query or clear the filter

### Table Not Updating

- Ensure you're on the Browse Jobs page when asking filter questions
- Check the network tab for API responses

## Future Enhancements

Possible additions:

- Save favorite queries
- Export filtered results
- Advanced sorting options
- Custom column creation based on queries
- Multi-criteria sorting

## Support

For issues or questions:

1. Check browser console for errors
2. Verify backend logs
3. Review the AI's response in the chat for clarification

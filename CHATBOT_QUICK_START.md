# 🚀 Quick Start: Global AI Chatbot

## What's New?

✅ **Global AI Chatbot Sidebar** - Access from anywhere, persists across pages
✅ **Smart Job Filtering** - Ask questions in natural language to filter/sort jobs
✅ **Real-time Table Updates** - Jobs table reshapes based on your questions
✅ **No Extra Backend Work** - Uses existing endpoints efficiently

## How to Use (In 3 Steps)

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd ai-job-screener
source venv/bin/activate
python -m chatgpt_clone.main

# Terminal 2 - Frontend
cd ai-job-screener/job-assistant-frontend
npm run dev
```

### 2. Open the Chat

- Click the **💬 chat icon** in the top navigation bar
- The chatbot slides in from the right

### 3. Ask Questions

Try these examples on the **Browse Jobs** page:

```
"Show only remote jobs"
"Sort by highest salary"
"Filter Python jobs in London"
"Find jobs with visa sponsorship"
"Show backend engineer positions paying over £70k"
```

## Visual Guide

```
┌─────────────────────────────────────────┐
│ Job Assistant AI        💬 Chat 📋 Browse│ ← Click this to toggle chat
└─────────────────────────────────────────┘
│                                          │
│  Browse Jobs Page          ┌────────────┤
│  ┌──────────────┐         │ AI Chat    │
│  │ Job 1        │         │ ────────   │
│  │ Job 2        │  ←───→  │ You: "..."  │
│  │ Job 3        │         │ AI: "..."   │
│  └──────────────┘         │ ────────   │
│  (Updates based on        │ [Input]    │
│   chat questions)         └────────────┤
```

## Key Features

### 🌐 Global Persistence

- Chat stays open when switching between pages
- Conversation history is preserved
- One unified chat experience

### 🧠 Smart Filtering

- Natural language understanding
- Semantic search for relevant jobs
- AI-powered sorting and filtering

### ⚡ Performance

- No unnecessary API calls
- Efficient state management
- Fast response times

### 🎨 UI/UX

- Cursor-style sidebar design
- Smooth animations
- Mobile responsive

## Example Workflow

1. **Navigate to Browse Jobs**

   - You see all available jobs

2. **Click Chat Icon**

   - Sidebar opens on the right

3. **Ask: "Show Python jobs in London"**

   - AI processes query
   - Table updates with filtered results
   - Blue badge shows "AI Filter Active"

4. **Clear Filter (Optional)**

   - Click "Clear Filter" button
   - Table shows all jobs again

5. **Switch Pages**
   - Chat stays open
   - Works on any page!

## Tips for Success

✅ Be specific: "Show Python jobs" not just "Python"
✅ Combine criteria: "Remote backend jobs with visa"
✅ Natural language: Talk to it like a person
✅ Clear filters: Reset to see all jobs anytime

## Need Help?

See **CHATBOT_FEATURE_GUIDE.md** for detailed documentation.

Happy job hunting! 🎯

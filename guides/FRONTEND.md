# 🎨 Frontend Guide - Job Assistant UI

## 📦 Overview

Modern React-based frontend with TypeScript, Tailwind CSS, and a beautiful glassmorphism design. Features chat interface and job browsing with real-time search.

---

## 🏗️ Architecture

```
job-assistant-frontend/
├── src/
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Main app & routing
│   ├── components/               # Reusable components
│   │   ├── ChatMessage.tsx       # Message bubbles
│   │   ├── ChatInput.tsx         # Input with send button
│   │   ├── JobCard.tsx           # Job display card
│   │   ├── MessageBubble.tsx     # Chat UI
│   │   ├── Navigation.tsx        # Nav bar
│   │   ├── Pagination.tsx        # Page controls
│   │   ├── SearchBar.tsx         # Search input
│   │   └── ThemeToggle.tsx       # Dark/light mode
│   ├── pages/
│   │   ├── Chat.tsx              # Chat interface
│   │   └── BrowseJobs.tsx        # Job listing page
│   ├── contexts/
│   │   ├── ChatContext.tsx       # Chat state
│   │   └── ThemeContext.tsx      # Theme state
│   ├── services/
│   │   └── api.ts                # API client
│   └── types/
│       └── index.ts              # TypeScript types
└── package.json
```

---

## 🎯 Key Components

### 1. API Client (`src/services/api.ts`)

```typescript
// Browse all jobs
export const jobsAPI = {
  browseJobs: async (page = 1, limit = 10) => {
    const response = await axios.get(`${API_URL}/jobs`, {
      params: { page, limit },
    });
    return response.data;
  },

  searchJobs: async (searchTerm: string) => {
    const response = await axios.get(`${API_URL}/jobs`, {
      params: { search: searchTerm },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  },
};

// Chat with AI
export const chatAPI = {
  sendMessage: async (message: string, userMemory?: string) => {
    const response = await axios.post(`${API_URL}/chat`, {
      message,
      user_memory: userMemory,
      return_all: false,
    });
    return response.data;
  },
};
```

**Usage:**

```typescript
// In components
const { results, total, has_next } = await jobsAPI.browseJobs(1, 10);
const { jobs } = await jobsAPI.searchJobs("python");
const { answer, jobs } = await chatAPI.sendMessage("Find backend jobs");
```

---

### 2. Browse Jobs Page (`src/pages/BrowseJobs.tsx`)

Features:

- ✅ Pagination
- ✅ Keyword search
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

```typescript
const BrowseJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Load jobs
  useEffect(() => {
    if (searchTerm) {
      jobsAPI.searchJobs(searchTerm).then((data) => setJobs(data.results));
    } else {
      jobsAPI.browseJobs(page, 10).then((data) => setJobs(data.results));
    }
  }, [page, searchTerm]);

  return (
    <div>
      <SearchBar onSearch={setSearchTerm} />
      <JobList jobs={jobs} />
      <Pagination page={page} onPageChange={setPage} />
    </div>
  );
};
```

---

### 3. Chat Interface (`src/pages/Chat.tsx`)

Features:

- ✅ Message history
- ✅ Streaming responses
- ✅ Job display in chat
- ✅ Auto-scroll
- ✅ Loading indicator

```typescript
const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // Get AI response
    const { answer, jobs } = await chatAPI.sendMessage(input);

    // Add AI response with jobs
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: answer,
        jobs: jobs,
      },
    ]);
  };

  return (
    <div>
      <MessageList messages={messages} />
      <ChatInput value={input} onSend={handleSend} />
    </div>
  );
};
```

---

### 4. Job Card (`src/components/JobCard.tsx`)

Displays:

- Title & Company
- Salary & Location
- Tech stack tags
- Visa info
- Link to job

```typescript
const JobCard = ({ job }: { job: Job }) => (
  <div className="job-card">
    <h3>{job.title}</h3>
    <p className="company">{job.company}</p>

    <div className="details">
      <span>💰 {job.salary}</span>
      <span>📍 {job.location}</span>
    </div>

    <div className="tech-stack">
      {job.tech_stack?.map((tech) => (
        <span key={tech} className="badge">
          {tech}
        </span>
      ))}
    </div>

    <a href={job.link} target="_blank">
      View Job →
    </a>
  </div>
);
```

---

## 🎨 Styling

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
      },
    },
  },
};
```

### Glassmorphism Effects

```css
/* src/index.css */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 🔌 Integration with Backend

### API Endpoints Used

```
Base URL: http://localhost:8000

GET  /jobs                  # Browse/search jobs
POST /chat                  # AI chat
GET  /stats                 # System stats
POST /user/profile          # Save preferences
GET  /user/profile/:id      # Get preferences
```

### Request Examples

**Browse Jobs:**

```typescript
const response = await axios.get("/jobs", {
  params: { page: 1, limit: 10 },
});
// Returns: { results: Job[], total: number, has_next: boolean }
```

**Search Jobs:**

```typescript
const response = await axios.get("/jobs", {
  params: { search: "python" },
});
// Returns: { results: Job[], total: number }
```

**Chat:**

```typescript
const response = await axios.post("/chat", {
  message: "Show me backend jobs",
  user_memory: "Python developer, 5 years exp",
});
// Returns: { answer: string, jobs: Job[], mode: string }
```

---

## 📱 Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile-First Approach

```tsx
<div
  className="
  flex flex-col            // Mobile: stack vertically
  md:flex-row              // Tablet+: horizontal layout
  gap-4                    // Spacing
  p-4 md:p-6              // Padding adjusts
"
>
  <JobCard />
</div>
```

---

## 🎯 State Management

### Chat Context

```typescript
// src/contexts/ChatContext.tsx
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
    const response = await chatAPI.sendMessage(text);
    setMessages((prev) => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
};
```

### Theme Context

```typescript
// src/contexts/ThemeContext.tsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 🧪 Development

### Start Dev Server

```bash
npm run dev
# Opens at http://localhost:3000
```

### Build for Production

```bash
npm run build
# Creates optimized build in dist/
```

### Preview Production Build

```bash
npm run preview
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🎨 Component Library

### Buttons

```tsx
// Primary button
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
  Click Me
</button>

// Secondary button
<button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
  Cancel
</button>
```

### Input Fields

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
  placeholder="Search jobs..."
/>
```

### Cards

```tsx
<div className="glass-card p-6 rounded-xl">
  <h3 className="text-xl font-semibold">Job Title</h3>
  <p className="text-gray-600">Description</p>
</div>
```

---

## ✅ Best Practices

1. **Type Safety**

   - Use TypeScript for all components
   - Define interfaces for props and data

2. **Error Handling**

   - Try-catch for API calls
   - User-friendly error messages
   - Loading states

3. **Performance**

   - Use React.memo for expensive components
   - Debounce search inputs
   - Lazy load images

4. **Accessibility**

   - Semantic HTML
   - ARIA labels
   - Keyboard navigation

5. **Code Organization**
   - Small, focused components
   - Reusable utilities
   - Consistent naming

---

## 🚀 Features

- ✅ Modern UI with glassmorphism
- ✅ Dark/light mode toggle
- ✅ Responsive design
- ✅ Real-time search
- ✅ Pagination
- ✅ Loading states
- ✅ Error handling
- ✅ Type-safe with TypeScript
- ✅ Fast with Vite
- ✅ Accessible UI

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

---

**Next**: See [BACKEND.md](BACKEND.md) for API details

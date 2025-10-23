# 🧪 Testing Guide: Global AI Chatbot

## Pre-requisites Checklist

- [ ] Backend running on `localhost:8000`
- [ ] Frontend running on `localhost:3000`
- [ ] OpenAI API key configured
- [ ] At least 5 jobs in the database
- [ ] Browser DevTools open (for debugging)

## Testing Steps

### Test 1: Chat Toggle Button ✅

**Steps:**

1. Navigate to `http://localhost:3000`
2. Look at the top navigation bar
3. Find the chat bubble icon button (rightmost)
4. Click it

**Expected:**

- [ ] Sidebar slides in from the right
- [ ] Button turns blue when active
- [ ] Sidebar shows "AI Assistant" header
- [ ] Empty state message displays

**Pass/Fail:** **\_**

---

### Test 2: Send Message in Chat ✅

**Steps:**

1. With chat open, type: "Hello"
2. Click Send or press Enter

**Expected:**

- [ ] Message appears as user message
- [ ] Loading indicator shows
- [ ] AI responds within 2-5 seconds
- [ ] AI message appears below user message
- [ ] Auto-scrolls to bottom

**Pass/Fail:** **\_**

---

### Test 3: Navigate to Browse Jobs ✅

**Steps:**

1. Keep chat open
2. Click "📋 Browse Jobs" in navigation
3. Observe the page and chat sidebar

**Expected:**

- [ ] Page changes to Browse Jobs
- [ ] Chat sidebar remains open
- [ ] Chat messages persist
- [ ] "Ask AI to Filter/Sort" button visible at top

**Pass/Fail:** **\_**

---

### Test 4: Filter Jobs via Chat ✅

**Steps:**

1. On Browse Jobs page
2. In chat, type: "Show only Python jobs"
3. Send the message

**Expected:**

- [ ] AI processes request (loading state)
- [ ] AI responds with job information
- [ ] Message: "✅ Table updated with X matching jobs!"
- [ ] Jobs table updates to show only Python-related jobs
- [ ] Blue filter badge appears above table
- [ ] Badge shows: "AI Filter Active: 'Show only Python jobs'"
- [ ] "Clear Filter" button appears

**Pass/Fail:** **\_**

---

### Test 5: Clear AI Filter ✅

**Steps:**

1. With filter active from Test 4
2. Click "Clear Filter" button

**Expected:**

- [ ] Filter badge disappears
- [ ] Table shows all jobs again
- [ ] Job count returns to original
- [ ] Pagination returns (if applicable)

**Pass/Fail:** **\_**

---

### Test 6: Sort Jobs via Chat ✅

**Steps:**

1. Clear any existing filters
2. In chat, type: "Sort by highest salary"
3. Send the message

**Expected:**

- [ ] AI responds
- [ ] Jobs reorder by salary (descending)
- [ ] Highest salary job appears first
- [ ] Filter badge shows query

**Pass/Fail:** **\_**

---

### Test 7: Complex Query ✅

**Steps:**

1. In chat, type: "Show remote backend engineer jobs with visa sponsorship"
2. Send the message

**Expected:**

- [ ] AI understands multi-criteria query
- [ ] Table filters to matching jobs
- [ ] Only relevant jobs shown
- [ ] AI explains the filtering

**Pass/Fail:** **\_**

---

### Test 8: Close and Reopen Chat ✅

**Steps:**

1. Click X button to close chat
2. Click chat icon to reopen

**Expected:**

- [ ] Chat closes smoothly
- [ ] Button returns to gray
- [ ] Reopening shows same conversation
- [ ] Messages are preserved

**Pass/Fail:** **\_**

---

### Test 9: New Chat ✅

**Steps:**

1. With chat open, click the "+" (New Chat) button
2. Observe the changes

**Expected:**

- [ ] Chat messages clear
- [ ] New session starts
- [ ] Empty state returns
- [ ] Previous filter cleared from table

**Pass/Fail:** **\_**

---

### Test 10: Mobile Responsiveness ✅

**Steps:**

1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Click chat icon

**Expected:**

- [ ] Sidebar takes full width on mobile
- [ ] Overlay appears behind sidebar
- [ ] Clicking overlay closes chat
- [ ] Touch scrolling works
- [ ] Input remains accessible

**Pass/Fail:** **\_**

---

### Test 11: Switch Pages with Filter Active ✅

**Steps:**

1. Apply AI filter on Browse Jobs
2. Switch to Chat page
3. Switch back to Browse Jobs

**Expected:**

- [ ] Filter persists when returning
- [ ] Filtered jobs still displayed
- [ ] Filter badge still shows
- [ ] Chat conversation preserved

**Pass/Fail:** **\_**

---

### Test 12: Multiple Queries in Sequence ✅

**Steps:**

1. Ask: "Show Python jobs"
2. Wait for result
3. Ask: "Now sort by salary"
4. Wait for result
5. Ask: "Only show remote positions"

**Expected:**

- [ ] Each query processes correctly
- [ ] Table updates for each query
- [ ] Filters compound appropriately
- [ ] Chat history shows all interactions

**Pass/Fail:** **\_**

---

### Test 13: Error Handling ✅

**Steps:**

1. Stop the backend server
2. Try to send a message

**Expected:**

- [ ] Loading state shows
- [ ] Error message appears after timeout
- [ ] Message: "Sorry, I encountered an error..."
- [ ] Chat remains functional
- [ ] Can retry when backend is back

**Pass/Fail:** **\_**

---

### Test 14: Empty Query ✅

**Steps:**

1. Leave input field empty
2. Try to click Send

**Expected:**

- [ ] Send button is disabled
- [ ] Nothing happens when clicked
- [ ] Input validation works

**Pass/Fail:** **\_**

---

### Test 15: Long Response ✅

**Steps:**

1. Ask: "Tell me about all the job positions in detail"
2. Wait for response

**Expected:**

- [ ] Long response displays correctly
- [ ] Chat scrolls properly
- [ ] Text wraps in message box
- [ ] No layout breaking

**Pass/Fail:** **\_**

---

## Automated Test Cases

### Unit Tests (Future)

```javascript
// ChatContext.test.tsx
test("toggleChat changes isChatOpen state");
test("addMessage adds to messages array");
test("clearMessages resets state");

// GlobalChatSidebar.test.tsx
test("renders empty state when no messages");
test("sends message on form submit");
test("disables input when loading");

// BrowseJobs.test.tsx
test("displays AI filtered jobs when provided");
test("clears AI filter on button click");
test("shows filter badge when AI filter active");
```

### Integration Tests (Future)

```javascript
test("end-to-end: filter jobs via chat", async () => {
  // Open app
  // Open chat
  // Send filter query
  // Verify table updates
  // Verify badge shows
});

test("end-to-end: persist chat across pages", async () => {
  // Open chat
  // Send message
  // Switch pages
  // Verify message persists
});
```

## Performance Testing

### Metrics to Track

```
Metric                    Target        Actual
─────────────────────────────────────────────
Chat open animation       < 300ms       ______
Message send latency      < 2000ms      ______
Table update time         < 100ms       ______
Sidebar scroll smoothness 60 FPS        ______
Bundle size increase      < 10KB        ______
Memory usage increase     < 5MB         ______
```

## Browser Compatibility

Test on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Console Errors Check

Open Console and verify:

- [ ] No red errors
- [ ] No yellow warnings (except third-party)
- [ ] No network failures
- [ ] No CORS issues

## Network Tab Check

1. Open Network tab
2. Perform chat interaction
3. Verify:
   - [ ] POST to `/chat` endpoint succeeds
   - [ ] Response contains `jobs` array
   - [ ] Response time < 5 seconds
   - [ ] Status code: 200

## Accessibility Check

Using browser DevTools:

- [ ] All buttons have ARIA labels
- [ ] Keyboard navigation works
- [ ] Focus visible on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible

## Edge Cases

### Test: No Jobs in Database

**Expected:** Empty state in table, AI responds appropriately

### Test: Very Long Job Title

**Expected:** Text truncates or wraps properly

### Test: Special Characters in Query

**Expected:** Query processed without errors

### Test: Rapid Message Sending

**Expected:** Messages queue properly, no race conditions

### Test: Disconnected Network

**Expected:** Graceful error handling, retry option

## Bug Report Template

```markdown
**Bug Title:**
[Brief description]

**Steps to Reproduce:**

1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Browser:**
[Chrome/Firefox/Safari/Edge + version]

**Console Errors:**
[Any errors from console]

**Severity:**
[Critical/High/Medium/Low]
```

## Success Criteria

All tests must pass for production deployment:

- [ ] 15/15 manual tests pass
- [ ] No console errors
- [ ] Works on all major browsers
- [ ] Mobile responsive
- [ ] Performance metrics met
- [ ] Accessibility standards met
- [ ] No memory leaks
- [ ] No network issues

## Test Results Summary

```
Date: __________
Tester: __________

Total Tests: 15
Passed: ___
Failed: ___
Skipped: ___

Pass Rate: _____%

Critical Issues: ___
Non-Critical Issues: ___

Overall Status: PASS / FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🎉 Ready for Production!

Once all tests pass, the feature is ready for production deployment. Congratulations! 🚀

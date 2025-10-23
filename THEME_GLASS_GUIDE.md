# 🎨 Theme Toggle & Glassmorphism Guide

## 🌟 Overview

The Job Assistant AI now features a **beautiful theme toggle** with iOS-style **glassmorphism effects** for light mode! Switch seamlessly between dark and light themes with smooth transitions.

## ✨ What's New

### 1. **Theme Toggle Button**

- Located in the sidebar header
- Animated sun/moon icon
- Smooth 300ms transition
- Remembers your preference (localStorage)

### 2. **Light Mode with Glass Effects**

- Inspired by iOS design language
- Frosted glass (glassmorphism) effects
- Backdrop blur + transparency
- Soft shadows and borders
- Modern, elegant appearance

### 3. **Dark Mode (Original)**

- High contrast for low-light environments
- Easy on the eyes
- Professional appearance

## 🎬 Visual Demo

### Dark Mode (Default)

```
┌─────────────────────────────────┐
│ █████ Dark Theme █████          │
│ ● Deep grays and blacks         │
│ ● High contrast text            │
│ ● Sharp borders                 │
│ ● Traditional dark UI           │
└─────────────────────────────────┘
```

### Light Mode (Glass)

```
┌─────────────────────────────────┐
│ ░░░░░ Light Theme (Glass) ░░░░░ │
│ ○ Frosted glass effects         │
│ ○ Soft, translucent backgrounds │
│ ○ Subtle shadows                │
│ ○ Modern iOS-style design       │
└─────────────────────────────────┘
```

## 🔮 Glassmorphism Effects

### What is Glassmorphism?

A modern design trend featuring:

- **Transparency**: Semi-transparent backgrounds
- **Blur**: Backdrop blur filters (20-30px)
- **Borders**: Subtle light borders
- **Shadows**: Soft, layered shadows
- **Depth**: Visual layers and hierarchy

### Where It's Applied

In **light mode**, glass effects appear on:

1. **Sidebar**

   - Frosted glass background
   - Soft right border
   - Gentle shadow

2. **Tables**

   - Transparent white background
   - Blur effect behind content
   - Floating appearance
   - Hover effects

3. **Buttons**

   - Glass-like surfaces
   - Subtle depth
   - Interactive feedback

4. **Cards**

   - Suggestion cards
   - Message bubbles
   - Info panels

5. **Inputs**
   - Frosted input fields
   - Soft focus states

## 🎯 Technical Specifications

### CSS Glass Classes

```css
/* Base glass effect */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

/* Table glass */
.glass-table {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
}

/* Sidebar glass */
.glass-sidebar {
  background: rgba(248, 248, 248, 0.75);
  backdrop-filter: blur(30px) saturate(180%);
}

/* Button glass */
.glass-button {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
}
```

### Theme Context

```typescript
// ThemeContext.tsx
const [theme, setTheme] = useState<"dark" | "light">("dark");

// Persisted in localStorage
localStorage.setItem("theme", theme);

// Applied to document
document.documentElement.setAttribute("data-theme", theme);
```

### Transition Animations

```css
/* Smooth theme transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease;
}
```

## 🎨 Design Details

### Color Palette

**Dark Mode:**

```
Background Primary:   #111827 (gray-900)
Background Secondary: #1f2937 (gray-800)
Background Tertiary:  #374151 (gray-700)
Text Primary:         #ffffff (white)
Text Secondary:       #d1d5db (gray-300)
Border:               #374151 (gray-700)
Accent:               #3b82f6 (blue-600)
```

**Light Mode:**

```
Background:           Gradient (white → soft purple tints)
Glass Surfaces:       rgba(255, 255, 255, 0.6-0.8)
Text Primary:         #111827 (gray-900)
Text Secondary:       #6b7280 (gray-600)
Border:               rgba(200, 200, 200, 0.3)
Accent:               #3b82f6 (blue-600)
```

### Glass Parameters

| Element | Blur | Opacity | Saturation |
| ------- | ---- | ------- | ---------- |
| Tables  | 20px | 60%     | 180%       |
| Sidebar | 30px | 75%     | 180%       |
| Buttons | 20px | 70%     | 180%       |
| Cards   | 25px | 75%     | 180%       |
| Inputs  | 15px | 60%     | 150%       |

## 🚀 How to Use

### Toggle Theme

**Method 1: Click Button**

1. Look for sun/moon icon in sidebar header
2. Click to toggle
3. Watch smooth transition

**Method 2: Keyboard** (future)

- `Ctrl + Shift + L` (planned)

### Theme Persistence

Your preference is automatically saved:

- Stores in `localStorage`
- Persists across sessions
- No login required

## 💡 Use Cases

### Dark Mode Best For:

- Low-light environments
- Night-time use
- Reduced eye strain
- Battery saving (OLED screens)
- Professional appearance

### Light Mode Best For:

- Bright environments
- Daytime use
- Modern, fresh appearance
- Showing off design details
- Screenshots/presentations

## 🎭 Component Examples

### Theme Toggle Button

```tsx
<ThemeToggle />

// Shows:
// - Sun icon (light mode)
// - Moon icon (dark mode)
// - Smooth 500ms rotation
// - Scale animation
```

### Themed Table

```tsx
<div
  className={
    theme === "light" ? "glass-table" : "bg-gray-800 border border-gray-700"
  }
>
  {/* Table content */}
</div>
```

### Themed Button

```tsx
<button
  className={
    theme === "light" ? "glass-button text-gray-700" : "bg-gray-700 text-white"
  }
>
  Click me
</button>
```

## 🔧 Implementation Files

### Created:

- `src/contexts/ThemeContext.tsx` - Theme state management
- `src/components/ThemeToggle.tsx` - Toggle button component
- `src/styles/glassmorphism.css` - Glass effect styles

### Modified:

- `src/App.tsx` - Added ThemeProvider
- `src/pages/Chat.tsx` - Theme-aware styling
- `src/components/JobTable.tsx` - Glass effects
- `src/index.css` - Theme variables & imports

## ⚡ Performance

### Optimizations:

- **GPU-accelerated blur**: Uses `backdrop-filter`
- **CSS transitions**: Smooth, hardware-accelerated
- **Minimal repaints**: Efficient property changes
- **LocalStorage**: Fast persistence

### Browser Support:

✅ Chrome 76+ (full support)
✅ Safari 14+ (full support)
✅ Firefox 103+ (full support)
✅ Edge 79+ (full support)

## 📱 Responsive Behavior

**Desktop:**

- Full glass effects
- All animations smooth
- Perfect clarity

**Mobile:**

- Optimized blur (lighter blur for performance)
- Touch-friendly toggle
- Smooth transitions

## 🎨 Customization

### Adjust Blur Intensity

```css
/* In glassmorphism.css */
.glass-table {
  backdrop-filter: blur(20px); /* Change this */
}
```

### Adjust Opacity

```css
.glass {
  background: rgba(255, 255, 255, 0.7); /* 0.7 = 70% opacity */
}
```

### Add New Glass Variant

```css
.glass-my-element {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.35);
}
```

## 🆚 Before vs After

### Before:

❌ Only dark mode
❌ No theme options
❌ Static appearance

### After:

✅ Dark + Light modes
✅ Glassmorphism in light mode
✅ Smooth theme transitions
✅ Persistent preferences
✅ Modern iOS-style design

## 🎉 Summary

**You now have:**

- ✅ Beautiful theme toggle
- ✅ iOS-style glassmorphism
- ✅ Smooth transitions (300ms)
- ✅ Persistent theme preference
- ✅ Modern, elegant light mode
- ✅ Professional dark mode
- ✅ Full browser support
- ✅ Optimized performance

**Click the sun/moon icon to switch themes and enjoy the beautiful glass effects!** ☀️🌙

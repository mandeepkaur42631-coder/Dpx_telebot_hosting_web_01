# DPX Bot Hosting Platform - Design Guidelines

## Design Approach
**System-Based Approach**: Drawing inspiration from modern hosting platforms (Vercel, Railway, Render) combined with Material Design principles for developer tools. Focus on professional, powerful aesthetics with exceptional functionality.

## Core Design Principles
1. **Developer-First**: Clean, functional interface optimized for bot management
2. **Professional Power**: Dark theme with accent colors that convey reliability and control
3. **Clear Hierarchy**: Distinct visual separation between authentication, management, and monitoring interfaces
4. **Real-time Feedback**: Visual indicators for bot status, operations, and system health

---

## Color Palette

### Dark Mode (Primary Theme)
- **Background Base**: 220 15% 8% (deep navy-black)
- **Surface Elevated**: 220 15% 12% (slightly lighter cards/panels)
- **Surface Interactive**: 220 15% 16% (hover states, active elements)

- **Primary Brand**: 210 100% 55% (vibrant electric blue - DPX signature)
- **Primary Hover**: 210 100% 45% (deeper blue for interactions)

- **Success (Running)**: 142 76% 45% (bright green)
- **Warning (Processing)**: 38 92% 50% (amber)
- **Error (Stopped)**: 0 84% 60% (red)

- **Text Primary**: 0 0% 95% (near white)
- **Text Secondary**: 220 10% 65% (muted gray)
- **Text Muted**: 220 10% 45% (subtle gray)

### Accent & Borders
- **Border Subtle**: 220 15% 20% (card borders)
- **Border Interactive**: 210 100% 55% (focused inputs, active states)
- **Backdrop Blur**: Use backdrop-blur-md for buttons on images/gradients

---

## Typography

### Font Families
- **Primary**: Inter (Google Fonts) - for UI, body text, forms
- **Monospace**: JetBrains Mono (Google Fonts) - for code, logs, file names, bot status

### Type Scale
- **Hero/Display**: text-4xl md:text-5xl, font-bold (login page)
- **Page Title**: text-3xl, font-bold (dashboard headers)
- **Section Heading**: text-xl md:text-2xl, font-semibold
- **Card Title**: text-lg, font-semibold
- **Body**: text-base, font-normal
- **Small/Caption**: text-sm, text-secondary
- **Code/Logs**: text-sm, font-mono

---

## Layout System

### Spacing Primitives
**Core Units**: Use Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section gaps: gap-4, gap-6, gap-8
- Margins: m-4, m-6, m-8, m-12, m-16

### Container Strategy
- **Login Page**: max-w-md centered (single card focus)
- **Dashboard**: max-w-7xl with full-width sections
- **Content Cards**: Varied widths based on content (file upload: max-w-2xl, logs: full-width)

### Grid Systems
- **Dashboard Overview**: 3-column grid on lg+ (bot status cards)
- **Bot Controls**: 2-column split (controls left, logs right on lg+)
- **File Upload**: Single column centered focus
- **Responsive**: Stack to single column on mobile/tablet

---

## Component Library

### Authentication (Login Page)
**Layout**: Full-height centered card with gradient backdrop
- **Background**: Subtle gradient mesh (navy to deep purple)
- **Login Card**: Elevated surface with border glow effect
- **Logo/Branding**: "DPX Bot Hosting" - bold typography, primary color accent
- **Access Code Input**: Large, prominent with primary border on focus
- **CTA Button**: Full-width primary blue, bold text
- **Buy Access Link**: Subtle link below with Telegram icon, muted text color

### Dashboard Header
- **Navigation Bar**: Sticky top, surface-elevated background
- **Brand Logo**: Left-aligned with primary color
- **User Info**: Right-aligned (access code status, logout)
- **Quick Actions**: Upload new bot, view all bots (icon buttons)

### Bot Management Cards
**Card Structure**: Elevated surface with status indicator stripe (left border, 4px, color-coded)
- **Card Header**: Bot name (semibold), status badge (running/stopped/error)
- **Card Body**: File info, last updated, uptime counter
- **Action Buttons**: Row of controls (Run: green, Stop: red, Restart: blue, Delete: muted)
- **Expand Toggle**: Show/hide logs section

### File Upload Interface
**Drop Zone**: Large dashed border area with upload icon
- **States**: Default (border-subtle), Hover (border-primary), Active (bg-surface-interactive)
- **File Display**: List view with file icons, names (monospace), sizes
- **Progress Indicators**: Linear progress bars for uploads/installs

### Real-time Logs Panel
**Terminal-Style Display**: Dark background, monospace font
- **Log Header**: Scrollable, auto-update toggle, clear logs button
- **Log Entries**: Timestamped, color-coded by type (info: white, warn: amber, error: red)
- **Scroll Behavior**: Auto-scroll to bottom when new logs appear

### Status Indicators
- **Badges**: Pill-shaped with colored backgrounds (success/warning/error)
- **Icons**: Heroicons - play (run), stop, refresh (restart), trash (delete), upload, terminal
- **Pulse Animations**: Subtle pulse on "running" status badges only

---

## Page-Specific Designs

### Login Page
- **Hero Section**: Full viewport height (min-h-screen)
- **Background**: Gradient mesh with subtle animated particles (CSS only, minimal motion)
- **Central Card**: Glass-morphism effect (backdrop-blur, semi-transparent border)
- **Hierarchy**: Logo/title → tagline → access code input → CTA → buy link

### Dashboard Home
- **Overview Section**: 3-column stats (Total Bots, Running, Stopped) with icons
- **Bot List**: Grid of bot cards (2 columns on lg, 1 on mobile)
- **Empty State**: Illustrated placeholder with "Upload Your First Bot" CTA

### Bot Detail View
- **Split Layout**: Controls & info (left 40%), Logs (right 60%) on lg+
- **File Manager**: Expandable section showing Bot.py, requirements.txt
- **Actions Bar**: Sticky bottom on mobile, sidebar on desktop

---

## Images & Visual Assets

### Hero/Background Images
**Login Page Background**: Subtle abstract tech pattern or circuit board aesthetic (dark, low opacity overlay)
- Placement: Full-screen background with gradient overlay
- Style: Dark blue/purple tones, subtle, non-distracting

**Dashboard Empty State**: Illustration of bot/server connection
- Placement: Center of empty bot list
- Style: Isometric or flat illustration in primary color scheme

### Icons
**Library**: Heroicons (outline for navigation, solid for status/actions)
- Bot status: server, cpu, activity
- Actions: play, stop, refresh-cw, trash-2, upload-cloud
- Files: file-code, file-text, folder

---

## Interaction Patterns

### Micro-interactions
- **Button Hovers**: Slight scale (1.02) + brightness increase
- **Card Hovers**: Subtle lift (shadow increase)
- **Input Focus**: Border color shift to primary + subtle glow
- **Status Changes**: Fade transition (200ms) when bot state updates

### Loading States
- **Initial Load**: Skeleton screens for dashboard cards
- **File Upload**: Progress bars with percentage
- **Bot Operations**: Spinner icon on action buttons during execution
- **Auto-refresh**: Subtle indicator when logs update

### Animations (Minimal)
- **Page Transitions**: Fade in (300ms)
- **Modal/Dialog**: Scale from 95% to 100% (200ms)
- **Toast Notifications**: Slide in from top-right
- **Running Status**: Gentle pulse (2s duration, infinite) ONLY for active bots

---

## Responsive Behavior

### Breakpoints
- **Mobile** (< 768px): Single column, stacked cards, bottom action bars
- **Tablet** (768-1024px): 2-column grids, collapsible sidebar
- **Desktop** (> 1024px): 3-column grids, persistent side navigation, split views

### Mobile Optimizations
- **Touch Targets**: Minimum 44px height for all interactive elements
- **Bottom Navigation**: Fixed action buttons for primary bot controls
- **Collapsible Sections**: Accordion-style logs and file manager
- **Simplified Header**: Hamburger menu for navigation

---

## Accessibility & Polish

- **Consistent Dark Mode**: All inputs, textareas, selects use dark backgrounds (surface-elevated)
- **Focus States**: Clear 2px primary-colored outline on all interactive elements
- **Color Contrast**: WCAG AA compliant text colors (95% white on dark backgrounds)
- **Loading Feedback**: Screen readers announce state changes ("Bot starting...", "Upload complete")
- **Error Handling**: Clear error messages with recovery actions (red backgrounds, actionable text)
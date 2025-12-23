# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**miohost** is a conversational guest assistant for boardinghouses and hotels. Guests access it via QR codes in rooms to get information about house amenities, book services, and receive local recommendations. The app supports German and English.

## Tech Stack

- **React** with JSX (single-file architecture in `App.jsx`)
- **Tailwind CSS** for styling (dark theme, glassmorphism design)
- **Framer Motion** for animations
- No build tool configuration present yet - assumes external Tailwind/React setup

## Architecture

The app is currently a single-file demo (`App.jsx`) containing:

- **Data constants**: `INTENTS`, `SUGGESTION_CHIPS`, `HOUSE_INFO`, `SERVICES`, `LOCAL_RECS`, `FAQS` - all bilingual (EN/DE)
- **Intent matching**: Keyword-based scoring system in `matchIntent()` function
- **A/B testing**: Two welcome screen variants stored in localStorage
- **State management**: React hooks with localStorage persistence for language, A/B variant, and QR scan state

### Key Components

- `Header` - Language toggle, A/B variant display, QR simulation controls
- `WelcomeScreen` - A/B tested welcome flow
- `ExperienceSections` - Main content: quick actions, house info, services, local recommendations, FAQ
- `ActionPanel` - Dynamic panel for info display, service requests, contact details
- `PromptIntentDemo` - Interactive intent detection demonstration

### localStorage Keys

- `pxai_guest_ab_variant` - A/B test variant (A or B)
- `pxai_guest_lang` - Selected language (EN or DE)
- `pxai_guest_qr_scanned` - QR scan state

## Product Context

See `prd.md` for full product requirements (in German). Key goals:
- Automate 70% of standard front-desk inquiries
- 24/7 availability via PWA (no app install needed)
- GDPR-compliant with no chat history storage without consent
- Target response time under 3 seconds

# Figma Layout & Design Documentation

This document details the app’s UI structure, design rationale, and layout principles based on the latest Figma prototypes and the colored wireframes.

---

## 1. Screen Overview

### Home / SOS (`home_colored.jpg`)

- **Purpose:** Fast access to the main SOS trigger and real-time status.
- **Figma layout:**
  - Central “Big SOS Button” (primary CTA)
  - Silent/Loud toggle beneath
  - Microphone and GPS status displayed
- **Design note:** Layout prioritizes one-tap access and immediate feedback, oriented for mobile use even in panic.

### Voice Command (`voice_colored.jpg`)

- **Purpose:** Voice trigger and confirmation.
- **Layout:**
  - Prominent “Listening Animation” at the top (shows system is actively listening)
  - Cancel button dominates lower area
  - Countdown timer to automatic action
- **Rationale:** Clear, actionable steps with visual feedback for accessibility.

### Emergency Confirmation (`confirmation_colored.jpg`)

- **Purpose:** Confirm or cancel the selected emergency call.
- **Key elements:**
  - Service being called (Police/112)
  - Location (map or text)
  - Singular Cancel/Confirm option
- **Design choice:** Prevents accidental alerts, ensures clarity for stressed users.

### Trusted Contacts (`contacts_colored.jpg`)

- **Purpose:** Manage, add, or auto-alert trusted persons.
- **Key elements:**
  - Scrollable contact list
  - Add/Edit modal
  - Auto-alert toggle (switch style)
- **Rationale:** Keeps loved ones in the loop; simplified UI for quick management.

### Onboarding & Permissions (`onboarding_colored.jpg`)

- **Purpose:** Guide users through app setup and permissions.
- **Includes:**
  - “App Purpose” overview
  - Permissions request (for GPS, mic, notifications)
  - Large Allow/Deny buttons for decisive action
- **Accessibility:** Uses plain language and high-contrast buttons for all users.

---

## 2. Layout Principles & Accessibility

- **Touch Targets:** All interactive elements are minimum 48dp in size.
- **High Contrast:** Uses color, borders, and redundancy to ensure accessibility in sunlight or for vision-impaired users.
- **Visual Hierarchy:** CTA buttons (SOS, Allow, Cancel) are always the most visually prominent.
- **Progressive Disclosure:** Only necessary actions shown on each screen. No clutter, no hidden menus.
- **Animated Feedback:** Listening/waiting states clearly animated or color-shifted for non-verbal users.
- **Cancel/Undo:** Every irreversible action (emergency dial) has a clear cancel step.

---

## 3. UI States and User Flows in Figma

- **Normal:** All primary, secondary, and disabled states visualized for each control.
- **Error:** Examples for invalid input, denied permissions, or failed SOS.
- **Success:** Clear indication when alerts/messages are sent.
- **Transitions:** Minimal, non-distracting animations; focus on speed and immediacy.

---

## 4. Figma Best Practices Applied

- **Consistent frame spacing (8pt grid)**
- **Layer naming and grouping for dev handoff**
- **Component usage for buttons, toggles, status indicators**
- **Dark mode preview included in alternate frames**

---

## 5. Next Steps

- Link Figma prototype URL here if available
- Update docs as new versions or usability changes are tested
- Include annotated screenshots for key flows if possible

---

_All design choices are driven by the emergency use case: clarity, accessibility, and reliability. See colored wireframes in `/docs/wireframes/` for visual reference._

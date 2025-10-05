# Wireframes Documentation – Emergency Response Voice App

This directory contains the core UI wireframes for the Emergency Response Voice App, visualizing key user flows for rapid, accessible crisis response.

---

## 1. Home / SOS Screen (`home_colored.jpg`)

- **Description:** Central entry point with a prominent SOS button for immediate help.
- **Elements:**
  - Large “Big SOS” button for high-stress usability
  - Silent/Loud toggle for alert types
  - Mic status indicator
  - GPS/location status
- **Rationale:** One-tap crisis activation for all personas (especially useful for Priya and Sunita); clear state feedback ensures user trust.

---

## 2. Voice Command Screen (`voice_colored.jpg`)

- **Description:** Interfaces dedicated to voice-based emergency triggers.
- **Elements:**
  - “Listening Animation” (visual feedback that voice is engaged)
  - Large Cancel button to stop false alarms
  - Countdown timer for action confirmation
- **Rationale:** Supports hands-free safety (for Arjun), ensures users can intervene to prevent accidental triggers.

---

## 3. Emergency Confirmation Screen (`confirmation_colored.jpg`)

- **Description:** Confirms which service is being contacted and allows for last-moment cancellation or confirmation.
- **Elements:**
  - Current selected emergency service (Police/112, etc.)
  - Map snapshot or location details
  - Cancel / Confirm big button
- **Rationale:** Critical safety net—prevents accidental calls and provides clarity on which service is being requested.

---

## 4. Contacts Management (`contacts_colored.jpg`)

- **Description:** Trusted contacts setup and auto-alert controls.
- **Elements:**
  - Contact list for adding/removing trusted people
  - Add/Edit control
  - Auto alert toggle for active notifications
- **Rationale:** Empowers users to ensure family/friends are notified; streamlined for quick access and management in emergencies.

---

## 5. Onboarding & Permissions (`onboarding_colored.jpg`)

- **Description:** First-time user flow and permissions grants.
- **Elements:**
  - App purpose overview
  - Permissions request (microphone, GPS, notifications)
  - Allow or Deny large buttons
- **Rationale:** Clearly explains what permissions are needed for reliability and safety from launch, reducing user confusion and friction.

---

## **Design Principles Applied**

- Large, high-contrast tap areas (≥48dp) for panic situations and older users
- Voice and manual triggers available on most screens, supporting accessibility
- Clear visual hierarchy; most critical actions are most prominent
- Animated/listening feedback and confirmations on every action
- Last-moment cancel options to prevent accidental alerts
- Simple layouts for fast comprehension under stress

---

## **Wireframe User Flow**

1. **Onboarding → Home/SOS**
2. **Home/SOS**
   - Trigger by button, voice, or contact toggle
   - Leads to Voice Command or Emergency Confirmation as needed
3. **Voice Command**
   - Listening, Cancel, Auto-Countdown
   - If triggered, routes to Emergency Confirmation
4. **Emergency Confirmation**
   - Shows current service, map, Cancel/Confirm
   - If not canceled, proceeds to emergency dial/send
5. **Contacts**
   - Accessible from Home for rapid update/alert setup

---

All UI screens and flows were designed for inclusivity, accessibility, and reliability—with stereo feedback (visual, voice, haptic) and rapid navigation under the pressures of a real emergency.

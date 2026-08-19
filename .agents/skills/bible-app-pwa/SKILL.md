---
name: bible-app-pwa
description: PWA offline caching, web app manifest, and installability configuration for Bible Web App
---

# Bible App PWA & Offline Skill

This skill defines the offline caching and web app installation strategy for the Bible application.

## Key Principles
1. **Service Worker Precaching**: Pre-cache `index.html`, CSS, JS, and CSV datasets (`/bible-datasets/*.csv`).
2. **Offline First**: Users must be able to launch and read the Bible without any active internet connection.
3. **Web Manifest**: Define standalone display mode, theme colors, and icons for mobile installability.

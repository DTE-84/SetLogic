# SetLogic
**Tagline:** The Behavioral Telemetry & AI Coaching Nexus.

## Executive Summary
SetLogic is a high-density behavioral telemetry hub for fitness and nutrition. It bridges wearables data with clinical-grade coaching to accelerate goal achievement through data-driven insight.

## Core Architecture
- **Stack:** React (Vite), Python (FastAPI), Supabase
- **Tracking:** Wearables Service, Food Vault (Quagga2)
- **Persona:** Senior Analytical Coach (Nova)

## Supabase sign-in

Copy the Supabase settings from `.env.example` into `.env.local` and use the project's publishable key. Run `npm run dev` to start the app. The five main screens require a Supabase session, and row-level security protects each account's tracking data.

In [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/obnfpusljjvozdzpuash/auth/url-configuration), allow the frontend root URL and the same URL with `?auth=recovery` for each environment. Set the Site URL to the deployed frontend origin. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` on the frontend host before building. Open password reset links in the browser that requested them.

## Key Features
- **Goal Acceleration:** Real-time telemetry on workout volume and nutritional velocity.
- **Nova Behavioral Chat:** Specialized AI coach focused on 'Correlation vs Causation' logic.
- **Adaptive Bottom Nav:** High-fidelity mobile UI with horizontal scrolling for 8+ data nodes.

## Aesthetic Protocol
- **Aesthetic:** Lux Forest (Obsidian / Kinetic Green)
- **UI Logic:** Medical-grade nutrition therapy and periodized strength programming.

---

**DTE Solutions LLC // Senior Systems Engineering**

# MedSnap Dashboard

This is the frontend and backend for the MedSnap dashboard system.

## Overview

The dashboard provides:
- **User Information Management** - Patient data, medical history, user profiles
- **Long-term Memory** - Integration with Letta Cloud and Gemini for patient context
- **Supabase Integration** - Database and authentication
- **Future Fish Audio Integration** - TTS capabilities (not priority)

## Architecture

### Frontend
- React/Next.js dashboard interface
- Patient management UI
- Medical history visualization
- Real-time data updates

### Backend
- Express.js API server
- Supabase database integration
- Letta Cloud integration for context management
- Gemini AI integration for medical insights
- Patient data models and CRUD operations

## Project Structure

```
dashboard/
├── frontend/          # React dashboard UI
├── backend/           # Express API server
└── README.md         # This file
```

## Key Features

- **Patient Management** - CRUD operations for patient data
- **Medical History** - Long-term patient context and history
- **AI Integration** - Gemini for medical insights and recommendations
- **Context Management** - Letta Cloud for maintaining patient context
- **Real-time Updates** - Live data synchronization
- **Authentication** - Supabase auth integration

## Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Gemini API, Letta Cloud
- **Authentication**: Supabase Auth
- **Future**: Fish Audio (TTS)

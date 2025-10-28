# Voice Translator Application

A comprehensive multilingual voice translation application built with Next.js, featuring real-time speech recognition, text-to-speech, image analysis, and dictionary functionality.

## Overview

This application provides a complete translation ecosystem with the following core features:

- **Voice Translation**: Real-time speech-to-text and text-to-speech translation
- **Image Analysis**: AI-powered image content analysis and translation
- **Dictionary**: Word-by-word translation with meanings
- **Grammar Correction**: Automatic grammar improvement for input text
- **Voice Cloning**: Custom voice model creation using ElevenLabs
- **Translation History**: Persistent storage of translation sessions

## Application Structure

### Main Components

#### Core Translation Components

- **VoiceTranslator** (`components/voice-translator-refactored.tsx`): Main application component that orchestrates all translation features
- **InputSection** (`components/input-section.tsx`): Handles text input, speech recognition, and translation controls
- **OutputSection** (`components/output-section.tsx`): Displays translated text with TTS playback and download options
- **LanguageSwapSection** (`components/language-swap-section.tsx`): Manages input/output language selection and swapping

#### Feature Components

- **ImageAnalysis** (`components/image-analysis.tsx`): Upload and analyze images using AI, with multi-language summaries
- **ClickableText** (`components/clickable-text.tsx`): Interactive text component with word-level dictionary lookup
- **GrammarAnalysisDialog** (`components/grammar-analysis-dialog.tsx`): Detailed grammar analysis and correction suggestions
- **SettingsDialog** (`components/settings-dialog.tsx`): Application settings including TTS voices and voice cloning
- **HistoryDialog** (`components/history-dialog.tsx`): Translation history management and playback

#### UI Components

- **AppHeader** (`components/app-header.tsx`): Navigation header with links to different features
- **AppFooter** (`components/app-footer.tsx`): Footer with branding and links
- **StatusIndicator** (`components/status-indicator.tsx`): Real-time status display for ongoing operations
- **ErrorAlerts** (`components/error-alerts.tsx`): Error handling and user notifications
- **QuickTips** (`components/quick-tips.tsx`): User guidance and feature hints

### Custom Hooks

#### Speech and Audio Hooks

- **useSpeechRecognition** (`hooks/use-speech-recognition.ts`): Web Speech API integration for voice input
- **useTextToSpeech** (`hooks/use-text-to-speech.ts`): Text-to-speech functionality with voice selection and audio download
- **useStreamingTranslation** (`hooks/use-streaming-translation.ts`): Real-time streaming translation for multiple languages

#### Data Management Hooks

- **useTranslationHistory** (`hooks/use-translation-history.ts`): Local storage management for translation history

### API Routes

#### Translation APIs

- **`/api/translate`** (`app/api/translate/route.ts`): Main translation endpoint using Google Gemini AI

  - Supports multiple output languages simultaneously
  - Handles auto-detection of input language
  - Rate limiting and text length validation

- **`/api/translate/stream`** (`app/api/translate/stream/route.ts`): Streaming translation for real-time updates

#### Media APIs

- **`/api/text-to-speech`** (`app/api/text-to-speech/route.ts`): Text-to-speech conversion

  - Primary: ElevenLabs (for cloned voices)
  - Fallback: Google Translate TTS
  - Supports multiple formats and voice settings

- **`/api/image-upload`** (`app/api/image-upload/route.ts`): Image upload handling via Cloudinary

- **`/api/image-analysis`** (`app/api/image-analysis/route.ts`): AI-powered image analysis
  - Uses Google Gemini Vision API
  - Provides multi-language summaries
  - Integrates with translation API for cross-language analysis

#### Utility APIs

- **`/api/dictionary`** (`app/api/dictionary/route.ts`): Word translation using Groq AI

  - Word-by-word translation
  - Supports multiple target languages

- **`/api/voice-clone`** (`app/api/voice-clone/route.ts`): Voice cloning using ElevenLabs

  - Audio sample upload and processing
  - Custom voice model creation

- **`/api/correct-grammar`** (`app/api/correct-grammar/route.ts`): Grammar correction
- **`/api/grammar-analysis`** (`app/api/grammar-analysis/route.ts`): Detailed grammar analysis
- **`/api/word-info`** (`app/api/word-info/route.ts`): Word information and definitions

### Pages

- **`/`** (`app/page.tsx`): Main voice translator interface
- **`/dictionary`** (`app/dictionary/page.tsx`): Standalone dictionary page
- **`/image-analysis`** (`app/image-analysis/page.tsx`): Image analysis interface

## Key Features and Functionality

### 1. Voice Translation

- **Speech Recognition**: Real-time voice input using Web Speech API
- **Multi-language Support**: 25+ languages including major Indian languages
- **Auto-translation**: Automatic translation on speech completion
- **Streaming Translation**: Real-time translation updates for multiple languages
- **Grammar Correction**: Optional automatic grammar improvement

### 2. Text-to-Speech (TTS)

- **Multiple TTS Engines**: ElevenLabs (premium), Google Translate (free)
- **Voice Cloning**: Custom voice creation from audio samples
- **Audio Download**: Save translations as audio files
- **Voice Settings**: Adjustable speech rate, pitch, and volume

### 3. Image Analysis

- **AI Vision**: Google Gemini Vision API integration
- **Multi-language Summaries**: Automatic translation of image descriptions
- **Cloud Storage**: Cloudinary integration for image hosting
- **Detailed Analysis**: Object detection, text recognition, scene description

### 4. Dictionary and Word Lookup

- **Interactive Text**: Clickable translated text for word definitions
- **Word Translation**: Individual word translation using Groq AI
- **Contextual Information**: Part of speech, definitions, examples

### 5. Translation History

- **Persistent Storage**: Local storage of all translation sessions
- **Playback**: Re-listen to previous translations
- **Export**: Download translation history as JSON
- **Management**: Clear or delete specific entries

### 6. Settings and Customization

- **TTS Settings**: Voice selection, speech parameters
- **Voice Cloning**: Manage custom voice models
- **UI Preferences**: Theme and interface customization
- **Language Preferences**: Default language settings

## Technology Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend APIs

- **Next.js API Routes**: Server-side API endpoints
- **Google Gemini AI**: Translation and vision AI
- **Groq AI**: Fast LLM for dictionary functions
- **ElevenLabs**: Voice cloning and premium TTS
- **Cloudinary**: Image hosting and processing

### Key Dependencies

- **@google/genai**: Google Gemini AI integration
- **groq-sdk**: Groq AI client
- **cloudinary**: Image management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **date-fns**: Date utilities
- **sonner**: Toast notifications

## How It Works

### Translation Flow

1. **Input**: User provides text via typing or speech recognition
2. **Processing**: Optional grammar correction applied
3. **Translation**: Text sent to Google Gemini API for translation
4. **Output**: Translated text displayed with TTS options
5. **Storage**: Translation saved to history

### Voice Input Flow

1. **Recording**: Web Speech API captures audio
2. **Transcription**: Speech converted to text in real-time
3. **Auto-translation**: Automatic translation trigger on speech completion
4. **Streaming**: Real-time translation updates for multiple languages

### Image Analysis Flow

1. **Upload**: Image uploaded to Cloudinary
2. **Analysis**: Google Gemini Vision analyzes image content
3. **Summary**: AI generates detailed description
4. **Translation**: Summary translated to multiple languages

### Voice Cloning Flow

1. **Audio Upload**: User provides voice sample
2. **Processing**: ElevenLabs processes audio for voice model
3. **Model Creation**: Custom voice model generated
4. **Integration**: Voice available for TTS in translations

## Configuration

### Environment Variables

```env
# AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional TTS APIs
GOOGLE_TTS_API_KEY=your_google_tts_key
AZURE_TTS_KEY=your_azure_tts_key
AWS_POLLY_KEY=your_aws_polly_key
OPENAI_API_KEY=your_openai_key
```

### Supported Languages

The application supports 25+ languages including:

- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean, Chinese, Arabic
- Indian languages: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, Assamese, Nepali, Sinhala

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- API keys for external services

### Installation

```bash
npm install
# or
pnpm install
```

### Development Server

```bash
npm run dev
# or
pnpm dev
```

### Build

```bash
npm run build
# or
pnpm build
```

### Deployment

The application is configured for deployment on Vercel with automatic API route handling and environment variable management.

## Architecture Patterns

### Component Architecture

- **Separation of Concerns**: Each component has a single responsibility
- **Composition**: Components are composed together for complex features
- **Reusability**: UI components are shared across features

### State Management

- **Local State**: React useState for component-level state
- **Custom Hooks**: Encapsulated logic for complex state management
- **Local Storage**: Persistent data storage for history and settings

### API Design

- **RESTful Routes**: Standard HTTP methods and REST conventions
- **Error Handling**: Comprehensive error responses and user feedback
- **Rate Limiting**: Basic rate limiting for API protection
- **Validation**: Input validation and sanitization

### Performance Optimizations

- **Dynamic Imports**: Code splitting for large components
- **Memoization**: React.memo for expensive re-renders
- **Streaming**: Real-time data streaming for better UX
- **Caching**: Local storage caching for frequently used data

This documentation provides a comprehensive overview of the application's architecture, features, and implementation details. The modular design allows for easy extension and maintenance of individual features.

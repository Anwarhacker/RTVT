// Validation utilities for the translation application

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateText(text: string, maxLength: number = 10000): ValidationResult {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push("Text cannot be empty");
  }

  if (text.length > maxLength) {
    errors.push(`Text must be less than ${maxLength} characters`);
  }

  // Check for potentially harmful content
  if (containsHarmfulContent(text)) {
    errors.push("Text contains inappropriate content");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLanguageCode(code: string): ValidationResult {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push("Language code cannot be empty");
  }

  // Basic language code validation (ISO 639-1 format)
  const languageCodeRegex = /^[a-z]{2,3}(-[A-Z]{2})?$/;
  if (!languageCodeRegex.test(code)) {
    errors.push("Invalid language code format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSpeechSpeed(speed: number): ValidationResult {
  const errors: string[] = [];

  if (typeof speed !== 'number' || isNaN(speed)) {
    errors.push("Speech speed must be a number");
  } else if (speed < 0.1 || speed > 10) {
    errors.push("Speech speed must be between 0.1 and 10");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateVolume(volume: number): ValidationResult {
  const errors: string[] = [];

  if (typeof volume !== 'number' || isNaN(volume)) {
    errors.push("Volume must be a number");
  } else if (volume < 0 || volume > 1) {
    errors.push("Volume must be between 0 and 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePitch(pitch: number): ValidationResult {
  const errors: string[] = [];

  if (typeof pitch !== 'number' || isNaN(pitch)) {
    errors.push("Pitch must be a number");
  } else if (pitch < 0 || pitch > 2) {
    errors.push("Pitch must be between 0 and 2");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function containsHarmfulContent(text: string): boolean {
  // Basic harmful content detection
  const harmfulPatterns = [
    /\b(hate|violence|abuse|harassment)\b/i,
    /\b(racist|sexist|homophobic|transphobic)\b/i,
    /\b(illegal|criminal|drug|weapon)\b/i,
    // Add more patterns as needed
  ];

  return harmfulPatterns.some(pattern => pattern.test(text));
}

export function sanitizeText(text: string): string {
  // Basic text sanitization
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || email.trim().length === 0) {
    errors.push("Email cannot be empty");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFile(file: File, maxSize: number = 10 * 1024 * 1024): ValidationResult {
  const errors: string[] = [];

  if (!file) {
    errors.push("No file selected");
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type for images
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push("File must be an image (JPEG, PNG, GIF, or WebP)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTranslationRequest(
  text: string,
  inputLang: string,
  outputLangs: string[]
): ValidationResult {
  const errors: string[] = [];

  const textValidation = validateText(text);
  if (!textValidation.isValid) {
    errors.push(...textValidation.errors);
  }

  const inputLangValidation = validateLanguageCode(inputLang);
  if (!inputLangValidation.isValid) {
    errors.push(`Input language: ${inputLangValidation.errors.join(', ')}`);
  }

  if (!outputLangs || outputLangs.length === 0) {
    errors.push("At least one output language is required");
  } else {
    outputLangs.forEach((lang, index) => {
      const langValidation = validateLanguageCode(lang);
      if (!langValidation.isValid) {
        errors.push(`Output language ${index + 1}: ${langValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
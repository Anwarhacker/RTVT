import {
  validateText,
  validateLanguageCode,
  validateSpeechSpeed,
  validateVolume,
  validatePitch,
  validateEmail,
  validateFile,
  validateTranslationRequest,
  sanitizeText,
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateText', () => {
    it('should validate valid text', () => {
      const result = validateText('Hello world');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty text', () => {
      const result = validateText('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text cannot be empty');
    });

    it('should reject text that is too long', () => {
      const longText = 'a'.repeat(10001);
      const result = validateText(longText);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text must be less than 10000 characters');
    });

    it('should detect harmful content', () => {
      const result = validateText('This contains hate speech');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text contains inappropriate content');
    });
  });

  describe('validateLanguageCode', () => {
    it('should validate valid language codes', () => {
      expect(validateLanguageCode('en').isValid).toBe(true);
      expect(validateLanguageCode('hi').isValid).toBe(true);
      expect(validateLanguageCode('zh-CN').isValid).toBe(true);
    });

    it('should reject empty language codes', () => {
      const result = validateLanguageCode('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language code cannot be empty');
    });

    it('should reject invalid language code formats', () => {
      const result = validateLanguageCode('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid language code format');
    });
  });

  describe('validateSpeechSpeed', () => {
    it('should validate valid speech speeds', () => {
      expect(validateSpeechSpeed(0.8).isValid).toBe(true);
      expect(validateSpeechSpeed(1.5).isValid).toBe(true);
      expect(validateSpeechSpeed(2.0).isValid).toBe(true);
    });

    it('should reject invalid speech speeds', () => {
      expect(validateSpeechSpeed(0.05).isValid).toBe(false);
      expect(validateSpeechSpeed(15).isValid).toBe(false);
      expect(validateSpeechSpeed(NaN).isValid).toBe(false);
    });
  });

  describe('validateVolume', () => {
    it('should validate valid volumes', () => {
      expect(validateVolume(0.5).isValid).toBe(true);
      expect(validateVolume(0).isValid).toBe(true);
      expect(validateVolume(1).isValid).toBe(true);
    });

    it('should reject invalid volumes', () => {
      expect(validateVolume(-0.1).isValid).toBe(false);
      expect(validateVolume(1.5).isValid).toBe(false);
      expect(validateVolume(NaN).isValid).toBe(false);
    });
  });

  describe('validatePitch', () => {
    it('should validate valid pitches', () => {
      expect(validatePitch(1).isValid).toBe(true);
      expect(validatePitch(0.5).isValid).toBe(true);
      expect(validatePitch(2).isValid).toBe(true);
    });

    it('should reject invalid pitches', () => {
      expect(validatePitch(-0.1).isValid).toBe(false);
      expect(validatePitch(2.5).isValid).toBe(false);
      expect(validatePitch(NaN).isValid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should validate valid emails', () => {
      expect(validateEmail('test@example.com').isValid).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk').isValid).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('invalid-email').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
    });
  });

  describe('validateFile', () => {
    it('should validate valid image files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeFile = new File(['a'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should reject invalid file types', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File must be an image');
    });
  });

  describe('validateTranslationRequest', () => {
    it('should validate valid translation requests', () => {
      const result = validateTranslationRequest('Hello', 'en', ['es', 'fr']);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid translation requests', () => {
      const result = validateTranslationRequest('', 'en', []);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text cannot be empty');
      expect(result.errors).toContain('At least one output language is required');
    });
  });

  describe('sanitizeText', () => {
    it('should sanitize text correctly', () => {
      expect(sanitizeText('  Hello   world  ')).toBe('Hello world');
      expect(sanitizeText('Hello\x00world')).toBe('Helloworld');
      expect(sanitizeText('Hello\n\nworld')).toBe('Hello world');
    });
  });
});
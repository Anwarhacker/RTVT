import { renderHook, act } from "@testing-library/react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

// Mock the Web Speech API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: "",
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onstart: null,
  onend: null,
  onresult: null,
  onerror: null,
};

const mockGetUserMedia = jest.fn();

// Mock global APIs
Object.defineProperty(window, "SpeechRecognition", {
  writable: true,
  value: jest.fn(() => mockSpeechRecognition),
});

Object.defineProperty(window, "webkitSpeechRecognition", {
  writable: true,
  value: jest.fn(() => mockSpeechRecognition),
});

Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

describe("useSpeechRecognition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }],
    });
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe("");
    expect(result.current.interimTranscript).toBe("");
    expect(result.current.error).toBe(null);
  });

  it("should start listening when startListening is called", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    await act(async () => {
      result.current.startListening();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it("should stop listening when stopListening is called", async () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Start listening first
    await act(async () => {
      result.current.startListening();
    });

    // Then stop listening
    act(() => {
      result.current.stopListening();
    });

    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });

  it("should reset transcript when resetTranscript is called", () => {
    const { result } = renderHook(() => useSpeechRecognition());

    act(() => {
      result.current.resetTranscript();
    });

    expect(result.current.transcript).toBe("");
    expect(result.current.interimTranscript).toBe("");
  });

  it("should handle speech recognition results", () => {
    const onResult = jest.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onResult }));

    // Simulate speech recognition result
    const mockEvent = {
      results: [
        {
          isFinal: true,
          0: { transcript: "Hello world" },
        },
      ],
      resultIndex: 0,
    };

    act(() => {
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult(mockEvent as any);
      }
    });

    expect(result.current.transcript).toBe("Hello world");
    expect(onResult).toHaveBeenCalledWith("Hello world", true);
  });

  it("should handle interim results", () => {
    const onInterimResult = jest.fn();
    const { result } = renderHook(() =>
      useSpeechRecognition({ onInterimResult })
    );

    // Simulate interim speech recognition result
    const mockEvent = {
      results: [
        {
          isFinal: false,
          0: { transcript: "Hello" },
        },
      ],
      resultIndex: 0,
    };

    act(() => {
      if (mockSpeechRecognition.onresult) {
        mockSpeechRecognition.onresult(mockEvent as any);
      }
    });

    expect(result.current.interimTranscript).toBe("Hello");
    expect(onInterimResult).toHaveBeenCalledWith("Hello");
  });

  it("should handle errors", () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useSpeechRecognition({ onError }));

    // Simulate speech recognition error
    const mockErrorEvent = {
      error: "network",
      message: "Network error",
    };

    act(() => {
      if (mockSpeechRecognition.onerror) {
        mockSpeechRecognition.onerror(mockErrorEvent as any);
      }
    });

    expect(result.current.error).toBe("Speech recognition error: network");
    expect(onError).toHaveBeenCalledWith("Speech recognition error: network");
  });

  it("should not be supported if SpeechRecognition is not available", () => {
    // Mock the absence of SpeechRecognition API
    const originalSpeechRecognition = Object.getOwnPropertyDescriptor(
      window,
      "SpeechRecognition"
    );
    const originalWebkitSpeechRecognition = Object.getOwnPropertyDescriptor(
      window,
      "webkitSpeechRecognition"
    );

    // Delete the properties
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const { result } = renderHook(() => useSpeechRecognition());

    expect(result.current.isSupported).toBe(false);

    // Restore the properties
    if (originalSpeechRecognition) {
      Object.defineProperty(
        window,
        "SpeechRecognition",
        originalSpeechRecognition
      );
    }
    if (originalWebkitSpeechRecognition) {
      Object.defineProperty(
        window,
        "webkitSpeechRecognition",
        originalWebkitSpeechRecognition
      );
    }
  });
});

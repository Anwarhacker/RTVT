import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InputControls } from "@/components/input-controls";

// Mock the useSpeechRecognition hook
jest.mock("@/hooks/use-speech-recognition", () => ({
  useSpeechRecognition: jest.fn(() => ({
    isSupported: true,
    isListening: false,
    transcript: "",
    interimTranscript: "",
    startListening: jest.fn(),
    stopListening: jest.fn(),
    resetTranscript: jest.fn(),
    error: null,
  })),
}));

describe("InputControls", () => {
  const defaultProps = {
    inputText: "Hello world",
    setInputText: jest.fn(),
    inputLanguage: "en",
    detectedLanguage: null,
    autoTranslate: false,
    setAutoTranslate: jest.fn(),
    autoPlay: false,
    setAutoPlay: jest.fn(),
    grammarCorrectionEnabled: true,
    setGrammarCorrectionEnabled: jest.fn(),
    streamingMode: false,
    setStreamingMode: jest.fn(),
    speechSpeed: 0.8,
    setSpeechSpeed: jest.fn(),
    onTranslate: jest.fn(),
    onReset: jest.fn(),
    isTranslating: false,
    isCorrectingGrammar: false,
    speechError: null,
    translationError: null,
    isSpeechSupported: true,
    isTTSSupported: true,
    onRecordingToggle: jest.fn(),
    isListening: false,
    interimTranscript: "",
    isStreaming: false,
    languages: [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input controls correctly", () => {
    render(<InputControls {...defaultProps} />);

    expect(screen.getByText("Input")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type or speak your text here...")
    ).toBeInTheDocument();
    expect(screen.getByText("Smart Features")).toBeInTheDocument();
  });

  it("displays input text correctly", () => {
    render(<InputControls {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      "Type or speak your text here..."
    );
    expect(textarea).toHaveValue("Hello world");
  });

  it("calls setInputText when text is changed", () => {
    render(<InputControls {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      "Type or speak your text here..."
    );
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(defaultProps.setInputText).toHaveBeenCalledWith("New text");
  });

  it("toggles auto-translate checkbox", () => {
    render(<InputControls {...defaultProps} />);

    const checkbox = screen.getByLabelText("Auto-translate as I speak");
    fireEvent.click(checkbox);

    expect(defaultProps.setAutoTranslate).toHaveBeenCalledWith(true);
  });

  it("toggles auto-play checkbox", () => {
    render(<InputControls {...defaultProps} />);

    const checkbox = screen.getByLabelText("Auto-play translated speech");
    fireEvent.click(checkbox);

    expect(defaultProps.setAutoPlay).toHaveBeenCalledWith(true);
  });

  it("toggles grammar correction checkbox", () => {
    render(<InputControls {...defaultProps} />);

    const checkbox = screen.getByLabelText("Auto-correct grammar & spelling");
    fireEvent.click(checkbox);

    expect(defaultProps.setGrammarCorrectionEnabled).toHaveBeenCalledWith(
      false
    );
  });

  it("toggles streaming mode checkbox", () => {
    render(<InputControls {...defaultProps} />);

    const checkbox = screen.getByLabelText("Real-time streaming mode");
    fireEvent.click(checkbox);

    expect(defaultProps.setStreamingMode).toHaveBeenCalledWith(true);
  });

  it("calls onTranslate when translate button is clicked", () => {
    render(<InputControls {...defaultProps} />);

    const translateButton = screen.getByText("Translate");
    fireEvent.click(translateButton);

    expect(defaultProps.onTranslate).toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", () => {
    render(<InputControls {...defaultProps} />);

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it("calls onRecordingToggle when record button is clicked", () => {
    render(<InputControls {...defaultProps} />);

    const recordButton = screen.getByText("Start Recording");
    fireEvent.click(recordButton);

    expect(defaultProps.onRecordingToggle).toHaveBeenCalled();
  });

  it("shows loading state when correcting grammar", () => {
    render(<InputControls {...defaultProps} isCorrectingGrammar={true} />);

    expect(screen.getByText("Correcting Grammar...")).toBeInTheDocument();
  });

  it("shows streaming state when streaming", () => {
    render(
      <InputControls
        {...defaultProps}
        isStreaming={true}
        streamingMode={true}
      />
    );

    expect(screen.getByText("Stop Stream")).toBeInTheDocument();
  });

  it("disables translate button when no input text", () => {
    render(<InputControls {...defaultProps} inputText="" />);

    const translateButton = screen.getByText("Translate");
    expect(translateButton).toBeDisabled();
  });

  it("displays detected language badge when available", () => {
    render(
      <InputControls
        {...defaultProps}
        detectedLanguage="es"
        inputLanguage="auto"
      />
    );

    expect(screen.getByText("Detected: es")).toBeInTheDocument();
  });

  it("updates speech speed when slider changes", () => {
    render(<InputControls {...defaultProps} />);

    const slider = screen.getByLabelText("Speech Speed: 0.8x");
    fireEvent.change(slider, { target: { value: "1.2" } });

    expect(defaultProps.setSpeechSpeed).toHaveBeenCalledWith(1.2);
  });

  it("shows listening indicator when recording", () => {
    render(<InputControls {...defaultProps} isListening={true} />);

    expect(screen.getByText("Listening for speech...")).toBeInTheDocument();
    expect(screen.getByText("Stop Recording")).toBeInTheDocument();
  });

  it("displays interim transcript when available", () => {
    render(
      <InputControls
        {...defaultProps}
        isListening={true}
        interimTranscript="Hello"
      />
    );

    expect(screen.getByText('"Hello"')).toBeInTheDocument();
  });
});


export type SpeechRecognitionStatus = 'inactive' | 'listening' | 'processing' | 'error';

// Type for speech recognition results
export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

// Configure the speech recognition
const setupSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }

  // @ts-ignore - webkitSpeechRecognition is not in TypeScript's lib.dom.d.ts
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  return recognition;
};

export { setupSpeechRecognition };

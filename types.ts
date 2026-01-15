
export enum Dosha {
  VATA = 'Vata',
  PITTA = 'Pitta',
  KAPHA = 'Kapha',
  VATA_PITTA = 'Vata-Pitta',
  PITTA_KAPHA = 'Pitta-Kapha',
  VATA_KAPHA = 'Vata-Kapha',
  TRIDOSHA = 'Tridosha'
}

export type Language = 'English' | 'Hindi';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AssessmentResult {
  prakritiType: string;
  explanation: string;
  keyTraits: string[];
  lifestyleAdvice: string[];
  dietaryAdvice: string[];
  detectedFacialFeatures?: string[];
}

export interface ImageValidationResult {
  isValid: boolean;
  feedback: string;
}

export interface Question {
  id: number;
  category: string;
  text: string;
  options: {
    label: string;
    text: string;
    dosha: Dosha;
  }[];
}

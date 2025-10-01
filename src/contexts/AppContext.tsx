"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Language } from '@/lib/translations';

// Define the shape of your form data
interface FormData {
  name: string;
  cnic: string;
  dob: string;
}

interface SecurityAnswer {
  question: string;
  answer: string;
}

// Define the shape of your global state
interface AppState {
  language: Language;
  currentStep: number;
  formData: FormData;
  securityAnswers: SecurityAnswer[];
  hasAccount: boolean;
}

// Define the actions you can perform on the state
type AppAction =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<FormData> }
  | { type: 'SET_SECURITY_ANSWERS'; payload: SecurityAnswer[] }
  | { type: 'RESET' }
  | { type: 'SET_HAS_ACCOUNT', payload: boolean };

// Initial state of the application
const initialState: AppState = {
  language: 'ur',
  currentStep: 0,
  formData: {
    name: '',
    cnic: '',
    dob: '',
  },
  securityAnswers: [],
  hasAccount: false,
};

// The reducer function to handle state changes
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1 };
    case 'PREV_STEP':
      return { ...state, currentStep: state.currentStep - 1 };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'SET_SECURITY_ANSWERS':
        return { ...state, securityAnswers: action.payload };
    case 'SET_HAS_ACCOUNT':
        if (action.payload) {
          // User wants to save info, go to name step
          return { ...state, hasAccount: action.payload, currentStep: 1 };
        } else {
          // User doesn't want to save, skip to completion
          return { ...state, hasAccount: action.payload, currentStep: 5 };
        }
    case 'RESET':
        return {
            ...initialState,
            language: state.language, // preserve language choice
        };
    default:
      return state;
  }
};

// Create the context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

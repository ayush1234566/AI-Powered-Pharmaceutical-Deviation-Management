import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Extraction state
  isExtracting: false,
  extractionProgress: 0,
  extractionStatus: '',

  // Chat messages
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '👋 Welcome to the AI Deviation Assistant! Upload a deviation report, lab result, or paste text above. I will automatically extract the relevant details and populate the form for you.',
      timestamp: new Date().toISOString(),
    },
  ],

  // Chat input
  isChatLoading: false,

  // Upload
  uploadedFileName: null,
  uploadError: null,
};

const aiPanelSlice = createSlice({
  name: 'aiPanel',
  initialState,
  reducers: {
    setExtracting: (state, action) => {
      state.isExtracting = action.payload;
      if (action.payload) {
        state.extractionProgress = 0;
        state.extractionStatus = 'Uploading document...';
        state.uploadError = null;
      }
    },
    setExtractionProgress: (state, action) => {
      state.extractionProgress = action.payload.progress;
      state.extractionStatus = action.payload.status;
    },
    setUploadedFileName: (state, action) => {
      state.uploadedFileName = action.payload;
    },
    setUploadError: (state, action) => {
      state.uploadError = action.payload;
      state.isExtracting = false;
      state.extractionProgress = 0;
      state.extractionStatus = '';
    },
    addMessage: (state, action) => {
      state.messages.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    setChatLoading: (state, action) => {
      state.isChatLoading = action.payload;
    },
    resetAIPanel: () => initialState,
  },
});

export const {
  setExtracting,
  setExtractionProgress,
  setUploadedFileName,
  setUploadError,
  addMessage,
  setChatLoading,
  resetAIPanel,
} = aiPanelSlice.actions;

export default aiPanelSlice.reducer;

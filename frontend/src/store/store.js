import { configureStore } from '@reduxjs/toolkit';
import deviationReducer from './deviationSlice';
import aiPanelReducer from './aiPanelSlice';

export const store = configureStore({
  reducer: {
    deviation: deviationReducer,
    aiPanel: aiPanelReducer,
  },
});

export default store;

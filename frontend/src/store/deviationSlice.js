import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Deviation Information
  id: null,
  site_plant: '',
  date_of_occurrence: '',
  title: '',
  source: '',
  related_product_material: '',
  batch_lot_number: '',

  // Deviation Details
  detailed_description: '',
  initial_impact: '',
  initial_severity: '',

  // AI reasoning
  ai_impact_reasoning: '',
  ai_severity_reasoning: '',

  // Metadata
  status: 'Draft',
  source_document_name: '',
  source_text: '',

  // UI state
  isSaving: false,
  saveSuccess: false,
  saveError: null,
  savedDeviationId: null,
};

const deviationSlice = createSlice({
  name: 'deviation',
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
    },
    populateFromAI: (state, action) => {
      const { extracted_data, recommendation } = action.payload;
      // Populate extracted fields
      if (extracted_data) {
        Object.keys(extracted_data).forEach((key) => {
          if (extracted_data[key] !== null && extracted_data[key] !== undefined) {
            state[key] = extracted_data[key];
          }
        });
      }
      // Populate recommendation
      if (recommendation) {
        if (recommendation.initial_impact) state.initial_impact = recommendation.initial_impact;
        if (recommendation.initial_severity) state.initial_severity = recommendation.initial_severity;
        if (recommendation.impact_reasoning) state.ai_impact_reasoning = recommendation.impact_reasoning;
        if (recommendation.severity_reasoning) state.ai_severity_reasoning = recommendation.severity_reasoning;
      }
    },
    loadDeviation: (state, action) => {
      const dev = action.payload;
      state.id = dev.id || null;
      state.savedDeviationId = dev.deviation_id || dev.id;
      state.site_plant = dev.site_plant || '';
      state.date_of_occurrence = dev.date_of_occurrence || '';
      state.title = dev.title || '';
      state.source = dev.source || '';
      state.related_product_material = dev.related_product_material || '';
      state.batch_lot_number = dev.batch_lot_number || '';
      state.detailed_description = dev.detailed_description || '';
      state.initial_impact = dev.initial_impact || '';
      state.initial_severity = dev.initial_severity || '';
      state.ai_impact_reasoning = dev.ai_impact_reasoning || '';
      state.ai_severity_reasoning = dev.ai_severity_reasoning || '';
      state.status = dev.status || 'Saved';
      state.source_document_name = dev.source_document_name || '';
      state.source_text = dev.source_text || '';
      state.saveSuccess = false;
      state.saveError = null;
    },
    resetForm: () => initialState,
    setSaving: (state, action) => {
      state.isSaving = action.payload;
    },
    setSaveSuccess: (state, action) => {
      state.saveSuccess = true;
      state.saveError = null;
      state.savedDeviationId = action.payload;
      state.status = 'Saved';
    },
    setSaveError: (state, action) => {
      state.saveSuccess = false;
      state.saveError = action.payload;
    },
    clearSaveStatus: (state) => {
      state.saveSuccess = false;
      state.saveError = null;
    },
  },
});

export const {
  updateField,
  populateFromAI,
  loadDeviation,
  resetForm,
  setSaving,
  setSaveSuccess,
  setSaveError,
  clearSaveStatus,
} = deviationSlice.actions;

export default deviationSlice.reducer;

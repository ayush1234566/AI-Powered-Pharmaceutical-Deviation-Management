import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateField,
  resetForm,
  setSaving,
  setSaveSuccess,
  setSaveError,
  clearSaveStatus,
} from '../store/deviationSlice';
import { resetAIPanel } from '../store/aiPanelSlice';
import { saveDeviation, updateDeviation } from '../api/deviationApi';
import {
  FiSave,
  FiRotateCcw,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiList,
  FiFileText,
} from 'react-icons/fi';

const SITE_OPTIONS = [
  '',
  'API Manufacturing Unit',
  'API Manufacturing Unit - Building A',
  'API Manufacturing Unit - Building B',
  'API Manufacturing Unit - Building C',
  'Formulation Plant 1',
  'Formulation Plant 2',
  'Formulation Plant B',
  'Quality Control Lab',
  'Warehouse & Distribution',
  'R&D Center',
  'Utility Block',
];

const SOURCE_OPTIONS = [
  '',
  'Manufacturing',
  'Laboratory',
  'Quality Control',
  'Quality Assurance',
  'Warehouse',
  'Utility',
  'Maintenance',
  'Environmental Monitoring',
  'Customer Complaint',
  'Regulatory',
  'Self-Inspection',
  'Audit Finding',
  'Other',
];

const IMPACT_OPTIONS = ['', 'Low', 'Medium', 'High', 'Critical'];
const SEVERITY_OPTIONS = ['', 'Minor', 'Major', 'Critical'];

export default function DeviationForm({ onNavigateToRegistry }) {
  const dispatch = useDispatch();
  const deviation = useSelector((state) => state.deviation);

  const handleChange = useCallback(
    (field) => (e) => {
      dispatch(updateField({ field, value: e.target.value }));
      dispatch(clearSaveStatus());
    },
    [dispatch]
  );

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
      dispatch(resetForm());
      dispatch(resetAIPanel());
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!deviation.title || !deviation.title.trim()) {
      dispatch(setSaveError('Title / Short Description is required.'));
      return;
    }

    dispatch(setSaving(true));
    dispatch(clearSaveStatus());

    try {
      const payload = {
        site_plant: deviation.site_plant || null,
        date_of_occurrence: deviation.date_of_occurrence || null,
        title: deviation.title,
        source: deviation.source || null,
        related_product_material: deviation.related_product_material || null,
        batch_lot_number: deviation.batch_lot_number || null,
        detailed_description: deviation.detailed_description || null,
        initial_impact: deviation.initial_impact || null,
        initial_severity: deviation.initial_severity || null,
        ai_impact_reasoning: deviation.ai_impact_reasoning || null,
        ai_severity_reasoning: deviation.ai_severity_reasoning || null,
        source_document_name: deviation.source_document_name || null,
        source_text: deviation.source_text || null,
        status: 'Saved',
      };

      let result;
      if (deviation.id) {
        result = await updateDeviation(deviation.id, payload);
      } else {
        result = await saveDeviation(payload);
      }
      dispatch(setSaveSuccess(result.deviation_id));
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || 'Failed to save deviation.';
      dispatch(setSaveError(msg));
    } finally {
      dispatch(setSaving(false));
    }
  };

  const descLength = (deviation.detailed_description || '').length;

  return (
    <div className="deviation-form-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-header-left">
          <h2>{deviation.id ? 'Edit Deviation' : 'Log Deviation'}</h2>
          <span className={`status-badge status-badge--${deviation.status.toLowerCase()}`}>
            {deviation.status}
          </span>
        </div>
        <div className="panel-header-right">
          {deviation.savedDeviationId && (
            <span className="deviation-id-badge">
              ID: {deviation.savedDeviationId}
            </span>
          )}
          {onNavigateToRegistry && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={onNavigateToRegistry}
              title="View all saved deviations"
            >
              <FiList size={14} />
              <span>Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Success / Error Messages */}
      {deviation.saveSuccess && (
        <div className="form-alert form-alert--success">
          <FiCheck size={16} />
          <span>
            Deviation {deviation.id ? 'updated' : 'saved'} successfully! (ID: {deviation.savedDeviationId})
          </span>
          {onNavigateToRegistry && (
            <button className="alert-link-btn" onClick={onNavigateToRegistry}>
              View in Registry →
            </button>
          )}
        </div>
      )}
      {deviation.saveError && (
        <div className="form-alert form-alert--error">
          <FiAlertCircle size={16} />
          <span>{deviation.saveError}</span>
        </div>
      )}

      {/* Form Content */}
      <div className="form-scroll">
        {/* Section 1: Deviation Information */}
        <div className="form-section">
          <div className="section-header">
            <h3>1. Deviation Information</h3>
            <span className="section-badge">Required</span>
          </div>

          <div className="form-grid form-grid--2col">
            <div className="form-group">
              <label htmlFor="site_plant">Site / Plant</label>
              <select
                id="site_plant"
                value={deviation.site_plant}
                onChange={handleChange('site_plant')}
              >
                {SITE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '— Select Site / Plant —'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date_of_occurrence">Date of Occurrence</label>
              <input
                type="date"
                id="date_of_occurrence"
                value={deviation.date_of_occurrence}
                onChange={handleChange('date_of_occurrence')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Title / Short Description <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="title"
              placeholder="e.g., Reactor Temperature Excursion During Condensation Step"
              value={deviation.title}
              onChange={handleChange('title')}
              maxLength={150}
            />
          </div>

          <div className="form-grid form-grid--3col">
            <div className="form-group">
              <label htmlFor="source">Source</label>
              <select
                id="source"
                value={deviation.source}
                onChange={handleChange('source')}
              >
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '— Select Source —'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="related_product_material">Related Product / Material</label>
              <input
                type="text"
                id="related_product_material"
                placeholder="e.g., Metformin HCl API"
                value={deviation.related_product_material}
                onChange={handleChange('related_product_material')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="batch_lot_number">Batch / Lot Number</label>
              <input
                type="text"
                id="batch_lot_number"
                placeholder="e.g., MET-2026-0847"
                value={deviation.batch_lot_number}
                onChange={handleChange('batch_lot_number')}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Deviation Details */}
        <div className="form-section">
          <div className="section-header">
            <h3>2. Deviation Details</h3>
            <span className="char-count">{descLength} / 2000</span>
          </div>

          <div className="form-group">
            <label htmlFor="detailed_description">
              Detailed Description
              <span className="label-hint">
                Include what happened, immediate containment, and preliminary root cause.
              </span>
            </label>
            <textarea
              id="detailed_description"
              rows={6}
              placeholder="Describe the deviation event thoroughly..."
              value={deviation.detailed_description}
              onChange={handleChange('detailed_description')}
              maxLength={2000}
            />
          </div>

          <div className="form-grid form-grid--2col">
            <div className="form-group">
              <label htmlFor="initial_impact">
                Initial Impact
                {deviation.ai_impact_reasoning && (
                  <span className="ai-tag" title={deviation.ai_impact_reasoning}>
                    AI Recommended
                  </span>
                )}
              </label>
              <select
                id="initial_impact"
                value={deviation.initial_impact}
                onChange={handleChange('initial_impact')}
                className={deviation.initial_impact ? `impact-${deviation.initial_impact.toLowerCase()}` : ''}
              >
                {IMPACT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '— Select Impact —'}
                  </option>
                ))}
              </select>
              {deviation.ai_impact_reasoning && (
                <div className="ai-reasoning">
                  <FiInfo size={12} />
                  <span>{deviation.ai_impact_reasoning}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="initial_severity">
                Initial Severity
                {deviation.ai_severity_reasoning && (
                  <span className="ai-tag" title={deviation.ai_severity_reasoning}>
                    AI Recommended
                  </span>
                )}
              </label>
              <select
                id="initial_severity"
                value={deviation.initial_severity}
                onChange={handleChange('initial_severity')}
                className={deviation.initial_severity ? `severity-${deviation.initial_severity.toLowerCase()}` : ''}
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '— Select Severity —'}
                  </option>
                ))}
              </select>
              {deviation.ai_severity_reasoning && (
                <div className="ai-reasoning">
                  <FiInfo size={12} />
                  <span>{deviation.ai_severity_reasoning}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button className="btn btn--outline" onClick={handleReset} disabled={deviation.isSaving}>
          <FiRotateCcw size={15} />
          Reset Form
        </button>
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={deviation.isSaving}
        >
          {deviation.isSaving ? (
            <>
              <span className="btn-spinner"></span>
              Saving...
            </>
          ) : (
            <>
              <FiSave size={15} />
              {deviation.id ? 'Update Deviation' : 'Save Deviation'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React from 'react';
import {
  FiX,
  FiPrinter,
  FiAlertTriangle,
  FiClock,
  FiMapPin,
  FiTag,
  FiShield,
  FiFileText,
  FiCheckCircle,
} from 'react-icons/fi';

export default function DeviationDetailModal({ deviation, onClose, onEdit }) {
  if (!deviation) return null;

  const handlePrint = () => {
    window.print();
  };

  const getImpactClass = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'critical': return 'badge-danger';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-neutral';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'badge-danger';
      case 'major': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content print-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="deviation-id-pill">{deviation.deviation_id || deviation.id}</span>
            <h3>{deviation.title || 'Untitled Deviation'}</h3>
          </div>
          <div className="modal-header-actions no-print">
            <button className="btn-secondary btn-sm" onClick={handlePrint} title="Print / Export Dossier">
              <FiPrinter size={15} />
              <span>Print Dossier</span>
            </button>
            {onEdit && (
              <button
                className="btn-primary btn-sm"
                onClick={() => {
                  onEdit(deviation);
                  onClose();
                }}
              >
                <span>Edit / Update</span>
              </button>
            )}
            <button className="btn-icon" onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Metadata Banner */}
          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <span className="meta-label">
                <FiMapPin size={13} /> Site / Plant
              </span>
              <span className="meta-value">{deviation.site_plant || 'N/A'}</span>
            </div>
            <div className="detail-meta-card">
              <span className="meta-label">
                <FiClock size={13} /> Occurrence Date
              </span>
              <span className="meta-value">{deviation.date_of_occurrence || 'N/A'}</span>
            </div>
            <div className="detail-meta-card">
              <span className="meta-label">
                <FiTag size={13} /> Batch / Lot No.
              </span>
              <span className="meta-value font-mono">{deviation.batch_lot_number || 'N/A'}</span>
            </div>
            <div className="detail-meta-card">
              <span className="meta-label">
                <FiFileText size={13} /> Product / Material
              </span>
              <span className="meta-value">{deviation.related_product_material || 'N/A'}</span>
            </div>
          </div>

          {/* Classification & Risk Matrix */}
          <div className="detail-section">
            <h4 className="section-title">
              <FiAlertTriangle size={15} /> Impact & Severity Risk Assessment
            </h4>
            <div className="risk-badges-row">
              <div className="risk-badge-box">
                <span className="risk-badge-label">Initial Impact:</span>
                <span className={`status-badge ${getImpactClass(deviation.initial_impact)}`}>
                  {deviation.initial_impact || 'Not Assessed'}
                </span>
              </div>
              <div className="risk-badge-box">
                <span className="risk-badge-label">Initial Severity:</span>
                <span className={`status-badge ${getSeverityClass(deviation.initial_severity)}`}>
                  {deviation.initial_severity || 'Not Assessed'}
                </span>
              </div>
              <div className="risk-badge-box">
                <span className="risk-badge-label">Status:</span>
                <span className="status-badge badge-info">
                  {deviation.status || 'Saved'}
                </span>
              </div>
              <div className="risk-badge-box">
                <span className="risk-badge-label">Source Category:</span>
                <span className="status-badge badge-neutral">
                  {deviation.source || 'General'}
                </span>
              </div>
            </div>

            {/* AI Reasoning Boxes */}
            {(deviation.ai_impact_reasoning || deviation.ai_severity_reasoning) && (
              <div className="ai-reasoning-panel">
                <div className="ai-reasoning-header">
                  <FiShield size={16} />
                  <span>Quality Assurance & AI Assessment Rationale</span>
                </div>
                {deviation.ai_impact_reasoning && (
                  <div className="reasoning-block">
                    <strong>Impact Justification:</strong>
                    <p>{deviation.ai_impact_reasoning}</p>
                  </div>
                )}
                {deviation.ai_severity_reasoning && (
                  <div className="reasoning-block">
                    <strong>Severity Justification:</strong>
                    <p>{deviation.ai_severity_reasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Event Description */}
          <div className="detail-section">
            <h4 className="section-title">
              <FiFileText size={15} /> Detailed Event Description & Investigation Notes
            </h4>
            <div className="description-text-box">
              {deviation.detailed_description ? (
                deviation.detailed_description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p className="text-muted">No description provided.</p>
              )}
            </div>
          </div>

          {/* Regulatory Audit Footnote */}
          <div className="detail-footnote">
            <FiCheckCircle size={14} />
            <span>
              Recorded in accordance with 21 CFR 211.192 and EU GMP Volume 4. Record ID: {deviation.id} | Timestamp: {deviation.created_at ? new Date(deviation.created_at).toLocaleString() : 'Recent'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { listDeviations, deleteDeviation } from '../api/deviationApi';
import { loadDeviation } from '../store/deviationSlice';
import DeviationDetailModal from './DeviationDetailModal';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiPlus,
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiTag,
  FiLayers,
} from 'react-icons/fi';

export default function DeviationRegistry({ onNavigateToLog }) {
  const dispatch = useDispatch();
  const [deviations, setDeviations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [impactFilter, setImpactFilter] = useState('ALL');
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchDeviations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDeviations(0, 100, search);
      setDeviations(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch deviations.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDeviations();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchDeviations]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this deviation record?`)) {
      try {
        await deleteDeviation(id);
        setDeviations((prev) => prev.filter((d) => d.id !== id && d.deviation_id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete deviation');
      }
    }
  };

  const handleEdit = (dev) => {
    dispatch(loadDeviation(dev));
    if (onNavigateToLog) onNavigateToLog();
  };

  const filteredDeviations = deviations.filter((dev) => {
    if (severityFilter !== 'ALL' && dev.initial_severity?.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }
    if (impactFilter !== 'ALL' && dev.initial_impact?.toLowerCase() !== impactFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getImpactBadge = (impact) => {
    const i = impact?.toLowerCase();
    let badgeClass = 'badge-neutral';
    if (i === 'critical') badgeClass = 'badge-danger';
    else if (i === 'high') badgeClass = 'badge-warning';
    else if (i === 'medium') badgeClass = 'badge-info';
    return <span className={`status-badge ${badgeClass}`}>{impact || 'N/A'}</span>;
  };

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    let badgeClass = 'badge-neutral';
    if (s === 'critical') badgeClass = 'badge-danger';
    else if (s === 'major') badgeClass = 'badge-warning';
    else if (s === 'minor') badgeClass = 'badge-info';
    return <span className={`status-badge ${badgeClass}`}>{severity || 'N/A'}</span>;
  };

  return (
    <div className="registry-container">
      {/* Registry Header */}
      <div className="registry-header-row">
        <div>
          <h2>Deviations Registry</h2>
          <p className="subtitle">
            Centralized GMP audit repository of all captured deviations and impact assessments
          </p>
        </div>
        <div className="registry-actions-top">
          <button className="btn-secondary btn-sm" onClick={fetchDeviations} title="Refresh records">
            <FiRefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary btn-sm" onClick={onNavigateToLog}>
            <FiPlus size={16} />
            <span>Log New Deviation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="registry-toolbar">
        <div className="search-input-wrapper">
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Search by ID, batch, title, product, or site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search-btn" onClick={() => setSearch('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-group">
          <label>
            <FiFilter size={13} /> Severity:
          </label>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="ALL">All Severities</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FiLayers size={13} /> Impact:
          </label>
          <select value={impactFilter} onChange={(e) => setImpactFilter(e.target.value)}>
            <option value="ALL">All Impacts</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading && deviations.length === 0 ? (
        <div className="registry-empty-state">
          <div className="loading-spinner"></div>
          <p>Loading deviation audit records...</p>
        </div>
      ) : error ? (
        <div className="registry-error-state">
          <FiAlertTriangle size={24} />
          <p>{error}</p>
          <button className="btn-secondary btn-sm" onClick={fetchDeviations}>
            Try Again
          </button>
        </div>
      ) : filteredDeviations.length === 0 ? (
        <div className="registry-empty-state">
          <FiLayers size={36} className="empty-icon" />
          <h3>No Deviations Found</h3>
          <p>
            {search || severityFilter !== 'ALL' || impactFilter !== 'ALL'
              ? 'No deviations match your search or filter criteria.'
              : 'No deviations have been logged yet. Use the Log Deviation intake form to create your first record.'}
          </p>
          <button className="btn-primary" onClick={onNavigateToLog}>
            <FiPlus size={16} />
            <span>Log a Deviation</span>
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="deviation-table">
            <thead>
              <tr>
                <th>Deviation ID</th>
                <th>Title / Summary</th>
                <th>Batch / Lot</th>
                <th>Site / Plant</th>
                <th>Date</th>
                <th>Impact</th>
                <th>Severity</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeviations.map((dev) => (
                <tr
                  key={dev.id}
                  onClick={() => setSelectedDeviation(dev)}
                  className="clickable-row"
                  title="Click to view full dossier"
                >
                  <td className="font-mono font-bold text-accent">
                    {dev.deviation_id || dev.id}
                  </td>
                  <td>
                    <div className="table-title-cell">
                      <span className="table-title-text">{dev.title || 'Untitled'}</span>
                      {dev.related_product_material && (
                        <span className="table-subtitle-text">{dev.related_product_material}</span>
                      )}
                    </div>
                  </td>
                  <td className="font-mono">{dev.batch_lot_number || '—'}</td>
                  <td>{dev.site_plant || '—'}</td>
                  <td>{dev.date_of_occurrence || '—'}</td>
                  <td>{getImpactBadge(dev.initial_impact)}</td>
                  <td>{getSeverityBadge(dev.initial_severity)}</td>
                  <td>
                    <span className="status-badge badge-info">{dev.status || 'Saved'}</span>
                  </td>
                  <td className="text-right table-actions-cell" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="table-action-btn"
                      title="Inspect Dossier"
                      onClick={() => setSelectedDeviation(dev)}
                    >
                      <FiEye size={15} />
                    </button>
                    <button
                      className="table-action-btn"
                      title="Load into Form / Edit"
                      onClick={() => handleEdit(dev)}
                    >
                      <FiEdit size={15} />
                    </button>
                    <button
                      className="table-action-btn text-danger"
                      title="Delete Record"
                      onClick={(e) => handleDelete(dev.id, e)}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeviation && (
        <DeviationDetailModal
          deviation={selectedDeviation}
          onClose={() => setSelectedDeviation(null)}
          onEdit={(dev) => handleEdit(dev)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getDeviationStats, listDeviations } from '../api/deviationApi';
import DeviationDetailModal from './DeviationDetailModal';
import {
  FiActivity,
  FiAlertOctagon,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiEye,
} from 'react-icons/fi';

export default function AnalyticsDashboard({ onNavigateToLog }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeviation, setSelectedDeviation] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, recentData] = await Promise.all([
          getDeviationStats(),
          listDeviations(0, 5),
        ]);
        setStats(statsData);
        setRecent(recentData);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Calculating quality risk metrics & deviation analytics...</p>
      </div>
    );
  }

  const total = stats?.total || 0;
  const criticalCount = stats?.by_severity?.Critical || 0;
  const majorCount = stats?.by_severity?.Major || 0;
  const minorCount = stats?.by_severity?.Minor || 0;

  const criticalImpact = stats?.by_impact?.Critical || 0;
  const highImpact = stats?.by_impact?.High || 0;
  const medImpact = stats?.by_impact?.Medium || 0;
  const lowImpact = stats?.by_impact?.Low || 0;

  return (
    <div className="dashboard-container">
      {/* Dashboard Top Header */}
      <div className="registry-header-row">
        <div>
          <h2>Quality & Deviation Analytics</h2>
          <p className="subtitle">
            Real-time quality intelligence, risk profile distribution, and regulatory metrics
          </p>
        </div>
        <button className="btn-primary btn-sm" onClick={onNavigateToLog}>
          <FiPlus size={16} />
          <span>Log New Deviation</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Deviations</span>
            <div className="kpi-icon-wrapper bg-indigo">
              <FiActivity size={18} />
            </div>
          </div>
          <div className="kpi-value">{total}</div>
          <span className="kpi-subtext">Across all manufacturing sites</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Critical / Major Severity</span>
            <div className="kpi-icon-wrapper bg-danger">
              <FiAlertOctagon size={18} />
            </div>
          </div>
          <div className="kpi-value text-danger">{criticalCount + majorCount}</div>
          <span className="kpi-subtext">
            {criticalCount} Critical | {majorCount} Major
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">High Quality Impact</span>
            <div className="kpi-icon-wrapper bg-warning">
              <FiAlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value text-warning">{criticalImpact + highImpact}</div>
          <span className="kpi-subtext">Batch quarantine or hold required</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Minor / Low Risk</span>
            <div className="kpi-icon-wrapper bg-success">
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div className="kpi-value text-success">{minorCount + lowImpact}</div>
          <span className="kpi-subtext">Documentation or isolated cosmetic</span>
        </div>
      </div>

      {/* Analytics Charts & Distributions */}
      <div className="dashboard-grid-2col">
        {/* Severity Distribution */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiBarChart2 size={18} />
            <h3>Severity Risk Breakdown</h3>
          </div>
          <div className="bar-group-list">
            <div className="bar-item">
              <div className="bar-label-row">
                <span>Critical Severity</span>
                <span className="font-bold text-danger">{criticalCount}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-danger"
                  style={{ width: `${total ? (criticalCount / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label-row">
                <span>Major Severity</span>
                <span className="font-bold text-warning">{majorCount}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-warning"
                  style={{ width: `${total ? (majorCount / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label-row">
                <span>Minor Severity</span>
                <span className="font-bold text-success">{minorCount}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-success"
                  style={{ width: `${total ? (minorCount / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiPieChart size={18} />
            <h3>Product Quality Impact Distribution</h3>
          </div>
          <div className="bar-group-list">
            <div className="bar-item">
              <div className="bar-label-row">
                <span>Critical Impact (Direct Patient Safety)</span>
                <span className="font-bold text-danger">{criticalImpact}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-danger"
                  style={{ width: `${total ? (criticalImpact / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label-row">
                <span>High Impact (Likely Quality Effect)</span>
                <span className="font-bold text-warning">{highImpact}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-warning"
                  style={{ width: `${total ? (highImpact / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label-row">
                <span>Medium Impact (Minor Quality Variation)</span>
                <span className="font-bold text-info">{medImpact}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-info"
                  style={{ width: `${total ? (medImpact / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bar-item">
              <div className="bar-label-row">
                <span>Low Impact (No Quality Effect)</span>
                <span className="font-bold text-success">{lowImpact}</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill bg-success"
                  style={{ width: `${total ? (lowImpact / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deviations Log */}
      <div className="dashboard-card mt-6">
        <div className="dashboard-card-header">
          <FiClock size={18} />
          <h3>Recent Deviation Dossiers</h3>
        </div>

        {recent.length === 0 ? (
          <p className="text-muted p-4">No recent deviations logged.</p>
        ) : (
          <div className="table-responsive">
            <table className="deviation-table">
              <thead>
                <tr>
                  <th>Deviation ID</th>
                  <th>Title</th>
                  <th>Batch / Lot</th>
                  <th>Occurrence Date</th>
                  <th>Impact</th>
                  <th>Severity</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((dev) => (
                  <tr key={dev.id} onClick={() => setSelectedDeviation(dev)} className="clickable-row">
                    <td className="font-mono font-bold text-accent">
                      {dev.deviation_id || dev.id}
                    </td>
                    <td>{dev.title || 'Untitled'}</td>
                    <td className="font-mono">{dev.batch_lot_number || '—'}</td>
                    <td>{dev.date_of_occurrence || '—'}</td>
                    <td>
                      <span className="status-badge badge-warning">{dev.initial_impact || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="status-badge badge-danger">{dev.initial_severity || 'N/A'}</span>
                    </td>
                    <td className="text-right table-actions-cell" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="table-action-btn"
                        title="View Full Dossier"
                        onClick={() => setSelectedDeviation(dev)}
                      >
                        <FiEye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDeviation && (
        <DeviationDetailModal
          deviation={selectedDeviation}
          onClose={() => setSelectedDeviation(null)}
          onEdit={() => {
            onNavigateToLog();
          }}
        />
      )}
    </div>
  );
}

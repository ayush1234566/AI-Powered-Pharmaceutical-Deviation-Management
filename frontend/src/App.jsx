import React, { useState } from 'react';
import Header from './components/Header';
import DeviationForm from './components/DeviationForm';
import AIAssistant from './components/AIAssistant';
import DeviationRegistry from './components/DeviationRegistry';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('log');

  return (
    <div className="app">
      <Header activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'log' && (
          <>
            <DeviationForm onNavigateToRegistry={() => setActiveTab('registry')} />
            <AIAssistant />
          </>
        )}
        {activeTab === 'registry' && (
          <div className="full-width-view">
            <DeviationRegistry onNavigateToLog={() => setActiveTab('log')} />
          </div>
        )}
        {activeTab === 'dashboard' && (
          <div className="full-width-view">
            <AnalyticsDashboard onNavigateToLog={() => setActiveTab('log')} />
          </div>
        )}
      </main>
    </div>
  );
}

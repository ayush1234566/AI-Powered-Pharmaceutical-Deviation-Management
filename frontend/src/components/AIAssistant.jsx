import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import {
  setExtracting,
  setExtractionProgress,
  setUploadedFileName,
  setUploadError,
  addMessage,
  setChatLoading,
} from '../store/aiPanelSlice';
import { populateFromAI, updateField } from '../store/deviationSlice';
import { extractFromText, extractFromFile, chatWithAI } from '../api/deviationApi';
import { SAMPLE_REPORTS } from '../data/sampleReports';
import {
  FiUploadCloud,
  FiSend,
  FiFileText,
  FiAlertTriangle,
  FiCpu,
  FiCheckCircle,
  FiXCircle,
  FiFile,
  FiX,
  FiZap,
} from 'react-icons/fi';

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};
const MAX_SIZE = 10 * 1024 * 1024;

export default function AIAssistant() {
  const dispatch = useDispatch();
  const aiPanel = useSelector((state) => state.aiPanel);
  const deviation = useSelector((state) => state.deviation);
  const [pasteText, setPasteText] = useState('');
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiPanel.messages]);

  // Simulate progress animation
  const simulateProgress = useCallback((dispatch) => {
    const steps = [
      { progress: 15, status: 'Uploading document...', delay: 200 },
      { progress: 35, status: 'Parsing document content...', delay: 500 },
      { progress: 60, status: 'Extracting key GMP parameters...', delay: 900 },
      { progress: 85, status: 'Generating impact & severity assessment...', delay: 1400 },
    ];
    steps.forEach(({ progress, status, delay }) => {
      setTimeout(() => {
        dispatch(setExtractionProgress({ progress, status }));
      }, delay);
    });
  }, []);

  // Handle AI extraction result
  const handleExtractionResult = useCallback(
    (result) => {
      dispatch(setExtractionProgress({ progress: 100, status: 'Extraction complete!' }));
      dispatch(
        populateFromAI({
          extracted_data: result.extracted_data,
          recommendation: result.recommendation,
        })
      );
      dispatch(
        addMessage({
          role: 'assistant',
          content: result.ai_message || '✅ Extraction complete. Please review the form.',
        })
      );
      setTimeout(() => {
        dispatch(setExtracting(false));
      }, 500);
    },
    [dispatch]
  );

  // Handle file upload via dropzone
  const onDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const err = rejectedFiles[0].errors[0];
        let msg = 'File rejected.';
        if (err.code === 'file-too-large') msg = 'File too large. Maximum size is 10MB.';
        else if (err.code === 'file-invalid-type')
          msg = 'Unsupported file type. Use PDF, DOCX, TXT, XLSX, JPG, or PNG.';
        dispatch(setUploadError(msg));
        dispatch(addMessage({ role: 'assistant', content: `❌ ${msg}` }));
        return;
      }
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      dispatch(setExtracting(true));
      dispatch(setUploadedFileName(file.name));
      dispatch(updateField({ field: 'source_document_name', value: file.name }));
      dispatch(
        addMessage({
          role: 'user',
          content: `📄 Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        })
      );
      dispatch(
        addMessage({
          role: 'assistant',
          content: '🔄 Analyzing document content and extracting key details...',
        })
      );

      simulateProgress(dispatch);

      try {
        const result = await extractFromFile(file);
        handleExtractionResult(result);
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Extraction failed.';
        dispatch(setUploadError(msg));
        dispatch(setExtracting(false));
        dispatch(addMessage({ role: 'assistant', content: `❌ Error: ${msg}` }));
      }
    },
    [dispatch, simulateProgress, handleExtractionResult]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: aiPanel.isExtracting,
  });

  // Handle text extraction
  const executeTextExtraction = async (textToExtract, label = 'Pasted text') => {
    if (!textToExtract.trim()) return;

    dispatch(setExtracting(true));
    dispatch(updateField({ field: 'source_text', value: textToExtract }));
    dispatch(
      addMessage({
        role: 'user',
        content: `📝 ${label} (${textToExtract.length} chars):\n"${textToExtract.substring(0, 140)}${textToExtract.length > 140 ? '...' : ''}"`,
      })
    );
    dispatch(
      addMessage({
        role: 'assistant',
        content: '🔄 Analyzing text content and extracting key parameters...',
      })
    );

    simulateProgress(dispatch);

    try {
      const result = await extractFromText(textToExtract);
      handleExtractionResult(result);
      setPasteText('');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Extraction failed.';
      dispatch(setUploadError(msg));
      dispatch(setExtracting(false));
      dispatch(addMessage({ role: 'assistant', content: `❌ Error: ${msg}` }));
    }
  };

  const handlePasteExtract = () => {
    executeTextExtraction(pasteText, 'Pasted text');
  };

  const handleLoadSample = (sample) => {
    setPasteText(sample.text);
    executeTextExtraction(sample.text, `Loaded Sample: ${sample.title}`);
  };

  // Handle chat
  const handleChat = async () => {
    if (!chatInput.trim() || aiPanel.isChatLoading) return;
    const msg = chatInput;
    setChatInput('');
    dispatch(addMessage({ role: 'user', content: msg }));
    dispatch(setChatLoading(true));

    try {
      const ctx = deviation.title
        ? JSON.stringify({
            title: deviation.title,
            impact: deviation.initial_impact,
            severity: deviation.initial_severity,
            description: deviation.detailed_description?.substring(0, 500),
          })
        : null;
      const result = await chatWithAI(msg, ctx);
      dispatch(addMessage({ role: 'assistant', content: result.response }));
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Chat failed.';
      dispatch(addMessage({ role: 'assistant', content: `❌ ${errMsg}` }));
    } finally {
      dispatch(setChatLoading(false));
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <div className="ai-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-header-left">
          <FiCpu size={18} className="ai-icon" />
          <h2>AI Deviation Assistant</h2>
          <span className="beta-badge">ACTIVE</span>
        </div>
      </div>

      <div className="ai-panel-content">
        {/* Upload Zone */}
        <div className="upload-section">
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'dropzone--active' : ''} ${aiPanel.isExtracting ? 'dropzone--disabled' : ''}`}
          >
            <input {...getInputProps()} />
            {aiPanel.uploadedFileName && !aiPanel.isExtracting ? (
              <div className="dropzone-uploaded">
                <FiFile size={20} />
                <span>{aiPanel.uploadedFileName}</span>
                <FiCheckCircle size={16} className="text-success" />
              </div>
            ) : (
              <>
                <FiUploadCloud size={32} className="dropzone-icon" />
                <p className="dropzone-text">
                  {isDragActive
                    ? 'Drop your file here...'
                    : 'Drag & drop a deviation document here'}
                </p>
                <p className="dropzone-subtext">
                  PDF, DOCX, TXT, XLSX, JPG, PNG — Max 10MB
                </p>
              </>
            )}
          </div>

          <div className="or-divider">
            <span>OR</span>
          </div>

          {/* Quick Demo Sample Chips */}
          <div className="sample-reports-bar">
            <span className="sample-label">
              <FiZap size={13} className="text-accent" /> One-Click Test Samples:
            </span>
            <div className="sample-chips">
              {SAMPLE_REPORTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className="sample-chip-btn"
                  disabled={aiPanel.isExtracting}
                  onClick={() => handleLoadSample(sample)}
                  title={`Extract: ${sample.title}`}
                >
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paste Text Area */}
          <div className="paste-section">
            <textarea
              className="paste-textarea"
              placeholder="Paste deviation details, notes, or email content here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={3}
              disabled={aiPanel.isExtracting}
            />
            <button
              className="btn btn--extract"
              onClick={handlePasteExtract}
              disabled={!pasteText.trim() || aiPanel.isExtracting}
            >
              <FiCpu size={14} />
              Extract with AI
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {aiPanel.isExtracting && (
          <div className="extraction-progress">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${aiPanel.extractionProgress}%` }}
              />
            </div>
            <p className="progress-status">
              <span className="progress-spinner"></span>
              {aiPanel.extractionStatus}
            </p>
          </div>
        )}

        {/* Error Display */}
        {aiPanel.uploadError && (
          <div className="upload-error">
            <FiXCircle size={14} />
            <span>{aiPanel.uploadError}</span>
            <button onClick={() => dispatch(setUploadError(null))}>
              <FiX size={14} />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-messages">
          {aiPanel.messages.map((msg) => (
            <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'assistant' ? <FiCpu size={14} /> : <FiFileText size={14} />}
              </div>
              <div className="chat-msg-content">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {aiPanel.isChatLoading && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg-avatar">
                <FiCpu size={14} />
              </div>
              <div className="chat-msg-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about CAPA, root cause, impact, 21 CFR 211..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            disabled={aiPanel.isChatLoading}
          />
          <button
            className="chat-send-btn"
            onClick={handleChat}
            disabled={!chatInput.trim() || aiPanel.isChatLoading}
          >
            <FiSend size={16} />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="ai-disclaimer">
          <FiAlertTriangle size={11} />
          Complies with FDA 21 CFR 211 & ICH Q7 guidance. Verify extracted data prior to QA sign-off.
        </p>
      </div>
    </div>
  );
}

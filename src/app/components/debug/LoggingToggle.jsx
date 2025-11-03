"use client";
import React, { useState, useEffect } from 'react';
import { Bug, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import logger from '../../utils/logger';

const LoggingToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    setIsLoggingEnabled(logger.getLoggingState());
    setLogCount(logger.getLogs().length);
  }, []);

  const toggleLogging = () => {
    const newState = logger.toggleLogging();
    setIsLoggingEnabled(newState);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogCount(0);
  };

  const exportLogs = () => {
    logger.exportLogs();
  };

  const getRecentLogs = () => {
    return logger.getLogs().slice(-10);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-all ${
          isLoggingEnabled 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-500 hover:bg-gray-600 text-white'
        }`}
        title={isLoggingEnabled ? 'Logging Enabled' : 'Logging Disabled'}
      >
        <Bug size={20} />
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Debug Panel</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Logging Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Enable Logging</span>
              <button
                onClick={toggleLogging}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isLoggingEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isLoggingEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Log Stats */}
            <div className="text-sm text-gray-600">
              <p>Total Logs: {logCount}</p>
              <p>Status: {isLoggingEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>

            {/* Recent Logs Preview */}
            {isLoggingEnabled && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Logs</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {getRecentLogs().map((log) => (
                    <div key={log.id} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                          log.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-gray-500">{log.category}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{log.message}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={exportLogs}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
              >
                <Download size={14} />
                Export
              </button>
              <button
                onClick={clearLogs}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggingToggle;









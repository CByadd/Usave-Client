"use client";

class Logger {
  constructor() {
    this.isEnabled = typeof window !== 'undefined' && localStorage.getItem('debugLogging') === 'true';
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  // Toggle logging on/off
  toggleLogging() {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('debugLogging', this.isEnabled.toString());
    }
    this.log('SYSTEM', 'Logging toggled', { enabled: this.isEnabled });
    return this.isEnabled;
  }

  // Set logging state
  setLogging(enabled) {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('debugLogging', enabled.toString());
    }
    this.log('SYSTEM', 'Logging state changed', { enabled: this.isEnabled });
  }

  // Get current logging state
  getLoggingState() {
    return this.isEnabled;
  }

  // Add log entry
  addLog(level, category, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('appLogs', JSON.stringify(this.logs.slice(-100))); // Keep last 100 in localStorage
      } catch (e) {
        console.warn('Failed to store logs in localStorage:', e);
      }
    }
  }

  // Log methods
  log(category, message, data = null) {
    if (!this.isEnabled) return;
    
    this.addLog('INFO', category, message, data);
    console.log(`[${category}] ${message}`, data || '');
  }

  error(category, message, data = null) {
    this.addLog('ERROR', category, message, data);
    console.error(`[${category}] ${message}`, data || '');
  }

  warn(category, message, data = null) {
    this.addLog('WARN', category, message, data);
    console.warn(`[${category}] ${message}`, data || '');
  }

  debug(category, message, data = null) {
    this.addLog('DEBUG', category, message, data);
    console.debug(`[${category}] ${message}`, data || '');
  }

  // API logging
  apiRequest(method, url, data = null) {
    this.log('API', `${method} ${url}`, { method, url, data });
  }

  apiResponse(method, url, status, data = null) {
    const level = status >= 400 ? 'error' : 'info';
    this[level]('API', `${method} ${url} - ${status}`, { method, url, status, data });
  }

  // Auth logging
  authLogin(email, success) {
    this.log('AUTH', `Login attempt: ${email}`, { email, success });
  }

  authRegister(email, success) {
    this.log('AUTH', `Registration attempt: ${email}`, { email, success });
  }

  authLogout() {
    this.log('AUTH', 'User logged out');
  }

  // Cart logging
  cartAdd(productId, quantity) {
    this.log('CART', `Added to cart: ${productId}`, { productId, quantity });
  }

  cartRemove(productId) {
    this.log('CART', `Removed from cart: ${productId}`, { productId });
  }

  cartUpdate(productId, quantity) {
    this.log('CART', `Updated cart: ${productId}`, { productId, quantity });
  }

  // Search logging
  searchQuery(query, results) {
    this.log('SEARCH', `Search: "${query}"`, { query, resultCount: results?.length || 0 });
  }

  // Navigation logging
  navigation(from, to) {
    this.log('NAV', `Navigation: ${from} → ${to}`, { from, to });
  }

  // Get logs
  getLogs(level = null, category = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    return filteredLogs.slice(-limit);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('appLogs');
    }
    this.log('SYSTEM', 'Logs cleared');
  }

  // Export logs
  exportLogs() {
    const logs = this.getLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;






































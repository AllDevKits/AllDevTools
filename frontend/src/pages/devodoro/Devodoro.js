import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiSettings, FiCoffee, FiZap, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import './Devodoro.css';

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true
};

function Devodoro() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = {
      play: () => {
        if (!settings.soundEnabled) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.stop(ctx.currentTime + 0.5);
      }
    };
  }, [settings.soundEnabled]);

  // Get duration based on mode
  const getDuration = useCallback((timerMode) => {
    switch (timerMode) {
      case TIMER_MODES.SHORT_BREAK: return settings.shortBreakDuration * 60;
      case TIMER_MODES.LONG_BREAK: return settings.longBreakDuration * 60;
      default: return settings.focusDuration * 60;
    }
  }, [settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Track focus time
  useEffect(() => {
    if (isRunning && mode === TIMER_MODES.FOCUS) {
      const trackingInterval = setInterval(() => {
        setTotalFocusTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(trackingInterval);
    }
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    audioRef.current?.play();
    setIsRunning(false);

    if (mode === TIMER_MODES.FOCUS) {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      // Determine next break type
      if (newSessions % settings.sessionsBeforeLongBreak === 0) {
        setMode(TIMER_MODES.LONG_BREAK);
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setMode(TIMER_MODES.SHORT_BREAK);
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      setMode(TIMER_MODES.FOCUS);
      setTimeLeft(settings.focusDuration * 60);
      
      if (settings.autoStartFocus) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgress = () => {
    const total = getDuration(mode);
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case TIMER_MODES.SHORT_BREAK: return '#10b981';
      case TIMER_MODES.LONG_BREAK: return '#06b6d4';
      default: return '#6366f1';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case TIMER_MODES.SHORT_BREAK: return 'Short Break';
      case TIMER_MODES.LONG_BREAK: return 'Long Break';
      default: return 'Focus Time';
    }
  };

  // Update settings
  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Update current timer if not running
    if (!isRunning) {
      if (key === 'focusDuration' && mode === TIMER_MODES.FOCUS) {
        setTimeLeft(value * 60);
      } else if (key === 'shortBreakDuration' && mode === TIMER_MODES.SHORT_BREAK) {
        setTimeLeft(value * 60);
      } else if (key === 'longBreakDuration' && mode === TIMER_MODES.LONG_BREAK) {
        setTimeLeft(value * 60);
      }
    }
  };

  return (
    <div className={`devodoro ${isFullscreen ? 'fullscreen' : ''}`} style={{ '--mode-color': getModeColor() }}>
      <div className="devodoro-container">
        {/* Header */}
        <div className="devodoro-header">
          <div className="header-left">
            <FiZap className="header-icon" />
            <h1>Devodoro</h1>
          </div>
          <div className="header-actions">
            <button 
              className={`icon-btn ${settings.soundEnabled ? 'active' : ''}`}
              onClick={() => updateSettings('soundEnabled', !settings.soundEnabled)}
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
            </button>
            <button 
              className="icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
            <button 
              className={`icon-btn ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <FiSettings />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button 
            className={`mode-tab ${mode === TIMER_MODES.FOCUS ? 'active' : ''}`}
            onClick={() => switchMode(TIMER_MODES.FOCUS)}
          >
            <FiZap /> Focus
          </button>
          <button 
            className={`mode-tab ${mode === TIMER_MODES.SHORT_BREAK ? 'active' : ''}`}
            onClick={() => switchMode(TIMER_MODES.SHORT_BREAK)}
          >
            <FiCoffee /> Short Break
          </button>
          <button 
            className={`mode-tab ${mode === TIMER_MODES.LONG_BREAK ? 'active' : ''}`}
            onClick={() => switchMode(TIMER_MODES.LONG_BREAK)}
          >
            <FiCoffee /> Long Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="timer-container">
          <div className="timer-ring">
            <svg viewBox="0 0 200 200">
              <circle
                className="timer-ring-bg"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                strokeWidth="8"
              />
              <circle
                className="timer-ring-progress"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgress() / 100)}`}
                style={{ stroke: getModeColor() }}
              />
            </svg>
            <div className="timer-content">
              <span className="timer-mode-label">{getModeLabel()}</span>
              <span className="timer-display">{formatTime(timeLeft)}</span>
              <span className="timer-session">Session {sessionsCompleted + 1}</span>
            </div>
          </div>
        </div>

        {/* Task Input */}
        <div className="task-input-container">
          <input
            type="text"
            className="task-input"
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            placeholder="What are you working on?"
          />
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button className="control-btn secondary" onClick={resetTimer}>
            <FiRotateCcw />
          </button>
          <button className="control-btn primary" onClick={toggleTimer}>
            {isRunning ? <FiPause /> : <FiPlay />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{sessionsCompleted}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{formatTotalTime(totalFocusTime)}</span>
            <span className="stat-label">Focus Time</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{settings.sessionsBeforeLongBreak - (sessionsCompleted % settings.sessionsBeforeLongBreak)}</span>
            <span className="stat-label">Until Long Break</span>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-panel">
            <h3>Timer Settings</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Focus Duration</label>
                <div className="setting-control">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.focusDuration}
                    onChange={(e) => updateSettings('focusDuration', parseInt(e.target.value) || 25)}
                  />
                  <span>min</span>
                </div>
              </div>
              <div className="setting-item">
                <label>Short Break</label>
                <div className="setting-control">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => updateSettings('shortBreakDuration', parseInt(e.target.value) || 5)}
                  />
                  <span>min</span>
                </div>
              </div>
              <div className="setting-item">
                <label>Long Break</label>
                <div className="setting-control">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => updateSettings('longBreakDuration', parseInt(e.target.value) || 15)}
                  />
                  <span>min</span>
                </div>
              </div>
              <div className="setting-item">
                <label>Sessions before long break</label>
                <div className="setting-control">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) => updateSettings('sessionsBeforeLongBreak', parseInt(e.target.value) || 4)}
                  />
                </div>
              </div>
              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => updateSettings('autoStartBreaks', e.target.checked)}
                  />
                  Auto-start breaks
                </label>
              </div>
              <div className="setting-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoStartFocus}
                    onChange={(e) => updateSettings('autoStartFocus', e.target.checked)}
                  />
                  Auto-start focus after break
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Devodoro;

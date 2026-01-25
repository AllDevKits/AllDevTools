import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiRotateCcw, FiVolume2, FiVolumeX, FiInfo } from 'react-icons/fi';
import './BreathingReset.css';

const BREATHING_PATTERNS = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for calm and focus. Equal parts inhale, hold, exhale, hold.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    color: '#6366f1',
    icon: '📦'
  },
  {
    id: '478',
    name: '4-7-8 Relaxation',
    description: 'Dr. Andrew Weil\'s technique for deep relaxation and sleep preparation.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    color: '#8b5cf6',
    icon: '😴'
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    description: 'Simple technique to quickly reduce stress and anxiety.',
    inhale: 4,
    holdIn: 2,
    exhale: 6,
    holdOut: 0,
    color: '#10b981',
    icon: '🌊'
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Quick breathing to increase alertness and energy.',
    inhale: 2,
    holdIn: 0,
    exhale: 2,
    holdOut: 0,
    color: '#f59e0b',
    icon: '⚡'
  },
  {
    id: 'focus',
    name: 'Focus Breath',
    description: 'Balanced breathing to enhance concentration and mental clarity.',
    inhale: 5,
    holdIn: 2,
    exhale: 5,
    holdOut: 2,
    color: '#06b6d4',
    icon: '🎯'
  }
];

const PHASES = {
  INHALE: 'inhale',
  HOLD_IN: 'holdIn',
  EXHALE: 'exhale',
  HOLD_OUT: 'holdOut'
};

const SESSION_DURATION = 60; // 60 seconds per session

function BreathingReset() {
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(PHASES.INHALE);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(selectedPattern.inhale);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [confetti, setConfetti] = useState([]);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((totalTime / SESSION_DURATION) * 100), 100);

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces = [];
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];
    const shapes = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎀', '🏆'];
    
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: 0.8 + Math.random() * 1.2
      });
    }
    return pieces;
  };

  // Initialize audio
  useEffect(() => {
    audioRef.current = {
      playTransition: () => {
        if (!soundEnabled) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 432;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.15;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.stop(ctx.currentTime + 0.2);
      },
      playComplete: () => {
        if (!soundEnabled) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play celebratory sound sequence
        [523, 659, 784, 1047].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.value = 0.2;
          osc.start(ctx.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
          osc.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
      }
    };
  }, [soundEnabled]);

  // Get next phase
  const getNextPhase = (current) => {
    const pattern = selectedPattern;
    switch (current) {
      case PHASES.INHALE:
        return pattern.holdIn > 0 ? PHASES.HOLD_IN : PHASES.EXHALE;
      case PHASES.HOLD_IN:
        return PHASES.EXHALE;
      case PHASES.EXHALE:
        return pattern.holdOut > 0 ? PHASES.HOLD_OUT : PHASES.INHALE;
      case PHASES.HOLD_OUT:
        return PHASES.INHALE;
      default:
        return PHASES.INHALE;
    }
  };

  // Get duration for phase
  const getPhaseDuration = (phase) => {
    switch (phase) {
      case PHASES.INHALE: return selectedPattern.inhale;
      case PHASES.HOLD_IN: return selectedPattern.holdIn;
      case PHASES.EXHALE: return selectedPattern.exhale;
      case PHASES.HOLD_OUT: return selectedPattern.holdOut;
      default: return selectedPattern.inhale;
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && !sessionComplete) {
      intervalRef.current = setInterval(() => {
        // Check if session is complete
        setTotalTime(prev => {
          if (prev >= SESSION_DURATION - 1) {
            // Session complete!
            setIsRunning(false);
            setSessionComplete(true);
            setConfetti(generateConfetti());
            audioRef.current?.playComplete();
            return SESSION_DURATION;
          }
          return prev + 1;
        });

        setPhaseTimeLeft(prev => {
          if (prev <= 1) {
            const nextPhase = getNextPhase(currentPhase);
            
            // Count cycle when returning to inhale
            if (nextPhase === PHASES.INHALE && currentPhase !== PHASES.INHALE) {
              setCyclesCompleted(c => c + 1);
            }
            
            audioRef.current?.playTransition();
            setCurrentPhase(nextPhase);
            return getPhaseDuration(nextPhase);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, currentPhase, selectedPattern, sessionComplete]);

  const toggleTimer = () => {
    if (sessionComplete) {
      resetSession();
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetSession = () => {
    setIsRunning(false);
    setCurrentPhase(PHASES.INHALE);
    setPhaseTimeLeft(selectedPattern.inhale);
    setCyclesCompleted(0);
    setTotalTime(0);
    setSessionComplete(false);
    setConfetti([]);
  };

  const selectPattern = (pattern) => {
    setSelectedPattern(pattern);
    resetSession();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case PHASES.INHALE: return 'Breathe In';
      case PHASES.HOLD_IN: return 'Hold';
      case PHASES.EXHALE: return 'Breathe Out';
      case PHASES.HOLD_OUT: return 'Hold';
      default: return 'Breathe In';
    }
  };

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case PHASES.INHALE: return 'Fill your lungs slowly through your nose';
      case PHASES.HOLD_IN: return 'Hold your breath gently';
      case PHASES.EXHALE: return 'Release slowly through your mouth';
      case PHASES.HOLD_OUT: return 'Rest with empty lungs';
      default: return '';
    }
  };

  // Calculate animation scale based on phase
  const getBreathScale = () => {
    if (!isRunning) return 1;
    
    const duration = getPhaseDuration(currentPhase);
    const progress = (duration - phaseTimeLeft) / duration;
    
    switch (currentPhase) {
      case PHASES.INHALE:
        return 1 + (0.5 * progress);
      case PHASES.HOLD_IN:
        return 1.5;
      case PHASES.EXHALE:
        return 1.5 - (0.5 * progress);
      case PHASES.HOLD_OUT:
        return 1;
      default:
        return 1;
    }
  };

  const getCycleTime = () => {
    return selectedPattern.inhale + selectedPattern.holdIn + 
           selectedPattern.exhale + selectedPattern.holdOut;
  };

  const getRemainingTime = () => {
    return SESSION_DURATION - totalTime;
  };

  return (
    <div className="breathing-reset" style={{ '--pattern-color': selectedPattern.color }}>
      {/* Confetti Animation */}
      {sessionComplete && confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map(piece => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                fontSize: `${piece.size}rem`,
                color: piece.color
              }}
            >
              {piece.shape}
            </div>
          ))}
        </div>
      )}

      <div className="breathing-container">
        {/* Header */}
        <div className="breathing-header">
          <div className="header-left">
            <span className="header-icon">🌬️</span>
            <h1>Breathing Reset</h1>
          </div>
          <div className="header-actions">
            <button 
              className={`icon-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
            </button>
            <button 
              className={`icon-btn ${showInfo ? 'active' : ''}`}
              onClick={() => setShowInfo(!showInfo)}
              title="Info"
            >
              <FiInfo />
            </button>
          </div>
        </div>

        {/* Pattern Selector */}
        <div className="pattern-selector">
          {BREATHING_PATTERNS.map(pattern => (
            <button
              key={pattern.id}
              className={`pattern-btn ${selectedPattern.id === pattern.id ? 'active' : ''}`}
              onClick={() => selectPattern(pattern)}
              style={{ '--btn-color': pattern.color }}
            >
              <span className="pattern-icon">{pattern.icon}</span>
              <span className="pattern-name">{pattern.name}</span>
            </button>
          ))}
        </div>

        {/* Pattern Info */}
        {showInfo && (
          <div className="pattern-info">
            <h3>{selectedPattern.name}</h3>
            <p>{selectedPattern.description}</p>
            <div className="pattern-timing">
              <span>Inhale: {selectedPattern.inhale}s</span>
              {selectedPattern.holdIn > 0 && <span>Hold: {selectedPattern.holdIn}s</span>}
              <span>Exhale: {selectedPattern.exhale}s</span>
              {selectedPattern.holdOut > 0 && <span>Hold: {selectedPattern.holdOut}s</span>}
            </div>
            <p className="cycle-info">One cycle: {getCycleTime()} seconds • Session: 60 seconds</p>
          </div>
        )}

        {/* Session Complete Celebration */}
        {sessionComplete ? (
          <div className="session-complete-card">
            <div className="celebration-icon">🎉</div>
            <h2>Amazing Job!</h2>
            <p className="complete-subtitle">You completed your breathing session!</p>
            
            <div className="completion-stats">
              <div className="completion-stat">
                <span className="stat-number">{cyclesCompleted}</span>
                <span className="stat-text">Cycles</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">60s</span>
                <span className="stat-text">Duration</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">100%</span>
                <span className="stat-text">Complete</span>
              </div>
            </div>

            <p className="encouragement">You're making great progress! 💪</p>
            
            <button className="btn-restart" onClick={resetSession}>
              <FiRotateCcw /> Start Another Session
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Session Progress</span>
                <span className="progress-percentage">{progressPercentage}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="progress-time">
                <span>{formatTime(totalTime)} elapsed</span>
                <span>{formatTime(getRemainingTime())} remaining</span>
              </div>
            </div>

            {/* Breathing Circle */}
            <div className="breathing-visual">
              <div 
                className={`breath-circle ${isRunning ? 'active' : ''}`}
                style={{ transform: `scale(${getBreathScale()})` }}
              >
                <div className="inner-circle">
                  <span className="phase-label">{getPhaseLabel()}</span>
                  <span className="phase-timer">{phaseTimeLeft}</span>
                </div>
              </div>
              <p className="phase-instruction">{getPhaseInstruction()}</p>
            </div>

            {/* Controls */}
            <div className="breathing-controls">
              <button className="control-btn" onClick={resetSession} title="Reset">
                <FiRotateCcw />
              </button>
              <button className="control-btn primary" onClick={toggleTimer}>
                {isRunning ? <FiPause /> : <FiPlay />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>
            </div>

            {/* Stats */}
            <div className="breathing-stats">
              <div className="stat-item">
                <span className="stat-value">{cyclesCompleted}</span>
                <span className="stat-label">Cycles</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">{progressPercentage}%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
          </>
        )}

        {/* Benefits */}
        <div className="benefits-section">
          <h3>Benefits of Breathing Exercises</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">😌</span>
              <span>Reduces stress & anxiety</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🧠</span>
              <span>Improves focus & clarity</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">❤️</span>
              <span>Lowers blood pressure</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💤</span>
              <span>Better sleep quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreathingReset;

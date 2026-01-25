import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSkipForward, FiRotateCcw, FiCheck, FiClock, FiActivity } from 'react-icons/fi';
import './StretchBreaks.css';

const STRETCHES = [
  {
    id: 1,
    name: 'Neck Roll',
    duration: 30,
    description: 'Slowly roll your head in a circle, first clockwise, then counter-clockwise.',
    instructions: [
      'Drop your chin to your chest',
      'Slowly roll your head to the right',
      'Continue rolling back and to the left',
      'Complete the circle and repeat in opposite direction'
    ],
    icon: '🧘'
  },
  {
    id: 2,
    name: 'Shoulder Shrugs',
    duration: 20,
    description: 'Raise your shoulders up to your ears, hold, then release.',
    instructions: [
      'Sit or stand with arms relaxed at sides',
      'Raise both shoulders up towards your ears',
      'Hold for 2-3 seconds',
      'Release and let shoulders drop naturally'
    ],
    icon: '💪'
  },
  {
    id: 3,
    name: 'Wrist Circles',
    duration: 25,
    description: 'Rotate your wrists in circles to relieve tension from typing.',
    instructions: [
      'Extend your arms in front of you',
      'Make fists with both hands',
      'Rotate wrists clockwise 10 times',
      'Rotate wrists counter-clockwise 10 times'
    ],
    icon: '✋'
  },
  {
    id: 4,
    name: 'Seated Spinal Twist',
    duration: 40,
    description: 'Twist your torso to stretch your back and improve spinal mobility.',
    instructions: [
      'Sit up straight in your chair',
      'Place right hand on left knee',
      'Twist torso to the left, looking over left shoulder',
      'Hold for 15-20 seconds, then switch sides'
    ],
    icon: '🔄'
  },
  {
    id: 5,
    name: 'Eye Rest (20-20-20)',
    duration: 20,
    description: 'Look at something 20 feet away for 20 seconds to reduce eye strain.',
    instructions: [
      'Look away from your screen',
      'Focus on an object about 20 feet away',
      'Keep focusing for 20 seconds',
      'Blink several times to moisten your eyes'
    ],
    icon: '👁️'
  },
  {
    id: 6,
    name: 'Standing Back Stretch',
    duration: 30,
    description: 'Stand and stretch your back to counter sitting posture.',
    instructions: [
      'Stand up from your chair',
      'Place hands on lower back',
      'Gently arch backwards',
      'Hold for 10 seconds, return to neutral'
    ],
    icon: '🧍'
  },
  {
    id: 7,
    name: 'Chest Opener',
    duration: 25,
    description: 'Open your chest to counter hunched posture from desk work.',
    instructions: [
      'Clasp hands behind your back',
      'Straighten arms and lift slightly',
      'Open chest and squeeze shoulder blades',
      'Hold for 15-20 seconds'
    ],
    icon: '🤗'
  },
  {
    id: 8,
    name: 'Finger Stretches',
    duration: 20,
    description: 'Stretch and flex your fingers to prevent repetitive strain.',
    instructions: [
      'Spread fingers wide apart',
      'Hold for 5 seconds',
      'Make a tight fist',
      'Repeat 5 times'
    ],
    icon: '🖐️'
  }
];

// Calculate total session duration
const TOTAL_DURATION = STRETCHES.reduce((sum, s) => sum + s.duration, 0);

function StretchBreaks() {
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STRETCHES[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedStretches, setCompletedStretches] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [confetti, setConfetti] = useState([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const currentStretch = STRETCHES[currentStretchIndex];

  // Calculate overall progress percentage
  const progressPercentage = Math.round((completedStretches.length / STRETCHES.length) * 100);
  
  // Calculate time-based progress
  const completedTime = completedStretches.reduce((sum, id) => {
    const stretch = STRETCHES.find(s => s.id === id);
    return sum + (stretch ? stretch.duration : 0);
  }, 0);
  const timeProgressPercentage = Math.round((completedTime / TOTAL_DURATION) * 100);

  // Generate confetti pieces
  const generateConfetti = () => {
    const pieces = [];
    const colors = ['#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'];
    const shapes = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎀', '🏆', '💪', '🧘', '✅'];
    
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
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.2;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.stop(ctx.currentTime + 0.3);
      },
      playComplete: () => {
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
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleStretchComplete();
    }

    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft]);

  const handleStretchComplete = () => {
    audioRef.current?.playTransition();
    setIsRunning(false);
    
    const newCompleted = [...completedStretches];
    if (!newCompleted.includes(currentStretch.id)) {
      newCompleted.push(currentStretch.id);
      setCompletedStretches(newCompleted);
    }

    // Check if all stretches are done
    if (newCompleted.length >= STRETCHES.length) {
      // All done! Show celebration
      setTimeout(() => {
        setSessionComplete(true);
        setConfetti(generateConfetti());
        audioRef.current?.playComplete();
      }, 500);
    } else {
      // Auto-advance to next stretch
      setTimeout(() => {
        nextStretch();
      }, 1500);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const nextStretch = () => {
    if (currentStretchIndex < STRETCHES.length - 1) {
      const nextIndex = currentStretchIndex + 1;
      setCurrentStretchIndex(nextIndex);
      setTimeLeft(STRETCHES[nextIndex].duration);
      setIsRunning(false);
    }
  };

  const selectStretch = (index) => {
    setCurrentStretchIndex(index);
    setTimeLeft(STRETCHES[index].duration);
    setIsRunning(false);
  };

  const resetSession = () => {
    setCurrentStretchIndex(0);
    setTimeLeft(STRETCHES[0].duration);
    setIsRunning(false);
    setCompletedStretches([]);
    setSessionComplete(false);
    setTotalTimeSpent(0);
    setConfetti([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `${secs}s`;
  };

  const getProgress = () => {
    return ((currentStretch.duration - timeLeft) / currentStretch.duration) * 100;
  };

  return (
    <div className="stretch-breaks">
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

      <div className="stretch-container">
        {/* Header */}
        <div className="stretch-header">
          <div className="header-left">
            <FiActivity className="header-icon" />
            <h1>Stretch Breaks</h1>
          </div>
          <div className="header-stats">
            <span className="stat">
              <FiCheck /> {completedStretches.length}/{STRETCHES.length} done
            </span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="overall-progress">
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
          <div className="progress-details">
            <span>{completedStretches.length} of {STRETCHES.length} stretches completed</span>
            <span>{formatTime(totalTimeSpent)} total time</span>
          </div>
        </div>

        {sessionComplete ? (
          /* Session Complete Screen */
          <div className="session-complete">
            <div className="complete-icon">🎉</div>
            <h2>Amazing Job!</h2>
            <p className="complete-subtitle">You completed all {STRETCHES.length} stretches!</p>
            
            <div className="completion-stats">
              <div className="completion-stat">
                <span className="stat-number">{STRETCHES.length}</span>
                <span className="stat-text">Stretches</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">{formatTime(totalTimeSpent)}</span>
                <span className="stat-text">Duration</span>
              </div>
              <div className="completion-stat">
                <span className="stat-number">100%</span>
                <span className="stat-text">Complete</span>
              </div>
            </div>

            <p className="complete-message">Your body thanks you for taking a break! 💪</p>
            <p className="encouragement">Keep up the great work - you're making progress!</p>
            
            <button className="btn-primary" onClick={resetSession}>
              <FiRotateCcw /> Start New Session
            </button>
          </div>
        ) : (
          <>
            {/* Current Stretch Display */}
            <div className="current-stretch">
              <div className="stretch-icon">{currentStretch.icon}</div>
              <h2 className="stretch-name">{currentStretch.name}</h2>
              <p className="stretch-description">{currentStretch.description}</p>
              
              {/* Timer Ring */}
              <div className="timer-ring">
                <svg viewBox="0 0 120 120">
                  <circle
                    className="ring-bg"
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="6"
                  />
                  <circle
                    className="ring-progress"
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                  />
                </svg>
                <span className="timer-display">{formatTime(timeLeft)}</span>
              </div>

              {/* Instructions */}
              <div className="instructions">
                <h3>How to do it:</h3>
                <ol>
                  {currentStretch.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Controls */}
              <div className="stretch-controls">
                <button className="control-btn" onClick={resetSession} title="Reset">
                  <FiRotateCcw />
                </button>
                <button className="control-btn primary" onClick={toggleTimer}>
                  {isRunning ? <FiPause /> : <FiPlay />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button 
                  className="control-btn" 
                  onClick={nextStretch}
                  disabled={currentStretchIndex >= STRETCHES.length - 1}
                  title="Skip"
                >
                  <FiSkipForward />
                </button>
              </div>
            </div>

            {/* Stretch List */}
            <div className="stretch-list">
              <h3>All Stretches</h3>
              <div className="stretch-grid">
                {STRETCHES.map((stretch, index) => (
                  <button
                    key={stretch.id}
                    className={`stretch-item ${index === currentStretchIndex ? 'active' : ''} ${completedStretches.includes(stretch.id) ? 'completed' : ''}`}
                    onClick={() => selectStretch(index)}
                  >
                    <span className="item-icon">{stretch.icon}</span>
                    <span className="item-name">{stretch.name}</span>
                    <span className="item-duration">
                      <FiClock /> {formatTime(stretch.duration)}
                    </span>
                    {completedStretches.includes(stretch.id) && (
                      <FiCheck className="check-icon" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StretchBreaks;

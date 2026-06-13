import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SessionLogger from './components/SessionLogger.jsx';
import SwingCoach from './components/SwingCoach.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import { History, Activity, Dumbbell } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('sweetswing_sessions');
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }
      
      const storedActive = localStorage.getItem('sweetswing_active_session');
      if (storedActive) {
        setActiveSession(JSON.parse(storedActive));
        setCurrentView('active-session'); // Resume active session
      }
    } catch (e) {
      console.error('Failed to load localStorage data:', e);
    }
  }, []);

  // Sync sessions to localStorage
  const saveSessions = (updatedSessions) => {
    setSessions(updatedSessions);
    localStorage.setItem('sweetswing_sessions', JSON.stringify(updatedSessions));
  };

  // Sync active session to localStorage
  const updateActiveSession = (updatedActive) => {
    setActiveSession(updatedActive);
    if (updatedActive) {
      localStorage.setItem('sweetswing_active_session', JSON.stringify(updatedActive));
    } else {
      localStorage.removeItem('sweetswing_active_session');
    }
  };

  // Start new practice session
  const handleStartSession = () => {
    const newSession = {
      id: Date.now(),
      startTime: new Date().toISOString(),
      shots: [],
      currentClub: '7-Iron'
    };
    updateActiveSession(newSession);
    setCurrentView('active-session');
  };

  // Log a shot in the active session
  const handleLogShot = (shot) => {
    if (!activeSession) return;
    const updatedShots = [...activeSession.shots, { ...shot, id: Date.now() }];
    const updatedActive = {
      ...activeSession,
      shots: updatedShots,
      currentClub: shot.club // Remember last used club
    };
    updateActiveSession(updatedActive);
  };

  // Undo the last logged shot
  const handleUndoShot = () => {
    if (!activeSession || activeSession.shots.length === 0) return;
    const updatedShots = activeSession.shots.slice(0, -1);
    const updatedActive = {
      ...activeSession,
      shots: updatedShots
    };
    updateActiveSession(updatedActive);
  };

  // Complete and save the active session
  const handleFinishSession = (summaryNotes, rating) => {
    if (!activeSession) return;
    const completedSession = {
      id: activeSession.id,
      date: new Date(activeSession.startTime).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      startTime: activeSession.startTime,
      endTime: new Date().toISOString(),
      shots: activeSession.shots,
      notes: summaryNotes,
      rating: rating
    };

    const updatedSessions = [completedSession, ...sessions];
    saveSessions(updatedSessions);
    updateActiveSession(null);
    setCurrentView('dashboard');
  };

  // Discard the active session
  const handleDiscardSession = () => {
    if (window.confirm('Are you sure you want to discard this practice session? Your logged shots will not be saved.')) {
      updateActiveSession(null);
      setCurrentView('dashboard');
    }
  };

  // Delete a past session
  const handleDeleteSession = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session from your history?')) {
      const updated = sessions.filter(s => s.id !== sessionId);
      saveSessions(updated);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header */}
      <header className="header-glass">
        <div className="nav-container">
          <div 
            className="brand cursor-pointer"
            onClick={() => setCurrentView(activeSession ? 'active-session' : 'dashboard')}
          >
            Sweet Swing <span>// Range Assistant</span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className={`btn btn-secondary ${currentView === 'dashboard' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'dashboard' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('dashboard')}
            >
              <Activity size={14} style={{ color: currentView === 'dashboard' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">Dashboard</span>
            </button>

            {activeSession && (
              <button 
                className={`btn btn-secondary ${currentView === 'active-session' ? 'active' : ''}`}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  borderColor: 'var(--color-primary)',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                  animation: 'pulseGlow 2s infinite'
                }}
                onClick={() => setCurrentView('active-session')}
              >
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }}></span>
                <span>Active ({activeSession.shots.length})</span>
              </button>
            )}

            <button 
              className={`btn btn-secondary ${currentView === 'history' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'history' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('history')}
            >
              <History size={14} style={{ color: currentView === 'history' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">History</span>
            </button>

            <button 
              className={`btn btn-secondary ${currentView === 'coach' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'coach' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('coach')}
            >
              <Dumbbell size={14} style={{ color: currentView === 'coach' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">Coach</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main className="main-content">
        {currentView === 'dashboard' && (
          <Dashboard 
            sessions={sessions} 
            onStartSession={handleStartSession} 
            activeSession={activeSession}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'active-session' && activeSession && (
          <SessionLogger 
            activeSession={activeSession}
            onLogShot={handleLogShot}
            onUndoShot={handleUndoShot}
            onFinishSession={handleFinishSession}
            onDiscardSession={handleDiscardSession}
          />
        )}

        {currentView === 'history' && (
          <SessionHistory 
            sessions={sessions} 
            onDeleteSession={handleDeleteSession}
            onStartSession={handleStartSession}
          />
        )}

        {currentView === 'coach' && (
          <SwingCoach 
            sessions={sessions}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-slate)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '40px' }}>
        Sweet Swing Golf Tracker &bull; 100% Local Practice Sandboxed Data Privacy
      </footer>
    </div>
  );
}

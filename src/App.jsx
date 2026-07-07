import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard.jsx';
import SessionLogger from './components/SessionLogger.jsx';
import SwingCoach from './components/SwingCoach.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import Profile from './components/Profile.jsx';
import PlayMode from './components/PlayMode.jsx';
import RangeMode from './components/RangeMode.jsx';
import { History, Activity, Dumbbell, User, Trophy, Target } from 'lucide-react';
import { 
  searchLogbookFile, 
  createLogbookFile, 
  fetchSessionsFromSheet, 
  appendSessionToSheet, 
  overwriteSessionsInSheet 
} from './utils/googleSync.js';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  
  // On-Course Rounds States
  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [customCourses, setCustomCourses] = useState([]);

  // Google Sync States
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleAccessToken, setGoogleAccessToken] = useState('');
  const [googleUser, setGoogleUser] = useState(null);
  const [googleSpreadsheetId, setGoogleSpreadsheetId] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [syncMessage, setSyncMessage] = useState('');

  // User Profile States
  const [golferName, setGolferName] = useState('Reva Golfer');
  const [handicap, setHandicap] = useState('28.0');
  const [homeCourse, setHomeCourse] = useState('Local Course');
  const [activeClubs, setActiveClubs] = useState([
    'Driver', '3-Wood', '5-Hybrid', '6-Hybrid', 
    '7-Iron', '8-Iron', '9-Iron', 
    'PW', 'SW', 'Putter'
  ]);
  const [clubDistances, setClubDistances] = useState({
    'Driver': 230, '3-Wood': 210, '5-Wood': 190, '7-Wood': 180,
    '3-Hybrid': 200, '4-Hybrid': 190, '5-Hybrid': 180, '6-Hybrid': 170,
    '4-Iron': 180, '5-Iron': 170, '6-Iron': 160, '7-Iron': 150, '8-Iron': 140, '9-Iron': 130,
    'PW': 115, 'AW': 105, 'GW': 100, 'SW': 90, 'LW': 80, 'Putter': 15
  });

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

      // Load Google details
      const storedClientId = localStorage.getItem('sweetswing_google_client_id');
      if (storedClientId) {
        setGoogleClientId(storedClientId);
      }
      const storedSpreadsheetId = localStorage.getItem('sweetswing_google_spreadsheet_id');
      if (storedSpreadsheetId) {
        setGoogleSpreadsheetId(storedSpreadsheetId);
      }
      const storedUser = localStorage.getItem('sweetswing_google_user');
      if (storedUser) {
        setGoogleUser(JSON.parse(storedUser));
      }

      // Load User Profile details
      const storedName = localStorage.getItem('sweetswing_golfer_name');
      if (storedName) {
        setGolferName(storedName);
      }
      const storedHandicap = localStorage.getItem('sweetswing_handicap');
      if (storedHandicap) {
        setHandicap(storedHandicap);
      }
      const storedCourse = localStorage.getItem('sweetswing_home_course');
      if (storedCourse) {
        setHomeCourse(storedCourse);
      }
      const storedClubs = localStorage.getItem('sweetswing_active_clubs');
      if (storedClubs) {
        try {
          setActiveClubs(JSON.parse(storedClubs));
        } catch (err) {
          console.error('Failed to parse active clubs:', err);
        }
      }
      const storedDistances = localStorage.getItem('sweetswing_club_distances');
      if (storedDistances) {
        try {
          setClubDistances(JSON.parse(storedDistances));
        } catch (err) {
          console.error('Failed to parse club distances:', err);
        }
      }

      // Load On-Course rounds details
      const storedRounds = localStorage.getItem('sweetswing_rounds');
      if (storedRounds) {
        try {
          setRounds(JSON.parse(storedRounds));
        } catch (err) {
          console.error('Failed to parse rounds:', err);
        }
      }

      const storedCustomCourses = localStorage.getItem('sweetswing_custom_courses');
      if (storedCustomCourses) {
        try {
          setCustomCourses(JSON.parse(storedCustomCourses));
        } catch (err) {
          console.error('Failed to parse custom courses:', err);
        }
      }
      const storedActiveRound = localStorage.getItem('sweetswing_active_round');
      if (storedActiveRound) {
        try {
          setActiveRound(JSON.parse(storedActiveRound));
          setCurrentView('play-mode'); // Resume active round
        } catch (err) {
          console.error('Failed to parse active round:', err);
        }
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

  // Sync rounds to localStorage
  const saveRounds = (updatedRounds) => {
    setRounds(updatedRounds);
    localStorage.setItem('sweetswing_rounds', JSON.stringify(updatedRounds));
  };

  // Sync active round to localStorage
  const updateActiveRound = (updatedActive) => {
    setActiveRound(updatedActive);
    if (updatedActive) {
      localStorage.setItem('sweetswing_active_round', JSON.stringify(updatedActive));
    } else {
      localStorage.removeItem('sweetswing_active_round');
    }
  };

  // Play Mode round handlers
  const handleStartRound = (courseName, numHoles, coursePars = null) => {
    const holes = Array.from({ length: numHoles }, (_, i) => {
      const par = (coursePars && coursePars.length > 0) ? coursePars[i % coursePars.length] : 4;
      return {
        holeNum: i + 1,
        par: par,
        score: par,
        putts: 2,
        fairway: 'Hit',
        gir: true
      };
    });
    const newRound = {
      id: Date.now(),
      course: courseName,
      date: new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      numHoles: numHoles,
      holes: holes
    };
    updateActiveRound(newRound);
  };

  const handleLogHole = (holeIdx, updatedHole) => {
    if (!activeRound) return;
    const updatedHoles = [...activeRound.holes];
    updatedHoles[holeIdx] = updatedHole;
    const updatedActive = {
      ...activeRound,
      holes: updatedHoles
    };
    updateActiveRound(updatedActive);
  };

  const handleFinishRound = () => {
    if (!activeRound) return;
    const completedRound = {
      ...activeRound,
      endTime: new Date().toISOString()
    };
    const updatedRounds = [completedRound, ...rounds];
    saveRounds(updatedRounds);
    updateActiveRound(null);
  };

  const handleDiscardRound = () => {
    if (window.confirm('Are you sure you want to discard this round? Your scores will not be saved.')) {
      updateActiveRound(null);
    }
  };

  const handleDeleteRound = (roundId) => {
    if (window.confirm('Are you sure you want to delete this round from history?')) {
      const updated = rounds.filter(r => r.id !== roundId);
      saveRounds(updated);
    }
  };

  const handleSaveCustomCourse = (course) => {
    const updated = [course, ...customCourses.filter(c => c.id !== course.id)];
    setCustomCourses(updated);
    localStorage.setItem('sweetswing_custom_courses', JSON.stringify(updated));
  };

  const handleDeleteCustomCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this custom course template?')) {
      const updated = customCourses.filter(c => c.id !== id);
      setCustomCourses(updated);
      localStorage.setItem('sweetswing_custom_courses', JSON.stringify(updated));
    }
  };

  // Profile update handlers
  const handleSetGolferName = (name) => {
    setGolferName(name);
    localStorage.setItem('sweetswing_golfer_name', name);
  };

  const handleSetHandicap = (hc) => {
    setHandicap(hc);
    localStorage.setItem('sweetswing_handicap', hc);
  };

  const handleSetHomeCourse = (course) => {
    setHomeCourse(course);
    localStorage.setItem('sweetswing_home_course', course);
  };

  const handleSetActiveClubs = (clubs) => {
    setActiveClubs(clubs);
    localStorage.setItem('sweetswing_active_clubs', JSON.stringify(clubs));
  };

  const handleSetClubDistances = (distances) => {
    setClubDistances(distances);
    localStorage.setItem('sweetswing_club_distances', JSON.stringify(distances));
  };

  // Start new practice session
  const handleStartSession = () => {
    const defaultClub = activeClubs.includes('7-Iron') ? '7-Iron' : (activeClubs[0] || 'Driver');
    const newSession = {
      id: Date.now(),
      startTime: new Date().toISOString(),
      shots: [],
      currentClub: defaultClub
    };
    updateActiveSession(newSession);
    setCurrentView('active-session');
  };

  // Log a shot in the active session
  const handleLogShot = (shot) => {
    if (!activeSession) return;
    
    if (shot.changeClubOnly) {
      const updatedActive = {
        ...activeSession,
        currentClub: shot.club
      };
      updateActiveSession(updatedActive);
      return;
    }

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

  // Helper for Google Sheets two-way sync
  const syncWithGoogleSheet = async (token, spreadsheetId, currentSessions = sessions) => {
    setSyncStatus('syncing');
    setSyncMessage('Downloading spreadsheet data...');
    
    // 1. Fetch remote sessions
    const remoteSessions = await fetchSessionsFromSheet(token, spreadsheetId);
    
    // 2. Merge local and remote sessions
    const mergedMap = new Map();
    
    // Add local sessions
    currentSessions.forEach(s => mergedMap.set(s.id, s));
    
    // Add remote sessions, keeping the one with more content on conflict
    remoteSessions.forEach(s => {
      if (!mergedMap.has(s.id)) {
        mergedMap.set(s.id, s);
      } else {
        const existing = mergedMap.get(s.id);
        if (s.shots.length > existing.shots.length || (s.notes && !existing.notes)) {
          mergedMap.set(s.id, s);
        }
      }
    });
    
    const mergedSessions = Array.from(mergedMap.values()).sort((a, b) => b.id - a.id);
    
    // 3. Save to local storage & state
    saveSessions(mergedSessions);
    
    // 4. Overwrite Google Sheets with unified history
    setSyncMessage('Uploading merged data to Google Sheets...');
    await overwriteSessionsInSheet(token, spreadsheetId, mergedSessions);
    
    setSyncStatus('success');
    setSyncMessage('Cloud sync complete!');
    
    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 4000);
  };

  // Connect Google account flow
  const handleConnectGoogle = (clientId) => {
    if (!clientId) return;
    setGoogleClientId(clientId);
    localStorage.setItem('sweetswing_google_client_id', clientId);
    setSyncStatus('syncing');
    setSyncMessage('Connecting to Google...');

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setSyncStatus('error');
            setSyncMessage(`Auth failed: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          const token = tokenResponse.access_token;
          setGoogleAccessToken(token);

          try {
            // Fetch Profile info
            const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            let userProfile = null;
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              userProfile = {
                name: profileData.name,
                email: profileData.email,
                picture: profileData.picture
              };
              setGoogleUser(userProfile);
              localStorage.setItem('sweetswing_google_user', JSON.stringify(userProfile));
            }

            setSyncMessage('Searching Google Drive for logbook...');
            let spreadsheetIdFile = await searchLogbookFile(token);
            let spreadsheetId = '';

            if (!spreadsheetIdFile) {
              setSyncMessage('Creating Sweet Swing Logbook sheet...');
              spreadsheetId = await createLogbookFile(token);
            } else {
              spreadsheetId = spreadsheetIdFile.id;
            }

            setGoogleSpreadsheetId(spreadsheetId);
            localStorage.setItem('sweetswing_google_spreadsheet_id', spreadsheetId);

            // Execute Sync
            await syncWithGoogleSheet(token, spreadsheetId, sessions);

          } catch (err) {
            console.error('Google Setup Error:', err);
            setSyncStatus('error');
            setSyncMessage(err.message || 'Failed to sync with Google Sheets');
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('OAuth Client Error:', err);
      setSyncStatus('error');
      setSyncMessage('Google Script failed to load. Please check internet connection.');
    }
  };

  // Manual trigger button
  const handleManualSync = async () => {
    if (!googleAccessToken) {
      handleConnectGoogle(googleClientId);
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('Syncing with Google Sheets...');
    try {
      await syncWithGoogleSheet(googleAccessToken, googleSpreadsheetId, sessions);
    } catch (err) {
      console.error('Manual sync failed:', err);
      if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized') || err.message.includes('token'))) {
        setGoogleAccessToken('');
        handleConnectGoogle(googleClientId);
      } else {
        setSyncStatus('error');
        setSyncMessage(err.message || 'Sync failed');
      }
    }
  };

  // Disconnect OAuth
  const handleDisconnectGoogle = () => {
    if (window.confirm('Disconnect from Google Drive? Your data remains safe in this browser.')) {
      setGoogleClientId('');
      setGoogleAccessToken('');
      setGoogleUser(null);
      setGoogleSpreadsheetId('');
      setSyncStatus('idle');
      setSyncMessage('');
      localStorage.removeItem('sweetswing_google_client_id');
      localStorage.removeItem('sweetswing_google_spreadsheet_id');
      localStorage.removeItem('sweetswing_google_user');
    }
  };

  // Complete and save the active session
  const handleFinishSession = async (summaryNotes, rating) => {
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

    // Attempt backup append
    if (googleSpreadsheetId) {
      if (googleAccessToken) {
        try {
          setSyncStatus('syncing');
          setSyncMessage('Saving session to Google Sheets...');
          await appendSessionToSheet(googleAccessToken, googleSpreadsheetId, completedSession);
          setSyncStatus('success');
          setSyncMessage('Session saved to Google Sheets!');
          setTimeout(() => {
            setSyncStatus('idle');
            setSyncMessage('');
          }, 3000);
        } catch (err) {
          console.error('Failed to append, trying full sync backup:', err);
          try {
            await overwriteSessionsInSheet(googleAccessToken, googleSpreadsheetId, updatedSessions);
            setSyncStatus('success');
            setSyncMessage('Session saved to Google Sheets!');
            setTimeout(() => {
              setSyncStatus('idle');
              setSyncMessage('');
            }, 3000);
          } catch (e) {
            setSyncStatus('error');
            setSyncMessage('Failed to save to cloud. Click "Sync Now" to retry.');
          }
        }
      } else {
        setSyncStatus('error');
        setSyncMessage('Google session expired. Re-sync on Dashboard to upload.');
      }
    }
  };

  // Discard the active session
  const handleDiscardSession = () => {
    if (window.confirm('Are you sure you want to discard this practice session? Your logged shots will not be saved.')) {
      updateActiveSession(null);
      setCurrentView('dashboard');
    }
  };

  // Delete a past session
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session from your history?')) {
      const updated = sessions.filter(s => s.id !== sessionId);
      saveSessions(updated);

      if (googleSpreadsheetId) {
        if (googleAccessToken) {
          try {
            setSyncStatus('syncing');
            setSyncMessage('Deleting session from Google Sheets...');
            await overwriteSessionsInSheet(googleAccessToken, googleSpreadsheetId, updated);
            setSyncStatus('success');
            setSyncMessage('Session deleted from cloud.');
            setTimeout(() => {
              setSyncStatus('idle');
              setSyncMessage('');
            }, 3000);
          } catch (err) {
            console.error('Delete sync failed:', err);
            setSyncStatus('error');
            setSyncMessage('Failed to delete from cloud. Re-sync to update.');
          }
        } else {
          setSyncStatus('error');
          setSyncMessage('Google session expired. Re-sync to update deletions.');
        }
      }
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
            Sweet Swing <span>// Golf Companion</span>
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
              className={`btn btn-secondary ${currentView === 'range-mode' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'range-mode' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('range-mode')}
            >
              <Target size={14} style={{ color: currentView === 'range-mode' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">Range Mode</span>
            </button>

            <button 
              className={`btn btn-secondary ${currentView === 'play-mode' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'play-mode' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('play-mode')}
            >
              <Trophy size={14} style={{ color: currentView === 'play-mode' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">Play Mode</span>
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

            <button 
              className={`btn btn-secondary ${currentView === 'profile' ? 'active' : ''}`}
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                borderColor: currentView === 'profile' ? 'var(--color-primary)' : 'var(--border-slate)'
              }}
              onClick={() => setCurrentView('profile')}
            >
              <User size={14} style={{ color: currentView === 'profile' ? 'var(--color-primary)' : 'inherit' }} />
              <span className="nav-text">Profile</span>
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
            rounds={rounds}
            activeRound={activeRound}
          />
        )}

        {currentView === 'active-session' && activeSession && (
          <SessionLogger 
            activeSession={activeSession}
            onLogShot={handleLogShot}
            onUndoShot={handleUndoShot}
            onFinishSession={handleFinishSession}
            onDiscardSession={handleDiscardSession}
            activeClubs={activeClubs}
            clubDistances={clubDistances}
          />
        )}

        {currentView === 'play-mode' && (
          <PlayMode 
            rounds={rounds}
            activeRound={activeRound}
            onStartRound={handleStartRound}
            onLogHole={handleLogHole}
            onFinishRound={handleFinishRound}
            onDiscardRound={handleDiscardRound}
            onDeleteRound={handleDeleteRound}
            customCourses={customCourses}
            onSaveCustomCourse={handleSaveCustomCourse}
            onDeleteCustomCourse={handleDeleteCustomCourse}
          />
        )}

        {currentView === 'range-mode' && (
          <RangeMode 
            sessions={sessions}
            activeSession={activeSession}
            onStartSession={handleStartSession}
            onDeleteSession={handleDeleteSession}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'coach' && (
          <SwingCoach 
            sessions={sessions}
          />
        )}

        {currentView === 'profile' && (
          <Profile 
            googleClientId={googleClientId}
            googleAccessToken={googleAccessToken}
            googleUser={googleUser}
            googleSpreadsheetId={googleSpreadsheetId}
            syncStatus={syncStatus}
            syncMessage={syncMessage}
            onConnectGoogle={handleConnectGoogle}
            onManualSync={handleManualSync}
            onDisconnectGoogle={handleDisconnectGoogle}
            golferName={golferName}
            setGolferName={handleSetGolferName}
            handicap={handicap}
            setHandicap={handleSetHandicap}
            homeCourse={homeCourse}
            setHomeCourse={handleSetHomeCourse}
            activeClubs={activeClubs}
            setActiveClubs={handleSetActiveClubs}
            clubDistances={clubDistances}
            setClubDistances={handleSetClubDistances}
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

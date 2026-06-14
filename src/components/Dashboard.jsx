import React from 'react';
import { Play, ShieldAlert, Award, ChevronRight, Activity, Cloud, RefreshCw, HelpCircle } from 'lucide-react';

export default function Dashboard({ 
  sessions, 
  onStartSession, 
  activeSession, 
  onNavigate,
  // Google Sync props
  googleClientId,
  googleAccessToken,
  googleUser,
  googleSpreadsheetId,
  syncStatus,
  syncMessage,
  onConnectGoogle,
  onManualSync,
  onDisconnectGoogle
}) {
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [inputClientId, setInputClientId] = React.useState(googleClientId || '');

  React.useEffect(() => {
    if (googleClientId) {
      setInputClientId(googleClientId);
    }
  }, [googleClientId]);

  // Aggregate statistics
  const totalSessions = sessions.length;
  const allShots = sessions.flatMap(s => s.shots || []);
  const totalShots = allShots.length;
  
  const pureShots = allShots.filter(s => s.contact === 'Pure').length;
  const purePercentage = totalShots > 0 ? Math.round((pureShots / totalShots) * 100) : 0;
  
  // Calculate miss rates
  const fatShots = allShots.filter(s => s.contact === 'Fat').length;
  const thinShots = allShots.filter(s => s.contact === 'Thin').length;
  const toppedShots = allShots.filter(s => s.contact === 'Topped').length;
  const shankShots = allShots.filter(s => s.contact === 'Shank/Miss').length;
  const totalMisses = fatShots + thinShots + toppedShots + shankShots;
  const missPercentage = totalShots > 0 ? Math.round((totalMisses / totalShots) * 100) : 0;

  // Find most used club
  const clubCounts = allShots.reduce((acc, shot) => {
    acc[shot.club] = (acc[shot.club] || 0) + 1;
    return acc;
  }, {});
  
  let topClub = 'None';
  let maxClubShots = 0;
  Object.entries(clubCounts).forEach(([club, count]) => {
    if (count > maxClubShots) {
      maxClubShots = count;
      topClub = club;
    }
  });

  // Calculate flight distribution for the SVG visualizer (excluding shanks/misses)
  const nonShankShots = allShots.filter(s => s.contact !== 'Shank/Miss');
  const totalNonShankShots = nonShankShots.length;

  const flightCounts = nonShankShots.reduce((acc, shot) => {
    acc[shot.flight] = (acc[shot.flight] || 0) + 1;
    return acc;
  }, {});

  const getFlightPercentage = (flightType) => {
    if (totalNonShankShots === 0) return 0;
    return Math.round(((flightCounts[flightType] || 0) / totalNonShankShots) * 100);
  };

  const flights = {
    Straight: getFlightPercentage('Straight'),
    Draw: getFlightPercentage('Draw'),
    Fade: getFlightPercentage('Fade'),
    Hook: getFlightPercentage('Hook'),
    Slice: getFlightPercentage('Slice'),
    Pull: getFlightPercentage('Pull'),
    Push: getFlightPercentage('Push'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Welcome & Quick Action */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Practice Smart, Hit Purer
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '1rem', lineHeight: '1.5' }}>
            Track your swing contact feel and ball flight directions. Sweet Swing will automatically calculate your sweet-spot hit percentage and diagnose swing errors.
          </p>
        </div>
        <div>
          {activeSession ? (
            <button 
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', animation: 'pulseGlow 2s infinite' }}
              onClick={() => onNavigate('active-session')}
            >
              <Activity size={18} />
              Resume Active Session
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
              onClick={onStartSession}
            >
              <Play size={18} fill="currentColor" />
              Start Range Session
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-card-grid">
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Sessions</span>
          <span className="stat-val-huge">{totalSessions}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total driving range visits</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Shots</span>
          <span className="stat-val-huge">{totalShots}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Registered range hits</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Sweet Spot Contact</span>
          <span className="stat-val-huge primary">{purePercentage}%</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Pure hit ratio</span>
          <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1, color: 'var(--color-primary)' }}>
            <Award size={80} />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Primary Club</span>
          <span className="stat-val-huge" style={{ fontSize: '2rem' }}>{topClub}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{maxClubShots > 0 ? `${maxClubShots} shots logged` : 'No shots logged yet'}</span>
        </div>
      </div>

      {/* Main Dashboard Interactive Section */}
      <div className="dashboard-grid">
        
        {/* Left Side: Ball Flight dispersion visualization */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Ball Flight Dispersion Map</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Visual representation of shot paths. Shading thickness corresponds to your landing shape percentage.
            </p>
          </div>

          <div className="dispersion-container">
            
            {/* Custom SVG Ball Flight Visual Target */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <svg width="280" height="280" viewBox="0 0 300 300" style={{ overflow: 'visible' }}>
                {/* Out-of-bounds / grid background */}
                <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
                <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" strokeDasharray="4" />
                <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1" />
                <circle cx="150" cy="150" r="20" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
                
                {/* Horizontal & Vertical Gridlines */}
                <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
                <line x1="150" y1="10" x2="150" y2="290" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />

                {/* Range Markers */}
                <text x="150" y="25" fill="var(--text-muted)" fontSize="8" textAnchor="middle">200m</text>
                <text x="150" y="65" fill="var(--text-muted)" fontSize="8" textAnchor="middle">150m</text>
                <text x="150" y="105" fill="var(--text-muted)" fontSize="8" textAnchor="middle">100m</text>

                {/* Trajectory lines starting from bottom tee (150, 270) */}
                {/* Tee position */}
                <circle cx="150" cy="270" r="4" fill="white" />
                
                {/* Straight Path */}
                <path 
                  d="M150,270 Q150,150 150,50" 
                  fill="none" 
                  stroke={flights.Straight > 0 ? "var(--color-primary)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Straight > 0 ? Math.max(1, flights.Straight * 0.15) : 1}
                  strokeDasharray={flights.Straight === 0 ? "3" : "none"}
                  opacity={flights.Straight > 0 ? Math.max(0.2, flights.Straight / 100) : 0.2}
                />
                
                {/* Draw (Left Curve) */}
                <path 
                  d="M150,270 Q120,160 100,70" 
                  fill="none" 
                  stroke={flights.Draw > 0 ? "var(--color-info)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Draw > 0 ? Math.max(1, flights.Draw * 0.15) : 1}
                  strokeDasharray={flights.Draw === 0 ? "3" : "none"}
                  opacity={flights.Draw > 0 ? Math.max(0.2, flights.Draw / 100) : 0.2}
                />

                {/* Fade (Right Curve) */}
                <path 
                  d="M150,270 Q180,160 200,70" 
                  fill="none" 
                  stroke={flights.Fade > 0 ? "var(--color-info)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Fade > 0 ? Math.max(1, flights.Fade * 0.15) : 1}
                  strokeDasharray={flights.Fade === 0 ? "3" : "none"}
                  opacity={flights.Fade > 0 ? Math.max(0.2, flights.Fade / 100) : 0.2}
                />

                {/* Hook (Sharp Left Curve) */}
                <path 
                  d="M150,270 Q90,180 50,90" 
                  fill="none" 
                  stroke={flights.Hook > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Hook > 0 ? Math.max(1, flights.Hook * 0.15) : 1}
                  strokeDasharray={flights.Hook === 0 ? "3" : "none"}
                  opacity={flights.Hook > 0 ? Math.max(0.2, flights.Hook / 100) : 0.2}
                />

                {/* Slice (Sharp Right Curve) */}
                <path 
                  d="M150,270 Q210,180 250,90" 
                  fill="none" 
                  stroke={flights.Slice > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"} 
                  strokeWidth={flights.Slice > 0 ? Math.max(1, flights.Slice * 0.15) : 1}
                  strokeDasharray={flights.Slice === 0 ? "3" : "none"}
                  opacity={flights.Slice > 0 ? Math.max(0.2, flights.Slice / 100) : 0.2}
                />

                {/* Pull (Straight Left Diagonal) */}
                <line 
                  x1="150" y1="270" x2="70" y2="150" 
                  stroke={flights.Pull > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth={flights.Pull > 0 ? Math.max(1, flights.Pull * 0.15) : 1}
                  strokeDasharray={flights.Pull === 0 ? "3" : "none"}
                  opacity={flights.Pull > 0 ? Math.max(0.2, flights.Pull / 100) : 0.2}
                />

                {/* Push (Straight Right Diagonal) */}
                <line 
                  x1="150" y1="270" x2="230" y2="150" 
                  stroke={flights.Push > 0 ? "var(--color-danger)" : "rgba(255, 255, 255, 0.05)"}
                  strokeWidth={flights.Push > 0 ? Math.max(1, flights.Push * 0.15) : 1}
                  strokeDasharray={flights.Push === 0 ? "3" : "none"}
                  opacity={flights.Push > 0 ? Math.max(0.2, flights.Push / 100) : 0.2}
                />

                {/* Landing indicators / labels */}
                {flights.Straight > 0 && <circle cx="150" cy="50" r="5" fill="var(--color-primary)" filter="drop-shadow(0 0 4px var(--color-primary))" />}
                {flights.Draw > 0 && <circle cx="100" cy="70" r="5" fill="var(--color-info)" filter="drop-shadow(0 0 4px var(--color-info))" />}
                {flights.Fade > 0 && <circle cx="200" cy="70" r="5" fill="var(--color-info)" filter="drop-shadow(0 0 4px var(--color-info))" />}
                {flights.Hook > 0 && <circle cx="50" cy="90" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Slice > 0 && <circle cx="250" cy="90" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Pull > 0 && <circle cx="70" cy="150" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
                {flights.Push > 0 && <circle cx="230" cy="150" r="5" fill="var(--color-danger)" filter="drop-shadow(0 0 4px var(--color-danger))" />}
              </svg>
            </div>

            {/* Dispersion Percentages List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Flight Path</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Frequency</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                  Straight
                </span>
                <span style={{ fontWeight: 600, color: flights.Straight > 25 ? 'var(--color-primary)' : 'var(--text-primary)' }}>{flights.Straight}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-info)' }}></span>
                  Draw / Fade
                </span>
                <span style={{ fontWeight: 600 }}>{flights.Draw + flights.Fade}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)' }}></span>
                  Slice / Hook
                </span>
                <span style={{ fontWeight: 600, color: (flights.Slice + flights.Hook) > 30 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{flights.Slice + flights.Hook}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.6)' }}></span>
                  Pull / Push
                </span>
                <span style={{ fontWeight: 600 }}>{flights.Pull + flights.Push}%</span>
              </div>
              {totalShots === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '10px' }}>
                  No shots logged yet. Start a session to generate flight dispersion.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats summary & Recent Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Diagnostic Coach Recommendation Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-accent-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-accent-gold)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Coach Focus Recommendation</h3>
            </div>
            {totalShots === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                Log your first range session to analyze hit consistency and receive mechanical drills from the Coach!
              </p>
            ) : missPercentage > 40 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Your miss rate is currently <strong>{missPercentage}%</strong>. Let's practice setup posture drills to lock down consistent clean contact.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  View Custom Drills
                </button>
              </div>
            ) : flights.Slice + flights.Hook > 30 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  You have a high tendency of horizontal curves (<strong>{flights.Slice + flights.Hook}%</strong>). Let's review the clubface path alignment tips.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  Analyze Ball Flights
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Great swing work! Your clean contact is at <strong>{purePercentage}%</strong>. Visit the Coach page to refine timing and tempo keys.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => onNavigate('coach')}
                >
                  View Swing Keys
                </button>
              </div>
            )}
          </div>

          {/* Recent Sessions list */}
          <div className="glass-panel" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Recent Range Visits</h3>
            
            {sessions.length === 0 ? (
              <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '20px 0' }}>
                No completed sessions found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.slice(0, 3).map((session) => {
                  const sShots = session.shots || [];
                  const sPure = sShots.filter(s => s.contact === 'Pure').length;
                  const sPercentage = sShots.length > 0 ? Math.round((sPure / sShots.length) * 100) : 0;
                  
                  return (
                    <div 
                      key={session.id}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.date}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sShots.length} shots &bull; {sPercentage}% pure
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Session Stars */}
                        <div style={{ color: 'var(--color-accent-gold)', fontSize: '0.9rem' }}>
                          {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sessions.length > 3 && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.8rem', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
                    onClick={() => onNavigate('history')}
                  >
                    View All Sessions History
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Google Sheets Cloud Sync Panel */}
          {!googleSpreadsheetId ? (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>Google Sheets Cloud Sync</h3>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                  Cloud Backup
                </span>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                Automatically save and sync your sessions to a private Google Sheets file in your Drive. Prevents data loss and lets you access your stats on any device.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="text" 
                  placeholder="Enter Google OAuth Client ID..."
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-slate)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  onClick={() => onConnectGoogle(inputClientId)}
                  disabled={!inputClientId || syncStatus === 'syncing'}
                >
                  {syncStatus === 'syncing' ? 'Connecting...' : 'Connect Google Drive'}
                </button>
              </div>

              {syncMessage && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: syncStatus === 'error' ? 'var(--color-danger)' : 'var(--color-primary)', 
                  background: syncStatus === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  border: syncStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  {syncMessage}
                </div>
              )}

              <div>
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--color-info)', 
                    fontSize: '0.8rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 0',
                    textAlign: 'left'
                  }}
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <HelpCircle size={14} />
                  {showInstructions ? 'Hide setup instructions' : 'How do I get a Google Client ID?'}
                </button>

                {showInstructions && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '12px', 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid rgba(255,255,255,0.02)', 
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    lineHeight: '1.4'
                  }}>
                    <p><strong>1. Go to Google Cloud Console</strong><br/>Create a free project at <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Cloud Console</a>.</p>
                    <p><strong>2. Configure OAuth Consent Screen</strong><br />Set user type to <strong>External</strong>, add app name &amp; email, and publish the app. In scopes, select <strong>{".../auth/drive.file"}</strong> and <strong>{".../auth/userinfo.profile"}</strong>.</p>
                    <p><strong>3. Create Web OAuth Client ID</strong><br/>In <strong>Credentials</strong>, create an <strong>OAuth Client ID</strong> (Web Application). Add Authorized Origin: <code style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{"https://sweet-swing.vercel.app"}</code> (and <code style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{"http://localhost:5174"}</code> for local testing). Copy the Client ID!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cloud size={18} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '1.1rem' }}>Cloud Sync Connected</h3>
                </div>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--color-primary)', 
                  background: 'rgba(16,185,129,0.1)', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  Active 🟢
                </span>
              </div>

              {googleUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  {googleUser.picture ? (
                    <img src={googleUser.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {googleUser.name ? googleUser.name.charAt(0) : 'G'}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{googleUser.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{googleUser.email}</span>
                  </div>
                </div>
              )}

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
                Your data is automatically synced to the sheet **"Sweet Swing Logbook"** in your Google Drive.
              </p>

              {syncMessage && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: syncStatus === 'error' ? 'var(--color-danger)' : 'var(--color-primary)', 
                  background: syncStatus === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                  padding: '8px 12px', 
                  borderRadius: '6px',
                  border: syncStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {syncStatus === 'syncing' && <RefreshCw size={12} className="spin-animation" />}
                  {syncMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flexGrow: 1, padding: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={onManualSync}
                  disabled={syncStatus === 'syncing'}
                >
                  <RefreshCw size={14} className={syncStatus === 'syncing' ? 'spin-animation' : ''} />
                  Sync Now
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                  onClick={onDisconnectGoogle}
                  disabled={syncStatus === 'syncing'}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    );
  }

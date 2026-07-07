import React, { useState } from 'react';
import { Play, Trash2, Calendar, ChevronDown, ChevronUp, Award, Activity } from 'lucide-react';

export default function RangeMode({
  sessions = [],
  activeSession,
  onStartSession,
  onDeleteSession,
  onNavigate
}) {
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Aggregate statistics for Range
  const totalSessions = sessions.length;
  const allShots = sessions.flatMap(s => s.shots || []);
  const totalShots = allShots.length;
  const pureShots = allShots.filter(s => s.contact === 'Pure').length;
  const purePercentage = totalShots > 0 ? Math.round((pureShots / totalShots) * 100) : 0;

  // Most used club
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

  const toggleExpandSession = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* View Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
            Range Practice Mode
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '0.9rem' }}>
            Log contact quality, flight dispersion, and carry distances. Sweet Swing will calculate consistency ratios and recommend drills.
          </p>
        </div>
        <div>
          {activeSession ? (
            <button 
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.95rem', animation: 'pulseGlow 2s infinite' }}
              onClick={() => onNavigate('active-session')}
            >
              <Activity size={16} />
              Resume Active Session
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
              onClick={onStartSession}
            >
              <Play size={16} fill="currentColor" />
              Start Range Session
            </button>
          )}
        </div>
      </div>

      {/* Grid: Stats Preview & Range History */}
      <div className="dashboard-grid">
        
        {/* Left Side: Sessions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'white' }}>Practice Logs History</h2>
          
          {sessions.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No range practice logs found. Start a range session to log swings!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map(session => {
                const isExpanded = expandedSessionId === session.id;
                const shots = session.shots || [];
                const pureCount = shots.filter(s => s.contact === 'Pure').length;
                const purePercentage = shots.length > 0 ? Math.round((pureCount / shots.length) * 100) : 0;
                
                // Calculate club stats in this session
                const clubStats = shots.reduce((acc, shot) => {
                  if (!acc[shot.club]) {
                    acc[shot.club] = { total: 0, pure: 0, distTotal: 0, distCount: 0 };
                  }
                  acc[shot.club].total += 1;
                  if (shot.contact === 'Pure') {
                    acc[shot.club].pure += 1;
                  }
                  if (shot.distance) {
                    acc[shot.club].distTotal += shot.distance;
                    acc[shot.club].distCount += 1;
                  }
                  return acc;
                }, {});

                return (
                  <div 
                    key={session.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isExpanded ? '16px' : '0px',
                      borderLeft: isExpanded ? '4px solid var(--color-primary)' : '1px solid var(--border-glow)'
                    }}
                  >
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => toggleExpandSession(session.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                          <Calendar size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{session.date}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {shots.length} shots &bull; {purePercentage}% Pure Hit Ratio
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: 'var(--color-accent-gold)', fontSize: '0.85rem' }}>
                          {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
                        </div>
                        {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                          {/* Reflections */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reflections</span>
                            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: session.notes ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: session.notes ? 'normal' : 'italic' }}>
                              {session.notes || 'No reflections logged.'}
                            </div>
                          </div>

                          {/* Club consistency breakdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Club Breakdown</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {Object.entries(clubStats).map(([club, stat]) => {
                                const pct = Math.round((stat.pure / stat.total) * 100);
                                const avgDist = stat.distCount > 0 ? Math.round(stat.distTotal / stat.distCount) : null;
                                return (
                                  <div key={club} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                      <span style={{ fontWeight: 600 }}>{club} ({stat.total} hits){avgDist ? ` • Avg ${avgDist} yds` : ''}</span>
                                      <span style={{ color: pct > 65 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{pct}% Pure</span>
                                    </div>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--grad-emerald)', borderRadius: '2px' }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Actions Ribbon */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Session ID: {session.id}</span>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                          >
                            <Trash2 size={12} />
                            Delete Log
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Stats Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignSelf: 'flex-start' }}>
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Range Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Practice Sessions</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalSessions}</span>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Swings Logged</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalShots}</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sweet Spot Ratio</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>{purePercentage}%</span>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Primary Club</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{topClub}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

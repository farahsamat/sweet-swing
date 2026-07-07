import React, { useState } from 'react';
import { Trash2, Calendar, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function SessionHistory({ sessions, onDeleteSession, onStartSession }) {
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const toggleExpandSession = (id) => {
    if (expandedSessionId === id) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Range Logbook</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review your historical driving range performance and notes.
          </p>
        </div>
        {sessions.length > 0 && (
          <button className="btn btn-primary" onClick={onStartSession}>
            Start New Session
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        /* Empty History */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '1.4rem' }}>No Completed Sessions Found</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            You haven't recorded any sessions yet. Once you complete a practice range session, it will be saved in your logbook here.
          </p>
          <button className="btn btn-primary" onClick={onStartSession}>
            Log Your First Session
          </button>
        </div>
      ) : (
        /* History List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isExpanded ? '20px' : '0px',
                  borderLeft: isExpanded ? '4px solid var(--color-primary)' : '1px solid var(--border-glow)'
                }}
              >
                {/* Header Grid summary */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleExpandSession(session.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '10px', color: 'var(--color-primary)' }}>
                      <Calendar size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{session.date}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {shots.length} shots logged &bull; {purePercentage}% Pure Hit Ratio
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Stars */}
                    <div style={{ color: 'var(--color-accent-gold)', fontSize: '1rem', letterSpacing: '2px' }}>
                      {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
                    </div>
                    {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div 
                    style={{ 
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                      paddingTop: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      animation: 'slideIn 0.2s ease-out forwards'
                    }}
                  >
                    
                    {/* Grid of stats and details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      
                      {/* Notes & thoughts */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Reflections
                        </span>
                        <div style={{ 
                          background: 'rgba(0,0,0,0.15)', 
                          padding: '16px', 
                          borderRadius: '10px', 
                          fontSize: '0.9rem', 
                          lineHeight: '1.5',
                          border: '1px solid rgba(255,255,255,0.02)',
                          color: session.notes ? 'var(--text-primary)' : 'var(--text-muted)',
                          fontStyle: session.notes ? 'normal' : 'italic'
                        }}>
                          {session.notes || 'No reflections logged for this session.'}
                        </div>
                      </div>

                      {/* Club Performance */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                          Club Consistency Breakdown
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {Object.entries(clubStats).map(([club, stat]) => {
                            const pct = Math.round((stat.pure / stat.total) * 100);
                            const avgDist = stat.distCount > 0 ? Math.round(stat.distTotal / stat.distCount) : null;
                            return (
                              <div key={club} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: 600 }}>
                                    {club} ({stat.total} hits){avgDist ? ` • Avg ${avgDist} yds` : ''}
                                  </span>
                                  <span style={{ color: pct > 65 ? 'var(--color-primary)' : 'var(--text-secondary)' }}>{pct}% Pure</span>
                                </div>
                                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--grad-emerald)', borderRadius: '3px' }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Actions Ribbon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Session ID: {session.id}
                      </span>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                      >
                        <Trash2 size={12} />
                        Delete Session
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
  );
}

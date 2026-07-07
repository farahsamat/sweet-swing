import React, { useState } from 'react';
import { User, Cloud, HelpCircle, RefreshCw, Edit2, Check, Award, BookOpen, Sparkles, GripVertical } from 'lucide-react';

export default function Profile({
  // Google sync props
  googleClientId,
  googleAccessToken,
  googleUser,
  googleSpreadsheetId,
  syncStatus,
  syncMessage,
  onConnectGoogle,
  onManualSync,
  onDisconnectGoogle,
  // User profile props
  golferName,
  setGolferName,
  handicap,
  setHandicap,
  homeCourse,
  setHomeCourse,
  activeClubs,
  setActiveClubs,
  clubDistances = {},
  setClubDistances,
  sessions = []
}) {
  // Calculate average actual distances from "Pure" shots in sessions
  const allShots = sessions.flatMap(s => s.shots || []);
  const pureDistanceStats = allShots.reduce((acc, shot) => {
    if (shot.contact === 'Pure' && shot.distance) {
      if (!acc[shot.club]) {
        acc[shot.club] = { totalDist: 0, count: 0 };
      }
      acc[shot.club].totalDist += shot.distance;
      acc[shot.club].count += 1;
    }
    return acc;
  }, {});

  const getRealClubAverage = (clubName) => {
    const stats = pureDistanceStats[clubName];
    if (!stats || stats.count === 0) return null;
    return Math.round(stats.totalDist / stats.count);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(golferName || 'Golfer');
  const [tempHandicap, setTempHandicap] = useState(handicap || '28.0');
  const [tempHomeCourse, setTempHomeCourse] = useState(homeCourse || 'Local Club');
  
  const [inputClientId, setInputClientId] = useState(googleClientId || '');
  const [showInstructions, setShowInstructions] = useState(false);

  // Sync state if external changes occur
  React.useEffect(() => {
    setInputClientId(googleClientId || '');
  }, [googleClientId]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setGolferName(tempName);
    setHandicap(tempHandicap);
    setHomeCourse(tempHomeCourse);
    setIsEditing(false);
  };

  const [isEditingBag, setIsEditingBag] = useState(false);
  const [customClubName, setCustomClubName] = useState('');

  const CLUB_SPECS = {
    'Driver': '12.5° Loft',
    '3-Wood': '20° Loft',
    '5-Wood': '24° Loft',
    '7-Wood': '27° Loft',
    '3-Hybrid': '19° Loft',
    '4-Hybrid': '22° Loft',
    '5-Hybrid': '27° Loft',
    '6-Hybrid': '32° Loft',
    '4-Iron': 'Utility / Distance',
    '5-Iron': 'Long Iron',
    '6-Iron': 'Perimeter Weighted',
    '7-Iron': 'Perimeter Weighted',
    '8-Iron': 'Perimeter Weighted',
    '9-Iron': 'Perimeter Weighted',
    'PW': 'Pitching Wedge',
    'AW': 'Approach Wedge',
    'GW': 'Gap Wedge',
    'SW': 'Sand Wedge',
    'LW': 'Lob Wedge',
    'Putter': 'Odyssey Marxman'
  };

  const STANDARD_CLUB_OPTIONS = [
    'Driver', '3-Wood', '5-Wood', '7-Wood',
    '3-Hybrid', '4-Hybrid', '5-Hybrid', '6-Hybrid',
    '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron',
    'PW', 'AW', 'GW', 'SW', 'LW', 'Putter'
  ];

  const handleToggleClub = (clubName) => {
    if (activeClubs.includes(clubName)) {
      if (activeClubs.length <= 1) {
        alert("Your bag must contain at least 1 club!");
        return;
      }
      setActiveClubs(activeClubs.filter(c => c !== clubName));
    } else {
      setActiveClubs([...activeClubs, clubName]);
    }
  };

  const handleAddCustomClub = (e) => {
    e.preventDefault();
    const cleanName = customClubName.trim();
    if (!cleanName) return;
    if (activeClubs.includes(cleanName)) {
      alert("This club is already in your bag!");
      return;
    }
    setActiveClubs([...activeClubs, cleanName]);
    if (setClubDistances) {
      setClubDistances({ ...clubDistances, [cleanName]: 100 });
    }
    setCustomClubName('');
  };

  const handleRemoveClub = (clubName) => {
    if (activeClubs.length <= 1) {
      alert("Your bag must contain at least 1 club!");
      return;
    }
    setActiveClubs(activeClubs.filter(c => c !== clubName));
  };

  const handleMoveClubUp = (index) => {
    if (index === 0) return;
    const newClubs = [...activeClubs];
    const temp = newClubs[index];
    newClubs[index] = newClubs[index - 1];
    newClubs[index - 1] = temp;
    setActiveClubs(newClubs);
  };

  const handleMoveClubDown = (index) => {
    if (index === activeClubs.length - 1) return;
    const newClubs = [...activeClubs];
    const temp = newClubs[index];
    newClubs[index] = newClubs[index + 1];
    newClubs[index + 1] = temp;
    setActiveClubs(newClubs);
  };

  // Drag and drop states & handlers
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const reorderedClubs = [...activeClubs];
    const draggedItem = reorderedClubs[draggedIndex];
    
    reorderedClubs.splice(draggedIndex, 1);
    reorderedClubs.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setActiveClubs(reorderedClubs);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Profile & Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your golf settings, customized gear configurations, and Google Sheets cloud integration.
        </p>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Side: Golfer Profile Card & Bag Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Profile Card */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--color-primary)' }} />
                Golfer Details
              </h2>
              {!isEditing && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setTempName(golferName);
                    setTempHandicap(handicap);
                    setTempHomeCourse(homeCourse);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 size={12} />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Golfer Name</label>
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-slate)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Handicap Index</label>
                    <input 
                      type="text" 
                      value={tempHandicap} 
                      onChange={(e) => setTempHandicap(e.target.value)} 
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-slate)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Home Course</label>
                    <input 
                      type="text" 
                      value={tempHomeCourse} 
                      onChange={(e) => setTempHomeCourse(e.target.value)} 
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-slate)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Check size={14} />
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: 'var(--grad-emerald)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                }}>
                  {googleUser && googleUser.picture ? (
                    <img 
                      src={googleUser.picture} 
                      alt="Google User" 
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                    />
                  ) : (
                    golferName ? golferName.charAt(0).toUpperCase() : 'G'
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'white' }}>{golferName || 'Golfer'}</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                      Handicap: <strong style={{ color: 'var(--color-primary)' }}>{handicap || '28.0'}</strong>
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                      Course: <strong style={{ color: 'white' }}>{homeCourse || 'Local Club'}</strong>
                    </span>
                  </div>
                  {googleUser && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Connected via Google as: {googleUser.email}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customizable Golf Bag */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: 'var(--color-accent-gold)' }} />
                Golf Bag Setup
              </h2>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setIsEditingBag(!isEditingBag)}
              >
                {isEditingBag ? 'Done Managing' : 'Manage Bag'}
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
              {isEditingBag 
                ? 'Select standard clubs or add custom clubs to set up your active bag configuration.'
                : 'Your current active golf clubs list. These clubs will be available for logging range sessions.'}
            </p>

            {isEditingBag ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
                {/* Custom club builder */}
                <form onSubmit={handleAddCustomClub} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Add custom club (e.g. 50° Wedge, 7-Wood)..."
                    value={customClubName}
                    onChange={(e) => setCustomClubName(e.target.value)}
                    style={{
                      flexGrow: 1,
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-slate)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Add
                  </button>
                </form>

                {/* Toggles grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Toggle Standard Clubs
                  </span>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
                    gap: '8px' 
                  }}>
                    {STANDARD_CLUB_OPTIONS.map((club) => {
                      const isActive = activeClubs.includes(club);
                      return (
                        <button
                          key={club}
                          type="button"
                          onClick={() => handleToggleClub(club)}
                          style={{
                            padding: '8px 6px',
                            background: isActive ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.01)',
                            border: '1px solid ' + (isActive ? 'var(--color-primary)' : 'var(--border-slate)'),
                            borderRadius: '8px',
                            color: isActive ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: isActive ? 600 : 'normal',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          {club} {isActive ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                             {/* Custom / Current list with reordering actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Current Active Bag ({activeClubs.length}) - Order Top to Bottom
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeClubs.map((club, idx) => (
                      <div 
                        key={club} 
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: draggedIndex === idx ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          border: draggedIndex === idx ? '1px dashed var(--color-primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          color: 'white',
                          cursor: 'grab',
                          opacity: draggedIndex === idx ? 0.5 : 1,
                          transition: 'background 0.2s, border-color 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GripVertical size={14} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                          <span style={{ fontWeight: 500 }}>{club}</span>
                          <input 
                            type="number"
                            value={clubDistances[club] || 100}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setClubDistances({ ...clubDistances, [club]: val });
                            }}
                            style={{
                              width: '55px',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid var(--border-slate)',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '0.75rem',
                              padding: '2px 4px',
                              textAlign: 'center',
                              marginLeft: '8px'
                            }}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>yds</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveClubUp(idx)}
                            disabled={idx === 0}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '4px',
                              color: idx === 0 ? 'var(--text-muted)' : 'var(--color-primary)',
                              cursor: idx === 0 ? 'default' : 'pointer',
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: idx === 0 ? 0.3 : 1
                            }}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveClubDown(idx)}
                            disabled={idx === activeClubs.length - 1}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '4px',
                              color: idx === activeClubs.length - 1 ? 'var(--text-muted)' : 'var(--color-primary)',
                              cursor: idx === activeClubs.length - 1 ? 'default' : 'pointer',
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: idx === activeClubs.length - 1 ? 0.3 : 1
                            }}
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveClub(club)}
                            style={{
                              background: 'rgba(239,68,68,0.05)',
                              border: '1px solid rgba(239,68,68,0.15)',
                              borderRadius: '4px',
                              color: 'var(--color-danger)',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              padding: '1px 8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: '6px'
                            }}
                            title="Remove from bag"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>      </div>

              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
                gap: '10px',
                marginTop: '8px' 
              }}>
                {activeClubs.map((clubName) => {
                  const spec = CLUB_SPECS[clubName] || 'Custom Club';
                  return (
                    <div 
                      key={clubName} 
                      style={{
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{clubName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {spec} &bull; {clubDistances[clubName] || 100} yds
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Club Average Yardage Matrix Card */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
              Club Average Yardage Matrix
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: '1.4' }}>
              Compares your estimated **Target Distance** against your real average **Pure Contact carry distance** recorded during range practice.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              {/* Matrix Table Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                <span>Club</span>
                <span style={{ textAlign: 'center' }}>Target</span>
                <span style={{ textAlign: 'center' }}>Real Pure</span>
                <span style={{ textAlign: 'left', paddingLeft: '10px' }}>Real vs Target</span>
              </div>

              {/* Clubs List */}
              {activeClubs.map(club => {
                const target = clubDistances[club] || 100;
                const real = getRealClubAverage(club);
                const pct = real ? Math.round((real / target) * 100) : 0;
                const diff = real ? real - target : null;
                const diffDisplay = diff !== null ? (diff >= 0 ? `+${diff} yds` : `${diff} yds`) : 'No data';
                const diffColor = diff !== null ? (diff >= 0 ? 'var(--color-primary)' : 'var(--color-danger)') : 'var(--text-muted)';
                
                return (
                  <div key={club} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 2fr', gap: '8px', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{club}</span>
                    <span style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{target} yds</span>
                    <span style={{ textAlign: 'center', color: real ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: real ? 700 : 'normal' }}>
                      {real ? `${real} yds` : '-'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                      {real ? (
                        <>
                          <div style={{ flexGrow: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', minWidth: '40px' }}>
                            <div 
                              style={{ 
                                width: `${Math.min(100, pct)}%`, 
                                height: '100%', 
                                background: diff >= 0 ? 'var(--grad-emerald)' : 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)', 
                                borderRadius: '3px' 
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: diffColor, fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                            {diffDisplay}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Log pure range shots</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Google Sheets Cloud Sync Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
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
                    <p><strong>3. Create Web OAuth Client ID</strong><br/>In <strong>Credentials</strong>, create an <strong>OAuth Client ID</strong> (Web Application). Add Authorized Origin: <code style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{"https://sweet-swing.vercel.app"}</code> (and <code style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '3px' }}>{"http://localhost:5173"}</code> or current port for local testing). Copy the Client ID!</p>
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

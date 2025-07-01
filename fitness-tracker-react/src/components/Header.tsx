import React, { useState } from 'react';

interface HeaderProps {
  familyId: string | null;
  isConnected: boolean;
  dailyGoal: number;
  onConnect: (familyId: string) => Promise<void>;
  onDisconnect: () => void;
  onUpdateGoal: (newGoal: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  familyId,
  isConnected,
  dailyGoal,
  onConnect,
  onDisconnect,
  onUpdateGoal
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!inputValue.trim()) {
      alert('Please enter a family ID');
      return;
    }
    
    setIsConnecting(true);
    try {
      await onConnect(inputValue);
    } catch (error) {
      alert(`Error connecting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    const confirmMessage = `Are you sure you want to disconnect from "${familyId}" and connect to a different family?\n\nNote: Your current data will remain in the cloud and you can reconnect later using the same family name.`;
    
    if (window.confirm(confirmMessage)) {
      onDisconnect();
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  const handleUpdateGoal = () => {
    const newGoal = prompt('Enter new daily goal:', dailyGoal.toString());
    if (newGoal && !isNaN(parseInt(newGoal))) {
      const goalValue = parseInt(newGoal);
      if (goalValue < 1) {
        alert('Goal must be at least 1');
        return;
      }
      if (goalValue >= 278) {
        alert('Goal must be less than 278');
        return;
      }
      onUpdateGoal(goalValue);
    }
  };


  return (
    <div className="header">
      <h1>💪 Dad & Son Fitness Challenge 🔥</h1>
      <p>
        🎯 Daily Goal: {dailyGoal} Reps 🎯
        <button onClick={handleUpdateGoal} style={{ marginLeft: '10px' }}>Edit</button>
      </p>
      <p>💯 Stay Strong Together! 💯</p>

      
      {!isConnected ? (
        <div id="family-setup" style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ marginBottom: '12px', fontWeight: '500' }}>👨‍👩‍👧‍👦 Family ID:</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your family name"
              style={{
                padding: '8px 12px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              disabled={isConnecting}
            />
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {isConnecting ? '⏳ Connecting...' : '🔗 Connect'}
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
            Both devices need to use the same Family ID to sync data
          </div>
        </div>
      ) : (
        <div style={{
          display: 'block',
          marginTop: '20px',
          padding: '12px',
          background: '#dcfce7',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#16a34a',
          fontWeight: '500'
        }}>
          <div style={{ marginBottom: '8px' }}>
            ✅ Connected as: <span>{familyId}</span>
          </div>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '4px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
          >
            🔄 Change Family
          </button>
        </div>
      )}
    </div>
  );
};
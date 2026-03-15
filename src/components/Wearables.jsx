import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Watch, Smartphone, TrendingUp, Plus } from 'lucide-react';
import { getAvailableProviders, connectAppleHealth, connectGoogleFit, connectFitbit } from '../services/wearablesService';
import './Wearables.css';

function Wearables() {
  const { currentUser } = useAuth();
  const [availableProviders, setAvailableProviders] = useState([]);
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const providers = getAvailableProviders();
    setAvailableProviders(providers);
  }, []);

  const handleConnect = async (provider) => {
    setLoading(true);
    setError('');

    try {
      let result;
      switch (provider) {
        case 'apple_health':
          result = await connectAppleHealth();
          break;
        case 'google_fit':
          result = await connectGoogleFit();
          break;
        case 'fitbit':
          await connectFitbit();
          return; // Redirects, so return early
        default:
          throw new Error('Unknown provider');
      }

      if (result.success) {
        setConnectedProviders([...connectedProviders, provider]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const providerInfo = {
    apple_health: {
      name: 'Apple Health',
      icon: Watch,
      color: '#FF2D55',
      description: 'Sync steps, workouts, heart rate, and more'
    },
    google_fit: {
      name: 'Google Fit',
      icon: Activity,
      color: '#4285F4',
      description: 'Track activities, calories, and fitness data'
    },
    fitbit: {
      name: 'Fitbit',
      icon: TrendingUp,
      color: '#00B0B9',
      description: 'Connect your Fitbit tracker and smartwatch'
    },
    manual: {
      name: 'Manual Entry',
      icon: Plus,
      color: '#00d9ff',
      description: 'Manually log your workouts and progress'
    }
  };

  return (
    <div className="wearables-container">
      <div className="wearables-header">
        <Smartphone size={32} className="header-icon" />
        <div>
          <h2>Connect Your Devices</h2>
          <p className="wearables-subtitle">
            Sync data from your fitness trackers and smartwatches
          </p>
        </div>
      </div>

      {error && (
        <div className="wearables-error">
          <span>{error}</span>
        </div>
      )}

      <div className="providers-grid">
        {availableProviders.map((provider) => {
          const info = providerInfo[provider];
          const Icon = info.icon;
          const isConnected = connectedProviders.includes(provider);

          return (
            <div key={provider} className={`provider-card ${isConnected ? 'connected' : ''}`}>
              <div className="provider-icon" style={{ background: `${info.color}20`, color: info.color }}>
                <Icon size={32} />
              </div>
              <div className="provider-info">
                <h3>{info.name}</h3>
                <p>{info.description}</p>
              </div>
              <button
                className={`connect-btn ${isConnected ? 'connected' : ''}`}
                onClick={() => handleConnect(provider)}
                disabled={loading || isConnected}
              >
                {isConnected ? 'Connected' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="wearables-info">
        <h3>Why Connect?</h3>
        <ul>
          <li>Automatic workout tracking</li>
          <li>Real-time health metrics</li>
          <li>Better AI recommendations</li>
          <li>Comprehensive progress insights</li>
        </ul>
      </div>
    </div>
  );
}

export default Wearables;

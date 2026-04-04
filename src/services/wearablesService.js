// Wearables Integration Service
// Supports: Apple Health, Google Fit, Fitbit

import { saveWearableData } from './firestoreService';

// Apple HealthKit Integration (iOS Safari)
export const connectAppleHealth = async () => {
  if (!window.webkit?.messageHandlers?.healthKit) {
    throw new Error('Apple Health not available. Open in iOS Safari.');
  }

  try {
    // Request permission to read health data
    const permissions = {
      read: [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierBodyMass',
        'HKQuantityTypeIdentifierHeight',
        'HKWorkoutTypeIdentifier'
      ]
    };

    window.webkit.messageHandlers.healthKit.postMessage({
      action: 'requestAuthorization',
      permissions
    });

    return { success: true, provider: 'apple_health' };
  } catch (error) {
    console.error('Apple Health connection error:', error);
    throw error;
  }
};

export const fetchAppleHealthData = async (dataType, startDate, endDate) => {
  if (!window.webkit?.messageHandlers?.healthKit) {
    throw new Error('Apple Health not available');
  }

  return new Promise((resolve) => {
    window.webkit.messageHandlers.healthKit.postMessage({
      action: 'queryData',
      type: dataType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Listen for response (requires native bridge setup)
    window.handleHealthKitResponse = (data) => {
      resolve(data);
    };
  });
};

// Google Fit Integration (Web API)
export const connectGoogleFit = async () => {
  if (!window.gapi) {
    throw new Error('Google API not loaded');
  }

  const CLIENT_ID = 'YOUR_GOOGLE_FIT_CLIENT_ID'; // You'll need to set this up
  const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read'
  ].join(' ');

  try {
    await window.gapi.auth2.init({
      client_id: CLIENT_ID,
      scope: SCOPES
    });

    const auth = window.gapi.auth2.getAuthInstance();
    await auth.signIn();

    return { success: true, provider: 'google_fit' };
  } catch (error) {
    console.error('Google Fit connection error:', error);
    throw error;
  }
};

export const fetchGoogleFitData = async (dataSource, startTime, endTime) => {
  const response = await window.gapi.client.fitness.users.dataSources.datasets.get({
    userId: 'me',
    dataSourceId: dataSource,
    datasetId: `${startTime}-${endTime}`
  });

  return response.result;
};

// Fitbit Integration (OAuth)
export const connectFitbit = async () => {
  const FITBIT_CLIENT_ID = 'YOUR_FITBIT_CLIENT_ID'; // You'll need to set this up
  const REDIRECT_URI = window.location.origin + '/fitbit-callback';
  const SCOPES = 'activity heartrate nutrition profile sleep weight';

  const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
    `response_type=token&` +
    `client_id=${FITBIT_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(SCOPES)}`;

  window.location.href = authUrl;
};

export const fetchFitbitData = async (accessToken, endpoint, date) => {
  const response = await fetch(
    `https://api.fitbit.com/1/user/-/${endpoint}/date/${date}.json`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Fitbit API error');
  }

  return await response.json();
};

// Generic sync function to save wearable data to Firestore
export const syncWearableData = async (userId, provider, data) => {
  const wearableData = {
    provider,
    data,
    syncedAt: new Date().toISOString()
  };

  await saveWearableData(userId, wearableData);
  return wearableData;
};

// Parse and normalize data from different providers
export const normalizeWearableData = (provider, rawData) => {
  switch (provider) {
    case 'apple_health':
      return {
        steps: rawData.stepCount || 0,
        calories: rawData.activeEnergyBurned || 0,
        heartRate: rawData.heartRate || null,
        weight: rawData.bodyMass || null,
        workouts: rawData.workouts || []
      };

    case 'google_fit':
      return {
        steps: rawData.steps || 0,
        calories: rawData.calories || 0,
        heartRate: rawData.heartRate || null,
        weight: rawData.weight || null,
        activities: rawData.activities || []
      };

    case 'fitbit':
      return {
        steps: rawData.steps || 0,
        calories: rawData.calories || 0,
        heartRate: rawData.restingHeartRate || null,
        weight: rawData.weight || null,
        sleep: rawData.sleep || null
      };

    default:
      return rawData;
  }
};

// Web-based fallback: Manual data entry
export const manualDataEntry = {
  logSteps: async (userId, steps, date = new Date()) => {
    await saveWearableData(userId, {
      provider: 'manual',
      type: 'steps',
      value: steps,
      date: date.toISOString()
    });
  },

  logWeight: async (userId, weight, date = new Date()) => {
    await saveWearableData(userId, {
      provider: 'manual',
      type: 'weight',
      value: weight,
      unit: 'kg',
      date: date.toISOString()
    });
  },

  logWorkout: async (userId, workoutData, date = new Date()) => {
    await saveWearableData(userId, {
      provider: 'manual',
      type: 'workout',
      ...workoutData,
      date: date.toISOString()
    });
  }
};

// Check what's available on current device
export const getAvailableProviders = () => {
  const providers = [];

  // Check for iOS
  if (window.webkit?.messageHandlers?.healthKit) {
    providers.push('apple_health');
  }

  // Check for Android/Web
  if (window.gapi || navigator.userAgent.includes('Android')) {
    providers.push('google_fit');
  }

  // Fitbit works everywhere via OAuth
  providers.push('fitbit');

  // Manual entry always available
  providers.push('manual');

  return providers;
};

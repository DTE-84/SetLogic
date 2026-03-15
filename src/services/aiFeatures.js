import { callClaude } from './claudeAPI';

// AI Progress Analysis - Analyzes user's workout/nutrition data
export const analyzeProgress = async (userData) => {
  const systemPrompt = `You are SetLogic, an elite AI fitness analyst. Analyze user progress data and provide:
1. Key insights and patterns
2. What's working well
3. Areas for improvement
4. Specific actionable recommendations

Be direct, data-driven, and motivating. Use bullet points for clarity.`;

  const userMessage = `Analyze my fitness progress:

**Workout Data:**
- Total workouts this month: ${userData.workouts?.length || 0}
- Average volume: ${userData.avgVolume || 'N/A'} kg
- Consistency: ${userData.consistency || 'N/A'}%

**Nutrition Data:**
- Average calories: ${userData.avgCalories || 'N/A'} kcal/day
- Average protein: ${userData.avgProtein || 'N/A'}g/day
- Meal adherence: ${userData.mealAdherence || 'N/A'}%

**Body Metrics:**
- Current weight: ${userData.currentWeight || 'N/A'} kg
- Weight change: ${userData.weightChange || 'N/A'} kg
- Goal: ${userData.goal || 'Not specified'}

${userData.wearableData ? `**Activity Data:**
- Average daily steps: ${userData.avgSteps || 'N/A'}
- Average heart rate: ${userData.avgHeartRate || 'N/A'} bpm
- Sleep quality: ${userData.sleepQuality || 'N/A'}
` : ''}

Provide a comprehensive analysis with actionable next steps.`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

// Smart Workout Recommendations based on history
export const getSmartWorkoutRecommendations = async (userHistory) => {
  const systemPrompt = `You are SetLogic, an AI workout optimizer. Based on user's workout history and performance, recommend:
1. What to train today for optimal progression
2. Exercises to prioritize
3. Volume/intensity adjustments
4. Recovery considerations

Be specific with sets, reps, and exercises.`;

  const userMessage = `Based on my recent workouts, what should I train today?

**Last 7 Days:**
${userHistory.recentWorkouts?.map(w => `- ${w.date}: ${w.muscleGroup} (${w.totalSets} sets, ${w.totalVolume}kg volume)`).join('\n') || 'No recent workouts'}

**Current Split:** ${userHistory.split || 'Not specified'}
**Recovery Status:** ${userHistory.recoveryStatus || 'Normal'}
**Available Time:** ${userHistory.availableTime || '60 minutes'}
**Equipment:** ${userHistory.equipment || 'Full gym'}

What should I focus on today for maximum progress?`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

// Nutrition Optimization - Suggests meal adjustments
export const optimizeNutrition = async (nutritionData) => {
  const systemPrompt = `You are SetLogic, an AI nutrition strategist. Analyze current nutrition and suggest optimizations for:
1. Better macro balance
2. Meal timing
3. Food swaps for better results
4. Supplement recommendations (if applicable)

Focus on practical, sustainable changes.`;

  const userMessage = `Help me optimize my nutrition:

**Current Intake:**
- Calories: ${nutritionData.avgCalories || 'N/A'} kcal/day
- Protein: ${nutritionData.avgProtein || 'N/A'}g
- Carbs: ${nutritionData.avgCarbs || 'N/A'}g
- Fats: ${nutritionData.avgFats || 'N/A'}g

**Goal:** ${nutritionData.goal || 'Not specified'}
**Activity Level:** ${nutritionData.activityLevel || 'Moderate'}
**Dietary Preferences:** ${nutritionData.preferences || 'Flexible'}
**Budget:** ${nutritionData.budget || 'Moderate'}

What should I adjust for better results?`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

// Injury Prevention & Recovery Advice
export const getRecoveryAdvice = async (recoveryData) => {
  const systemPrompt = `You are SetLogic, an AI recovery specialist. Provide personalized advice on:
1. Rest and recovery optimization
2. Injury prevention strategies
3. Mobility/stretching recommendations
4. When to push vs when to back off

Be cautious and evidence-based.`;

  const userMessage = `Advise me on recovery and injury prevention:

**Training Frequency:** ${recoveryData.frequency || 'N/A'} days/week
**Sleep:** ${recoveryData.avgSleep || 'N/A'} hours/night
**Soreness Level:** ${recoveryData.sorenessLevel || 'Moderate'}/10
**Recent Injuries:** ${recoveryData.injuries || 'None'}
**Age:** ${recoveryData.age || 'Not specified'}
**Stress Level:** ${recoveryData.stressLevel || 'Moderate'}

${recoveryData.painAreas ? `Areas of discomfort: ${recoveryData.painAreas}` : ''}

What should I focus on for optimal recovery?`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

// Goal Setting & Timeline Prediction
export const predictGoalTimeline = async (goalData) => {
  const systemPrompt = `You are SetLogic, an AI goal strategist. Based on current progress and goal, provide:
1. Realistic timeline estimate
2. Required rate of progress
3. Potential obstacles
4. Strategy adjustments needed

Be honest and realistic while staying motivating.`;

  const userMessage = `Help me plan my goal timeline:

**Current Stats:**
- Weight: ${goalData.currentWeight || 'N/A'} kg
- Body fat: ${goalData.currentBF || 'N/A'}%
- Strength level: ${goalData.strengthLevel || 'N/A'}

**Goal:**
- Target: ${goalData.goalTarget || 'Not specified'}
- Timeline: ${goalData.desiredTimeline || 'ASAP'}

**Current Approach:**
- Training: ${goalData.trainingFrequency || 'N/A'} days/week
- Nutrition: ${goalData.nutritionAdherence || 'N/A'}% compliant
- Consistency: ${goalData.consistency || 'N/A'} months

Is my timeline realistic? What do I need to adjust?`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

// Weekly Check-in Summary
export const generateWeeklyCheckin = async (weekData) => {
  const systemPrompt = `You are SetLogic, providing a weekly performance review. Summarize:
1. This week's highlights
2. Adherence to plan
3. Progress vs last week
4. Next week's focus

Keep it concise, data-driven, and action-oriented.`;

  const userMessage = `Generate my weekly check-in summary:

**This Week:**
- Workouts completed: ${weekData.workoutsCompleted || 0}/${weekData.workoutsPlanned || 0}
- Avg calories: ${weekData.avgCalories || 'N/A'} kcal
- Weight change: ${weekData.weightChange || 'N/A'} kg
- Steps: ${weekData.avgSteps || 'N/A'}/day
- Sleep: ${weekData.avgSleep || 'N/A'} hrs/night

**Last Week:**
- Workouts: ${weekData.lastWeekWorkouts || 'N/A'}
- Weight: ${weekData.lastWeekWeight || 'N/A'} kg

**Notes:** ${weekData.notes || 'None'}

Summarize my week and advise on next steps.`;

  const messages = [{ role: 'user', content: userMessage }];
  return await callClaude(messages, systemPrompt);
};

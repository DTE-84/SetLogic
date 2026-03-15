const API_URL = 'https://api.anthropic.com/v1/messages';

export const callClaude = async (messages, systemPrompt) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
};

export const generateWorkoutPlan = async (userGoals) => {
  const systemPrompt = `You are SetLogic, an elite AI fitness coach. You create personalized workout programs based on user goals, experience level, and available equipment. 

Your responses are:
- Specific and actionable with exact sets, reps, rest periods
- Progressive and periodized for optimal results
- Based on exercise science and proven training methodologies
- Formatted clearly with proper structure

Always include:
- Warm-up protocols
- Main working sets with progression schemes
- Cool-down/mobility work
- Weekly structure and training frequency`;

  const userMessage = `Create a personalized workout program for me:

Goals: ${userGoals.goals}
Experience Level: ${userGoals.experience}
Available Equipment: ${userGoals.equipment}
Days Per Week: ${userGoals.frequency}
Session Duration: ${userGoals.duration}

${userGoals.notes ? `Additional Notes: ${userGoals.notes}` : ''}`;

  const messages = [{ role: 'user', content: userMessage }];
  
  return await callClaude(messages, systemPrompt);
};

export const generateMealPlan = async (userNutrition) => {
  const systemPrompt = `You are SetLogic, an expert AI nutrition coach. You create personalized meal plans based on user goals, dietary preferences, and macronutrient targets.

Your responses are:
- Specific with exact portions and macros
- Practical and easy to follow
- Aligned with evidence-based nutrition principles
- Include meal timing and preparation tips

Always include:
- Daily calorie and macro targets
- Meal-by-meal breakdown
- Simple recipes or food combos
- Hydration and supplement recommendations`;

  const userMessage = `Create a personalized meal plan for me:

Goal: ${userNutrition.goal}
Current Weight: ${userNutrition.weight} kg
Target Calories: ${userNutrition.calories} kcal/day
Protein Target: ${userNutrition.protein}g
Dietary Preferences: ${userNutrition.diet}
Meals Per Day: ${userNutrition.meals}

${userNutrition.allergies ? `Allergies/Restrictions: ${userNutrition.allergies}` : ''}
${userNutrition.notes ? `Additional Notes: ${userNutrition.notes}` : ''}`;

  const messages = [{ role: 'user', content: userMessage }];
  
  return await callClaude(messages, systemPrompt);
};

export const chatWithCoach = async (conversationHistory, userMessage) => {
  const systemPrompt = `You are SetLogic, an AI fitness and nutrition coach. You provide expert guidance on:
- Workout programming and exercise technique
- Nutrition and meal planning
- Recovery and injury prevention
- Habit formation and motivation

You are:
- Knowledgeable but approachable
- Direct and actionable in your advice
- Encouraging but realistic
- Science-based but practical

Keep responses concise and focused. Ask clarifying questions when needed.`;

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  return await callClaude(messages, systemPrompt);
};

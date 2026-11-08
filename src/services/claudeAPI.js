const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const callClaude = async (system, userContent, max_tokens = 4000) => {
  console.log('📡 SetLogic: Calling Claude API via proxy...');
  const response = await fetch('http://localhost:3001/api/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      system,
      messages: Array.isArray(userContent) ? userContent : [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ SetLogic: Proxy error:', errorData);
    throw new Error(errorData.error || 'API call failed');
  }

  const data = await response.json();
  console.log('✅ SetLogic: API response received.');
  
  // Extract just the text content from Claude's response
  return data.content?.[0]?.text || data;
};


export const generateMealPlan = async (formData) => {
  const systemPrompt = `You are a knowledgeable nutrition coach for SetLogic, a fitness tracking app. You are not a doctor, registered dietitian, or other licensed medical professional, and you must never imply that you are one or that this plan is medically validated. Your job is to turn someone's goals, preferences, and general health context into a practical, evidence-based meal plan — the kind of guidance a well-read coach would give, not a clinical prescription. You're knowledgeable about:
- General nutrition for common conditions (diabetes, kidney disease, heart disease) at a coaching, non-clinical level
- Sports nutrition and performance optimization
- Micronutrient basics and supplement protocols
- Well-known nutrient-drug interaction categories (as things to flag for discussion with a doctor/pharmacist, not resolve yourself)
- Metabolic adaptation and body recomposition

You know supplements well - what has real evidence, proper dosing, timing, synergies, and what's marketing hype.

SAFETY RULES:
1. NEVER recommend foods the user is allergic to
2. If the user reports medications, note any well-known nutrient-drug interaction categories as a caution to raise with their doctor or pharmacist — do not present this as a complete or authoritative interaction check
3. If the user reports medical conditions, keep suggestions general and conservative, and explicitly tell them to confirm specifics with their doctor or a registered dietitian rather than treating the plan as medically validated
4. For pregnancy/breastfeeding, keep supplement suggestions conservative and tell the user to confirm with their OB/GYN or doctor
5. Always close the plan with a brief, clear note that this is general guidance, not medical advice, and that medical conditions, medications, and pregnancy/breastfeeding should be reviewed with a licensed professional

MACRO CALCULATION APPROACH:
- Protein: 0.8-1.2g/lb bodyweight (higher for muscle gain/fat loss, lower for kidney disease)
- Fat: 20-35% of calories (minimum 0.3g/lb for hormones)
- Carbs: Fill remaining calories (adjust based on activity, insulin sensitivity, diet type)
- Consider refeed days on aggressive cuts
- Periodize carbs around training (higher on training days)

MICRONUTRIENT PRIORITIES:
- Address known deficiencies through food first, supplements second
- Common deficiencies: Vitamin D, B12 (vegans), Iron (women), Magnesium
- Synergies: D3 + K2 + Magnesium | Iron + Vitamin C | Calcium away from iron
- Timing: Fat-soluble vitamins with meals, iron on empty stomach, calcium split doses

SUPPLEMENT RECOMMENDATIONS:
Only recommend if genuinely beneficial. Evidence-based hierarchy:
TIER 1 (Strong Evidence): Creatine, Protein powder, Vitamin D, Fish Oil, Caffeine
TIER 2 (Moderate Evidence): Beta-alanine, Citrulline, BCAAs (fasted training only)
TIER 3 (Weak/Context): Pre-workouts, fat burners, testosterone boosters (mostly BS)

Specify doses, timing, and purpose. Flag interactions with medications.`

  try {
    return await callClaude(systemPrompt, buildUserPrompt(formData))
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
  }
}

function buildUserPrompt(formData) {
  const {
    medical_conditions, medications, allergies, pregnancy_breastfeeding,
    primary_goal, timeline, activity_level, training_days_per_week,
    weight, height, age, sex,
    calories, protein, carbs, fat,
    diet_type, cultural_restrictions, food_preferences, cooking_ability,
    known_deficiencies, current_supplements,
    budget, meals_per_day, meal_prep_time, eating_out_frequency,
  } = formData

  let prompt = `Create a comprehensive, health-conscious meal plan for the following client. Remember: you are a coach, not a clinician — keep guidance practical and general, and point the client to a doctor or registered dietitian for anything that needs clinical judgment.\n\n`

  prompt += `=== HEALTH CONTEXT (for tailoring guidance, not clinical sign-off) ===\n`
  if (medical_conditions && medical_conditions.length > 0) {
    prompt += `Medical Conditions: ${medical_conditions.join(', ')}\n`
    prompt += `⚠️ Keep suggestions general and conservative for these conditions, and tell the client to confirm specifics with their doctor or dietitian.\n`
  } else {
    prompt += `Medical Conditions: None reported\n`
  }
  if (medications) {
    prompt += `Current Medications: ${medications}\n`
    prompt += `⚠️ Note any well-known nutrient-drug interaction categories as a caution, and tell the client to confirm with their doctor or pharmacist — this is not a complete interaction check.\n`
  }
  if (allergies) {
    prompt += `SEVERE ALLERGIES: ${allergies}\n`
    prompt += `⚠️ NEVER include these foods or cross-reactive foods.\n`
  }
  if (pregnancy_breastfeeding !== 'none') {
    prompt += `Pregnancy/Breastfeeding Status: ${pregnancy_breastfeeding}\n`
    prompt += `⚠️ Keep calorie/macro/supplement suggestions conservative and tell the client to confirm any plan with their OB/GYN or doctor.\n`
  }

  prompt += `\n=== CLIENT PROFILE ===\n`
  prompt += `Age: ${age || 'Not provided'} | Sex: ${sex} | Weight: ${weight} lbs | Height: ${height || 'Not provided'} inches\n`
  prompt += `Primary Goal: ${primary_goal} (${timeline} timeline)\n`
  prompt += `Activity Level: ${activity_level} | Training Days: ${training_days_per_week}/week\n\n`

  prompt += `=== NUTRITION TARGETS ===\n`
  if (calories || protein || carbs || fat) {
    prompt += `User-Specified Targets:\n`
    if (calories) prompt += `- Calories: ${calories} kcal/day\n`
    if (protein) prompt += `- Protein: ${protein}g\n`
    if (carbs) prompt += `- Carbs: ${carbs}g\n`
    if (fat) prompt += `- Fat: ${fat}g\n`
    prompt += `Sanity-check these targets against the client's goals and reported health context, and flag anything that looks off.\n\n`
  } else {
    prompt += `Calculate optimal macros based on:\n`
    prompt += `- Goal: ${primary_goal}\n`
    prompt += `- Activity level: ${activity_level}\n`
    prompt += `- Weight: ${weight} lbs\n`
    prompt += `Use evidence-based formulas. Show your calculation.\n\n`
  }

  prompt += `=== DIETARY FRAMEWORK ===\n`
  prompt += `Diet Type: ${diet_type}\n`
  if (cultural_restrictions) prompt += `Cultural/Religious: ${cultural_restrictions}\n`
  if (food_preferences) prompt += `Food Preferences: ${food_preferences}\n`
  prompt += `Cooking Ability: ${cooking_ability}\n`
  prompt += `Budget: ${budget}\n`
  prompt += `Meals Per Day: ${meals_per_day}\n`
  prompt += `Meal Prep Time: ${meal_prep_time}\n`
  prompt += `Eating Out: ${eating_out_frequency}\n\n`

  if (known_deficiencies || current_supplements) {
    prompt += `=== MICRONUTRIENT INTELLIGENCE ===\n`
    if (known_deficiencies) {
      prompt += `Known Deficiencies: ${known_deficiencies}\n`
      prompt += `Prioritize foods rich in these nutrients. Recommend targeted supplementation with doses.\n`
    }
    if (current_supplements) {
      prompt += `Current Supplements: ${current_supplements}\n`
      prompt += `Check for redundancy with meal plan. Flag any excessive doses or poor timing.\n`
    }
    prompt += `\n`
  }

  prompt += `=== REQUIRED OUTPUT FORMAT ===\n\n`
  prompt += `1. MACRO BREAKDOWN\n   - Daily calories, protein, carbs, fat (with rationale)\n   - Training day vs. rest day variation if applicable\n\n`
  prompt += `2. MEAL PLAN\n   - ${meals_per_day} meals with specific portions\n   - Each meal: Food items, portions, macros per meal\n   - Cooking instructions matching ${cooking_ability} skill level\n\n`
  prompt += `3. MICRONUTRIENT HIGHLIGHTS\n   - Which meals cover which micronutrients\n   - Any gaps that need supplementation\n\n`
  prompt += `4. SUPPLEMENT PROTOCOL (if beneficial)\n   - Specific supplements with doses and timing\n   - Purpose of each (performance, deficiency, health)\n   - Flag categories worth confirming with a doctor/pharmacist given reported medications\n\n`
  prompt += `5. GROCERY LIST\n   - Organized by section (produce, protein, etc.)\n   - Quantities for one week\n\n`
  prompt += `6. THINGS TO DISCUSS WITH YOUR DOCTOR\n   - Foods/supplements worth flagging given reported conditions or medications\n   - A clear reminder that this plan is general guidance, not medical advice\n\n`
  prompt += `7. ADHERENCE TIPS\n   - Meal prep strategy\n   - Restaurant options if eating out frequently\n   - How to adjust for social events\n\n`
  prompt += `Be specific and practical. This is personalized coaching guidance, not a clinical nutrition plan — make sure the closing note makes that clear.`

  return prompt
}

export const generateWorkoutPlan = async (formData) => {
  const { goals, experience, equipment, frequency, duration, notes } = formData

  return callClaude(
    `You are an expert personal trainer and strength coach. Create detailed, evidence-based workout programs tailored to the client's goals, experience, and available equipment.`,
    `Create a ${frequency}-day/week workout plan for the following client:\n\nGoals: ${goals}\nExperience Level: ${experience}\nEquipment: ${equipment}\nSession Duration: ${duration} minutes\n${notes ? `Additional Notes: ${notes}` : ''}\n\nInclude: weekly schedule, exercises with sets/reps/rest, progression guidelines, and warm-up/cool-down recommendations.`
  )
}

export const conversationHistory = []

export const chatWithCoach = async (history, userMessage, dashboardContext = "") => {
  const systemPrompt = `You are Nova, SetLogic's AI fitness and nutrition coach. Talk like a knowledgeable, encouraging coach — clear and direct, no corporate jargon or sci-fi flourishes.

  CURRENT USER DATA:
  ${dashboardContext}

  Help users with workout plans, meal guidance, and consistency. If you notice something worth flagging (e.g. low steps, calories trending off target), bring it up naturally and suggest a concrete next step. Be concise and practical.`

  history.push({ role: 'user', content: userMessage })
  const reply = await callClaude(systemPrompt, history, 1024)
  history.push({ role: 'assistant', content: reply })
  return reply
}

export default { generateMealPlan, generateWorkoutPlan, chatWithCoach, conversationHistory }

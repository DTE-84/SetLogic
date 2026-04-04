/**
 * Claude API Service - Medical-Grade Nutrition Planning
 * Encodes Drew's GNC-level nutrition expertise into prompts
 */

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export const generateMealPlan = async (formData) => {
	// Build comprehensive system prompt with Drew's nutrition knowledge
	const systemPrompt = `You are a registered dietitian with 15+ years of clinical experience, specializing in:
- Medical nutrition therapy (diabetes, kidney disease, heart disease, cancer recovery)
- Sports nutrition and performance optimization  
- Micronutrient optimization and supplement protocols
- Medication-nutrient interactions
- Metabolic adaptation and body recomposition

You have the supplement knowledge equivalent to a GNC manager - you know what actually works, proper dosing, timing, synergies, and what's marketing bullshit.

CRITICAL SAFETY RULES:
1. NEVER recommend foods the user is allergic to
2. ALWAYS account for medication-nutrient interactions (e.g., grapefruit + statins, vitamin K + blood thinners, iron + calcium)
3. Flag any recommendations that could be dangerous given medical conditions
4. Adjust macros/micros for pregnancy/breastfeeding if applicable
5. If unsure about safety, explicitly state "Consult your doctor before..."

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

Specify doses, timing, and purpose. Flag interactions with medications.`;

	// Build detailed user prompt
	const userPrompt = buildUserPrompt(formData);

	try {
		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": ANTHROPIC_API_KEY,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-sonnet-4-20250514",
				max_tokens: 4000,
				system: systemPrompt,
				messages: [
					{
						role: "user",
						content: userPrompt,
					},
				],
			}),
		});

		const data = await response.json();
		return data.content[0].text;
	} catch (error) {
		console.error("Error calling Claude API:", error);
		throw error;
	}
};

function buildUserPrompt(formData) {
	const {
		// Safety
		medical_conditions,
		medications,
		allergies,
		pregnancy_breastfeeding,

		// Goals
		primary_goal,
		timeline,
		activity_level,
		training_days_per_week,

		// Biometrics
		weight,
		height,
		age,
		sex,

		// Nutrition
		calories,
		protein,
		carbs,
		fat,

		// Dietary
		diet_type,
		cultural_restrictions,
		food_preferences,
		cooking_ability,

		// Micros
		known_deficiencies,
		current_supplements,

		// Lifestyle
		budget,
		meals_per_day,
		meal_prep_time,
		eating_out_frequency,
	} = formData;

	let prompt = `Create a comprehensive, medically-informed meal plan for the following client:\n\n`;

	// CRITICAL SAFETY SECTION (always first)
	prompt += `=== CRITICAL SAFETY INFORMATION ===\n`;

	if (medical_conditions && medical_conditions.length > 0) {
		prompt += `Medical Conditions: ${medical_conditions.join(", ")}\n`;
		prompt += `⚠️ ADJUST PLAN FOR THESE CONDITIONS. Flag any foods/nutrients that could worsen symptoms.\n`;
	} else {
		prompt += `Medical Conditions: None reported\n`;
	}

	if (medications) {
		prompt += `Current Medications: ${medications}\n`;
		prompt += `⚠️ CHECK FOR NUTRIENT-DRUG INTERACTIONS. Explicitly warn about any dangerous combinations.\n`;
	}

	if (allergies) {
		prompt += `SEVERE ALLERGIES: ${allergies}\n`;
		prompt += `⚠️ NEVER include these foods or cross-reactive foods.\n`;
	}

	if (pregnancy_breastfeeding !== "none") {
		prompt += `Pregnancy/Breastfeeding Status: ${pregnancy_breastfeeding}\n`;
		prompt += `⚠️ Adjust calories/macros/micros for maternal nutrition. Avoid dangerous supplements.\n`;
	}

	prompt += `\n=== CLIENT PROFILE ===\n`;
	prompt += `Age: ${age || "Not provided"} | Sex: ${sex} | Weight: ${weight} lbs | Height: ${height || "Not provided"} inches\n`;
	prompt += `Primary Goal: ${primary_goal} (${timeline} timeline)\n`;
	prompt += `Activity Level: ${activity_level} | Training Days: ${training_days_per_week}/week\n\n`;

	// Nutrition targets
	prompt += `=== NUTRITION TARGETS ===\n`;
	if (calories || protein || carbs || fat) {
		prompt += `User-Specified Targets:\n`;
		if (calories) prompt += `- Calories: ${calories} kcal/day\n`;
		if (protein) prompt += `- Protein: ${protein}g\n`;
		if (carbs) prompt += `- Carbs: ${carbs}g\n`;
		if (fat) prompt += `- Fat: ${fat}g\n`;
		prompt += `Validate these targets. Adjust if unsafe given medical conditions or goals.\n\n`;
	} else {
		prompt += `Calculate optimal macros based on:\n`;
		prompt += `- Goal: ${primary_goal}\n`;
		prompt += `- Activity level: ${activity_level}\n`;
		prompt += `- Weight: ${weight} lbs\n`;
		prompt += `Use evidence-based formulas. Show your calculation.\n\n`;
	}

	// Dietary framework
	prompt += `=== DIETARY FRAMEWORK ===\n`;
	prompt += `Diet Type: ${diet_type}\n`;
	if (cultural_restrictions)
		prompt += `Cultural/Religious: ${cultural_restrictions}\n`;
	if (food_preferences) prompt += `Food Preferences: ${food_preferences}\n`;
	prompt += `Cooking Ability: ${cooking_ability}\n`;
	prompt += `Budget: ${budget}\n`;
	prompt += `Meals Per Day: ${meals_per_day}\n`;
	prompt += `Meal Prep Time: ${meal_prep_time}\n`;
	prompt += `Eating Out: ${eating_out_frequency}\n\n`;

	// Micronutrients
	if (known_deficiencies || current_supplements) {
		prompt += `=== MICRONUTRIENT INTELLIGENCE ===\n`;
		if (known_deficiencies) {
			prompt += `Known Deficiencies: ${known_deficiencies}\n`;
			prompt += `Prioritize foods rich in these nutrients. Recommend targeted supplementation with doses.\n`;
		}
		if (current_supplements) {
			prompt += `Current Supplements: ${current_supplements}\n`;
			prompt += `Check for redundancy with meal plan. Flag any excessive doses or poor timing.\n`;
		}
		prompt += `\n`;
	}

	// Output format
	prompt += `=== REQUIRED OUTPUT FORMAT ===\n\n`;

	prompt += `1. MACRO BREAKDOWN\n`;
	prompt += `   - Daily calories, protein, carbs, fat (with rationale)\n`;
	prompt += `   - Training day vs. rest day variation if applicable\n\n`;

	prompt += `2. MEAL PLAN\n`;
	prompt += `   - ${meals_per_day} meals with specific portions\n`;
	prompt += `   - Each meal: Food items, portions, macros per meal\n`;
	prompt += `   - Cooking instructions matching ${cooking_ability} skill level\n\n`;

	prompt += `3. MICRONUTRIENT HIGHLIGHTS\n`;
	prompt += `   - Which meals cover which micronutrients\n`;
	prompt += `   - Any gaps that need supplementation\n\n`;

	prompt += `4. SUPPLEMENT PROTOCOL (if beneficial)\n`;
	prompt += `   - Specific supplements with doses and timing\n`;
	prompt += `   - Purpose of each (performance, deficiency, health)\n`;
	prompt += `   - Interaction warnings with medications\n\n`;

	prompt += `5. GROCERY LIST\n`;
	prompt += `   - Organized by section (produce, protein, etc.)\n`;
	prompt += `   - Quantities for one week\n\n`;

	prompt += `6. SAFETY WARNINGS\n`;
	prompt += `   - Any medical contraindications\n`;
	prompt += `   - Foods to monitor/avoid\n`;
	prompt += `   - When to consult doctor\n\n`;

	prompt += `7. ADHERENCE TIPS\n`;
	prompt += `   - Meal prep strategy\n`;
	prompt += `   - Restaurant options if eating out frequently\n`;
	prompt += `   - How to adjust for social events\n\n`;

	prompt += `Be specific, practical, and safety-focused. This is medical-grade nutrition planning, not generic meal prep.`;

	return prompt;
}

export const generateWorkoutPlan = async (formData) => {
  const { goals, experience, equipment, frequency, duration, notes } = formData

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are an expert personal trainer and strength coach. Create detailed, evidence-based workout programs tailored to the client's goals, experience, and available equipment.`,
      messages: [{
        role: 'user',
        content: `Create a ${frequency}-day/week workout plan for the following client:

Goals: ${goals}
Experience Level: ${experience}
Equipment: ${equipment}
Session Duration: ${duration} minutes
${notes ? `Additional Notes: ${notes}` : ''}

Include: weekly schedule, exercises with sets/reps/rest, progression guidelines, and warm-up/cool-down recommendations.`
      }],
    }),
  })

  const data = await response.json()
  return data.content[0].text
}

export const conversationHistory = []

export const chatWithCoach = async (history, userMessage) => {
  const systemPrompt = `You are a knowledgeable fitness and nutrition coach. Help users with workout plans, meal guidance, exercise tips, recovery, and staying consistent with their fitness goals. Be concise, practical, and encouraging.`

  history.push({ role: 'user', content: userMessage })

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    }),
  })

  const data = await response.json()
  const reply = data.content[0].text
  history.push({ role: 'assistant', content: reply })
  return reply
}

export default { generateMealPlan, chatWithCoach, conversationHistory };

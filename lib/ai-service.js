// TribeFit AI Service using OpenRouter free models
// Falls back to EMERGENT_LLM_KEY (OpenAI-compatible) if OPENROUTER_API_KEY is not set

import OpenAI from 'openai';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Free OpenRouter models, tried in order on rate-limit/unavailable errors
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen3-235b-a22b:free',
];

// OpenRouter only. AI features are disabled (null client) when no key is set.
const openai = process.env.OPENROUTER_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        'X-Title': 'TribeFit',
      },
    })
  : null;
const usingOpenRouter = Boolean(openai);

export class TribeFitAIService {
  constructor(userId = 'default') {
    this.userId = userId;
    this.model = FREE_MODELS[0];
  }

  // Try each free model in order; fall through on rate limits or missing models
  async chat(messages, { max_tokens = 800, temperature = 0.7 } = {}) {
    if (!openai) throw new Error('AI features disabled: set OPENROUTER_API_KEY');
    let lastError;
    for (const model of FREE_MODELS) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages,
          max_tokens,
          temperature,
        });
        this.lastModel = model;
        return completion.choices[0].message.content.trim();
      } catch (error) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        if (status !== 429 && status !== 404 && status !== 503) throw error;
        console.warn(`OpenRouter model ${model} failed (${status}), trying next...`);
      }
    }
    throw lastError;
  }

  get modelLabel() {
    return `TribeFit AI Coach (${this.lastModel || this.model})`;
  }

  /**
   * Generate personalized workout plan based on user profile
   */
  async generateWorkoutPlan({ 
    fitnessGoals = 'General Fitness',
    availableTime = 30,
    equipment = ['Bodyweight'],
    experienceLevel = 'Beginner',
    limitations = 'None'
  }) {
    try {
      const prompt = `
You are an expert fitness coach for TribeFit, a social fitness app. Create a personalized workout plan with the following specifications:

User Profile:
- Fitness Goals: ${fitnessGoals}
- Available Time: ${availableTime} minutes per session
- Equipment Available: ${equipment.join(', ')}
- Experience Level: ${experienceLevel}
- Limitations/Injuries: ${limitations}

Create a structured workout plan with:
1. A clear workout title
2. Warm-up routine (5 minutes)
3. Main workout exercises with sets, reps, and rest periods
4. Cool-down routine (5 minutes)
5. Motivational tips for this specific workout

Format the response as a JSON object with the following structure:
{
  "title": "Workout Title",
  "duration": ${availableTime},
  "difficulty": "${experienceLevel}",
  "warmup": ["Exercise 1", "Exercise 2"],
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "12-15",
      "rest": "60 seconds",
      "description": "Form cues and tips",
      "targetMuscles": ["muscle1", "muscle2"]
    }
  ],
  "cooldown": ["Stretch 1", "Stretch 2"],
  "tips": ["Tip 1", "Tip 2"],
  "calories": 250
}

Make it engaging and tailored to their goals!`;

      const response = await this.chat([
        {
          role: 'system',
          content: 'You are TribeFit AI Coach, an expert fitness trainer who creates personalized, motivating workout plans. Always respond with valid JSON format.'
        },
        { role: 'user', content: prompt }
      ], { max_tokens: 1500, temperature: 0.7 });
      
      // Try to parse JSON response
      try {
        const workoutPlan = JSON.parse(response);
        workoutPlan.generated_by = this.modelLabel;
        workoutPlan.generated_at = new Date().toISOString();
        return workoutPlan;
      } catch (parseError) {
        // If JSON parsing fails, return a formatted text response
        return {
          title: `${experienceLevel} ${fitnessGoals} Workout`,
          duration: availableTime,
          difficulty: experienceLevel,
          content: response,
          generated_by: this.modelLabel,
          generated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('AI Workout Generation Error:', error);
      throw new Error('Failed to generate AI workout plan. Please try again.');
    }
  }

  /**
   * Get exercise form guidance and tips
   */
  async getExerciseGuidance(exerciseName) {
    try {
      const prompt = `
Provide detailed exercise guidance for: ${exerciseName}

Include:
1. Proper starting position
2. Step-by-step execution
3. Common mistakes to avoid
4. Breathing pattern
5. Target muscles
6. Beginner modifications
7. Advanced variations

Make it clear and actionable for TribeFit app users.`;

      const guidance = await this.chat([
        {
          role: 'system',
          content: 'You are a certified personal trainer providing clear, safe exercise instruction for the TribeFit fitness app.'
        },
        { role: 'user', content: prompt }
      ], { max_tokens: 800, temperature: 0.6 });

      return {
        exercise: exerciseName,
        guidance,
        generated_by: this.modelLabel,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Exercise Guidance Error:', error);
      throw new Error('Failed to get exercise guidance. Please try again.');
    }
  }

  /**
   * Generate motivational messages for fitness journey
   */
  async generateMotivation({ 
    userName = 'Warrior',
    goal = 'fitness',
    streakDays = 0,
    completionRate = 0 
  }) {
    try {
      const prompt = `
Generate a motivational message for ${userName} in the TribeFit app:

Context:
- Current goal: ${goal}
- Streak: ${streakDays} days
- Workout completion rate: ${completionRate}%

Create an encouraging, personalized message that:
1. Acknowledges their progress
2. Motivates them to continue
3. Uses fitness/tribal themes
4. Keeps it under 50 words
5. Makes it energetic and inspiring

Make it feel personal and powerful!`;

      const message = await this.chat([
        {
          role: 'system',
          content: 'You are a motivational fitness coach for TribeFit. Create inspiring, energetic messages that make people want to crush their workouts.'
        },
        { role: 'user', content: prompt }
      ], { max_tokens: 150, temperature: 0.8 });

      return {
        message,
        for_user: userName,
        generated_by: this.modelLabel,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Motivation Error:', error);
      throw new Error('Failed to generate motivation. Please try again.');
    }
  }

  /**
   * Answer fitness and nutrition questions
   */
  async answerFitnessQuestion(question) {
    try {
      const prompt = `
Answer this fitness question for a TribeFit app user: "${question}"

Provide:
1. Clear, accurate answer
2. Practical tips they can implement
3. Safety considerations if relevant
4. Encouraging tone

Keep it concise but comprehensive. Make it actionable for someone on their fitness journey.`;

      const answer = await this.chat([
        {
          role: 'system',
          content: 'You are a knowledgeable fitness coach and nutritionist for TribeFit. Provide accurate, practical advice with an encouraging tone.'
        },
        { role: 'user', content: prompt }
      ], { max_tokens: 600, temperature: 0.7 });

      return {
        question,
        answer,
        generated_by: this.modelLabel,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Q&A Error:', error);
      throw new Error('Failed to answer question. Please try again.');
    }
  }

  /**
   * Generate squad or tribe names and descriptions
   */
  async generateGroupDetails({ type = 'squad', theme = 'fitness', style = 'motivational' }) {
    try {
      const prompt = `
Generate a ${type} name and description for TribeFit:

Theme: ${theme}
Style: ${style}

Create:
1. An inspiring ${type} name (2-3 words)
2. A compelling description (1-2 sentences)
3. A motivational motto/tagline

Make it sound powerful and community-focused for fitness enthusiasts.`;

      const response = await this.chat([
        {
          role: 'system',
          content: 'You are a creative coach who creates inspiring names and descriptions for fitness groups in TribeFit app.'
        },
        { role: 'user', content: prompt }
      ], { max_tokens: 200, temperature: 0.9 });
      
      return {
        type,
        content: response,
        generated_by: this.modelLabel,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI Group Generation Error:', error);
      throw new Error('Failed to generate group details. Please try again.');
    }
  }
}

// Export singleton instance for easy use
export const tribeFitAI = new TribeFitAIService();

// Export individual functions for specific use cases
export async function generateAIWorkout(userProfile) {
  const ai = new TribeFitAIService(userProfile.userId);
  return ai.generateWorkoutPlan(userProfile);
}

export async function getAIExerciseGuidance(exerciseName, userId = 'default') {
  const ai = new TribeFitAIService(userId);
  return ai.getExerciseGuidance(exerciseName);
}

export async function getAIMotivation(userContext) {
  const ai = new TribeFitAIService(userContext.userId);
  return ai.generateMotivation(userContext);
}

export async function askAIFitnessQuestion(question, userId = 'default') {
  const ai = new TribeFitAIService(userId);
  return ai.answerFitnessQuestion(question);
}
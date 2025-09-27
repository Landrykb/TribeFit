// TribeFit AI Service using OpenAI GPT-4o-mini
// Integrated with Emergent LLM Key for seamless AI features

import OpenAI from 'openai';

// Initialize OpenAI with Emergent LLM key
const openai = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://api.openai.com/v1'
});

export class TribeFitAIService {
  constructor(userId = 'default') {
    this.userId = userId;
    this.model = 'gpt-4o-mini'; // Using GPT-4o-mini as requested
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

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are TribeFit AI Coach, an expert fitness trainer who creates personalized, motivating workout plans. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content.trim();
      
      // Try to parse JSON response
      try {
        const workoutPlan = JSON.parse(response);
        workoutPlan.generated_by = 'TribeFit AI Coach (GPT-4o-mini)';
        workoutPlan.generated_at = new Date().toISOString();
        return workoutPlan;
      } catch (parseError) {
        // If JSON parsing fails, return a formatted text response
        return {
          title: `${experienceLevel} ${fitnessGoals} Workout`,
          duration: availableTime,
          difficulty: experienceLevel,
          content: response,
          generated_by: 'TribeFit AI Coach (GPT-4o-mini)',
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

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a certified personal trainer providing clear, safe exercise instruction for the TribeFit fitness app.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      return {
        exercise: exerciseName,
        guidance: completion.choices[0].message.content.trim(),
        generated_by: 'TribeFit AI Coach (GPT-4o-mini)',
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

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a motivational fitness coach for TribeFit. Create inspiring, energetic messages that make people want to crush their workouts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      return {
        message: completion.choices[0].message.content.trim(),
        for_user: userName,
        generated_by: 'TribeFit AI Coach (GPT-4o-mini)',
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

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable fitness coach and nutritionist for TribeFit. Provide accurate, practical advice with an encouraging tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7
      });

      return {
        question,
        answer: completion.choices[0].message.content.trim(),
        generated_by: 'TribeFit AI Coach (GPT-4o-mini)',
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

      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a creative coach who creates inspiring names and descriptions for fitness groups in TribeFit app.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.9
      });

      const response = completion.choices[0].message.content.trim();
      
      return {
        type,
        content: response,
        generated_by: 'TribeFit AI Coach (GPT-4o-mini)',
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
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fitnessGoals, availableTime, equipment, experienceLevel, userId } = body;

    // Validate required fields
    if (!fitnessGoals || !availableTime || !equipment || !experienceLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use Emergent LLM key for AI generation
    const apiKey = process.env.EMERGENT_LLM_KEY;
    
    if (!apiKey) {
      console.error('EMERGENT_LLM_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }
    
    // Construct prompt for AI
    const prompt = `
Create a personalized workout plan with the following requirements:

FITNESS GOALS: ${fitnessGoals}
AVAILABLE TIME: ${availableTime} minutes per session
EQUIPMENT ACCESS: ${equipment}
EXPERIENCE LEVEL: ${experienceLevel}

Please provide a detailed weekly workout plan that includes:
1. A brief introduction explaining the benefits for these specific goals
2. A 7-day structured schedule with specific workout days and rest days
3. Detailed exercises for each day including:
   - Exercise names
   - Sets and reps (or time for cardio)
   - Rest periods between sets
   - Proper form cues
4. Warm-up routine (5-10 minutes)
5. Cool-down/stretching routine (5-10 minutes)
6. Weekly progression recommendations
7. Tips for nutrition and recovery

Format the response in a clear, organized way using markdown-style headers and bullet points.
Keep it practical and achievable for someone with ${experienceLevel} experience level.
    `;

    // Call OpenAI API through Emergent integration
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a certified personal trainer and fitness expert with 10+ years of experience. Create detailed, safe, and effective workout plans tailored to individual needs and goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const workoutPlan = data.choices[0].message.content;

    // Store the generated plan (in a real app, save to database)
    const planData = {
      id: `plan-${Date.now()}`,
      userId: userId || 'demo-user',
      goals: fitnessGoals,
      duration: availableTime,
      equipment,
      level: experienceLevel,
      content: workoutPlan,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      workoutPlan,
      planId: planData.id
    });
    
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return NextResponse.json(
      { error: `Failed to generate workout plan: ${error.message}` },
      { status: 500 }
    );
  }
}
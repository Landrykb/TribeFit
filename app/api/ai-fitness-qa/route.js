import { NextResponse } from 'next/server';
import { askAIFitnessQuestion } from '../../../lib/ai-service.js';

export async function POST(request) {
  try {
    const { question, userId } = await request.json();

    console.log('AI Fitness Q&A request:', { question, userId });

    // Validate required fields
    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Use GPT-4o-mini to answer fitness questions
    try {
      const aiResponse = await askAIFitnessQuestion(question, userId || 'default-user');
      
      console.log('AI Fitness Q&A response generated:', aiResponse);

      return NextResponse.json({ 
        success: true,
        question: aiResponse.question,
        answer: aiResponse.answer,
        generated_by: aiResponse.generated_by,
        generated_at: aiResponse.generated_at,
        message: 'Fitness question answered successfully by AI Coach'
      });

    } catch (aiError) {
      console.error('AI Q&A failed:', aiError);
      
      // Provide a helpful fallback response
      const fallbackAnswers = {
        'lose weight': 'To lose weight effectively: 1) Create a caloric deficit through diet and exercise, 2) Combine cardio and strength training, 3) Stay consistent with your routine, 4) Eat whole foods and control portions, 5) Get adequate sleep and manage stress.',
        'build muscle': 'For muscle building: 1) Follow a progressive overload training program, 2) Eat adequate protein (0.8-1g per lb bodyweight), 3) Get 7-9 hours of sleep for recovery, 4) Train each muscle group 2-3x per week, 5) Be consistent for at least 8-12 weeks.',
        'nutrition': 'Good nutrition basics: 1) Eat plenty of vegetables and fruits, 2) Include lean protein with each meal, 3) Choose whole grains over refined ones, 4) Stay hydrated with water, 5) Limit processed foods and added sugars.',
        'cardio': 'Effective cardio tips: 1) Mix moderate and high-intensity sessions, 2) Aim for 150+ minutes moderate or 75+ minutes vigorous per week, 3) Include activities you enjoy, 4) Start gradually and build up intensity, 5) Consider HIIT for time efficiency.',
        'strength': 'Strength training guidelines: 1) Focus on compound movements (squat, deadlift, push, pull), 2) Progressive overload is key, 3) 2-4 sets of 6-12 reps for most goals, 4) Rest 48+ hours between training same muscles, 5) Proper form beats heavy weight.'
      };
      
      const questionLower = question.toLowerCase();
      let fallbackAnswer = 'Great question! For personalized fitness advice, I recommend: 1) Consulting with a certified personal trainer, 2) Speaking with your healthcare provider, 3) Starting with basic movements and progressing gradually, 4) Focusing on consistency over perfection. Stay active and listen to your body!';
      
      // Find relevant fallback answer
      for (const [key, answer] of Object.entries(fallbackAnswers)) {
        if (questionLower.includes(key)) {
          fallbackAnswer = answer;
          break;
        }
      }
      
      return NextResponse.json({ 
        success: true,
        question: question,
        answer: fallbackAnswer,
        generated_by: 'TribeFit Fitness Knowledge Base',
        generated_at: new Date().toISOString(),
        message: 'Question answered using fitness knowledge base',
        note: 'AI temporarily unavailable - using curated fitness guidance'
      });
    }

  } catch (error) {
    console.error('Fitness Q&A error:', error);
    return NextResponse.json(
      { error: 'Failed to process fitness question' },
      { status: 500 }
    );
  }
}
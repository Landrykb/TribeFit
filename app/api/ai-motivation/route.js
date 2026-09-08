import { NextResponse } from 'next/server';
import { getAIMotivation } from '../../../lib/ai-service.js';

export async function POST(request) {
  try {
    const { userId, userName, goal, streakDays, completionRate } = await request.json();

    // Use GPT-4o-mini to generate personalized motivation
    const userContext = {
      userId: userId || 'default-user',
      userName: userName || 'Warrior',
      goal: goal || 'fitness excellence',
      streakDays: streakDays || 0,
      completionRate: completionRate || 0
    };

    try {
      const motivationResponse = await getAIMotivation(userContext);
      
      return NextResponse.json({ 
        success: true,
        message: motivationResponse.message,
        for_user: motivationResponse.for_user,
        generated_by: motivationResponse.generated_by,
        generated_at: motivationResponse.generated_at,
        context: {
          streak: streakDays,
          completion_rate: completionRate,
          goal: goal
        }
      });

    } catch (aiError) {
      console.error('AI Motivation failed:', aiError);
      
      // Provide motivational fallback messages based on context
      const fallbackMessages = {
        highStreak: [
          `🔥 ${streakDays} days strong! You're building an unstoppable habit, ${userName}!`,
          `💪 ${streakDays}-day streak? You're officially a fitness warrior! Keep dominating!`,
          `🏆 ${streakDays} days of consistency = champions mindset. Don't break the chain!`
        ],
        mediumStreak: [
          `💯 ${streakDays} days down! You're in the momentum zone, ${userName}. Keep pushing!`,
          `🚀 ${streakDays} days of showing up. That's the discipline of greatness right there!`,
          `⚡ ${streakDays} days strong! Your future self is already thanking you!`
        ],
        lowStreak: [
          `🌟 Every champion started with day 1. You're building something amazing, ${userName}!`,
          `💪 Progress isn't about perfection, it's about consistency. You've got this!`,
          `🔥 Small steps, big dreams. Each workout brings you closer to your goals!`
        ],
        restart: [
          `🎯 Fresh start, fresh energy! Today is perfect for crushing your ${goal} goals!`,
          `💪 Champions don't stay down. Time to show your tribe what you're made of!`,
          `⚡ New day, new opportunity to be stronger than yesterday!`
        ]
      };
      
      let messageCategory = 'restart';
      if (streakDays >= 7) messageCategory = 'highStreak';
      else if (streakDays >= 3) messageCategory = 'mediumStreak';
      else if (streakDays > 0) messageCategory = 'lowStreak';
      
      const messages = fallbackMessages[messageCategory];
      const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
      
      return NextResponse.json({ 
        success: true,
        message: selectedMessage,
        for_user: userName,
        generated_by: 'TribeFit Motivation Engine',
        generated_at: new Date().toISOString(),
        context: {
          streak: streakDays,
          completion_rate: completionRate,
          goal: goal
        },
        note: 'AI temporarily unavailable - using curated motivation system'
      });
    }

  } catch (error) {
    console.error('Motivation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate motivation' },
      { status: 500 }
    );
  }
}
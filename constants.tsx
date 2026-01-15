
import { Dosha, Question } from './types';

export const QUESTIONS: Question[] = [
  // 1. Skin Characteristics
  {
    id: 1,
    category: 'Skin Texture',
    text: 'How would you describe the general texture of your skin?',
    options: [
      { label: 'A', text: 'Naturally dry, thin, and can be rough', dosha: Dosha.VATA },
      { label: 'B', text: 'Oily, soft, and prone to redness or moles', dosha: Dosha.PITTA },
      { label: 'C', text: 'Thick, moist, smooth, and supple', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 2,
    category: 'Skin Temperature',
    text: 'How does your skin usually feel to the touch?',
    options: [
      { label: 'A', text: 'Cool or cold, especially hands and feet', dosha: Dosha.VATA },
      { label: 'B', text: 'Warm or hot most of the time', dosha: Dosha.PITTA },
      { label: 'C', text: 'Pleasantly cool or neutral', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 3,
    category: 'Skin Sensitivity',
    text: 'How sensitive is your skin to external factors?',
    options: [
      { label: 'A', text: 'Tends to crack, chap, or feel rough easily', dosha: Dosha.VATA },
      { label: 'B', text: 'Sensitive, prone to acne, rashes, or inflammation', dosha: Dosha.PITTA },
      { label: 'C', text: 'Relatively resilient and rarely reacts to external changes', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 4,
    category: 'Sweating Tendency',
    text: 'How much do you typically sweat during activity or heat?',
    options: [
      { label: 'A', text: 'Scant or very little sweating', dosha: Dosha.VATA },
      { label: 'B', text: 'Profuse or high amount of sweating', dosha: Dosha.PITTA },
      { label: 'C', text: 'Moderate but steady sweating', dosha: Dosha.KAPHA }
    ]
  },
  // 2. Hair
  {
    id: 5,
    category: 'Hair Texture',
    text: 'What is the natural texture of your hair?',
    options: [
      { label: 'A', text: 'Dry, brittle, frizzy, or curly', dosha: Dosha.VATA },
      { label: 'B', text: 'Fine, soft, oily, or straight', dosha: Dosha.PITTA },
      { label: 'C', text: 'Thick, oily, wavy, and lustrous', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 6,
    category: 'Hair Changes',
    text: 'Have you noticed any early hair loss or greying?',
    options: [
      { label: 'A', text: 'Moderate thinning or breakage over time', dosha: Dosha.VATA },
      { label: 'B', text: 'Early thinning, balding, or premature greying', dosha: Dosha.PITTA },
      { label: 'C', text: 'Very little hair loss or greying; hair remains thick', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 7,
    category: 'Scalp Condition',
    text: 'How would you describe your scalp health?',
    options: [
      { label: 'A', text: 'Prone to dryness and small flakes (dandruff)', dosha: Dosha.VATA },
      { label: 'B', text: 'Oily scalp with occasional redness or irritation', dosha: Dosha.PITTA },
      { label: 'C', text: 'Normal to oily, healthy and thick', dosha: Dosha.KAPHA }
    ]
  },
  // 3. Body structure
  {
    id: 8,
    category: 'Body Frame',
    text: 'How would you describe your overall physical frame?',
    options: [
      { label: 'A', text: 'Thin, tall, or very short; petite frame', dosha: Dosha.VATA },
      { label: 'B', text: 'Medium build; balanced proportions', dosha: Dosha.PITTA },
      { label: 'C', text: 'Large, broad, or stout frame', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 9,
    category: 'Weight Stability',
    text: 'How easily does your weight fluctuate?',
    options: [
      { label: 'A', text: 'Difficult to gain weight; varies frequently', dosha: Dosha.VATA },
      { label: 'B', text: 'Stable weight; can gain or lose with effort', dosha: Dosha.PITTA },
      { label: 'C', text: 'Gains weight easily and finds it hard to lose', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 10,
    category: 'Muscle Development',
    text: 'How is your natural muscle tone and development?',
    options: [
      { label: 'A', text: 'Poorly developed; joints may be prominent', dosha: Dosha.VATA },
      { label: 'B', text: 'Moderate development; flexible and defined', dosha: Dosha.PITTA },
      { label: 'C', text: 'Well-developed; sturdy and firm', dosha: Dosha.KAPHA }
    ]
  },
  // 4. Digestion
  {
    id: 11,
    category: 'Appetite Strength',
    text: 'How would you describe your appetite?',
    options: [
      { label: 'A', text: 'Irregular; sometimes very hungry, sometimes not at all', dosha: Dosha.VATA },
      { label: 'B', text: 'Strong and sharp; cannot skip meals', dosha: Dosha.PITTA },
      { label: 'C', text: 'Mild and constant; can comfortably skip meals', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 12,
    category: 'Digestion Speed',
    text: 'How fast do you digest your food?',
    options: [
      { label: 'A', text: 'Unpredictable; sometimes fast, often gassy or bloated', dosha: Dosha.VATA },
      { label: 'B', text: 'Fast digestion; hunger returns quickly', dosha: Dosha.PITTA },
      { label: 'C', text: 'Slow digestion; feel heavy for a long time after eating', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 13,
    category: 'Food Preference',
    text: 'What type of food do you naturally crave or prefer?',
    options: [
      { label: 'A', text: 'Warm, cooked, and oily/moist foods', dosha: Dosha.VATA },
      { label: 'B', text: 'Cooling, refreshing, and sweet foods', dosha: Dosha.PITTA },
      { label: 'C', text: 'Light, dry, and spicy foods', dosha: Dosha.KAPHA }
    ]
  },
  // 5. Elimination
  {
    id: 14,
    category: 'Bowel Regularity',
    text: 'How regular are your bowel movements?',
    options: [
      { label: 'A', text: 'Irregular or prone to constipation', dosha: Dosha.VATA },
      { label: 'B', text: 'Regular and frequent; sometimes loose', dosha: Dosha.PITTA },
      { label: 'C', text: 'Regular but slow; once a day usually', dosha: Dosha.KAPHA }
    ]
  },
  // 6. Energy
  {
    id: 15,
    category: 'Daily Energy',
    text: 'How is your energy level throughout the day?',
    options: [
      { label: 'A', text: 'Fluctuating; comes in bursts, tires easily', dosha: Dosha.VATA },
      { label: 'B', text: 'Intense and focused; high endurance', dosha: Dosha.PITTA },
      { label: 'C', text: 'Steady and consistent; slow to start but long-lasting', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 16,
    category: 'Activity Preference',
    text: 'What is your preferred pace for daily activities?',
    options: [
      { label: 'A', text: 'Fast-paced, always moving and doing multiple things', dosha: Dosha.VATA },
      { label: 'B', text: 'Goal-oriented, competitive, and disciplined', dosha: Dosha.PITTA },
      { label: 'C', text: 'Relaxed, calm, and methodical', dosha: Dosha.KAPHA }
    ]
  },
  // 7. Sleep
  {
    id: 17,
    category: 'Sleep Pattern',
    text: 'How do you describe your typical sleep?',
    options: [
      { label: 'A', text: 'Light, interrupted, or short duration', dosha: Dosha.VATA },
      { label: 'B', text: 'Moderate duration; sound sleep', dosha: Dosha.PITTA },
      { label: 'C', text: 'Deep, heavy, and long duration; hard to wake up', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 18,
    category: 'Dream Activity',
    text: 'What kind of dreams do you usually have?',
    options: [
      { label: 'A', text: 'Frequent dreams of flying, running, or movement', dosha: Dosha.VATA },
      { label: 'B', text: 'Vivid, intense, or fiery dreams', dosha: Dosha.PITTA },
      { label: 'C', text: 'Few dreams; usually peaceful or watery', dosha: Dosha.KAPHA }
    ]
  },
  // 8. Climate
  {
    id: 19,
    category: 'Climate Preference',
    text: 'Which climate do you find most uncomfortable?',
    options: [
      { label: 'A', text: 'Cold and windy weather', dosha: Dosha.VATA },
      { label: 'B', text: 'Hot and sunny weather', dosha: Dosha.PITTA },
      { label: 'C', text: 'Cold and damp/rainy weather', dosha: Dosha.KAPHA }
    ]
  },
  // 9. Hydration
  {
    id: 20,
    category: 'Thirst Frequency',
    text: 'How often do you feel thirsty?',
    options: [
      { label: 'A', text: 'Varies; sometimes very thirsty, other times forget to drink', dosha: Dosha.VATA },
      { label: 'B', text: 'Frequent thirst; need water regularly', dosha: Dosha.PITTA },
      { label: 'C', text: 'Rarely thirsty; can go long periods without water', dosha: Dosha.KAPHA }
    ]
  },
  // 10. Emotional
  {
    id: 21,
    category: 'Stress Response',
    text: 'How do you typically react to stress?',
    options: [
      { label: 'A', text: 'Anxiety, worry, or fear', dosha: Dosha.VATA },
      { label: 'B', text: 'Irritability, anger, or impatience', dosha: Dosha.PITTA },
      { label: 'C', text: 'Withdrawal, sadness, or stubbornness', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 22,
    category: 'Mood Stability',
    text: 'How would you describe your general mood?',
    options: [
      { label: 'A', text: 'Changeable and spontaneous', dosha: Dosha.VATA },
      { label: 'B', text: 'Sharp, intense, and purposeful', dosha: Dosha.PITTA },
      { label: 'C', text: 'Calm, steady, and forgiving', dosha: Dosha.KAPHA }
    ]
  },
  // 11. Cognitive
  {
    id: 23,
    category: 'Learning Style',
    text: 'How do you learn and remember information?',
    options: [
      { label: 'A', text: 'Learn quickly but forget quickly', dosha: Dosha.VATA },
      { label: 'B', text: 'Sharp memory; focused and analytical', dosha: Dosha.PITTA },
      { label: 'C', text: 'Learn slowly but never forget', dosha: Dosha.KAPHA }
    ]
  },
  {
    id: 24,
    category: 'Decision-Making',
    text: 'How do you usually make decisions?',
    options: [
      { label: 'A', text: 'Indecisive or change mind frequently', dosha: Dosha.VATA },
      { label: 'B', text: 'Decisive and firm', dosha: Dosha.PITTA },
      { label: 'C', text: 'Deliberate, slow, and careful', dosha: Dosha.KAPHA }
    ]
  },
  // 12. Social
  {
    id: 25,
    category: 'Speech Pattern',
    text: 'What is your typical way of speaking?',
    options: [
      { label: 'A', text: 'Fast, talkative, and sometimes scattered', dosha: Dosha.VATA },
      { label: 'B', text: 'Sharp, precise, and authoritative', dosha: Dosha.PITTA },
      { label: 'C', text: 'Slow, melodious, and thoughtful', dosha: Dosha.KAPHA }
    ]
  }
];

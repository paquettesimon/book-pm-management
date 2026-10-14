/**
 * Curated workout catalog for the schedule-aware workout planner.
 * Each workout has a known estimated duration so the recommendation
 * engine can match it against the student's available time window.
 *
 * Categories: strength, cardio, flexibility, quick — to cover different
 * preferences and time budgets. No medical claims; these are general
 * fitness suggestions.
 */

const WORKOUTS = [
  {
    id: 'quick-stretch',
    name: 'Desk & Dorm Stretch',
    category: 'flexibility',
    durationMin: 10,
    intensity: 'low',
    location: 'home',
    activities: ['Neck rolls', 'Shoulder stretches', 'Hip openers', 'Hamstring stretch', 'Deep breathing'],
    description: 'A gentle full-body stretch routine you can do between classes.',
  },
  {
    id: 'express-hiit',
    name: 'Express HIIT',
    category: 'cardio',
    durationMin: 15,
    intensity: 'high',
    location: 'home',
    activities: ['Jumping jacks', 'High knees', 'Burpees', 'Mountain climbers', 'Plank hold'],
    description: 'A fast, high-intensity circuit to get your heart rate up in 15 minutes.',
  },
  {
    id: 'core-circuit',
    name: 'Core Circuit',
    category: 'strength',
    durationMin: 20,
    intensity: 'medium',
    location: 'home',
    activities: ['Plank', 'Bicycle crunches', 'Russian twists', 'Leg raises', 'Side plank'],
    description: 'Target your core with a bodyweight circuit — no equipment needed.',
  },
  {
    id: 'walk-campus',
    name: 'Campus Power Walk',
    category: 'cardio',
    durationMin: 25,
    intensity: 'low',
    location: 'outdoor',
    activities: ['Brisk walking', 'Stair climbing', 'Posture check', 'Breath pacing'],
    description: 'A brisk walk around campus — a great way to clear your head between study sessions.',
  },
  {
    id: 'bodyweight-strength',
    name: 'Bodyweight Strength',
    category: 'strength',
    durationMin: 30,
    intensity: 'medium',
    location: 'home',
    activities: ['Squats', 'Push-ups', 'Lunges', 'Glute bridges', 'Plank variations'],
    description: 'A full-body strength session using just your body weight.',
  },
  {
    id: 'yoga-flow',
    name: 'Vinyasa Yoga Flow',
    category: 'flexibility',
    durationMin: 30,
    intensity: 'low',
    location: 'home',
    activities: ['Sun salutations', 'Warrior poses', 'Balance flow', 'Cool-down', 'Meditation'],
    description: 'A flowing yoga sequence to build flexibility and calm your mind.',
  },
  {
    id: 'run-intervals',
    name: 'Interval Run',
    category: 'cardio',
    durationMin: 30,
    intensity: 'high',
    location: 'outdoor',
    activities: ['Warm-up jog', 'Sprint intervals', 'Recovery jog', 'Cool-down walk'],
    description: 'A structured interval run to build endurance in 30 minutes.',
  },
  {
    id: 'gym-strength',
    name: 'Gym Strength Session',
    category: 'strength',
    durationMin: 45,
    intensity: 'high',
    location: 'gym',
    activities: ['Dumbbell rows', 'Bench press', 'Deadlifts', 'Overhead press', 'Core finisher'],
    description: 'A compound-lift strength session for the gym — bring your campus gym pass.',
  },
  {
    id: 'long-run',
    name: 'Endurance Run',
    category: 'cardio',
    durationMin: 45,
    intensity: 'high',
    location: 'outdoor',
    activities: ['Warm-up', 'Steady-state run', 'Tempo push', 'Cool-down', 'Stretch'],
    description: 'A longer steady-state run to build aerobic endurance.',
  },
  {
    id: 'full-circuit',
    name: 'Full-Body Circuit Training',
    category: 'strength',
    durationMin: 45,
    intensity: 'high',
    location: 'gym',
    activities: ['Kettlebell swings', 'Box jumps', 'Rowing', 'Battle ropes', 'Core circuit'],
    description: 'A high-energy circuit mixing strength and cardio at the gym.',
  },
  {
    id: 'long-yoga',
    name: 'Deep Yoga & Mobility',
    category: 'flexibility',
    durationMin: 45,
    intensity: 'medium',
    location: 'home',
    activities: ['Extended warm-up', 'Deep stretch sequence', 'Balance work', 'Meditation', 'Breathwork'],
    description: 'A longer yoga and mobility session to recover and de-stress.',
  },
  {
    id: 'swim',
    name: 'Pool Swim',
    category: 'cardio',
    durationMin: 45,
    intensity: 'medium',
    location: 'gym',
    activities: ['Warm-up laps', 'Freestyle sets', 'Kick drills', 'Cool-down laps'],
    description: 'A structured swim workout at the campus pool — low impact, full body.',
  },
];

export const CATEGORIES = [
  { value: 'any', label: 'Any' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
];

export const INTENSITY_PREFS = [
  { value: 'any', label: 'Any intensity' },
  { value: 'low', label: 'Low intensity' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High intensity' },
];

export const LOCATION_PREFS = [
  { value: 'any', label: 'Anywhere' },
  { value: 'home', label: 'Home / Dorm' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'gym', label: 'Gym' },
];

export default WORKOUTS;

/**
 * Pre-built Event Templates
 * 30 production-ready templates for common team engagement scenarios
 */

export const PREMADE_TEMPLATES = [
  // ===== TEAM BUILDING (6) =====
  {
    name: "Team Trivia Challenge",
    description: "Interactive trivia game with multiple rounds, real-time scoring, and team competition",
    category: "team_building",
    icon: "🎯",
    default_duration_minutes: 45,
    default_max_participants: 50,
    template_type: "trivia_game",
    description_draft: "Join us for an exciting team trivia challenge! Test your knowledge across various categories while competing for the top spot on the leaderboard.",
    agenda: [
      { title: "Welcome & Team Formation", duration_minutes: 5, description: "Form teams and explain rules" },
      { title: "Round 1: General Knowledge", duration_minutes: 8, description: "10 questions, 30 seconds each" },
      { title: "Round 2: Company Trivia", duration_minutes: 8, description: "Questions about our company" },
      { title: "Round 3: Pop Culture", duration_minutes: 8, description: "Movies, music, and trends" },
      { title: "Lightning Round", duration_minutes: 8, description: "Quick-fire bonus questions" },
      { title: "Results & Awards", duration_minutes: 8, description: "Announce winners and celebrate" }
    ],
    icebreakers: [
      { title: "Two Truths and a Lie", duration_minutes: 5, description: "Each team shares one fact about themselves" }
    ],
    materials_needed: ["Trivia questions", "Scorecard", "Timer", "Prize announcements"],
    facilitator_tips: [
      "Keep energy high between rounds",
      "Have backup questions ready",
      "Encourage team discussion during answers",
      "Celebrate creative wrong answers"
    ],
    game_config: {
      type: "trivia",
      rounds: 4,
      questions_per_round: 10,
      time_per_question: 30,
      categories: ["general", "company", "pop_culture", "lightning"]
    }
  },
  {
    name: "Virtual Escape Room",
    description: "Collaborative puzzle-solving adventure where teams work together to 'escape'",
    category: "team_building",
    icon: "🔐",
    default_duration_minutes: 60,
    default_max_participants: 30,
    template_type: "escape_room",
    description_draft: "Work together to solve puzzles, find clues, and escape before time runs out! This virtual escape room tests your team's communication and problem-solving skills.",
    agenda: [
      { title: "Introduction & Story Setup", duration_minutes: 5, description: "Set the scene and explain mechanics" },
      { title: "Puzzle Phase 1", duration_minutes: 15, description: "Initial clues and puzzles" },
      { title: "Puzzle Phase 2", duration_minutes: 15, description: "Intermediate challenges" },
      { title: "Final Puzzle", duration_minutes: 15, description: "Ultimate escape challenge" },
      { title: "Debrief & Reflection", duration_minutes: 10, description: "Discuss teamwork insights" }
    ],
    materials_needed: ["Puzzle assets", "Timer", "Hint system", "Virtual room graphics"],
    facilitator_tips: [
      "Monitor team progress and provide hints if stuck",
      "Keep background music for atmosphere",
      "Celebrate breakthroughs loudly"
    ],
    game_config: {
      type: "escape_room",
      puzzles: 5,
      hints_allowed: 3,
      time_limit_minutes: 45
    }
  },
  {
    name: "Creative Caption Contest",
    description: "Hilarious photo caption competition with voting and prizes",
    category: "team_building",
    icon: "📸",
    default_duration_minutes: 30,
    default_max_participants: 100,
    template_type: "caption_contest",
    description_draft: "Get ready to unleash your wit! We'll show funny images and you'll compete to write the best captions. Voting determines the winners!",
    agenda: [
      { title: "Rules Explanation", duration_minutes: 3, description: "How captions and voting work" },
      { title: "Round 1-3", duration_minutes: 15, description: "3 images, 3 minutes each for captions" },
      { title: "Voting", duration_minutes: 7, description: "Vote on favorite captions" },
      { title: "Winners & Best Of", duration_minutes: 5, description: "Announce winners and share highlights" }
    ],
    materials_needed: ["Funny images", "Submission system", "Voting mechanism"],
    game_config: {
      type: "caption_contest",
      rounds: 3,
      time_per_image: 180,
      voting_time: 60
    }
  },
  {
    name: "Virtual Scavenger Hunt",
    description: "Race to find household items and complete fun challenges",
    category: "team_building",
    icon: "🔍",
    default_duration_minutes: 30,
    default_max_participants: 50,
    template_type: "scavenger_hunt",
    description_draft: "Ready, set, hunt! Find items around your home, complete challenges, and race against other teams for points!",
    agenda: [
      { title: "Rules & Team Setup", duration_minutes: 3, description: "Explain scoring and challenges" },
      { title: "Hunt Rounds", duration_minutes: 20, description: "10 items/challenges, 2 min each" },
      { title: "Results & Highlights", duration_minutes: 7, description: "Show funniest finds and winners" }
    ],
    game_config: {
      type: "scavenger_hunt",
      challenges: 10,
      time_per_challenge: 120
    }
  },
  {
    name: "Team Pictionary Battle",
    description: "Drawing and guessing game with real-time collaboration",
    category: "team_building",
    icon: "🎨",
    default_duration_minutes: 40,
    default_max_participants: 40,
    template_type: "pictionary",
    description_draft: "Grab your drawing tools! Teams take turns drawing while others guess. Points for speed and creativity!",
    agenda: [
      { title: "Setup & Teams", duration_minutes: 5, description: "Form teams and explain rules" },
      { title: "Drawing Rounds", duration_minutes: 30, description: "Multiple rounds of drawing and guessing" },
      { title: "Final Scores", duration_minutes: 5, description: "Announce winners" }
    ],
    game_config: {
      type: "pictionary",
      rounds_per_team: 3,
      time_per_drawing: 60
    }
  },
  {
    name: "Bingo Night",
    description: "Classic bingo with custom cards and exciting prizes",
    category: "team_building",
    icon: "🎱",
    default_duration_minutes: 45,
    default_max_participants: 100,
    template_type: "bingo",
    description_draft: "B-I-N-G-O! Join us for classic bingo with custom company-themed cards and great prizes!",
    agenda: [
      { title: "Card Distribution", duration_minutes: 5, description: "Get your bingo cards" },
      { title: "Bingo Rounds", duration_minutes: 35, description: "Multiple games with different patterns" },
      { title: "Prizes & Wrap-up", duration_minutes: 5, description: "Award prizes to winners" }
    ],
    game_config: {
      type: "bingo",
      patterns: ["line", "four_corners", "blackout"],
      cards_per_player: 2
    }
  },

  // ===== SOCIAL (5) =====
  {
    name: "Virtual Happy Hour",
    description: "Casual social gathering with conversation starters and optional games",
    category: "social",
    icon: "🍻",
    default_duration_minutes: 60,
    default_max_participants: 30,
    template_type: "social_hangout",
    description_draft: "Grab your favorite beverage and join us for a casual hangout! We'll have conversation starters, optional mini-games, and plenty of time to catch up.",
    agenda: [
      { title: "Welcome & Cheers", duration_minutes: 5, description: "Toast to the team" },
      { title: "Conversation Rounds", duration_minutes: 30, description: "Rotating breakout rooms" },
      { title: "Optional Game", duration_minutes: 20, description: "Fun group activity" },
      { title: "Open Social", duration_minutes: 5, description: "Free chat time" }
    ],
    icebreakers: [
      { title: "Show Your Drink", duration_minutes: 3, description: "Everyone shows what they're drinking" },
      { title: "Weekend Plans", duration_minutes: 5, description: "Share upcoming weekend activities" }
    ]
  },
  {
    name: "Show & Tell",
    description: "Share hobbies, pets, collections, or interesting items from home",
    category: "social",
    icon: "🌟",
    default_duration_minutes: 45,
    default_max_participants: 20,
    template_type: "show_and_tell",
    description_draft: "What makes you unique? Bring something special to share with the team - a hobby project, pet, collection, or anything that tells your story!",
    agenda: [
      { title: "Introduction", duration_minutes: 5, description: "Explain format and sign up" },
      { title: "Presentations", duration_minutes: 35, description: "3-5 min per person" },
      { title: "Q&A & Wrap-up", duration_minutes: 5, description: "Final questions and appreciation" }
    ]
  },
  {
    name: "Virtual Coffee Chat",
    description: "Randomly paired 1-on-1 conversations to build connections",
    category: "social",
    icon: "☕",
    default_duration_minutes: 30,
    default_max_participants: 50,
    template_type: "coffee_chat",
    description_draft: "Get paired with a random colleague for a casual coffee chat. Great for meeting people outside your usual team!",
    agenda: [
      { title: "Pairing & Topics", duration_minutes: 3, description: "Get your partner and conversation starters" },
      { title: "Chat Session", duration_minutes: 25, description: "1-on-1 conversation" },
      { title: "Share Highlights", duration_minutes: 2, description: "Optional: share something interesting you learned" }
    ],
    icebreakers: [
      { title: "Current Obsession", duration_minutes: 2, description: "What are you really into lately?" },
      { title: "Bucket List Item", duration_minutes: 2, description: "Share one thing on your bucket list" }
    ]
  },
  {
    name: "Pet Parade",
    description: "Show off your furry, scaly, or feathery friends",
    category: "social",
    icon: "🐾",
    default_duration_minutes: 30,
    default_max_participants: 30,
    template_type: "pet_show",
    description_draft: "It's a pet parade! Introduce your animal companions to the team. No pet? Show us your plants or stuffed animals!",
    agenda: [
      { title: "Pet Introductions", duration_minutes: 25, description: "Everyone shows their pets" },
      { title: "Awards", duration_minutes: 5, description: "Fun categories: cutest, silliest, etc." }
    ]
  },
  {
    name: "Recipe Exchange",
    description: "Share and discover favorite recipes from teammates",
    category: "social",
    icon: "🍳",
    default_duration_minutes: 45,
    default_max_participants: 25,
    template_type: "recipe_exchange",
    description_draft: "Bring a recipe to share! Whether it's a family secret or a recent discovery, let's build our team cookbook together.",
    agenda: [
      { title: "Recipe Presentations", duration_minutes: 35, description: "Share your recipe and story" },
      { title: "Q&A & Tips", duration_minutes: 5, description: "Ask questions and share tips" },
      { title: "Compilation", duration_minutes: 5, description: "How to access the team cookbook" }
    ]
  },

  // ===== WELLNESS (5) =====
  {
    name: "Guided Meditation",
    description: "10-15 minute guided meditation for stress relief and focus",
    category: "wellness",
    icon: "🧘",
    default_duration_minutes: 20,
    default_max_participants: 100,
    template_type: "meditation",
    description_draft: "Take a mindful break with a guided meditation session. Perfect for resetting your energy and finding calm.",
    agenda: [
      { title: "Settling In", duration_minutes: 3, description: "Get comfortable and prepare" },
      { title: "Guided Meditation", duration_minutes: 12, description: "Follow along with the guide" },
      { title: "Gentle Return", duration_minutes: 5, description: "Slowly return and share reflections" }
    ]
  },
  {
    name: "Desk Yoga Session",
    description: "Gentle stretches you can do at your desk",
    category: "wellness",
    icon: "🧎",
    default_duration_minutes: 15,
    default_max_participants: 100,
    template_type: "yoga",
    description_draft: "Release tension with simple stretches designed for desk workers. No equipment needed - just you and your chair!",
    agenda: [
      { title: "Warm-up", duration_minutes: 3, description: "Gentle movements to start" },
      { title: "Stretches", duration_minutes: 10, description: "Guided desk-friendly stretches" },
      { title: "Cool Down", duration_minutes: 2, description: "Final relaxation" }
    ]
  },
  {
    name: "Gratitude Circle",
    description: "Share what you're grateful for and boost positivity",
    category: "wellness",
    icon: "🙏",
    default_duration_minutes: 20,
    default_max_participants: 20,
    template_type: "gratitude",
    description_draft: "Start the day with positivity! Share what you're grateful for and hear inspiring moments from colleagues.",
    agenda: [
      { title: "Introduction", duration_minutes: 2, description: "Set the tone" },
      { title: "Sharing Round", duration_minutes: 15, description: "Each person shares gratitude" },
      { title: "Closing Reflection", duration_minutes: 3, description: "Group appreciation" }
    ]
  },
  {
    name: "Mindful Walking Break",
    description: "Guided outdoor or indoor walking meditation",
    category: "wellness",
    icon: "🚶",
    default_duration_minutes: 15,
    default_max_participants: 50,
    template_type: "walking",
    description_draft: "Step away from your screen for a mindful walking break. Works indoors or outdoors!",
    agenda: [
      { title: "Preparation", duration_minutes: 2, description: "Get ready to walk" },
      { title: "Guided Walk", duration_minutes: 10, description: "Follow the audio guide" },
      { title: "Return & Reflect", duration_minutes: 3, description: "Share your experience" }
    ]
  },
  {
    name: "Breathing Exercises",
    description: "Quick breathwork for stress relief and energy",
    category: "wellness",
    icon: "💨",
    default_duration_minutes: 10,
    default_max_participants: 100,
    template_type: "breathing",
    description_draft: "Learn and practice breathing techniques that can help you manage stress anytime, anywhere.",
    agenda: [
      { title: "Intro to Breathwork", duration_minutes: 2, description: "Why breathing matters" },
      { title: "Practice Techniques", duration_minutes: 6, description: "3 different breathing exercises" },
      { title: "Wrap-up", duration_minutes: 2, description: "Tips for daily practice" }
    ]
  },

  // ===== WORKSHOP (4) =====
  {
    name: "Brainstorming Session",
    description: "Structured ideation workshop for problem-solving",
    category: "workshop",
    icon: "💡",
    default_duration_minutes: 60,
    default_max_participants: 20,
    template_type: "brainstorm",
    description_draft: "Got a challenge to solve? Let's brainstorm together using proven ideation techniques to generate innovative solutions.",
    agenda: [
      { title: "Problem Definition", duration_minutes: 10, description: "Clarify the challenge" },
      { title: "Individual Ideation", duration_minutes: 10, description: "Silent brainstorming" },
      { title: "Group Sharing", duration_minutes: 20, description: "Present and build on ideas" },
      { title: "Voting & Prioritization", duration_minutes: 15, description: "Select top ideas" },
      { title: "Next Steps", duration_minutes: 5, description: "Action planning" }
    ]
  },
  {
    name: "Feedback Workshop",
    description: "Practice giving and receiving constructive feedback",
    category: "workshop",
    icon: "💬",
    default_duration_minutes: 45,
    default_max_participants: 16,
    template_type: "feedback_workshop",
    description_draft: "Master the art of feedback! Learn frameworks for giving helpful feedback and receiving it gracefully.",
    agenda: [
      { title: "Feedback Frameworks", duration_minutes: 10, description: "Learn the SBI model" },
      { title: "Practice Rounds", duration_minutes: 25, description: "Role-play scenarios" },
      { title: "Debrief", duration_minutes: 10, description: "Discuss learnings" }
    ]
  },
  {
    name: "Design Thinking Sprint",
    description: "Rapid prototyping and user-centered problem solving",
    category: "workshop",
    icon: "🎯",
    default_duration_minutes: 90,
    default_max_participants: 20,
    template_type: "design_sprint",
    description_draft: "Apply design thinking methodology to tackle a real challenge. Empathize, define, ideate, prototype, and test!",
    agenda: [
      { title: "Empathize", duration_minutes: 15, description: "Understand the user" },
      { title: "Define", duration_minutes: 15, description: "Frame the problem" },
      { title: "Ideate", duration_minutes: 20, description: "Generate solutions" },
      { title: "Prototype", duration_minutes: 25, description: "Build quick mockups" },
      { title: "Test & Feedback", duration_minutes: 15, description: "Get reactions" }
    ]
  },
  {
    name: "Retrospective",
    description: "Team reflection on what's working and what to improve",
    category: "workshop",
    icon: "🔄",
    default_duration_minutes: 45,
    default_max_participants: 15,
    template_type: "retrospective",
    description_draft: "Let's reflect on our recent work! What went well, what could improve, and what should we try next?",
    agenda: [
      { title: "Set the Stage", duration_minutes: 5, description: "Create safety and focus" },
      { title: "Gather Data", duration_minutes: 10, description: "What happened?" },
      { title: "Generate Insights", duration_minutes: 15, description: "What does it mean?" },
      { title: "Decide Actions", duration_minutes: 10, description: "What will we do?" },
      { title: "Close", duration_minutes: 5, description: "Appreciate and commit" }
    ]
  },

  // ===== TRAINING (4) =====
  {
    name: "Tool Tutorial",
    description: "Learn a new software tool or feature together",
    category: "training",
    icon: "🛠️",
    default_duration_minutes: 45,
    default_max_participants: 30,
    template_type: "tutorial",
    description_draft: "Level up your skills! Join this hands-on tutorial to learn a new tool that will boost your productivity.",
    agenda: [
      { title: "Tool Overview", duration_minutes: 10, description: "What and why" },
      { title: "Live Demo", duration_minutes: 15, description: "Watch how it works" },
      { title: "Hands-on Practice", duration_minutes: 15, description: "Try it yourself" },
      { title: "Q&A", duration_minutes: 5, description: "Get your questions answered" }
    ]
  },
  {
    name: "Lunch & Learn",
    description: "Informal learning session over lunch",
    category: "training",
    icon: "🍕",
    default_duration_minutes: 45,
    default_max_participants: 50,
    template_type: "lunch_learn",
    description_draft: "Grab your lunch and join us for an informal learning session! A team member will share their expertise.",
    agenda: [
      { title: "Introduction", duration_minutes: 5, description: "Meet the presenter" },
      { title: "Presentation", duration_minutes: 25, description: "Main content" },
      { title: "Discussion", duration_minutes: 15, description: "Questions and conversation" }
    ]
  },
  {
    name: "Skill Share",
    description: "Team members teach each other new skills",
    category: "training",
    icon: "🎓",
    default_duration_minutes: 30,
    default_max_participants: 25,
    template_type: "skill_share",
    description_draft: "Everyone has something to teach! Join us as team members share their unique skills and knowledge.",
    agenda: [
      { title: "Mini Sessions", duration_minutes: 25, description: "3 x 8-min skill shares" },
      { title: "Networking", duration_minutes: 5, description: "Connect with presenters" }
    ]
  },
  {
    name: "Onboarding Buddy Session",
    description: "New hire orientation and Q&A with their buddy",
    category: "training",
    icon: "🤝",
    default_duration_minutes: 30,
    default_max_participants: 2,
    template_type: "onboarding_buddy",
    description_draft: "Welcome! Connect with your onboarding buddy to learn the ropes and get your questions answered.",
    agenda: [
      { title: "Introductions", duration_minutes: 5, description: "Get to know each other" },
      { title: "Company Overview", duration_minutes: 10, description: "Culture and expectations" },
      { title: "Tools & Resources", duration_minutes: 10, description: "Essential systems" },
      { title: "Q&A", duration_minutes: 5, description: "Any questions?" }
    ]
  },

  // ===== MEETING (4) =====
  {
    name: "All-Hands Meeting",
    description: "Company-wide update and Q&A session",
    category: "meeting",
    icon: "🏢",
    default_duration_minutes: 60,
    default_max_participants: 500,
    template_type: "all_hands",
    description_draft: "Join the entire company for updates, celebrations, and Q&A with leadership.",
    agenda: [
      { title: "Welcome & Wins", duration_minutes: 10, description: "Celebrate achievements" },
      { title: "Business Update", duration_minutes: 20, description: "Key metrics and news" },
      { title: "Team Spotlights", duration_minutes: 15, description: "Featured projects" },
      { title: "Q&A", duration_minutes: 15, description: "Ask leadership anything" }
    ]
  },
  {
    name: "Team Standup",
    description: "Quick daily sync to align on priorities",
    category: "meeting",
    icon: "🌅",
    default_duration_minutes: 15,
    default_max_participants: 15,
    template_type: "standup",
    description_draft: "Quick daily check-in: What did you do? What will you do? Any blockers?",
    agenda: [
      { title: "Round Robin Updates", duration_minutes: 12, description: "1 min per person" },
      { title: "Blockers Discussion", duration_minutes: 3, description: "Address any issues" }
    ]
  },
  {
    name: "Sprint Planning",
    description: "Plan work for the upcoming sprint",
    category: "meeting",
    icon: "📋",
    default_duration_minutes: 90,
    default_max_participants: 12,
    template_type: "sprint_planning",
    description_draft: "Plan our upcoming sprint! Review the backlog, estimate work, and commit to deliverables.",
    agenda: [
      { title: "Sprint Goal", duration_minutes: 10, description: "Define the objective" },
      { title: "Backlog Review", duration_minutes: 30, description: "Discuss items" },
      { title: "Estimation", duration_minutes: 30, description: "Size the work" },
      { title: "Commitment", duration_minutes: 20, description: "Finalize sprint scope" }
    ]
  },
  {
    name: "1-on-1 Check-in",
    description: "Manager and direct report touchpoint",
    category: "meeting",
    icon: "👥",
    default_duration_minutes: 30,
    default_max_participants: 2,
    template_type: "one_on_one",
    description_draft: "Regular check-in to discuss progress, challenges, and growth.",
    agenda: [
      { title: "How Are You?", duration_minutes: 5, description: "Personal check-in" },
      { title: "Updates & Progress", duration_minutes: 10, description: "What's happening" },
      { title: "Challenges", duration_minutes: 10, description: "Where do you need help?" },
      { title: "Development", duration_minutes: 5, description: "Growth and goals" }
    ]
  },

  // ===== WEBINAR (2) =====
  {
    name: "Expert Panel",
    description: "Industry experts discuss a topic with Q&A",
    category: "webinar",
    icon: "🎤",
    default_duration_minutes: 60,
    default_max_participants: 200,
    template_type: "panel",
    description_draft: "Join our expert panel as they discuss industry trends and answer your questions.",
    agenda: [
      { title: "Introduction", duration_minutes: 5, description: "Meet the panelists" },
      { title: "Discussion", duration_minutes: 35, description: "Moderated conversation" },
      { title: "Audience Q&A", duration_minutes: 20, description: "Your questions answered" }
    ]
  },
  {
    name: "Product Demo",
    description: "Showcase new features or products",
    category: "webinar",
    icon: "🚀",
    default_duration_minutes: 45,
    default_max_participants: 100,
    template_type: "demo",
    description_draft: "See our latest features in action! Live demo followed by Q&A.",
    agenda: [
      { title: "Overview", duration_minutes: 5, description: "What's new" },
      { title: "Live Demo", duration_minutes: 25, description: "See it in action" },
      { title: "Use Cases", duration_minutes: 10, description: "How to apply it" },
      { title: "Q&A", duration_minutes: 5, description: "Questions" }
    ]
  }
];

export const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '📁' },
  { value: 'team_building', label: 'Team Building', icon: '👥' },
  { value: 'social', label: 'Social', icon: '🎉' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
  { value: 'workshop', label: 'Workshop', icon: '💡' },
  { value: 'training', label: 'Training', icon: '🎓' },
  { value: 'meeting', label: 'Meeting', icon: '📅' },
  { value: 'webinar', label: 'Webinar', icon: '🎤' },
  { value: 'onboarding', label: 'Onboarding', icon: '🤝' },
  { value: 'custom', label: 'Custom', icon: '✨' }
];

export default PREMADE_TEMPLATES;
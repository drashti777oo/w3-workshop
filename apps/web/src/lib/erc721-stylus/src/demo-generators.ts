/**
 * NFT Demo Generators
 * Fun and unique demo modes for minting
 */

export type DemoMode = 'random' | 'girly' | 'emoji' | 'mood';

export interface GeneratedNFT {
  name: string;
  description: string;
  emoji: string;
  colors: { primary: string; secondary: string; accent: string };
  metadata: {
    mood?: string;
    vibes?: string[];
    theme?: string;
  };
}

export interface DemoGenerateOptions {
  moodKey?: string;
}

// ============================================================================
// RANDOM NFT GENERATOR 🎲
// ============================================================================

const randomAdjectives = [
  'Mystical', 'Cosmic', 'Ethereal', 'Radiant', 'Luminous',
  'Crystalline', 'Celestial', 'Prismatic', 'Iridescent', 'Enchanted',
  'Serene', 'Vivacious', 'Whimsical', 'Majestic', 'Sublime',
  'Twilight', 'Aurora', 'Nebula', 'Stellar', 'Quantum'
];

const randomNouns = [
  'Phoenix', 'Dragon', 'Unicorn', 'Griffin', 'Pegasus',
  'Sprite', 'Essence', 'Spirit', 'Aura', 'Orb',
  'Crystal', 'Flame', 'Whisper', 'Echo', 'Dream',
  'Prism', 'Vortex', 'Aurora', 'Bloom', 'Sparkle'
];

const randomEmojis = [
  '✨', '🌟', '💫', '⭐', '🌠', '🔮', '💎', '🦄', '🐉', '🔥',
  '❄️', '🌈', '🌸', '🦋', '🌺', '🎀', '💝', '🎨', '🎭', '🎪'
];

const randomColors = [
  { primary: '#FF1493', secondary: '#FFB6C1', accent: '#FFC0CB' }, // Hot pink
  { primary: '#9370DB', secondary: '#DDA0DD', accent: '#EE82EE' }, // Purple
  { primary: '#00CED1', secondary: '#87CEEB', accent: '#B0E0E6' }, // Turquoise
  { primary: '#FFD700', secondary: '#FFA500', accent: '#FFB347' }, // Gold
  { primary: '#FF69B4', secondary: '#FF1493', accent: '#FF69B4' }, // Hot pink variants
  { primary: '#48D1CC', secondary: '#20B2AA', accent: '#40E0D0' }, // Medium turquoise
  { primary: '#FF6EC7', secondary: '#FF1493', accent: '#FF69B4' }, // Pink variants
  { primary: '#4169E1', secondary: '#6495ED', accent: '#87CEEB' }, // Blue
];

export function generateRandomNFT(): GeneratedNFT {
  const adjective = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
  const noun = randomNouns[Math.floor(Math.random() * randomNouns.length)];
  const emoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
  const colors = randomColors[Math.floor(Math.random() * randomColors.length)];

  return {
    name: `${adjective} ${noun}`,
    description: `A unique and mesmerizing ${adjective.toLowerCase()} ${noun.toLowerCase()} NFT. One of a kind. ${emoji}`,
    emoji,
    colors,
    metadata: {
      theme: `${adjective}-${noun}`,
      vibes: ['unique', 'limited', 'mystical']
    }
  };
}

// ============================================================================
// GIRLY NFT GENERATOR 👑✨
// ============================================================================

const girlyThemes = [
  { name: 'Rose Garden', emoji: '🌹', colors: { primary: '#FF1493', secondary: '#FFB6C1', accent: '#FFC0CB' } },
  { name: 'Lavender Dream', emoji: '💜', colors: { primary: '#DDA0DD', secondary: '#EE82EE', accent: '#DDA0DD' } },
  { name: 'Cherry Blossom', emoji: '🌸', colors: { primary: '#FFB7C5', secondary: '#FF69B4', accent: '#FFC0CB' } },
  { name: 'Strawberry Vibes', emoji: '🍓', colors: { primary: '#FF1493', secondary: '#FFB6C1', accent: '#FF69B4' } },
  { name: 'Peachy Keen', emoji: '🍑', colors: { primary: '#FFDAB9', secondary: '#FFB6C1', accent: '#FFB347' } },
  { name: 'Minty Fresh', emoji: '🌿', colors: { primary: '#98FF98', secondary: '#77DD77', accent: '#98FB98' } },
  { name: 'Bubble Gum', emoji: '🎀', colors: { primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FFC0CB' } },
  { name: 'Gold Glitter', emoji: '✨', colors: { primary: '#FFD700', secondary: '#FFA500', accent: '#FFB347' } },
];

const girlyAdjectives = [
  'Delicate', 'Adorable', 'Gorgeous', 'Rad', 'Magical',
  'Dreamy', 'Chic', 'Fabulous', 'Stunning', 'Lovely',
  'Sweet', 'Precious', 'Elegant', 'Enchanting', 'Dazzling'
];

const girlyNouns = [
  'Beauty', 'Glow', 'Sparkle', 'Shimmer', 'Bliss',
  'Charm', 'Grace', 'Radiance', 'Gem', 'Star',
  'Crown', 'Heart', 'Dream', 'Magic', 'Vibes'
];

export function generateGirlyNFT(): GeneratedNFT {
  const theme = girlyThemes[Math.floor(Math.random() * girlyThemes.length)];
  const adjective = girlyAdjectives[Math.floor(Math.random() * girlyAdjectives.length)];
  const noun = girlyNouns[Math.floor(Math.random() * girlyNouns.length)];

  return {
    name: `${adjective} ${noun}`,
    description: `${theme.name} energy ✨ A fabulous limited edition NFT serving ${adjective.toLowerCase()} ${noun.toLowerCase()} realness. You're iconic. ✨`,
    emoji: theme.emoji,
    colors: theme.colors,
    metadata: {
      mood: 'confident',
      vibes: ['fashion', 'fab', theme.name.toLowerCase(), 'icon'],
      theme: theme.name
    }
  };
}

// ============================================================================
// EMOJI-BASED NFT GENERATOR 🎨
// ============================================================================

const emojiCollections = [
  {
    category: 'Animals',
    emojis: ['🦄', '🐉', '🦋', '🐛', '🐝', '🦅', '🦚', '🦚', '🐲'],
    vibe: 'wild'
  },
  {
    category: 'Nature',
    emojis: ['🌸', '🌺', '🌹', '🌻', '🌼', '🍀', '🌿', '🍃', '🌱'],
    vibe: 'serene'
  },
  {
    category: 'Celestial',
    emojis: ['⭐', '🌟', '✨', '💫', '🌠', '🔮', '🌙', '⚡'],
    vibe: 'cosmic'
  },
  {
    category: 'Sparkle & Shine',
    emojis: ['💎', '💠', '🔶', '🔸', '💛', '📿', '🎁', '🎀'],
    vibe: 'luxe'
  },
  {
    category: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💗'],
    vibe: 'love'
  },
  {
    category: 'Vibes',
    emojis: ['🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺'],
    vibe: 'artistic'
  }
];

export function generateEmojiNFT(): GeneratedNFT {
  const collection = emojiCollections[Math.floor(Math.random() * emojiCollections.length)];
  const emoji = collection.emojis[Math.floor(Math.random() * collection.emojis.length)];
  const baseColor = randomColors[Math.floor(Math.random() * randomColors.length)];

  return {
    name: `${collection.category} ${emoji}`,
    description: `${emoji} Emoji artistry edition. Pure ${collection.vibe} energy. Collectible. Unique. Beautiful. ${emoji}`,
    emoji,
    colors: baseColor,
    metadata: {
      theme: collection.category,
      vibes: [collection.vibe, 'emoji', 'art', 'collectible']
    }
  };
}

// ============================================================================
// MOOD-BASED NFT GENERATOR 🎭
// ============================================================================

interface MoodProfile {
  name: string;
  emoji: string;
  colors: { primary: string; secondary: string; accent: string };
  adjectives: string[];
  descriptions: string[];
}

const moods: Record<string, MoodProfile> = {
  confident: {
    name: 'Confident',
    emoji: '👑',
    colors: { primary: '#FFD700', secondary: '#FFA500', accent: '#FF6B6B' },
    adjectives: ['Bold', 'Strong', 'Fierce', 'Unstoppable', 'Royal'],
    descriptions: [
      'Owning the moment. You are THAT person.',
      'Confidence level: maximum. Serving looks and vibes.',
      'This is your crown moment ✨'
    ]
  },
  creative: {
    name: 'Creative',
    emoji: '🎨',
    colors: { primary: '#FF69B4', secondary: '#DDA0DD', accent: '#87CEEB' },
    adjectives: ['Artistic', 'Expressive', 'Vibrant', 'Imaginative', 'Free'],
    descriptions: [
      'Pure creative energy captured in an NFT.',
      'Your imagination becomes art. No limits.',
      'Where creativity flows freely 🎨'
    ]
  },
  peaceful: {
    name: 'Peaceful',
    emoji: '🧘',
    colors: { primary: '#98FB98', secondary: '#87CEEB', accent: '#DDA0DD' },
    adjectives: ['Serene', 'Calm', 'Zen', 'Balanced', 'Harmonious'],
    descriptions: [
      'Inner peace. Pure tranquility.',
      'Harmony in every pixel. Breathe easy.',
      'Finding balance and serenity 🍃'
    ]
  },
  playful: {
    name: 'Playful',
    emoji: '🎉',
    colors: { primary: '#FF1493', secondary: '#00CED1', accent: '#FFD700' },
    adjectives: ['Fun', 'Quirky', 'Mischievous', 'Joyful', 'Whimsical'],
    descriptions: [
      'Pure joy and fun captured in NFT form.',
      'Life is too short not to have fun!',
      'Spreading smiles and good vibes 🎉'
    ]
  },
  mysterious: {
    name: 'Mysterious',
    emoji: '🔮',
    colors: { primary: '#4B0082', secondary: '#8B00FF', accent: '#DDA0DD' },
    adjectives: ['Enigmatic', 'Secret', 'Deep', 'Hidden', 'Intriguing'],
    descriptions: [
      'Secrets and mysteries await. Explore.',
      'There\'s always more than meets the eye.',
      'Diving deep into the unknown 🔮'
    ]
  },
  energetic: {
    name: 'Energetic',
    emoji: '⚡',
    colors: { primary: '#FF4500', secondary: '#FFD700', accent: '#FF69B4' },
    adjectives: ['Electric', 'Dynamic', 'Powerful', 'Intense', 'Explosive'],
    descriptions: [
      'Raw energy. Pure power.',
      'Unstoppable momentum captured here.',
      'Feeling the rush ⚡'
    ]
  }
};

export function generateMoodNFT(moodKey?: string): GeneratedNFT {
  const moodKeys = Object.keys(moods);
  const selectedMood = moods[moodKey || moodKeys[Math.floor(Math.random() * moodKeys.length)]];

  const adjective = selectedMood.adjectives[Math.floor(Math.random() * selectedMood.adjectives.length)];
  const description = selectedMood.descriptions[Math.floor(Math.random() * selectedMood.descriptions.length)];

  return {
    name: `${adjective} ${selectedMood.name}`,
    description,
    emoji: selectedMood.emoji,
    colors: selectedMood.colors,
    metadata: {
      mood: selectedMood.name,
      vibes: ['mood-based', 'unique', selectedMood.name.toLowerCase()]
    }
  };
}

export const AVAILABLE_MOODS = Object.entries(moods).map(([key, mood]) => ({
  key,
  name: mood.name,
  emoji: mood.emoji
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function generateDemoNFT(mode: DemoMode, options: DemoGenerateOptions = {}): GeneratedNFT {
  switch (mode) {
    case 'random':
      return generateRandomNFT();
    case 'girly':
      return generateGirlyNFT();
    case 'emoji':
      return generateEmojiNFT();
    case 'mood':
      return generateMoodNFT(options.moodKey);
    default:
      return generateRandomNFT();
  }
}

/**
 * Generate a data URI for the SVG badge
 */
export function generateDemoNFTImage(nft: GeneratedNFT): string {
  const svg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${nft.colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${nft.colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#grad)"/>
      
      <!-- Decorative circles -->
      <circle cx="80" cy="80" r="40" fill="${nft.colors.accent}" opacity="0.3"/>
      <circle cx="320" cy="320" r="50" fill="${nft.colors.accent}" opacity="0.2"/>
      <circle cx="320" cy="80" r="30" fill="${nft.colors.secondary}" opacity="0.25"/>
      
      <!-- Center emoji -->
      <text x="200" y="160" font-size="120" text-anchor="middle" dominant-baseline="middle">
        ${nft.emoji}
      </text>
      
      <!-- Name -->
      <text x="200" y="280" font-size="32" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">
        ${nft.name}
      </text>
      
      <!-- Sparkle accents -->
      <text x="60" y="60" font-size="20">✨</text>
      <text x="340" y="340" font-size="20">✨</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate metadata JSON for the NFT
 */
export function generateDemoNFTMetadata(nft: GeneratedNFT, baseUri?: string): object {
  const image = generateDemoNFTImage(nft);

  return {
    name: nft.name,
    description: nft.description,
    image,
    emoji: nft.emoji,
    attributes: [
      {
        trait_type: 'Mood',
        value: nft.metadata.mood || 'Random'
      },
      {
        trait_type: 'Vibes',
        value: (nft.metadata.vibes || []).join(', ')
      },
      {
        trait_type: 'Theme',
        value: nft.metadata.theme || 'Demo'
      },
      {
        trait_type: 'Primary Color',
        value: nft.colors.primary
      },
      {
        trait_type: 'Generated',
        value: new Date().toISOString().split('T')[0]
      }
    ],
    external_url: 'https://w3-workshop.example.com'
  };
}

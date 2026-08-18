import { GalleryItem, FunFact, Quote, PersonalityTrait, SoundboardItem } from './types';
import heroImg from './assets/images/hutao_hero_art_1785916192001.jpg';
import ghostCompanionImg from './assets/images/hutao_ghost_spirit_1785916204881.jpg';
import galleryPoetryImg from './assets/images/hutao_gallery_poetry_1785916217046.jpg';
import galleryWuwangImg from './assets/images/hutao_gallery_wuwang_1785916231872.jpg';

// Image constants - imported directly so Vite bundles them in production build
export const IMAGES = {
  hero: heroImg,
  ghostCompanion: ghostCompanionImg,
  galleryPoetry: galleryPoetryImg,
  galleryWuwang: galleryWuwangImg,
  // Additional high quality Genshin themed art photos
  galleryChibi: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
  galleryLanterns: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1000&auto=format&fit=crop',
  galleryNight: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
};

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    id: 'playful',
    title: 'Playful & Mischievous',
    subtitle: 'Master Prankster of Liyue',
    description: 'Always bursting with eccentric ideas, Tak loves jumping out from corners to scare unsuspecting citizens or composing eccentric songs like the famous Hilichurl Tune.',
    iconName: 'Sparkles',
    quote: '"Silly-churl, billy-churl, silly-billy hilichurl... Frantic-churl, tutu-churl, searchin\' for a bone!"',
    color: 'from-amber-500 to-red-600',
  },
  {
    id: 'energetic',
    title: 'Energetic & Quirky',
    subtitle: 'Unstoppable Vitality',
    description: 'Her mind moves at a hundred miles an hour! She runs through Liyue Harbor like a gust of wind, advertising funeral coupons with unmatched enthusiasm.',
    iconName: 'Zap',
    quote: '"When the sun\'s out, bathe in the sun! When the moon\'s out, bathe in the moonlight!"',
    color: 'from-orange-500 to-rose-600',
  },
  {
    id: 'clever',
    title: 'Clever & Poetic Genius',
    subtitle: 'The Versectile Poet',
    description: 'Behind her whimsical demeanor lies an incredibly sharp wit. Her poetry is famed across Liyue Harbor for its profound beauty and witty wordplay.',
    iconName: 'BookOpen',
    quote: '"The moon\'s a cup of chilled tea, starry night a blanket of velvet. Verse flows like wine!"',
    color: 'from-red-600 to-amber-600',
  },
  {
    id: 'caring',
    title: 'Profoundly Caring & Wise',
    subtitle: 'Guardian of the Border',
    description: 'Tak takes her sacred duty as Director with extreme reverence. She ensures every soul transitions peacefully between life and death with dignity.',
    iconName: 'Heart',
    quote: '"Balance must be maintained. Life leads to death, and death is the foundation of life."',
    color: 'from-rose-600 to-yellow-600',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: 'Poetry under the Full Moon',
    category: 'photo',
    imageUrl: IMAGES.galleryPoetry,
    description: 'Tak composing verses at twilight surrounded by blooming red plum blossoms.',
    tags: ['Poetry', 'Moonlight', 'Plum Blossom'],
  },
  {
    id: '2',
    title: 'Mist of Wuwang Hill',
    category: 'game',
    imageUrl: IMAGES.galleryWuwang,
    description: 'Guiding wandering spirits along the boundary of life and death with her trusty red paper lantern.',
    tags: ['Wuwang Hill', 'Spirits', 'Lantern'],
  },
  {
    id: '3',
    title: 'Director at Your Service!',
    category: 'game',
    imageUrl: IMAGES.hero,
    description: 'Tak in her official Wangsheng Director attire, sporting her signature cheeky grin.',
    tags: ['Wangsheng', 'Pyro', 'Hero'],
  },
  {
    id: '4',
    title: 'Boo Tao Spirit Companion',
    category: 'random',
    imageUrl: IMAGES.ghostCompanion,
    description: 'The whimsical ghost friend that accompanies Tak on all her adventures and pranks.',
    tags: ['Boo Tao', 'Ghost', 'Cute'],
  },
  {
    id: '5',
    title: 'Lantern Rite Celebrations',
    category: 'sport',
    imageUrl: IMAGES.galleryLanterns,
    description: 'Warm crimson paper lanterns illuminating the bustling night markets of Liyue Harbor.',
    tags: ['Liyue', 'Lantern Rite', 'Night'],
  },
  {
    id: '6',
    title: 'Twilight Whispers',
    category: 'photo',
    imageUrl: IMAGES.galleryNight,
    description: 'Mysterious night glow over the sacred spirit border under a starry sky.',
    tags: ['Border', 'Ethereal', 'Glow'],
  },
];

export const FUN_FACTS: FunFact[] = [
  {
    id: '1',
    title: 'Silly-Churl Song Composer',
    fact: 'Tak wrote the famous Hilichurl Song that children all over Liyue now sing! It tells the whimsical story of a hilichurl getting sick and searching for medicine.',
    iconName: 'Music',
    secretDetail: 'Even Zhongli knows the lyrics by heart!',
    badge: 'Popular Song',
  },
  {
    id: '2',
    title: 'Pranking Qiqi',
    fact: 'She used to try to bury Qiqi out of concern that zombie Qiqi was suffering in life, but stopped once she realized how happy Qiqi actually was with her friends!',
    iconName: 'Smile',
    secretDetail: 'Now Tak leaves sweet snacks for Qiqi instead.',
    badge: 'Secret Lore',
  },
  {
    id: '3',
    title: 'Plum Blossom Eyepupils',
    fact: 'Tak has unique red blossom-shaped star pupils in her eyes, matching the red plum flower pinned to her dark brown porkpie hat.',
    iconName: 'Eye',
    secretDetail: 'Inherited from her beloved grandfather.',
    badge: 'Visual Design',
  },
  {
    id: '4',
    title: 'Love for Boiled Fish',
    fact: 'Her favorite food is Steamed Fish with Chili Sauce and Prawn Dumplings! She loves spicy dishes that pack a fiery punch.',
    iconName: 'Utensils',
    secretDetail: 'She once tried teaching Zhongli to cook, with disastrous results.',
    badge: 'Favorite Food',
  },
  {
    id: '5',
    title: 'Liyue Poetry Master',
    fact: 'Tak is renowned throughout Liyue as a master poet! Her catchy verses and street poetry are popular among children and scholars alike.',
    iconName: 'Sparkles',
    secretDetail: 'She frequently holds friendly poetry duels with Xingqiu!',
    badge: 'Poetry Lore',
  },
  {
    id: '6',
    title: 'Staff of Homa Master',
    fact: 'Her legendary polearm, the Staff of Homa, was forged to purify evil spirits through divine crimson flames.',
    iconName: 'Flame',
    secretDetail: 'Deals extra damage when her HP drops below 50%!',
    badge: 'Weapon Lore',
  },
];

export const QUOTES: Quote[] = [
  {
    id: '1',
    text: 'Silly-churl, billy-churl, silly-billy hilichurl... Frantic-churl, tutu-churl, searchin\' for a bone!',
    context: 'Tak\'s Famous Idle Song',
    japaneseText: 'ヒルチャールのお兄さんが病気になった…',
  },
  {
    id: '2',
    text: 'When the sun\'s out, bathe in the sun! When the moon\'s out, bathe in the moonlight!',
    context: 'Advice on Living Life to the Fullest',
    japaneseText: '日差しがある時は日光浴！月明かりの時は月光浴！',
  },
  {
    id: '3',
    text: 'Eat well, sleep well, nothing on your mind. If anything goes wrong, you know where to find me!',
    context: 'Wangsheng Funeral Director Greeting',
    japaneseText: 'ちゃんとお飯食べて、ちゃんと寝て…',
  },
  {
    id: '4',
    text: 'Yo! Oya? Oya oya? You came to visit little old me? How delightful!',
    context: 'Greeting Friends at Wangsheng Parlor',
    japaneseText: 'おや？おやおや？私に会いに来てくれたの？',
  },
  {
    id: '5',
    text: 'Balance must be maintained. Life leads to death, and death is the foundation of life.',
    context: 'On the Boundary of Life and Death',
    japaneseText: '生と死の境界を守ることが私の使命。',
  },
];

export const SOUNDBOARD_ITEMS: SoundboardItem[] = [
  {
    id: '1',
    title: 'Silly-Churl Song',
    subtitle: 'Classic Liyue Nursery Rhyme',
    emoji: '🎵',
    color: 'from-amber-500 to-red-600',
  },
  {
    id: '2',
    title: 'Oya? Oya Oya?',
    subtitle: 'Playful Greeting',
    emoji: '👻',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: '3',
    title: 'Yahoo~!',
    subtitle: 'Energetic Dash',
    emoji: '✨',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: '4',
    title: 'Spirits, Arise!',
    subtitle: 'Guide to Afterlife',
    emoji: '🔥',
    color: 'from-rose-600 to-purple-600',
  },
  {
    id: '5',
    title: 'Boo! Did I scare ya?',
    subtitle: 'Prank Surprise',
    emoji: '🎭',
    color: 'from-yellow-500 to-red-500',
  },
];

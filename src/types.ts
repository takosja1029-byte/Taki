export interface GalleryCategory {
  id: string;
  label: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

export interface FunFact {
  id: string;
  title: string;
  fact: string;
  iconName: string;
  secretDetail: string;
  badge: string;
}

export interface Quote {
  id: string;
  text: string;
  context: string;
  japaneseText?: string;
  pinyin?: string;
}

export interface PersonalityTrait {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  customIconUrl?: string;
  quote: string;
  color: string;
  audioUrl?: string;
}

export interface SoundboardItem {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}

export interface LoreBox {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { GalleryItem, FunFact, Quote, PersonalityTrait, GalleryCategory, LoreBox, SectionHeaderContent, HeroContent } from '../types';
import { GALLERY_ITEMS, FUN_FACTS, QUOTES, IMAGES, PERSONALITY_TRAITS } from '../data';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirestoreQuotaExceeded, markFirestoreQuotaExceeded, isQuotaError } from '../lib/firebase';
import {
  savePersonalityAudioToCloud,
  deletePersonalityAudioFromCloud,
  loadPersonalityAudioFromLocal,
  subscribePersonalityAudios,
} from '../utils/personalityAudioStorage';

export interface SiteImages {
  hero: string;
  ghostCompanion: string;
  aboutAvatar: string;
}

export function sanitizeImageUrl(url: string | undefined | null): string {
  if (!url) return IMAGES.hero;
  if (typeof url === 'string' && (url.startsWith('/src/assets/images/') || url.startsWith('/src/assets/') || url.startsWith('/src/'))) {
    if (url.includes('hutao_gallery_poetry')) return IMAGES.galleryPoetry;
    if (url.includes('hutao_gallery_wuwang')) return IMAGES.galleryWuwang;
    if (url.includes('hutao_ghost_spirit')) return IMAGES.ghostCompanion;
    if (url.includes('hutao_hero_art')) return IMAGES.hero;
    return IMAGES.hero;
  }
  return url;
}

export function sanitizeGalleryItems(items: GalleryItem[]): GalleryItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    imageUrl: sanitizeImageUrl(item.imageUrl),
  }));
}

export function sanitizeSiteImages(imgs: Partial<SiteImages>): SiteImages {
  return {
    hero: sanitizeImageUrl(imgs?.hero || DEFAULT_SITE_IMAGES.hero),
    ghostCompanion: sanitizeImageUrl(imgs?.ghostCompanion || DEFAULT_SITE_IMAGES.ghostCompanion),
    aboutAvatar: sanitizeImageUrl(imgs?.aboutAvatar || DEFAULT_SITE_IMAGES.aboutAvatar),
  };
}

export const DEFAULT_SITE_IMAGES: SiteImages = {
  hero: IMAGES.hero,
  ghostCompanion: IMAGES.ghostCompanion,
  aboutAvatar: IMAGES.hero,
};

export interface AboutContent {
  badgeText: string;
  titlePrefix: string;
  titleName: string;
  description: string;
  characterName: string;
  characterRole: string;
  characterBio: string;
  brandTitle: string;
  brandSubtitle: string;
}

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  badgeText: 'Learn More About Me',
  titlePrefix: 'About',
  titleName: 'Tak',
  description: 'The eccentric, poem-loving Director of the Wangsheng Funeral Parlor in Liyue Harbor.',
  characterName: 'Tak',
  characterRole: 'Director • Versatile Poet',
  characterBio: 'Tak took over the Wangsheng Funeral Parlor at a young age. Despite her playful prankster persona, she manages the parlor with utmost gravity when ritual dictates. To her, life and death are natural cycles, and she guards the border between them with sacred reverence.',
  brandTitle: 'Tak',
  brandSubtitle: 'Wangsheng Parlor',
};

export const DEFAULT_LORE_BOXES: LoreBox[] = [
  {
    id: 'lore_1',
    title: 'Guardian of the Sacred Boundary',
    description:
      'Wangsheng Funeral Parlor has served Liyue for generations. Tak carries out solemn rites for departed souls, ensuring they transition peacefully to the spirit realm without regrets. She views death not as something tragic, but as a peaceful return to nature.',
    iconName: 'Scroll',
  },
  {
    id: 'lore_2',
    title: 'The Versectile Poet of Liyue',
    description:
      'Tak is widely celebrated for her eccentric poetry. Her verses spread like wildfire among Liyue children and merchants alike. Her most legendary composition is the "Hilichurl Song", a playful tune recited across Teyvat!',
    iconName: 'Feather',
  },
  {
    id: 'lore_3',
    title: 'Spirited Prankster & Friend',
    description:
      'Whether popping up behind Zhongli to give him unexpected homework, sharing poetry with Baizhu, or organizing poetry battles with Xiangling, Tak brings infectious warmth and laughter wherever she walks.',
    iconName: 'Sparkles',
  },
];

export type SectionHeaderKey = 'personality' | 'quotes' | 'funFacts' | 'gallery';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badge: 'Wangsheng Funeral Parlor',
  titlePrefix: 'Welcome to',
  titleHighlight: "Tak's",
  titleSuffix: 'World',
};

export const DEFAULT_SECTION_HEADERS: Record<SectionHeaderKey, SectionHeaderContent> = {
  personality: {
    badge: 'Character Traits & Voice',
    chineseSymbol: '魂',
    titlePrefix: "Tak's",
    titleHighlight: 'Personality',
    subtitle: 'Click cards to reveal her inner voice, or press the voice button to listen to her custom voice lines!',
  },
  quotes: {
    badge: 'Memorable Lines & Poems',
    chineseSymbol: '诗',
    titlePrefix: 'Famous',
    titleHighlight: 'Tak Quotes',
    subtitle: 'Reflections on life, death, poetry, and funeral parlor wisdom.',
  },
  funFacts: {
    badge: 'Lore & Trivia Secrets',
    chineseSymbol: '趣',
    titlePrefix: 'Tak',
    titleHighlight: 'Fun Facts',
    subtitle: 'Click any card to flip it over and uncover secret lore, strange habits, and director trivia!',
  },
  gallery: {
    badge: 'Illustrations & Wallpapers',
    chineseSymbol: '画',
    titlePrefix: 'Tak',
    titleHighlight: 'Gallery',
    subtitle:
      'Explore high quality artwork, poetry moments, and glowing spirit illustrations. Click or touch any picture to view in full resolution.',
  },
};

export const DEFAULT_SUBTITLES = [
  'Director of Wangsheng Funeral Parlor 👻',
  'Versectile Poet ✨',
  'Ghost Friend 💮',
  'Prank Master 🎭',
];

export const DEFAULT_GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'sport', label: 'Sport' },
  { id: 'game', label: 'Game' },
  { id: 'photo', label: 'Photo' },
  { id: 'random', label: 'Random' },
];

interface AppDataContextType {
  galleryItems: GalleryItem[];
  galleryCategories: GalleryCategory[];
  funFacts: FunFact[];
  quotes: Quote[];
  personalityTraits: PersonalityTrait[];
  subtitles: string[];
  siteImages: SiteImages;
  aboutContent: AboutContent;
  loreBoxes: LoreBox[];
  sectionHeaders: Record<SectionHeaderKey, SectionHeaderContent>;
  heroContent: HeroContent;
  updateHeroContent: (content: Partial<HeroContent>) => void;
  updateSiteImage: (key: keyof SiteImages, url: string) => void;
  resetSiteImages: () => void;
  updateAboutContent: (newContent: Partial<AboutContent>) => void;
  resetAboutContent: () => void;
  addLoreBox: (box: Omit<LoreBox, 'id'>) => void;
  updateLoreBox: (id: string, box: Partial<LoreBox>) => void;
  deleteLoreBox: (id: string) => void;
  updateSectionHeader: (key: SectionHeaderKey, content: Partial<SectionHeaderContent>) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  addGalleryCategory: (label: string) => void;
  updateGalleryCategory: (id: string, label: string) => void;
  deleteGalleryCategory: (id: string) => void;
  resetGalleryCategories: () => void;
  addFunFact: (fact: Omit<FunFact, 'id'>) => void;
  updateFunFact: (id: string, fact: Partial<FunFact>) => void;
  deleteFunFact: (id: string) => void;
  addQuote: (quote: Omit<Quote, 'id'>) => void;
  updateQuote: (id: string, quote: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  addPersonalityTrait: (trait: Omit<PersonalityTrait, 'id'>) => void;
  updatePersonalityTrait: (id: string, trait: Partial<PersonalityTrait>) => void;
  deletePersonalityTrait: (id: string) => void;
  addSubtitle: (text: string) => void;
  updateSubtitle: (index: number, text: string) => void;
  deleteSubtitle: (index: number) => void;
  resetAllData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  GALLERY: 'hutao_app_gallery_v2',
  GALLERY_CATEGORIES: 'hutao_app_gallery_categories_v2',
  FUN_FACTS: 'hutao_app_facts_v2',
  QUOTES: 'hutao_app_quotes_v2',
  PERSONALITY: 'hutao_app_personality_v2',
  SUBTITLES: 'hutao_app_subtitles_v2',
  SITE_IMAGES: 'hutao_app_site_images_v2',
  ABOUT_CONTENT: 'hutao_app_about_content_v2',
  LORE_BOXES: 'hutao_app_lore_boxes_v1',
  SECTION_HEADERS: 'hutao_app_section_headers_v1',
  HERO_CONTENT: 'hutao_app_hero_content_v1',
};

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return saved ? sanitizeGalleryItems(JSON.parse(saved)) : sanitizeGalleryItems(GALLERY_ITEMS);
    } catch (e) {
      return sanitizeGalleryItems(GALLERY_ITEMS);
    }
  });

  const [galleryCategories, setGalleryCategories] = useState<GalleryCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY_CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_GALLERY_CATEGORIES;
    } catch (e) {
      return DEFAULT_GALLERY_CATEGORIES;
    }
  });

  const [funFacts, setFunFacts] = useState<FunFact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUN_FACTS);
      return saved ? JSON.parse(saved) : FUN_FACTS;
    } catch (e) {
      return FUN_FACTS;
    }
  });

  const [loreBoxes, setLoreBoxes] = useState<LoreBox[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LORE_BOXES);
      return saved ? JSON.parse(saved) : DEFAULT_LORE_BOXES;
    } catch (e) {
      return DEFAULT_LORE_BOXES;
    }
  });

  const [sectionHeaders, setSectionHeaders] = useState<Record<SectionHeaderKey, SectionHeaderContent>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SECTION_HEADERS);
      return saved ? { ...DEFAULT_SECTION_HEADERS, ...JSON.parse(saved) } : DEFAULT_SECTION_HEADERS;
    } catch (e) {
      return DEFAULT_SECTION_HEADERS;
    }
  });

  const [heroContent, setHeroContent] = useState<HeroContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HERO_CONTENT);
      return saved ? { ...DEFAULT_HERO_CONTENT, ...JSON.parse(saved) } : DEFAULT_HERO_CONTENT;
    } catch (e) {
      return DEFAULT_HERO_CONTENT;
    }
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : QUOTES;
    } catch (e) {
      return QUOTES;
    }
  });

  const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PERSONALITY);
      return saved ? JSON.parse(saved) : PERSONALITY_TRAITS;
    } catch (e) {
      return PERSONALITY_TRAITS;
    }
  });

  const [subtitles, setSubtitles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBTITLES);
      return saved ? JSON.parse(saved) : DEFAULT_SUBTITLES;
    } catch (e) {
      return DEFAULT_SUBTITLES;
    }
  });

  const [siteImages, setSiteImages] = useState<SiteImages>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITE_IMAGES);
      return saved ? sanitizeSiteImages({ ...DEFAULT_SITE_IMAGES, ...JSON.parse(saved) }) : sanitizeSiteImages(DEFAULT_SITE_IMAGES);
    } catch (e) {
      return sanitizeSiteImages(DEFAULT_SITE_IMAGES);
    }
  });

  const [aboutContent, setAboutContent] = useState<AboutContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_CONTENT);
      return saved ? { ...DEFAULT_ABOUT_CONTENT, ...JSON.parse(saved) } : DEFAULT_ABOUT_CONTENT;
    } catch (e) {
      return DEFAULT_ABOUT_CONTENT;
    }
  });

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(galleryItems));
    } catch (e) {
      console.warn('Failed to save gallery items to localStorage', e);
    }
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY_CATEGORIES, JSON.stringify(galleryCategories));
    } catch (e) {
      console.warn('Failed to save gallery categories to localStorage', e);
    }
  }, [galleryCategories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FUN_FACTS, JSON.stringify(funFacts));
    } catch (e) {
      console.warn('Failed to save fun facts to localStorage', e);
    }
  }, [funFacts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LORE_BOXES, JSON.stringify(loreBoxes));
    } catch (e) {
      console.warn('Failed to save lore boxes to localStorage', e);
    }
  }, [loreBoxes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SECTION_HEADERS, JSON.stringify(sectionHeaders));
    } catch (e) {
      console.warn('Failed to save section headers to localStorage', e);
    }
  }, [sectionHeaders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HERO_CONTENT, JSON.stringify(heroContent));
    } catch (e) {
      console.warn('Failed to save hero content to localStorage', e);
    }
  }, [heroContent]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    } catch (e) {
      console.warn('Failed to save quotes to localStorage', e);
    }
  }, [quotes]);

  useEffect(() => {
    try {
      // Store lightweight traits in localStorage (without heavy base64 audio data) to avoid quota errors
      const lightweightTraits = personalityTraits.map((t) => ({
        ...t,
        audioUrl: t.audioUrl && t.audioUrl.startsWith('data:') ? '[FIREBASE_AUDIO]' : t.audioUrl,
      }));
      localStorage.setItem(STORAGE_KEYS.PERSONALITY, JSON.stringify(lightweightTraits));
    } catch (e) {
      console.warn('Failed to save personality traits to localStorage', e);
    }
  }, [personalityTraits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBTITLES, JSON.stringify(subtitles));
    } catch (e) {
      console.warn('Failed to save subtitles to localStorage', e);
    }
  }, [subtitles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SITE_IMAGES, JSON.stringify(siteImages));
    } catch (e) {
      console.warn('Failed to save site images to localStorage', e);
    }
  }, [siteImages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ABOUT_CONTENT, JSON.stringify(aboutContent));
    } catch (e) {
      console.warn('Failed to save about content to localStorage', e);
    }
  }, [aboutContent]);

  // Firestore Realtime Cloud Synchronization
  const [isFirebaseSynced, setIsFirebaseSynced] = useState(false);

  // Debounced sync helper to merge and save partial state to Firestore without exhausting write quota
  const pendingSyncRef = useRef<Record<string, unknown>>({});
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSeededAppDataRef = useRef<boolean>(false);

  const syncPartialToFirestore = (partialData: Record<string, unknown>) => {
    // If Firestore write quota is exceeded, update local state only to avoid backoff error loops
    if (isFirestoreQuotaExceeded()) {
      return;
    }

    // Sanitize personalityTraits payload for Firestore to ensure appData/config document stays well within 1MB limit
    const sanitizedPartial = { ...partialData };
    if (sanitizedPartial.personalityTraits && Array.isArray(sanitizedPartial.personalityTraits)) {
      sanitizedPartial.personalityTraits = (sanitizedPartial.personalityTraits as PersonalityTrait[]).map((t) => ({
        ...t,
        audioUrl: t.audioUrl && t.audioUrl.startsWith('data:') ? '[FIREBASE_AUDIO]' : t.audioUrl,
      }));
    }
    // Site images (hero banner, ghost companion, about portrait) are uploaded as full-resolution
    // base64 photos which alone can exceed Firestore's 1MB per-document limit. Rather than risk
    // silently failing the whole write, keep images local-only (already saved reliably to
    // localStorage) and don't send them to the shared cloud document at all.
    if (sanitizedPartial.siteImages && typeof sanitizedPartial.siteImages === 'object') {
      const imgs = sanitizedPartial.siteImages as Record<string, string>;
      const markerImages: Record<string, string> = {};
      for (const key of Object.keys(imgs)) {
        markerImages[key] = imgs[key] && imgs[key].startsWith('data:') ? '[LOCAL_IMAGE]' : imgs[key];
      }
      sanitizedPartial.siteImages = markerImages;
    }

    pendingSyncRef.current = { ...pendingSyncRef.current, ...sanitizedPartial };
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        if (isFirestoreQuotaExceeded()) return;
        if (Object.keys(pendingSyncRef.current).length === 0) return;
        const payload = { ...pendingSyncRef.current, updatedAt: new Date().toISOString() };
        pendingSyncRef.current = {};
        const docRef = doc(db, 'appData', 'config');
        await setDoc(docRef, payload, { merge: true });
      } catch (e) {
        if (isQuotaError(e)) {
          markFirestoreQuotaExceeded();
        }
        console.info('Firestore save notice:', e);
      }
    }, 1200);
  };

  // Initial load from IndexedDB cache for personality audios & realtime Firestore subscription
  useEffect(() => {
    let isMounted = true;

    // 1. Instantly load any locally cached personality audios from IndexedDB
    const loadCachedPersonalityAudios = async () => {
      try {
        const traitsWithCache = await Promise.all(
          personalityTraits.map(async (t) => {
            const cachedAudio = await loadPersonalityAudioFromLocal(t.id);
            if (cachedAudio) {
              return { ...t, audioUrl: cachedAudio };
            }
            return t;
          })
        );
        if (isMounted) {
          setPersonalityTraits(traitsWithCache);
        }
      } catch (e) {
        console.warn('Cached personality audio load warning:', e);
      }
    };
    loadCachedPersonalityAudios();

    // 2. Realtime listener for all personality audio changes from Firebase Firestore
    const unsubscribePersonalityAudios = subscribePersonalityAudios((audioMap) => {
      if (!isMounted) return;
      setPersonalityTraits((prev) => {
        let hasChange = false;
        const next = prev.map((t) => {
          const cloudAudio = audioMap[t.id];
          if (cloudAudio && t.audioUrl !== cloudAudio) {
            hasChange = true;
            return { ...t, audioUrl: cloudAudio };
          }
          return t;
        });
        return hasChange ? next : prev;
      });
    });

    // 3. Realtime listener for appData/config document
    let unsubscribeConfig = () => {};
    try {
      const docRef = doc(db, 'appData', 'config');
      unsubscribeConfig = onSnapshot(
        docRef,
        (snapshot) => {
          if (!isMounted) return;
          if (isFirestoreQuotaExceeded()) {
            // Cloud writes are currently blocked, so the cloud copy may be stale/out of date
            // compared to local edits. Trust local state instead of overwriting it.
            return;
          }
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.galleryItems !== undefined) setGalleryItems(sanitizeGalleryItems(data.galleryItems));
            if (data.galleryCategories !== undefined) setGalleryCategories(data.galleryCategories);
            if (data.funFacts !== undefined) setFunFacts(data.funFacts);
            if (data.loreBoxes !== undefined) setLoreBoxes(data.loreBoxes);
            if (data.sectionHeaders !== undefined) {
              setSectionHeaders((prev) => ({ ...prev, ...data.sectionHeaders }));
            }
            if (data.heroContent !== undefined) {
              setHeroContent((prev) => ({ ...prev, ...data.heroContent }));
            }
            if (data.quotes !== undefined) setQuotes(data.quotes);
            if (data.personalityTraits !== undefined) {
              setPersonalityTraits((prev) => {
                const incoming = data.personalityTraits as PersonalityTrait[];
                return incoming.map((inTrait) => {
                  const existing = prev.find((p) => p.id === inTrait.id);
                  let finalAudio = inTrait.audioUrl;
                  if (!finalAudio || finalAudio === '[FIREBASE_AUDIO]') {
                    finalAudio = existing?.audioUrl || '';
                  }
                  return { ...inTrait, audioUrl: finalAudio };
                });
              });
            }
            if (data.subtitles !== undefined) setSubtitles(data.subtitles);
            if (data.siteImages !== undefined) {
              // Cloud only ever stores placeholder markers for images (real image bytes stay
              // local-only to avoid the 1MB document limit) — so merge in only real image
              // values from the cloud and keep whatever's already loaded locally otherwise.
              setSiteImages((prev) => {
                const incoming = data.siteImages as Record<string, string>;
                const merged: Record<string, string> = { ...prev };
                for (const key of Object.keys(incoming)) {
                  const val = incoming[key];
                  if (val && val !== '[LOCAL_IMAGE]') {
                    merged[key] = val;
                  }
                }
                return sanitizeSiteImages(merged as Partial<SiteImages>);
              });
            }
            if (data.aboutContent !== undefined) setAboutContent(data.aboutContent);
          } else if (!hasSeededAppDataRef.current && !isFirestoreQuotaExceeded()) {
            hasSeededAppDataRef.current = true;
            const sanitizedTraits = personalityTraits.map((t) => ({
              ...t,
              audioUrl: t.audioUrl && t.audioUrl.startsWith('data:') ? '[FIREBASE_AUDIO]' : t.audioUrl,
            }));
            const sanitizedSiteImages: Record<string, string> = {};
            for (const key of Object.keys(siteImages)) {
              const val = (siteImages as Record<string, string>)[key];
              sanitizedSiteImages[key] = val && val.startsWith('data:') ? '[LOCAL_IMAGE]' : val;
            }
            setDoc(
              docRef,
              {
                galleryItems,
                galleryCategories,
                funFacts,
                loreBoxes,
                sectionHeaders,
                heroContent,
                quotes,
                personalityTraits: sanitizedTraits,
                subtitles,
                siteImages: sanitizedSiteImages,
                aboutContent,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch((err) => {
              if (isQuotaError(err)) {
                markFirestoreQuotaExceeded();
              }
              console.info('Seeding Firestore appData notice:', err);
            });
          }
          setIsFirebaseSynced(true);
        },
        (error) => {
          if (isQuotaError(error)) {
            markFirestoreQuotaExceeded();
          }
          console.info('Firestore subscription notice (using local storage fallback):', error.message);
        }
      );
    } catch (e) {
      console.info('Firestore setup fallback to local storage:', e);
    }

    return () => {
      isMounted = false;
      unsubscribePersonalityAudios();
      unsubscribeConfig();
    };
  }, []);

  // Site Images
  const updateSiteImage = (key: keyof SiteImages, url: string) => {
    setSiteImages((prev) => {
      const updated = { ...prev, [key]: url };
      syncPartialToFirestore({ siteImages: updated });
      return updated;
    });
  };

  const resetSiteImages = () => {
    setSiteImages(DEFAULT_SITE_IMAGES);
    localStorage.removeItem(STORAGE_KEYS.SITE_IMAGES);
    syncPartialToFirestore({ siteImages: DEFAULT_SITE_IMAGES });
  };

  // About Content
  const updateAboutContent = (newContent: Partial<AboutContent>) => {
    setAboutContent((prev) => {
      const updated = { ...prev, ...newContent };
      syncPartialToFirestore({ aboutContent: updated });
      return updated;
    });
  };

  const resetAboutContent = () => {
    setAboutContent(DEFAULT_ABOUT_CONTENT);
    localStorage.removeItem(STORAGE_KEYS.ABOUT_CONTENT);
    syncPartialToFirestore({ aboutContent: DEFAULT_ABOUT_CONTENT });
  };

  // Gallery CRUD
  const addGalleryItem = (newItem: Omit<GalleryItem, 'id'>) => {
    const item: GalleryItem = {
      ...newItem,
      id: Date.now().toString(),
    };
    setGalleryItems((prev) => {
      const updated = [item, ...prev];
      syncPartialToFirestore({ galleryItems: updated });
      return updated;
    });
  };

  const updateGalleryItem = (id: string, updatedItem: Partial<GalleryItem>) => {
    setGalleryItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item));
      syncPartialToFirestore({ galleryItems: updated });
      return updated;
    });
  };

  const deleteGalleryItem = (id: string) => {
    setGalleryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncPartialToFirestore({ galleryItems: updated });
      return updated;
    });
  };

  // Gallery Categories CRUD
  const addGalleryCategory = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setGalleryCategories((prev) => {
      if (prev.some((c) => c.id === id || c.label.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, { id, label: trimmed }];
      syncPartialToFirestore({ galleryCategories: updated });
      return updated;
    });
  };

  const updateGalleryCategory = (id: string, newLabel: string) => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setGalleryCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, label: trimmed } : c));
      syncPartialToFirestore({ galleryCategories: updated });
      return updated;
    });
  };

  const deleteGalleryCategory = (id: string) => {
    if (id === 'all') return;
    setGalleryCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      syncPartialToFirestore({ galleryCategories: updated });
      return updated;
    });
  };

  const resetGalleryCategories = () => {
    setGalleryCategories(DEFAULT_GALLERY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.GALLERY_CATEGORIES);
    syncPartialToFirestore({ galleryCategories: DEFAULT_GALLERY_CATEGORIES });
  };

  // Fun Facts CRUD
  const addFunFact = (newFact: Omit<FunFact, 'id'>) => {
    const fact: FunFact = {
      ...newFact,
      id: Date.now().toString(),
    };
    setFunFacts((prev) => {
      const updated = [fact, ...prev];
      syncPartialToFirestore({ funFacts: updated });
      return updated;
    });
  };

  const updateFunFact = (id: string, updatedFact: Partial<FunFact>) => {
    setFunFacts((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedFact } : item));
      syncPartialToFirestore({ funFacts: updated });
      return updated;
    });
  };

  const deleteFunFact = (id: string) => {
    setFunFacts((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncPartialToFirestore({ funFacts: updated });
      return updated;
    });
  };

  // Lore Boxes CRUD (About section story cards)
  const addLoreBox = (newBox: Omit<LoreBox, 'id'>) => {
    const box: LoreBox = {
      ...newBox,
      id: Date.now().toString(),
    };
    setLoreBoxes((prev) => {
      const updated = [...prev, box];
      syncPartialToFirestore({ loreBoxes: updated });
      return updated;
    });
  };

  const updateLoreBox = (id: string, updatedBox: Partial<LoreBox>) => {
    setLoreBoxes((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedBox } : item));
      syncPartialToFirestore({ loreBoxes: updated });
      return updated;
    });
  };

  const deleteLoreBox = (id: string) => {
    setLoreBoxes((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncPartialToFirestore({ loreBoxes: updated });
      return updated;
    });
  };

  const updateSectionHeader = (key: SectionHeaderKey, content: Partial<SectionHeaderContent>) => {
    setSectionHeaders((prev) => {
      const updated = { ...prev, [key]: { ...prev[key], ...content } };
      syncPartialToFirestore({ sectionHeaders: updated });
      return updated;
    });
  };

  const updateHeroContent = (content: Partial<HeroContent>) => {
    setHeroContent((prev) => {
      const updated = { ...prev, ...content };
      syncPartialToFirestore({ heroContent: updated });
      return updated;
    });
  };

  // Quotes CRUD
  const addQuote = (newQuote: Omit<Quote, 'id'>) => {
    const quote: Quote = {
      ...newQuote,
      id: Date.now().toString(),
    };
    setQuotes((prev) => {
      const updated = [quote, ...prev];
      syncPartialToFirestore({ quotes: updated });
      return updated;
    });
  };

  const updateQuote = (id: string, updatedQuote: Partial<Quote>) => {
    setQuotes((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedQuote } : item));
      syncPartialToFirestore({ quotes: updated });
      return updated;
    });
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncPartialToFirestore({ quotes: updated });
      return updated;
    });
  };

  // Personality Traits CRUD
  const addPersonalityTrait = (newTrait: Omit<PersonalityTrait, 'id'>) => {
    const traitId = 'trait_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const trait: PersonalityTrait = {
      ...newTrait,
      id: traitId,
    };
    if (newTrait.audioUrl) {
      savePersonalityAudioToCloud(traitId, newTrait.audioUrl).catch((err) => {
        console.warn('Background save personality audio notice:', err);
      });
    }
    setPersonalityTraits((prev) => {
      const updated = [trait, ...prev];
      syncPartialToFirestore({ personalityTraits: updated });
      return updated;
    });
  };

  const updatePersonalityTrait = (id: string, updatedTrait: Partial<PersonalityTrait>) => {
    if (updatedTrait.audioUrl !== undefined) {
      if (updatedTrait.audioUrl && updatedTrait.audioUrl !== '[FIREBASE_AUDIO]') {
        savePersonalityAudioToCloud(id, updatedTrait.audioUrl).catch((err) => {
          console.warn('Background update personality audio notice:', err);
        });
      } else if (updatedTrait.audioUrl === '') {
        deletePersonalityAudioFromCloud(id).catch((err) => {
          console.warn('Background delete personality audio notice:', err);
        });
      }
    }
    setPersonalityTraits((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedTrait } : item));
      syncPartialToFirestore({ personalityTraits: updated });
      return updated;
    });
  };

  const deletePersonalityTrait = (id: string) => {
    deletePersonalityAudioFromCloud(id).catch((err) => {
      console.warn('Background delete personality audio notice:', err);
    });
    setPersonalityTraits((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      syncPartialToFirestore({ personalityTraits: updated });
      return updated;
    });
  };

  // Subtitles CRUD
  const addSubtitle = (text: string) => {
    if (!text.trim()) return;
    setSubtitles((prev) => {
      const updated = [...prev, text.trim()];
      syncPartialToFirestore({ subtitles: updated });
      return updated;
    });
  };

  const updateSubtitle = (index: number, text: string) => {
    if (!text.trim()) return;
    setSubtitles((prev) => {
      const updated = [...prev];
      updated[index] = text.trim();
      syncPartialToFirestore({ subtitles: updated });
      return updated;
    });
  };

  const deleteSubtitle = (index: number) => {
    setSubtitles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      syncPartialToFirestore({ subtitles: updated });
      return updated;
    });
  };

  // Reset Data
  const resetAllData = () => {
    setGalleryItems(GALLERY_ITEMS);
    setGalleryCategories(DEFAULT_GALLERY_CATEGORIES);
    setFunFacts(FUN_FACTS);
    setLoreBoxes(DEFAULT_LORE_BOXES);
    setSectionHeaders(DEFAULT_SECTION_HEADERS);
    setHeroContent(DEFAULT_HERO_CONTENT);
    setQuotes(QUOTES);
    setPersonalityTraits(PERSONALITY_TRAITS);
    setSubtitles(DEFAULT_SUBTITLES);
    setSiteImages(DEFAULT_SITE_IMAGES);
    setAboutContent(DEFAULT_ABOUT_CONTENT);
    localStorage.removeItem(STORAGE_KEYS.GALLERY);
    localStorage.removeItem(STORAGE_KEYS.GALLERY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.FUN_FACTS);
    localStorage.removeItem(STORAGE_KEYS.LORE_BOXES);
    localStorage.removeItem(STORAGE_KEYS.SECTION_HEADERS);
    localStorage.removeItem(STORAGE_KEYS.HERO_CONTENT);
    localStorage.removeItem(STORAGE_KEYS.QUOTES);
    localStorage.removeItem(STORAGE_KEYS.PERSONALITY);
    localStorage.removeItem(STORAGE_KEYS.SUBTITLES);
    localStorage.removeItem(STORAGE_KEYS.SITE_IMAGES);
    localStorage.removeItem(STORAGE_KEYS.ABOUT_CONTENT);
    syncPartialToFirestore({
      galleryItems: GALLERY_ITEMS,
      galleryCategories: DEFAULT_GALLERY_CATEGORIES,
      funFacts: FUN_FACTS,
      loreBoxes: DEFAULT_LORE_BOXES,
      sectionHeaders: DEFAULT_SECTION_HEADERS,
      heroContent: DEFAULT_HERO_CONTENT,
      quotes: QUOTES,
      personalityTraits: PERSONALITY_TRAITS,
      subtitles: DEFAULT_SUBTITLES,
      siteImages: DEFAULT_SITE_IMAGES,
      aboutContent: DEFAULT_ABOUT_CONTENT,
    });
  };

  return (
    <AppDataContext.Provider
      value={{
        galleryItems,
        galleryCategories,
        funFacts,
        loreBoxes,
        sectionHeaders,
        heroContent,
        updateHeroContent,
        quotes,
        personalityTraits,
        subtitles,
        siteImages,
        aboutContent,
        updateSiteImage,
        resetSiteImages,
        updateAboutContent,
        resetAboutContent,
        addLoreBox,
        updateLoreBox,
        deleteLoreBox,
        updateSectionHeader,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addGalleryCategory,
        updateGalleryCategory,
        deleteGalleryCategory,
        resetGalleryCategories,
        addFunFact,
        updateFunFact,
        deleteFunFact,
        addQuote,
        updateQuote,
        deleteQuote,
        addPersonalityTrait,
        updatePersonalityTrait,
        deletePersonalityTrait,
        addSubtitle,
        updateSubtitle,
        deleteSubtitle,
        resetAllData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

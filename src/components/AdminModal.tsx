import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  LogOut,
  Upload,
  Plus,
  Trash2,
  Edit,
  Check,
  Image as ImageIcon,
  Sparkles,
  Quote as QuoteIcon,
  HelpCircle,
  RotateCcw,
  Tag,
  Eye,
  ShieldAlert,
  Type,
  Ghost,
  Volume2,
  VolumeX,
  Mic,
  Music,
  Play,
  Pause,
  Sliders,
  Crop,
  Maximize2,
  ZoomIn,
  Menu,
  ChevronDown,
  SkipBack,
  SkipForward,
  Scroll,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import type { SectionHeaderKey } from '../context/AppDataContext';
import { GalleryItem, FunFact, Quote, LoreBox, SectionHeaderContent, HeroContent } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { ambientMusic, MusicTrack } from '../utils/ambientMusic';
import { fetchPersonalityAudioFromCloud } from '../utils/personalityAudioStorage';
import { ImageCropperModal } from './ImageCropperModal';
import { ImageViewerModal, ImageViewerData } from './ImageViewerModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export type AdminTab = 'site-images' | 'about' | 'personality' | 'subtitles' | 'gallery' | 'facts' | 'quotes' | 'music';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Compact editor for a section's header text (badge, Chinese symbol, title, subtitle).
// Reused across the Personality, Quotes, Fun Facts, and Gallery tabs.
const SectionHeaderEditor: React.FC<{
  label: string;
  sectionKey: SectionHeaderKey;
  headers: Record<SectionHeaderKey, SectionHeaderContent>;
  onUpdate: (key: SectionHeaderKey, content: Partial<SectionHeaderContent>) => void;
}> = ({ label, sectionKey, headers, onUpdate }) => {
  const current = headers[sectionKey];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(current);

  useEffect(() => {
    setForm(current);
  }, [current]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(sectionKey, form);
    setOpen(false);
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-red-500/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <h4 className="font-display font-bold text-amber-300 text-sm flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400" />
          <span>{label} Section Header</span>
        </h4>
        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <form onSubmit={handleSave} className="space-y-3 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Badge Text</label>
              <input
                type="text"
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Chinese Symbol</label>
              <input
                type="text"
                value={form.chineseSymbol}
                onChange={(e) => setForm({ ...form, chineseSymbol: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title Prefix</label>
              <input
                type="text"
                value={form.titlePrefix}
                onChange={(e) => setForm({ ...form, titlePrefix: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title Highlight</label>
              <input
                type="text"
                value={form.titleHighlight}
                onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 mb-1">Subtitle</label>
            <textarea
              rows={2}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
          >
            Save Header
          </button>
        </form>
      )}
    </div>
  );
};

// Editor for the Hero section's badge text and main "Welcome to X World" title.
const HeroContentEditor: React.FC<{
  heroContent: HeroContent;
  onUpdate: (content: Partial<HeroContent>) => void;
}> = ({ heroContent, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(heroContent);

  useEffect(() => {
    setForm(heroContent);
  }, [heroContent]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
    setOpen(false);
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-red-500/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <h4 className="font-display font-bold text-amber-300 text-sm flex items-center gap-2">
          <Type className="w-4 h-4 text-amber-400" />
          <span>Hero Badge & Main Title</span>
        </h4>
        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <form onSubmit={handleSave} className="space-y-3 mt-4">
          <div>
            <label className="block text-xs font-semibold text-rose-200/80 mb-1">
              Top Badge Text (e.g. "Wangsheng Funeral Parlor")
            </label>
            <input
              type="text"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title Prefix</label>
              <input
                type="text"
                value={form.titlePrefix}
                onChange={(e) => setForm({ ...form, titlePrefix: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title Highlight</label>
              <input
                type="text"
                value={form.titleHighlight}
                onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title Suffix</label>
              <input
                type="text"
                value={form.titleSuffix}
                onChange={(e) => setForm({ ...form, titleSuffix: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <p className="text-[11px] text-rose-200/50">
            Preview: {form.titlePrefix} <span className="text-amber-300">{form.titleHighlight}</span> {form.titleSuffix}
          </p>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
          >
            Save Hero Header
          </button>
        </form>
      )}
    </div>
  );
};

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const {
    galleryItems,
    galleryCategories,
    funFacts,
    loreBoxes,
    sectionHeaders,
    updateSectionHeader,
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
  } = useAppData();

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hutao_admin_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleSetAuth = (auth: boolean) => {
    setIsAuthenticated(auth);
    try {
      if (auth) {
        localStorage.setItem('hutao_admin_authenticated', 'true');
      } else {
        localStorage.removeItem('hutao_admin_authenticated');
      }
    } catch (e) {
      console.warn('LocalStorage auth update failed:', e);
    }
  };
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'site-images' | 'about' | 'personality' | 'subtitles' | 'gallery' | 'facts' | 'quotes' | 'music'>('site-images');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Cropper & Fullscreen Picture Viewer State
  const [cropperModal, setCropperModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    targetKey: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    targetKey: '',
  });

  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    image: ImageViewerData | null;
  }>({
    isOpen: false,
    image: null,
  });

  // 2-Step Confirmation State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    itemName: '',
    onConfirm: () => {},
  });

  const requestDeleteConfirm = (title: string, itemName: string, onConfirmAction: () => void) => {
    setDeleteConfirmState({
      isOpen: true,
      title,
      itemName,
      onConfirm: () => {
        onConfirmAction();
        setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openCropper = (imageUrl: string, title: string, targetKey: string) => {
    if (!imageUrl) {
      alert('Please provide or upload an image first before cropping.');
      return;
    }
    setCropperModal({
      isOpen: true,
      imageUrl,
      title,
      targetKey,
    });
  };

  const openViewer = (src: string, title?: string, caption?: string, tags?: string[]) => {
    if (!src) return;
    setViewerModal({
      isOpen: true,
      image: { src, title, caption, tags },
    });
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    const key = cropperModal.targetKey;
    if (key === 'site-hero') {
      updateSiteImage('hero', croppedDataUrl);
      showToast('Hero image cropped & saved!');
    } else if (key === 'site-ghostCompanion') {
      updateSiteImage('ghostCompanion', croppedDataUrl);
      showToast('Ghost companion cropped & saved!');
    } else if (key === 'site-aboutAvatar') {
      updateSiteImage('aboutAvatar', croppedDataUrl);
      showToast('About section portrait cropped & saved!');
    } else if (key === 'gallery-new' || key === 'gallery-edit') {
      setGalleryForm((prev) => ({ ...prev, imageUrl: croppedDataUrl }));
      showToast('Gallery image cropped!');
    } else if (key === 'personality-icon') {
      setPersonalityForm((prev) => ({ ...prev, customIconUrl: croppedDataUrl }));
      showToast('Personality icon cropped!');
    }
  };

  // Background Music Admin State
  const [musicPlaying, setMusicPlaying] = useState<boolean>(() => ambientMusic.getIsPlaying());
  const [musicMode, setMusicModeState] = useState<'synth' | 'custom'>(() => ambientMusic.getMode());
  const [musicVolume, setMusicVolumeState] = useState<number>(() => ambientMusic.getVolume());
  const [musicUploading, setMusicUploading] = useState<boolean>(false);
  const [musicUrlInput, setMusicUrlInput] = useState<string>('');
  const [playlist, setPlaylistState] = useState<MusicTrack[]>(() => ambientMusic.getPlaylist());
  const [currentTrackIndex, setCurrentTrackIndexState] = useState<number>(() => ambientMusic.getCurrentTrackIndex());

  useEffect(() => {
    const unsubscribe = ambientMusic.subscribe(() => {
      setMusicPlaying(ambientMusic.getIsPlaying());
      setMusicModeState(ambientMusic.getMode());
      setPlaylistState([...ambientMusic.getPlaylist()]);
      setCurrentTrackIndexState(ambientMusic.getCurrentTrackIndex());
    });
    return () => unsubscribe();
  }, []);

  const handleMusicFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetInput = e.target;
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Audio file is too large! Please upload a file smaller than 15MB.');
      targetInput.value = '';
      return;
    }

    setMusicUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        await ambientMusic.addTrack(file.name, result, sizeMb);
        console.log('[Music Hub] Playlist updated:', ambientMusic.getPlaylist().map(t => ({ id: t.id, name: t.name, size: t.size, urlPreview: t.url.substring(0, 30) + '...' })));
        setMusicModeState('custom');
        showToast(`Music track "${file.name}" uploaded & saved!`);
      } catch (err: unknown) {
        console.error('Error handling custom audio upload:', err);
        const errorMessage = err instanceof Error ? err.message : 'Could not process audio file.';
        alert(errorMessage);
      } finally {
        setMusicUploading(false);
        try {
          targetInput.value = '';
        } catch (e) {}
      }
    };

    reader.onerror = () => {
      alert('Failed to read music file.');
      setMusicUploading(false);
      try {
        targetInput.value = '';
      } catch (e) {}
    };

    reader.readAsDataURL(file);
  };

  const handleAddUrlTrack = async () => {
    if (!musicUrlInput.trim()) return;
    const url = musicUrlInput.trim();
    const name = url.split('/').pop()?.split('?')[0] || 'Web Music Track';
    await ambientMusic.addTrack(name, url, 'Web URL');
    setMusicUrlInput('');
    setMusicModeState('custom');
    showToast('Web audio track saved to playlist!');
  };

  // Form States for Editing / Creating
  const [editingPersonalityId, setEditingPersonalityId] = useState<string | null>(null);
  const [personalityForm, setPersonalityForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    iconName: 'Sparkles',
    customIconUrl: '',
    quote: '',
    color: 'from-amber-500 to-red-600',
    audioUrl: '',
  });
  const [audioUploading, setAudioUploading] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);

  const handleIconFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large! Please upload a file smaller than 8MB.');
      e.target.value = '';
      return;
    }

    setIconUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        setPersonalityForm((prev) => ({ ...prev, customIconUrl: result }));
        showToast('Custom logo/icon uploaded successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to process image file.');
      } finally {
        setIconUploading(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIconUploading(false);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('Audio file is too large! Please upload a file smaller than 20MB.');
      e.target.value = '';
      return;
    }

    setAudioUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        setPersonalityForm((prev) => ({ ...prev, audioUrl: result }));
        showToast('Voice audio file uploaded successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to process audio file.');
      } finally {
        setAudioUploading(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      alert('Failed to read audio file.');
      setAudioUploading(false);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'photo',
    imageUrl: '',
    description: '',
    tags: '',
  });

  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryLabel, setEditingCategoryLabel] = useState<string>('');

  const [editingSubtitleIndex, setEditingSubtitleIndex] = useState<number | null>(null);
  const [subtitleInput, setSubtitleInput] = useState<string>('');

  const [editingFactId, setEditingFactId] = useState<string | null>(null);
  const [factForm, setFactForm] = useState({
    title: '',
    fact: '',
    iconName: 'Sparkles',
    secretDetail: '',
    badge: 'Secret Lore',
  });

  const [editingLoreBoxId, setEditingLoreBoxId] = useState<string | null>(null);
  const [loreBoxForm, setLoreBoxForm] = useState({
    title: '',
    description: '',
    iconName: 'Scroll',
  });

  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    text: '',
    context: '',
    japaneseText: '',
  });

  // Success Message Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Subtitle
  const handleSaveSubtitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtitleInput.trim()) {
      alert('Please enter a subtitle text!');
      return;
    }

    if (editingSubtitleIndex !== null) {
      updateSubtitle(editingSubtitleIndex, subtitleInput);
      showToast('Hero subtitle updated!');
      setEditingSubtitleIndex(null);
    } else {
      addSubtitle(subtitleInput);
      showToast('New hero subtitle added!');
    }
    setSubtitleInput('');
  };

  const handleEditSubtitle = (index: number, text: string) => {
    setEditingSubtitleIndex(index);
    setSubtitleInput(text);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'hutak1029') {
      handleSetAuth(true);
      setLoginError('');
      setPasswordInput('');
      showToast('Welcome Director! Admin Dashboard Unlocked');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  // Image File Upload Helpers (With Automatic Compression)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please upload a smaller image.');
        return;
      }
      try {
        showToast('Compressing image...');
        const compressedUrl = await compressImage(file, 1600, 1600, 0.82);
        setGalleryForm((prev) => ({
          ...prev,
          imageUrl: compressedUrl,
        }));
        showToast('Image compressed & uploaded!');
      } catch (err) {
        console.error('Compression error:', err);
        alert('Failed to compress image.');
      }
    }
  };

  const handleSiteImageUpload = async (key: keyof typeof siteImages, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please select a smaller image.');
        return;
      }
      try {
        showToast('Compressing site image...');
        const compressedUrl = await compressImage(file, 1200, 1200, 0.82);
        updateSiteImage(key, compressedUrl);
        showToast('Site image compressed & updated!');
      } catch (err) {
        console.error('Site image compression error:', err);
        alert('Failed to compress site image.');
      }
    }
  };

  const handleGalleryItemImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please select a smaller image.');
        return;
      }
      try {
        showToast('Compressing gallery image...');
        const compressedUrl = await compressImage(file, 1600, 1600, 0.82);
        updateGalleryItem(id, { imageUrl: compressedUrl });
        showToast('Gallery image compressed & updated!');
      } catch (err) {
        console.error('Gallery image compression error:', err);
        alert('Failed to compress gallery image.');
      }
    }
  };

  // Save Gallery Item (Create or Update)
  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.imageUrl) {
      alert('Please provide a title and image!');
      return;
    }

    let finalImageUrl = galleryForm.imageUrl;
    if (finalImageUrl.startsWith('data:image/') && !finalImageUrl.includes('image/webp')) {
      try {
        finalImageUrl = await compressImage(finalImageUrl, 1600, 1600, 0.82);
      } catch (err) {
        console.warn('Image compression fallback:', err);
      }
    }

    const parsedTags = galleryForm.tags
      ? galleryForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Artwork'];

    if (editingGalleryId) {
      updateGalleryItem(editingGalleryId, {
        title: galleryForm.title,
        category: galleryForm.category,
        imageUrl: finalImageUrl,
        description: galleryForm.description,
        tags: parsedTags,
      });
      showToast('Gallery item updated successfully!');
      setEditingGalleryId(null);
    } else {
      addGalleryItem({
        title: galleryForm.title,
        category: galleryForm.category,
        imageUrl: finalImageUrl,
        description: galleryForm.description,
        tags: parsedTags,
      });
      showToast('New upload added to Gallery!');
    }

    // Reset Form
    const defaultCat = galleryCategories.find((c) => c.id !== 'all')?.id || 'photo';
    setGalleryForm({ title: '', category: defaultCat, imageUrl: '', description: '', tags: '' });
  };

  const handleEditGallery = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryForm({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      tags: item.tags.join(', '),
    });
  };

  // Save Fun Fact
  const handleSaveFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factForm.title || !factForm.fact) {
      alert('Please fill out the fact title and description!');
      return;
    }

    if (editingFactId) {
      updateFunFact(editingFactId, factForm);
      showToast('Fun fact updated!');
      setEditingFactId(null);
    } else {
      addFunFact(factForm);
      showToast('New fun fact added!');
    }

    setFactForm({ title: '', fact: '', iconName: 'Sparkles', secretDetail: '', badge: 'Secret Lore' });
  };

  const handleEditFact = (fact: FunFact) => {
    setEditingFactId(fact.id);
    setFactForm({
      title: fact.title,
      fact: fact.fact,
      iconName: fact.iconName || 'Sparkles',
      secretDetail: fact.secretDetail,
      badge: fact.badge,
    });
  };

  // Save Lore Box (About section story cards)
  const handleSaveLoreBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loreBoxForm.title || !loreBoxForm.description) {
      alert('Please fill out the title and description!');
      return;
    }

    if (editingLoreBoxId) {
      updateLoreBox(editingLoreBoxId, loreBoxForm);
      showToast('Lore box updated!');
      setEditingLoreBoxId(null);
    } else {
      addLoreBox(loreBoxForm);
      showToast('New lore box added!');
    }

    setLoreBoxForm({ title: '', description: '', iconName: 'Scroll' });
  };

  const handleEditLoreBox = (box: LoreBox) => {
    setEditingLoreBoxId(box.id);
    setLoreBoxForm({
      title: box.title,
      description: box.description,
      iconName: box.iconName || 'Scroll',
    });
  };

  // Save Quote
  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.text || !quoteForm.context) {
      alert('Please fill out quote text and context!');
      return;
    }

    if (editingQuoteId) {
      updateQuote(editingQuoteId, quoteForm);
      showToast('Quote updated!');
      setEditingQuoteId(null);
    } else {
      addQuote(quoteForm);
      showToast('New quote added!');
    }

    setQuoteForm({ text: '', context: '', japaneseText: '' });
  };

  const handleEditQuote = (q: Quote) => {
    setEditingQuoteId(q.id);
    setQuoteForm({
      text: q.text,
      context: q.context,
      japaneseText: q.japaneseText || '',
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] glass-card rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col bg-[#160a0b] my-auto"
      >
        {/* Modal Header */}
        <div className="flex-none flex items-center justify-between p-3.5 sm:p-5 border-b border-red-500/30 bg-[#1c0c0e]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-xl text-white truncate">
                Wangsheng Admin Portal
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-300/80 truncate">
                {isAuthenticated ? 'Manage & Upload Custom Content' : 'Director Authentication'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => handleSetAuth(false)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950 border border-red-500/40 text-amber-300 text-xs font-semibold hover:bg-red-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-red-950/60 text-amber-300 hover:text-white hover:bg-red-700 transition-colors cursor-pointer"
              aria-label="Close portal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="flex-none bg-gradient-to-r from-amber-600 to-red-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* LOGIN FORM (if not authenticated) */}
        {!isAuthenticated ? (
          <div className="p-5 sm:p-8 flex flex-col items-center justify-center text-center my-auto overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 p-0.5 mb-3 sm:mb-4 shadow-[0_0_25px_rgba(230,57,70,0.5)]">
              <div className="w-full h-full bg-[#160a0b] rounded-full flex items-center justify-center">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
              </div>
            </div>

            <h4 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
              Admin Login Required
            </h4>
            <p className="text-rose-200/70 text-xs sm:text-sm max-w-sm mb-6">
              Enter the admin password to unlock management tools, upload photos/artworks, and edit quotes or trivia.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Enter Admin Password"
                  className="w-full px-4 py-3 rounded-2xl bg-[#230d10] border border-red-500/40 text-white placeholder-rose-300/40 focus:outline-none focus:border-amber-400 text-center font-semibold text-sm"
                  autoFocus
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-xs font-semibold flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="group relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:via-amber-500 hover:to-red-600 border border-amber-400/40 text-white font-display font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(230,57,70,0.4)] hover:shadow-[0_0_28px_rgba(247,127,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
                <span>Access Admin Dashboard</span>
                <Sparkles className="w-4 h-4 text-amber-300 opacity-80 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
            {/* Mobile Navigation Header Bar (with hamburger button matching the user's design) */}
            <div className="flex sm:hidden items-center justify-between px-3 py-2 bg-[#140608] border-b border-red-500/30 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-10 h-10 rounded-xl bg-[#2a0e12] border-2 border-red-500/60 text-amber-300 active:bg-red-800 transition-colors shadow-md flex items-center justify-center cursor-pointer shrink-0"
                  title="Toggle Admin Menu"
                >
                  <Menu className="w-5 h-5 text-amber-300" />
                </button>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">Tab:</span>
                  <span className="text-xs font-bold text-white truncate bg-red-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {activeTab === 'site-images' && '🖼️ Site Images'}
                    {activeTab === 'about' && '👻 About Text'}
                    {activeTab === 'personality' && `✨ Personality (${personalityTraits.length})`}
                    {activeTab === 'subtitles' && `📝 Hero Titles (${subtitles.length})`}
                    {activeTab === 'gallery' && `🎨 Gallery (${galleryItems.length})`}
                    {activeTab === 'facts' && `💡 Fun Facts (${funFacts.length})`}
                    {activeTab === 'quotes' && `💬 Quotes (${quotes.length})`}
                    {activeTab === 'music' && '🎵 Music'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-amber-300 text-xs font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 border border-amber-500/40 shrink-0 cursor-pointer"
              >
                <span>Switch Tab</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Mobile Dropdown Menu Drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[49px] left-0 right-0 z-50 bg-[#160a0b]/98 backdrop-blur-xl border-b-2 border-amber-500/50 p-3 shadow-2xl flex flex-col gap-1.5 sm:hidden"
                >
                  <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider px-2 pb-1 border-b border-red-500/20">
                    Select Admin Section
                  </div>
                  {[
                    { id: 'site-images', label: 'Site Images & Artwork', icon: ImageIcon },
                    { id: 'about', label: 'About Text', icon: Ghost },
                    { id: 'personality', label: `Personality (${personalityTraits.length})`, icon: Sparkles },
                    { id: 'subtitles', label: `Hero Titles (${subtitles.length})`, icon: Type },
                    { id: 'gallery', label: `Gallery (${galleryItems.length})`, icon: ImageIcon },
                    { id: 'facts', label: `Fun Facts (${funFacts.length})`, icon: Sparkles },
                    { id: 'quotes', label: `Quotes (${quotes.length})`, icon: QuoteIcon },
                    { id: 'music', label: 'Background Music', icon: Music },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id as AdminTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-red-900 to-amber-950 text-amber-300 border border-amber-400/60 shadow-md'
                            : 'text-rose-100/80 hover:bg-red-950/50 border border-transparent'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{tab.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-300 ml-auto" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop Nav Tabs Bar */}
            <div className="hidden sm:flex flex-none border-b border-red-500/30 bg-[#17080a] px-6 py-2 overflow-x-auto whitespace-nowrap items-center gap-2 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('site-images')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'site-images'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Site Images & Artwork</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'about'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <Ghost className="w-4 h-4 text-amber-400 shrink-0" />
                <span>About Text</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('personality')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'personality'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Personality ({personalityTraits.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subtitles')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'subtitles'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <Type className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hero Titles ({subtitles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'gallery'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Gallery ({galleryItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('facts')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'facts'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fun Facts ({funFacts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quotes')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'quotes'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <QuoteIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Quotes ({quotes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('music')}
                className={`py-2 px-4 text-xs font-display font-bold flex items-center gap-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  activeTab === 'music'
                    ? 'bg-gradient-to-r from-red-950 to-amber-950/90 text-amber-300 border border-amber-400/50 shadow-[0_2px_10px_rgba(247,127,0,0.2)]'
                    : 'text-rose-200/70 hover:text-white hover:bg-red-950/40 border border-transparent'
                }`}
              >
                <Music className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Background Music</span>
              </button>
            </div>

            {/* TAB CONTENT SCROLLABLE AREA */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-5 sm:space-y-8">
              {/* TAB 0: SITE IMAGES & ARTWORK */}
              {activeTab === 'site-images' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <h4 className="font-display font-bold text-base sm:text-lg text-amber-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                        <span>Manage Site Images & Artwork</span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-rose-200/70 mt-0.5">
                        Upload custom images directly from your computer or enter an image URL to replace any image on the site.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        requestDeleteConfirm('Reset Site Images', 'All custom site artwork & hero banner', () => {
                          resetSiteImages();
                          showToast('Site images reset to defaults!');
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/30 text-rose-300 text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer shrink-0"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  {/* Grid of Site Images */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Main Hero Artwork */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-display font-bold text-sm text-amber-300">
                            1. Main Hero Banner Art
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-amber-200 border border-amber-400/30">
                            Hero Section
                          </span>
                        </div>

                        {/* Image Preview with Hover Controls */}
                        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-red-500/30 bg-[#140808] relative mb-4 group">
                          <img
                            src={siteImages.hero}
                            alt="Main Hero Artwork"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => openViewer(siteImages.hero, 'Main Hero Banner Art', 'Hero Section Artwork')}
                              className="px-3 py-1.5 rounded-lg bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>View Full</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openCropper(siteImages.hero, 'Crop Hero Banner Art', 'site-hero')}
                              className="px-3 py-1.5 rounded-lg bg-red-800 border border-amber-400/50 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>Crop</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <label className="py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-[11px] font-bold hover:scale-102 transition-transform cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSiteImageUpload('hero', e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => openCropper(siteImages.hero, 'Crop Hero Banner Art', 'site-hero')}
                            className="py-2 px-3 rounded-xl bg-red-950/90 border border-amber-500/40 text-amber-300 font-display text-[11px] font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Crop Image</span>
                          </button>
                        </div>

                        {/* URL Option */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-rose-200/70">Or Paste Image URL</label>
                          <input
                            type="text"
                            value={siteImages.hero}
                            onChange={(e) => updateSiteImage('hero', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Floating Ghost Companion */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-display font-bold text-sm text-amber-300">
                            2. Ghost Spirit (Boo Tao)
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-amber-200 border border-amber-400/30">
                            Floating Companion
                          </span>
                        </div>

                        {/* Image Preview with Hover Controls */}
                        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-red-500/30 bg-[#140808] relative mb-4 flex items-center justify-center p-4 group">
                          <img
                            src={siteImages.ghostCompanion}
                            alt="Boo Tao Ghost"
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => openViewer(siteImages.ghostCompanion, 'Ghost Spirit (Boo Tao)', 'Floating Companion Spirit')}
                              className="px-3 py-1.5 rounded-lg bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>View Full</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openCropper(siteImages.ghostCompanion, 'Crop Ghost Companion', 'site-ghostCompanion')}
                              className="px-3 py-1.5 rounded-lg bg-red-800 border border-amber-400/50 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>Crop</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <label className="py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-[11px] font-bold hover:scale-102 transition-transform cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSiteImageUpload('ghostCompanion', e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => openCropper(siteImages.ghostCompanion, 'Crop Ghost Companion', 'site-ghostCompanion')}
                            className="py-2 px-3 rounded-xl bg-red-950/90 border border-amber-500/40 text-amber-300 font-display text-[11px] font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Crop Image</span>
                          </button>
                        </div>

                        {/* URL Option */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-rose-200/70">Or Paste Image URL</label>
                          <input
                            type="text"
                            value={siteImages.ghostCompanion}
                            onChange={(e) => updateSiteImage('ghostCompanion', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. About Section Avatar Portrait */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-display font-bold text-sm text-amber-300">
                            3. About Section Portrait
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-amber-200 border border-amber-400/30">
                            About Card
                          </span>
                        </div>

                        {/* Image Preview with Hover Controls */}
                        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-red-500/30 bg-[#140808] relative mb-4 flex items-center justify-center group">
                          <img
                            src={siteImages.aboutAvatar}
                            alt="About Section Portrait"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <button
                              type="button"
                              onClick={() => openViewer(siteImages.aboutAvatar, 'About Section Portrait', 'Tak Director Card')}
                              className="px-3 py-1.5 rounded-lg bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>View Full</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openCropper(siteImages.aboutAvatar, 'Crop About Section Portrait', 'site-aboutAvatar')}
                              className="px-3 py-1.5 rounded-lg bg-red-800 border border-amber-400/50 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>Crop</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <label className="py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-[11px] font-bold hover:scale-102 transition-transform cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSiteImageUpload('aboutAvatar', e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => openCropper(siteImages.aboutAvatar, 'Crop About Section Portrait', 'site-aboutAvatar')}
                            className="py-2 px-3 rounded-xl bg-red-950/90 border border-amber-500/40 text-amber-300 font-display text-[11px] font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Crop className="w-3.5 h-3.5" />
                            <span>Crop Image</span>
                          </button>
                        </div>

                        {/* URL Option */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-rose-200/70">Or Paste Image URL</label>
                          <input
                            type="text"
                            value={siteImages.aboutAvatar}
                            onChange={(e) => updateSiteImage('aboutAvatar', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ABOUT SECTION TEXT */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-lg text-amber-200 flex items-center gap-2">
                        <Ghost className="w-5 h-5 text-amber-400" />
                        <span>Manage About Section Text</span>
                      </h4>
                      <p className="text-xs text-rose-200/70 mt-1">
                        Edit, change, or delete any title, badge text, or biography in the About section.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        requestDeleteConfirm('Reset About Section Text', 'All About Section biography & titles', () => {
                          resetAboutContent();
                          showToast('About Section text reset to default!');
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/80 border border-red-500/30 text-rose-300 text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer shrink-0"
                    >
                      Reset Defaults
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Header Logo Branding Card */}
                    <div className="glass-card p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-red-950/40 via-amber-950/20 to-red-950/40 md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="font-display font-bold text-base text-amber-300 flex items-center gap-2">
                          <Ghost className="w-4 h-4 text-amber-400 animate-bounce" />
                          <span>Navigation Header Logo & Tagline</span>
                        </label>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-400/40 font-semibold">
                          Top Navbar
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-amber-200 block mb-1">
                            Brand Name (Logo Title)
                          </label>
                          <input
                            type="text"
                            value={aboutContent.brandTitle ?? ''}
                            onChange={(e) => updateAboutContent({ brandTitle: e.target.value })}
                            placeholder="e.g. Tak"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-amber-500/40 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                          <p className="text-[11px] text-rose-200/60 mt-1">Main title next to the ghost icon</p>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-amber-200 block mb-1">
                            Brand Tagline (Logo Subtitle)
                          </label>
                          <input
                            type="text"
                            value={aboutContent.brandSubtitle ?? ''}
                            onChange={(e) => updateAboutContent({ brandSubtitle: e.target.value })}
                            placeholder="e.g. Wangsheng Parlor"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-amber-500/40 text-white font-bold text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                          <p className="text-[11px] text-rose-200/60 mt-1">Small uppercase text below the brand name</p>
                        </div>
                      </div>
                    </div>

                    {/* Header Badge / Tagline */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-display font-bold text-sm text-amber-300">
                          Top Badge / Tagline
                        </label>
                        <span className="text-[10px] text-rose-200/60">(e.g. "Learn More About Me")</span>
                      </div>
                      <input
                        type="text"
                        value={aboutContent.badgeText}
                        onChange={(e) => updateAboutContent({ badgeText: e.target.value })}
                        placeholder="Tagline badge..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[11px] text-rose-200/60">
                        Appears inside the glowing floating badge above the section title. Leave blank to hide.
                      </p>
                    </div>

                    {/* Section Heading Title */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 space-y-3">
                      <label className="font-display font-bold text-sm text-amber-300 block">
                        Main Section Title
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-rose-200/70 block mb-1">Prefix</label>
                          <input
                            type="text"
                            value={aboutContent.titlePrefix}
                            onChange={(e) => updateAboutContent({ titlePrefix: e.target.value })}
                            placeholder="e.g. About"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-rose-200/70 block mb-1">Highlighted Name</label>
                          <input
                            type="text"
                            value={aboutContent.titleName}
                            onChange={(e) => updateAboutContent({ titleName: e.target.value })}
                            placeholder="e.g. Tak"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-rose-200/60">
                        Result preview: <strong className="text-amber-300">{aboutContent.titlePrefix} {aboutContent.titleName}</strong>
                      </p>
                    </div>

                    {/* Section Subtitle Description */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 space-y-3 md:col-span-2">
                      <label className="font-display font-bold text-sm text-amber-300 block">
                        Section Subtitle Description
                      </label>
                      <textarea
                        rows={2}
                        value={aboutContent.description}
                        onChange={(e) => updateAboutContent({ description: e.target.value })}
                        placeholder="Enter section description..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>

                    {/* Character Card Name & Role */}
                    <div className="glass-card p-5 rounded-2xl border border-red-500/30 space-y-3 md:col-span-2">
                      <h5 className="font-display font-bold text-sm text-amber-300">
                        Character Profile Card Info
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-rose-200/70 block mb-1">Character Name</label>
                          <input
                            type="text"
                            value={aboutContent.characterName}
                            onChange={(e) => updateAboutContent({ characterName: e.target.value })}
                            placeholder="Character Name..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-rose-200/70 block mb-1">Title / Role</label>
                          <input
                            type="text"
                            value={aboutContent.characterRole}
                            onChange={(e) => updateAboutContent({ characterRole: e.target.value })}
                            placeholder="Title or Role..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="text-[11px] font-semibold text-rose-200/70 block mb-1">Biography</label>
                        <textarea
                          rows={3}
                          value={aboutContent.characterBio}
                          onChange={(e) => updateAboutContent({ characterBio: e.target.value })}
                          placeholder="Biography text..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lore / Story Boxes (the 3 cards below the About text) */}
                  <div className="pt-2 border-t border-red-500/20 space-y-4">
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <h5 className="font-display font-bold text-base text-amber-200 flex items-center gap-2">
                          <Scroll className="w-4 h-4 text-amber-400" />
                          <span>Lore / Story Cards ({loreBoxes.length})</span>
                        </h5>
                        <p className="text-[11px] text-rose-200/60 mt-1">
                          The story cards shown next to your photo in the About section.
                        </p>
                      </div>
                    </div>

                    <div className="glass-card p-5 rounded-2xl border border-red-500/30">
                      <h6 className="font-display font-bold text-sm text-amber-200 mb-3 flex items-center justify-between">
                        <span>{editingLoreBoxId ? 'Edit Lore Card' : 'Add New Lore Card'}</span>
                        {editingLoreBoxId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLoreBoxId(null);
                              setLoreBoxForm({ title: '', description: '', iconName: 'Scroll' });
                            }}
                            className="text-xs text-rose-300 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </h6>

                      <form onSubmit={handleSaveLoreBox} className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title</label>
                          <input
                            type="text"
                            value={loreBoxForm.title}
                            onChange={(e) => setLoreBoxForm({ ...loreBoxForm, title: e.target.value })}
                            placeholder="e.g. Guardian of the Sacred Boundary"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={loreBoxForm.description}
                            onChange={(e) => setLoreBoxForm({ ...loreBoxForm, description: e.target.value })}
                            placeholder="Story / lore text shown in the card..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Icon</label>
                          <select
                            value={loreBoxForm.iconName}
                            onChange={(e) => setLoreBoxForm({ ...loreBoxForm, iconName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            <option value="Scroll">Scroll</option>
                            <option value="Feather">Feather</option>
                            <option value="Sparkles">Sparkles</option>
                            <option value="Ghost">Ghost</option>
                            <option value="Award">Award</option>
                            <option value="MapPin">MapPin</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                        >
                          {editingLoreBoxId ? 'Update Card' : 'Add Card'}
                        </button>
                      </form>
                    </div>

                    <div className="space-y-3">
                      {loreBoxes.map((box) => (
                        <div
                          key={box.id}
                          className="p-4 rounded-2xl glass-card border border-red-500/20 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h6 className="font-display font-bold text-sm text-white truncate">{box.title}</h6>
                            <p className="text-xs text-rose-200/70 mt-1 line-clamp-2">{box.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLoreBox(box);
                              }}
                              className="p-2 rounded-lg bg-red-950 text-amber-300 hover:text-white cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteConfirm('Delete Lore Card', box.title, () => {
                                  deleteLoreBox(box.id);
                                  if (editingLoreBoxId === box.id) {
                                    setEditingLoreBoxId(null);
                                  }
                                  showToast(`Deleted lore card "${box.title}"!`);
                                });
                              }}
                              className="p-2 rounded-lg bg-red-950 text-rose-300 hover:text-white cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PERSONALITY TRAITS */}
              {activeTab === 'personality' && (
                <div className="space-y-6">
                  <SectionHeaderEditor
                    label="Personality"
                    sectionKey="personality"
                    headers={sectionHeaders}
                    onUpdate={updateSectionHeader}
                  />
                  {/* Form for Creating / Editing Personality Trait */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display font-bold text-amber-300 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>{editingPersonalityId ? 'Edit Personality Card' : 'Add New Personality Card'}</span>
                      </h4>
                      {editingPersonalityId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPersonalityId(null);
                            setPersonalityForm({ title: '', subtitle: '', description: '', iconName: 'Sparkles', customIconUrl: '', quote: '', color: 'from-amber-500 to-red-600', audioUrl: '' });
                          }}
                          className="text-xs text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!personalityForm.title.trim() || !personalityForm.description.trim()) {
                          alert('Title and description are required');
                          return;
                        }

                        if (editingPersonalityId) {
                          updatePersonalityTrait(editingPersonalityId, personalityForm);
                          showToast('Personality card updated!');
                          setEditingPersonalityId(null);
                        } else {
                          addPersonalityTrait(personalityForm);
                          showToast('New personality card created!');
                        }

                        setPersonalityForm({
                          title: '',
                          subtitle: '',
                          description: '',
                          iconName: 'Sparkles',
                          customIconUrl: '',
                          quote: '',
                          color: 'from-amber-500 to-red-600',
                          audioUrl: '',
                        });
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-rose-200/80 block mb-1">Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Playful & Mischievous"
                            value={personalityForm.title}
                            onChange={(e) => setPersonalityForm({ ...personalityForm, title: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-rose-200/80 block mb-1">Subtitle Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. Master Prankster"
                            value={personalityForm.subtitle}
                            onChange={(e) => setPersonalityForm({ ...personalityForm, subtitle: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-rose-200/80 block mb-1">Front Description</label>
                        <textarea
                          rows={2}
                          required
                          placeholder="Short description displayed on card front..."
                          value={personalityForm.description}
                          onChange={(e) => setPersonalityForm({ ...personalityForm, description: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-rose-200/80 block mb-1">Inner Voice / Quote (Card Back)</label>
                        <textarea
                          rows={2}
                          placeholder="Quote revealed when card flips..."
                          value={personalityForm.quote}
                          onChange={(e) => setPersonalityForm({ ...personalityForm, quote: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      {/* VOICE AUDIO UPLOAD & MANAGEMENT SECTION */}
                      <div className="p-4 rounded-xl bg-red-950/40 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                            <Mic className="w-4 h-4 text-amber-400" />
                            <span>Personality Voice Line / Custom Audio</span>
                          </label>
                          {personalityForm.audioUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPersonalityForm({ ...personalityForm, audioUrl: '' });
                              }}
                              className="text-[11px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Audio
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* File Upload Button */}
                          <div>
                            <label className="block text-[11px] text-rose-200/70 mb-1 font-semibold">
                              Upload Audio File (.mp3, .wav, .m4a)
                            </label>
                            <label className="w-full py-2.5 px-3 rounded-xl bg-[#200b0e] border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>{audioUploading ? 'Processing File...' : 'Choose Voice File'}</span>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioFileUpload}
                                className="hidden"
                                disabled={audioUploading}
                              />
                            </label>
                          </div>

                          {/* Direct Audio URL input */}
                          <div>
                            <label className="block text-[11px] text-rose-200/70 mb-1 font-semibold">
                              Or Enter Voice Audio URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://... audio URL"
                              value={personalityForm.audioUrl.startsWith('data:') ? '[Uploaded Custom Audio File]' : personalityForm.audioUrl}
                              onChange={(e) => setPersonalityForm({ ...personalityForm, audioUrl: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400 truncate"
                            />
                          </div>
                        </div>

                        {/* Audio Preview Controls */}
                        {personalityForm.audioUrl && (
                          <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-amber-200 flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Audio Ready for Preview
                            </span>
                            <audio
                              controls
                              src={personalityForm.audioUrl}
                              className="h-8 w-full sm:w-64 accent-amber-500"
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-rose-200/60">
                          Upload your own voice recording or custom audio file to hear your voice when users interact with this personality card!
                        </p>
                      </div>

                      {/* LOGO & CUSTOM ICON MANAGEMENT SECTION */}
                      <div className="p-4 rounded-xl bg-red-950/40 border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Personality Logo & Custom Icon</span>
                          </label>
                          {personalityForm.customIconUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteConfirm('Remove Custom Logo', 'Uploaded Custom Logo / Icon', () => {
                                  setPersonalityForm((prev) => ({ ...prev, customIconUrl: '' }));
                                  showToast('Custom logo removed!');
                                });
                              }}
                              className="text-[11px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove Custom Logo
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Custom Logo Image File Upload */}
                          <div>
                            <label className="block text-[11px] text-rose-200/70 mb-1 font-semibold">
                              Upload Custom Icon/Logo Image (.png, .svg, .jpg)
                            </label>
                            <label className="w-full py-2.5 px-3 rounded-xl bg-[#200b0e] border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                              <span>{iconUploading ? 'Processing Image...' : 'Upload Custom Logo'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleIconFileUpload}
                                className="hidden"
                                disabled={iconUploading}
                              />
                            </label>
                          </div>

                          {/* Direct Image URL input */}
                          <div>
                            <label className="block text-[11px] text-rose-200/70 mb-1 font-semibold">
                              Or Enter Icon Image URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://... logo image URL"
                              value={personalityForm.customIconUrl?.startsWith('data:') ? '[Uploaded Custom Image File]' : (personalityForm.customIconUrl || '')}
                              onChange={(e) => setPersonalityForm({ ...personalityForm, customIconUrl: e.target.value })}
                              className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400 truncate"
                            />
                          </div>
                        </div>

                        {/* Custom Logo Preview */}
                        {personalityForm.customIconUrl && (
                          <div className="pt-2 border-t border-amber-500/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 p-1.5 flex items-center justify-center shrink-0 border border-amber-400/50 shadow-md">
                              <img
                                src={personalityForm.customIconUrl}
                                alt="Custom Logo Preview"
                                className="w-full h-full object-contain filter drop-shadow"
                              />
                            </div>
                            <span className="text-xs text-amber-200 font-semibold">
                              Custom Logo / Icon Active! Will replace preset vector icon.
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-rose-200/80 block mb-1">Preset Fallback Vector Icon</label>
                          <select
                            value={personalityForm.iconName}
                            onChange={(e) => setPersonalityForm({ ...personalityForm, iconName: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          >
                            <option value="Sparkles">Sparkles ✨</option>
                            <option value="Zap">Zap ⚡</option>
                            <option value="BookOpen">Book 📖</option>
                            <option value="Heart">Heart ❤️</option>
                            <option value="Ghost">Ghost 👻</option>
                            <option value="Flame">Flame 🔥</option>
                            <option value="Crown">Crown 👑</option>
                            <option value="Star">Star ⭐️</option>
                            <option value="Shield">Shield 🛡️</option>
                            <option value="Flower2">Flower 🌸</option>
                            <option value="Feather">Feather 🪶</option>
                            <option value="Gem">Gem 💎</option>
                            <option value="Moon">Moon 🌙</option>
                            <option value="Wand2">Wand 🪄</option>
                            <option value="Music">Music 🎵</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-rose-200/80 block mb-1">Color Gradient</label>
                          <select
                            value={personalityForm.color}
                            onChange={(e) => setPersonalityForm({ ...personalityForm, color: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          >
                            <option value="from-amber-500 to-red-600">Amber to Red</option>
                            <option value="from-orange-500 to-rose-600">Orange to Rose</option>
                            <option value="from-red-600 to-amber-600">Red to Amber</option>
                            <option value="from-rose-600 to-yellow-600">Rose to Yellow</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-lg"
                      >
                        {editingPersonalityId ? 'Save Changes' : '+ Add Personality Card'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Personality Cards List */}
                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-xs uppercase tracking-wider text-rose-200/60 px-1">
                      Current Cards ({personalityTraits.length})
                    </h5>

                    {personalityTraits.map((trait) => (
                      <div
                        key={trait.id}
                        className="glass-card p-4 rounded-xl border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {trait.customIconUrl && (
                              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 p-0.5 flex items-center justify-center shrink-0">
                                <img src={trait.customIconUrl} alt={trait.title} className="w-full h-full object-contain" />
                              </div>
                            )}
                            <h6 className="font-display font-bold text-sm text-white">{trait.title}</h6>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 border border-amber-500/40 text-amber-300 font-semibold">
                              {trait.subtitle}
                            </span>
                            {trait.customIconUrl && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold">
                                Custom Logo
                              </span>
                            )}
                            {trait.audioUrl ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 font-bold flex items-center gap-1">
                                <Mic className="w-3 h-3 text-amber-400" /> Custom Voice File
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-rose-300/60 font-semibold">
                                Speech Synthesized
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-rose-200/70 line-clamp-1">{trait.description}</p>
                          {trait.quote && (
                            <p className="text-[11px] text-amber-200/80 italic">&quot;{trait.quote}&quot;</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {trait.audioUrl && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                let url = trait.audioUrl;
                                if (url === '[FIREBASE_AUDIO]' || !url) {
                                  url = (await fetchPersonalityAudioFromCloud(trait.id)) || '';
                                }
                                if (url) {
                                  const audio = new Audio(url);
                                  audio.play().catch((err) => alert('Audio error: ' + err));
                                } else {
                                  alert('Voice audio is still syncing or not found.');
                                }
                              }}
                              className="p-2 rounded-lg bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-500/50 transition-colors cursor-pointer flex items-center gap-1"
                              title="Test Voice Line"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setEditingPersonalityId(trait.id);
                              let initialAudio = trait.audioUrl || '';
                              if (initialAudio === '[FIREBASE_AUDIO]') {
                                initialAudio = (await fetchPersonalityAudioFromCloud(trait.id)) || '';
                              }
                              setPersonalityForm({
                                title: trait.title,
                                subtitle: trait.subtitle,
                                description: trait.description,
                                iconName: trait.iconName,
                                customIconUrl: trait.customIconUrl || '',
                                quote: trait.quote,
                                color: trait.color,
                                audioUrl: initialAudio,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteConfirm('Delete Personality Card', trait.title, () => {
                                deletePersonalityTrait(trait.id);
                                if (editingPersonalityId === trait.id) {
                                  setEditingPersonalityId(null);
                                }
                                showToast(`Deleted personality card "${trait.title}"!`);
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-rose-300 text-xs font-semibold hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: HERO TITLES / SUBTITLES */}
              {activeTab === 'subtitles' && (
                <div className="space-y-6">
                  {/* Hero badge + main title editor */}
                  <HeroContentEditor heroContent={heroContent} onUpdate={updateHeroContent} />

                  {/* Form */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30">
                    <h4 className="font-display font-bold text-lg text-amber-200 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {editingSubtitleIndex !== null ? (
                          <Edit className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Plus className="w-5 h-5 text-amber-400" />
                        )}
                        {editingSubtitleIndex !== null
                          ? 'Edit Hero Title / Subtitle'
                          : 'Add New Animated Hero Subtitle'}
                      </span>
                      {editingSubtitleIndex !== null && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubtitleIndex(null);
                            setSubtitleInput('');
                          }}
                          className="text-xs text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </h4>
                    <p className="text-xs text-rose-200/70 mb-4">
                      These animated titles loop continuously in typewriter style in the main Hero banner section.
                    </p>

                    <form onSubmit={handleSaveSubtitle} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">
                          Subtitle Text / Title
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={subtitleInput}
                            onChange={(e) => setSubtitleInput(e.target.value)}
                            placeholder="e.g. Director of Wangsheng Funeral Parlor 👻"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-sm focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer shrink-0"
                          >
                            {editingSubtitleIndex !== null ? 'Save Title' : 'Add Title'}
                          </button>
                        </div>
                      </div>

                      {/* Quick Emoji Helper */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-amber-300/70">Insert Emoji:</span>
                        {['👻', '✨', '💮', '🎭', '🔥', '🌸', '💫', '👑', '🕯️', '🦋'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSubtitleInput((prev) => prev + emoji)}
                            className="px-2 py-0.5 text-xs rounded bg-red-950/80 border border-red-500/30 text-amber-200 hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </form>
                  </div>

                  {/* Subtitles List */}
                  <div className="space-y-3">
                    <h5 className="font-display font-bold text-sm text-amber-300 flex items-center justify-between">
                      <span>Current Hero Animated Subtitles ({subtitles.length})</span>
                      <span className="text-xs font-normal text-rose-200/60">
                        Top item displays first
                      </span>
                    </h5>

                    {subtitles.length === 0 ? (
                      <p className="text-xs text-rose-200/50 italic p-4 text-center">
                        No titles added yet. Add one above!
                      </p>
                    ) : (
                      subtitles.map((title, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl glass-card border border-red-500/20 flex items-center justify-between hover:border-amber-400/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-red-950 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-display font-bold text-sm text-white">
                              {title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSubtitle(idx, title);
                              }}
                              className="p-2 rounded-lg bg-red-950 text-amber-300 hover:text-white hover:bg-red-900 transition-colors cursor-pointer"
                              title="Edit subtitle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteConfirm('Delete Hero Subtitle', title, () => {
                                  deleteSubtitle(idx);
                                  if (editingSubtitleIndex === idx) {
                                    setEditingSubtitleIndex(null);
                                  }
                                  showToast(`Deleted subtitle "${title}"!`);
                                });
                              }}
                              className="p-2 rounded-lg bg-red-950 text-rose-300 hover:text-white hover:bg-red-800 transition-colors cursor-pointer"
                              title="Delete subtitle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: GALLERY & UPLOADS */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <SectionHeaderEditor
                    label="Gallery"
                    sectionKey="gallery"
                    headers={sectionHeaders}
                    onUpdate={updateSectionHeader}
                  />
                  {/* Gallery Categories Manager */}
                  <div className="glass-card p-5 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-red-950/30 via-amber-950/20 to-red-950/30 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="font-display font-bold text-base text-amber-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Manage Gallery Categories</span>
                        </h4>
                        <p className="text-xs text-rose-200/60 mt-0.5">
                          Add, rename, or delete filter tabs shown on the main gallery section.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteConfirm('Reset Gallery Categories', 'All custom categories back to defaults', () => {
                            resetGalleryCategories();
                            showToast('Categories reset to default!');
                          });
                        }}
                        className="text-xs text-amber-300 hover:text-white underline cursor-pointer"
                      >
                        Reset Categories
                      </button>
                    </div>

                    {/* Add Category Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCategoryInput.trim()) return;
                        addGalleryCategory(newCategoryInput.trim());
                        showToast(`Category "${newCategoryInput.trim()}" added!`);
                        setNewCategoryInput('');
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        placeholder="New Category Name (e.g. Sport, Game, Photo, Random...)"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-[#200b0e] border border-amber-500/40 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold hover:scale-102 transition-transform cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Category</span>
                      </button>
                    </form>

                    {/* Existing Categories Badges / List */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {galleryCategories.map((cat) => {
                        const isAll = cat.id === 'all' || cat.label.toLowerCase() === 'all';
                        const isEditing = editingCategoryId === cat.id;

                        if (isEditing) {
                          return (
                            <form
                              key={cat.id}
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (editingCategoryLabel.trim()) {
                                  updateGalleryCategory(cat.id, editingCategoryLabel.trim());
                                  showToast('Category updated!');
                                }
                                setEditingCategoryId(null);
                              }}
                              className="flex items-center gap-1.5 p-1 rounded-xl bg-red-950 border border-amber-400/60"
                            >
                              <input
                                type="text"
                                value={editingCategoryLabel}
                                onChange={(e) => setEditingCategoryLabel(e.target.value)}
                                className="px-2 py-1 rounded-lg bg-[#160a0b] text-white text-xs font-bold w-28 focus:outline-none border border-amber-400/40"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="px-2 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategoryId(null);
                                }}
                                className="px-2 py-1 rounded-lg bg-red-900 text-rose-200 text-xs hover:text-white cursor-pointer"
                              >
                                Cancel
                              </button>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={cat.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/80 border border-amber-500/30 text-amber-200 text-xs font-semibold"
                          >
                            <span>{cat.label}</span>
                            {!isAll && (
                              <div className="flex items-center gap-1 border-l border-amber-500/20 pl-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCategoryId(cat.id);
                                    setEditingCategoryLabel(cat.label);
                                  }}
                                  className="text-amber-400 hover:text-white transition-colors cursor-pointer"
                                  title="Edit Category Name"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    requestDeleteConfirm('Delete Gallery Category', cat.label, () => {
                                      deleteGalleryCategory(cat.id);
                                      showToast(`Category "${cat.label}" deleted!`);
                                    });
                                  }}
                                  className="text-rose-400 hover:text-red-200 transition-colors cursor-pointer"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload / Add New Form */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30">
                    <h4 className="font-display font-bold text-lg text-amber-200 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {editingGalleryId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5 text-amber-400" />}
                        {editingGalleryId ? 'Edit Gallery Artwork' : 'Upload / Add New Gallery Image'}
                      </span>
                      {editingGalleryId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGalleryId(null);
                            const defaultCat = galleryCategories.find((c) => c.id !== 'all')?.id || 'photo';
                            setGalleryForm({ title: '', category: defaultCat, imageUrl: '', description: '', tags: '' });
                          }}
                          className="text-xs text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </h4>

                    <form onSubmit={handleSaveGalleryItem} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title</label>
                          <input
                            type="text"
                            value={galleryForm.title}
                            onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                            placeholder="e.g. Tak Spring Celebration"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Category</label>
                          <select
                            value={galleryForm.category}
                            onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          >
                            {galleryCategories
                              .filter((cat) => cat.id !== 'all' && cat.label.toLowerCase() !== 'all')
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.label}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Image Source: Upload or URL */}
                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Image Source</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                          <input
                            type="text"
                            value={galleryForm.imageUrl}
                            onChange={(e) => setGalleryForm({ ...galleryForm, imageUrl: e.target.value })}
                            placeholder="Paste Image URL (https://...)"
                            className="flex-1 px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />

                          <label className="px-4 py-2 rounded-xl bg-red-950 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0">
                            <Upload className="w-4 h-4" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Preview Thumbnail if available with Crop & View controls */}
                      {galleryForm.imageUrl && (
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/60 border border-red-500/30">
                          <div className="flex items-center gap-3">
                            <img
                              src={galleryForm.imageUrl}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded-lg border border-amber-400/40 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold text-amber-300">Image Loaded</p>
                              <p className="text-[11px] text-rose-200/60">Ready to save, crop, or preview full size.</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openViewer(galleryForm.imageUrl, galleryForm.title || 'Gallery Artwork', galleryForm.description);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>View Full</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openCropper(galleryForm.imageUrl, 'Crop Gallery Image', editingGalleryId ? 'gallery-edit' : 'gallery-new');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-800 border border-amber-400/50 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Crop className="w-3.5 h-3.5" />
                              <span>Crop</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={galleryForm.description}
                          onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                          placeholder="Short description of the artwork or photo..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Tags (Comma separated)</label>
                        <input
                          type="text"
                          value={galleryForm.tags}
                          onChange={(e) => setGalleryForm({ ...galleryForm, tags: e.target.value })}
                          placeholder="e.g. Tak, Lanterns, Red Plum"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                      >
                        {editingGalleryId ? 'Update Gallery Item' : 'Add to Gallery'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Gallery Items List */}
                  <div>
                    <h5 className="font-display font-bold text-sm text-amber-300 uppercase tracking-wider mb-3">
                      Current Gallery Showcase ({galleryItems.length})
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {galleryItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-2xl glass-card border border-red-500/20"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded-xl border border-amber-400/30 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-xs text-white truncate">{item.title}</p>
                            <p className="text-[10px] text-amber-300 uppercase">
                              {galleryCategories.find(c => c.id === item.category || c.label.toLowerCase() === item.category.toLowerCase())?.label || item.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <label
                              className="p-1.5 rounded-lg bg-red-950 text-amber-300 hover:text-white hover:bg-red-800 transition-colors cursor-pointer"
                              title="Upload new image from computer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleGalleryItemImageUpload(item.id, e)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGallery(item);
                              }}
                              className="p-1.5 rounded-lg bg-red-950 text-amber-300 hover:text-white hover:bg-amber-600 transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDeleteConfirm('Delete Gallery Item', item.title, () => {
                                  deleteGalleryItem(item.id);
                                  if (editingGalleryId === item.id) {
                                    setEditingGalleryId(null);
                                  }
                                  showToast(`Deleted "${item.title}" from gallery!`);
                                });
                              }}
                              className="p-1.5 rounded-lg bg-red-950 text-rose-300 hover:text-white hover:bg-red-700 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FUN FACTS */}
              {activeTab === 'facts' && (
                <div className="space-y-6">
                  <SectionHeaderEditor
                    label="Fun Facts"
                    sectionKey="funFacts"
                    headers={sectionHeaders}
                    onUpdate={updateSectionHeader}
                  />
                  {/* Form */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30">
                    <h4 className="font-display font-bold text-lg text-amber-200 mb-4 flex items-center justify-between">
                      <span>{editingFactId ? 'Edit Fun Fact' : 'Add New Fun Fact / Lore'}</span>
                      {editingFactId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFactId(null);
                            setFactForm({ title: '', fact: '', iconName: 'Sparkles', secretDetail: '', badge: 'Secret Lore' });
                          }}
                          className="text-xs text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </h4>

                    <form onSubmit={handleSaveFact} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Title</label>
                          <input
                            type="text"
                            value={factForm.title}
                            onChange={(e) => setFactForm({ ...factForm, title: e.target.value })}
                            placeholder="e.g. Favorite Dish"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={factForm.badge}
                            onChange={(e) => setFactForm({ ...factForm, badge: e.target.value })}
                            placeholder="e.g. Secret Lore"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Fact Description (Front Side)</label>
                        <textarea
                          rows={2}
                          value={factForm.fact}
                          onChange={(e) => setFactForm({ ...factForm, fact: e.target.value })}
                          placeholder="The main fact shown on card front..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Secret Lore (Card Back Side)</label>
                        <input
                          type="text"
                          value={factForm.secretDetail}
                          onChange={(e) => setFactForm({ ...factForm, secretDetail: e.target.value })}
                          placeholder="Secret detail revealed when clicked..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                      >
                        {editingFactId ? 'Update Fact' : 'Add Fun Fact'}
                      </button>
                    </form>
                  </div>

                  {/* Fact List */}
                  <div className="space-y-3">
                    {funFacts.map((fact) => (
                      <div key={fact.id} className="p-4 rounded-2xl glass-card border border-red-500/20 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-display font-bold text-sm text-white">{fact.title}</h5>
                            <span className="text-[10px] bg-red-950 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                              {fact.badge}
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/70 mt-1">{fact.fact}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFact(fact);
                            }}
                            className="p-2 rounded-lg bg-red-950 text-amber-300 hover:text-white cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteConfirm('Delete Fun Fact', fact.title, () => {
                                deleteFunFact(fact.id);
                                if (editingFactId === fact.id) {
                                  setEditingFactId(null);
                                }
                                showToast(`Deleted fact "${fact.title}"!`);
                              });
                            }}
                            className="p-2 rounded-lg bg-red-950 text-rose-300 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUOTES */}
              {activeTab === 'quotes' && (
                <div className="space-y-6">
                  <SectionHeaderEditor
                    label="Quotes"
                    sectionKey="quotes"
                    headers={sectionHeaders}
                    onUpdate={updateSectionHeader}
                  />
                  {/* Form */}
                  <div className="glass-card p-6 rounded-2xl border border-red-500/30">
                    <h4 className="font-display font-bold text-lg text-amber-200 mb-4 flex items-center justify-between">
                      <span>{editingQuoteId ? 'Edit Quote' : 'Add New Quote'}</span>
                      {editingQuoteId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingQuoteId(null);
                            setQuoteForm({ text: '', context: '', japaneseText: '' });
                          }}
                          className="text-xs text-rose-300 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </h4>

                    <form onSubmit={handleSaveQuote} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1">Quote Text (English)</label>
                        <textarea
                          rows={2}
                          value={quoteForm.text}
                          onChange={(e) => setQuoteForm({ ...quoteForm, text: e.target.value })}
                          placeholder='e.g. "When the sun is out, bathe in the sun!"'
                          className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Context / Occasion</label>
                          <input
                            type="text"
                            value={quoteForm.context}
                            onChange={(e) => setQuoteForm({ ...quoteForm, context: e.target.value })}
                            placeholder="e.g. Idle Line"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-rose-200/80 mb-1">Japanese / Chinese Text (Optional)</label>
                          <input
                            type="text"
                            value={quoteForm.japaneseText}
                            onChange={(e) => setQuoteForm({ ...quoteForm, japaneseText: e.target.value })}
                            placeholder="e.g. 日差しがある時は日光浴！"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#200b0e] border border-red-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                      >
                        {editingQuoteId ? 'Update Quote' : 'Add Quote'}
                      </button>
                    </form>
                  </div>

                  {/* Quotes List */}
                  <div className="space-y-3">
                    {quotes.map((q) => (
                      <div key={q.id} className="p-4 rounded-2xl glass-card border border-red-500/20 flex items-center justify-between">
                        <div>
                          <p className="font-display font-bold text-sm text-white">&quot;{q.text}&quot;</p>
                          <p className="text-xs text-amber-300 mt-1">{q.context} {q.japaneseText && `• ${q.japaneseText}`}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditQuote(q);
                            }}
                            className="p-2 rounded-lg bg-red-950 text-amber-300 hover:text-white cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requestDeleteConfirm('Delete Quote', `"${q.text}"`, () => {
                                deleteQuote(q.id);
                                if (editingQuoteId === q.id) {
                                  setEditingQuoteId(null);
                                }
                                showToast('Quote deleted!');
                              });
                            }}
                            className="p-2 rounded-lg bg-red-950 text-rose-300 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: BACKGROUND MUSIC & AUDIO SETTINGS */}
              {activeTab === 'music' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display font-bold text-lg text-amber-200 flex items-center gap-2">
                        <Music className="w-5 h-5 text-amber-400" />
                        <span>Ambient Background Music Settings</span>
                      </h4>
                      <p className="text-xs text-rose-200/70 mt-1">
                        Upload custom music files from your computer, adjust volume, or toggle the ambient oriental melody.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {musicMode === 'custom' && playlist.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            ambientMusic.previousTrack();
                            showToast('Playing previous track');
                          }}
                          className="p-2.5 rounded-2xl border border-red-500/40 bg-red-950/80 text-amber-300 hover:bg-red-900 transition-colors cursor-pointer shadow-md"
                          title="Previous Track"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const isNowPlaying = ambientMusic.toggle();
                          setMusicPlaying(isNowPlaying);
                          showToast(isNowPlaying ? 'Background music started!' : 'Background music paused.');
                        }}
                        className={`px-4 py-2.5 rounded-2xl border font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                          musicPlaying
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(247,127,0,0.4)]'
                            : 'bg-red-950/80 border-red-500/40 text-rose-200/80 hover:text-amber-200'
                        }`}
                      >
                        {musicPlaying ? (
                          <>
                            <Pause className="w-4 h-4 text-amber-400" />
                            <span>Pause Music</span>
                            <span className="flex items-center gap-0.5 ml-1 h-3">
                              <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
                              <span className="w-0.5 h-3.5 bg-amber-300 rounded-full animate-bounce [animation-delay:150ms]" />
                              <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 text-amber-400" />
                            <span>Play Background Music</span>
                          </>
                        )}
                      </button>

                      {musicMode === 'custom' && playlist.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            ambientMusic.nextTrack();
                            showToast('Playing next track');
                          }}
                          className="p-2.5 rounded-2xl border border-red-500/40 bg-red-950/80 text-amber-300 hover:bg-red-900 transition-colors cursor-pointer shadow-md"
                          title="Next Track"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Audio Mode Selection */}
                  <div className="p-5 rounded-3xl glass-card border border-red-500/30 space-y-4 bg-[#1c0c0e]">
                    <h5 className="font-display font-bold text-sm text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Select Audio Source Mode</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Oriental Bamboo Flute Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setMusicModeState('synth');
                          ambientMusic.setMode('synth');
                          showToast('Switched to Oriental Bamboo Flute Melody');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          musicMode === 'synth'
                            ? 'bg-gradient-to-tr from-amber-950/80 to-red-950 border-amber-400 text-amber-200 shadow-lg'
                            : 'bg-[#200b0e]/70 border-red-500/20 text-rose-200/60 hover:text-white hover:border-amber-500/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-display font-bold text-sm text-amber-300">🎼 Oriental Bamboo Flute</span>
                            {musicMode === 'synth' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">ACTIVE</span>
                            )}
                          </div>
                          <p className="text-xs text-rose-200/70">
                            Soothing, mysterious Web Audio API synthesized flute & atmospheric Liyue drone loop.
                          </p>
                        </div>
                      </button>

                      {/* Custom Uploaded Track Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setMusicModeState('custom');
                          ambientMusic.setMode('custom');
                          showToast('Switched to Custom Audio Playlist');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          musicMode === 'custom'
                            ? 'bg-gradient-to-tr from-amber-950/80 to-red-950 border-amber-400 text-amber-200 shadow-lg'
                            : 'bg-[#200b0e]/70 border-red-500/20 text-rose-200/60 hover:text-white hover:border-amber-500/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-display font-bold text-sm text-amber-300">🎵 Custom Playlist ({playlist.length})</span>
                            {musicMode === 'custom' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold">ACTIVE</span>
                            )}
                          </div>
                          <p className="text-xs text-rose-200/70">
                            Play your stored music files in continuous auto-playing sequential order.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Custom Background Music Track Management */}
                  <div className="p-5 rounded-3xl glass-card border border-amber-500/30 space-y-4 bg-[#1e0a0c]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Background Music Storage ({playlist.length} Files Saved)</span>
                      </label>
                      {playlist.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            requestDeleteConfirm('Clear All Custom Music', 'Remove all uploaded audio files', () => {
                              ambientMusic.clearAllCustomTracks();
                              showToast('All custom music tracks removed.');
                            });
                          }}
                          className="text-xs text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear All Music
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Upload Audio File From Computer */}
                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                          Upload Music File (.mp3, .wav, .ogg, .m4a)
                        </label>
                        <label className="w-full py-3 px-4 rounded-2xl bg-[#2b0d10] border border-amber-500/40 hover:border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{musicUploading ? 'Processing Audio File...' : 'Choose Music File From Computer'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleMusicFileUpload}
                            className="hidden"
                            disabled={musicUploading}
                          />
                        </label>
                        <p className="text-[11px] text-rose-200/50 mt-1">
                          Max file size: 15MB. Saved directly to Firebase Storage.
                        </p>
                      </div>

                      {/* Direct Audio URL */}
                      <div>
                        <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                          Or Add Audio File Web URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://example.com/background-music.mp3"
                            value={musicUrlInput}
                            onChange={(e) => setMusicUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddUrlTrack();
                            }}
                            className="w-full px-4 py-2.5 rounded-2xl bg-[#2b0d10] border border-red-500/40 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={handleAddUrlTrack}
                            className="px-3 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs hover:bg-amber-500/30 shrink-0 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-rose-200/50">
                            Direct HTTP audio link to add to auto-play playlist.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              await ambientMusic.loadDefaultPresetTracks();
                              showToast('Loaded Oriental Ambient Playlist!');
                            }}
                            className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
                          >
                            + Load Oriental 3-Song Pack
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stored Playlist Files */}
                    {playlist.length > 0 && (
                      <div className="pt-3 border-t border-amber-500/20 space-y-2">
                        <p className="text-xs font-bold text-amber-200/90 mb-2">
                          Saved Music Tracks (Auto-plays in order):
                        </p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {playlist.map((track, idx) => {
                            const isCurrent = musicMode === 'custom' && idx === currentTrackIndex;
                            return (
                              <div
                                key={track.id}
                                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                                  isCurrent
                                    ? 'bg-amber-950/60 border-amber-400/80 text-amber-200 shadow-md'
                                    : 'bg-[#2b0d10]/60 border-red-500/20 text-rose-200/80 hover:border-amber-500/40'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => ambientMusic.playTrackAtIndex(idx)}
                                    className={`p-2 rounded-xl shrink-0 cursor-pointer transition-colors ${
                                      isCurrent && musicPlaying
                                        ? 'bg-amber-400 text-black'
                                        : 'bg-red-950 border border-amber-500/30 text-amber-300 hover:bg-red-900'
                                    }`}
                                    title="Play this track"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                  </button>

                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                                      {idx + 1}. {track.name}
                                    </p>
                                    <p className="text-[10px] text-amber-200/60 flex items-center gap-2">
                                      {track.size && <span>Size: {track.size}</span>}
                                      {isCurrent && musicPlaying && (
                                        <span className="text-amber-400 font-bold flex items-center gap-1">
                                          <span>● NOW PLAYING</span>
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    ambientMusic.removeTrack(track.id);
                                    showToast(`Removed "${track.name}"`);
                                  }}
                                  className="p-1.5 rounded-xl text-rose-300 hover:text-red-400 hover:bg-red-950 transition-colors shrink-0 cursor-pointer"
                                  title="Delete music track"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Volume Slider Section */}
                  <div className="p-5 rounded-3xl glass-card border border-red-500/30 space-y-3 bg-[#1c0c0e]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-amber-400" />
                        <span>Background Music Volume Level</span>
                      </label>
                      <span className="text-xs font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/40">
                        {Math.round(musicVolume * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <VolumeX className="w-4 h-4 text-rose-200/50 shrink-0" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={musicVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setMusicVolumeState(val);
                          ambientMusic.setVolume(val);
                        }}
                        className="w-full accent-amber-400 h-2 bg-red-950 rounded-lg cursor-pointer"
                      />
                      <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex-none p-3 sm:p-4 border-t border-red-500/30 bg-[#160a0b] flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-display text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                Close Portal
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperModal.isOpen}
        imageUrl={cropperModal.imageUrl}
        title={cropperModal.title}
        onClose={() => setCropperModal((prev) => ({ ...prev, isOpen: false }))}
        onCropComplete={handleCropComplete}
      />

      {/* Full Size Picture Viewer Modal */}
      <ImageViewerModal
        isOpen={viewerModal.isOpen}
        image={viewerModal.image}
        onClose={() => setViewerModal({ isOpen: false, image: null })}
      />

      {/* 2-Step Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.title}
        itemName={deleteConfirmState.itemName}
        onConfirm={deleteConfirmState.onConfirm}
        onCancel={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>,
    document.body
  );
};

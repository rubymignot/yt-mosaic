export type Language = 'fr' | 'en';

export type Translations = {
  title: string;
  description: string;
  loading: string;
  videos: string;
  addSlot: string;
  clearAll: string;
  export: string;
  import: string;
  editVideos: string;
  collapse: string;
  switchToGallery: string;
  switchToGrid: string;
  toggleFullscreen: string;
  showGuide: string;
  hideControls: string;
  showControls: string;
  pasteClipboard: string;
  removeSlot: string;
  emptySlot: string;
  placeholder: string;
  exportSuccess: string;
  importSuccess: string;
  importStarting: string;
  importReplace: string;
  importError: string;
  noVideosToExport: string;
  switchedTo: string;
  gridView: string;
  galleryView: string;
  view: string;
  keyboardShortcuts: string;
  toggleTopControls: string;
  toggleFullscreenGuide: string;
  toggleGridGallery: string;
  focusVideo: string;
  unfocusVideo: string;
  guideNote: string;
  emptySlotLabel: string;
  loadingVideo: string;
  errorLoading: string;
  videoId: string;
  madeInFrance: string;
  by: string;
};

export const translations: Record<Language, Translations> = {
  en: {
    // Layout
    title: "YT Mosaic Viewer",
    description: "Watch multiple YouTube videos at once in a customizable mosaic layout.",
    loading: "Loading...",
    
    // Controls
    videos: "Videos",
    addSlot: "Add Slot",
    clearAll: "Clear All",
    export: "Export",
    import: "Import",
    editVideos: "Edit Videos",
    collapse: "Collapse",
    
    // Grid/Gallery
    switchToGallery: "Switch to Gallery View (G)",
    switchToGrid: "Switch to Grid View (G)",
    toggleFullscreen: "Toggle Fullscreen (F)",
    showGuide: "Show Keyboard Shortcuts Guide (?)",
    hideControls: "Hide Top Controls (H)",
    showControls: "Show Top Controls (H)",
    
    // Video inputs
    pasteClipboard: "Paste from clipboard",
    removeSlot: "Remove video slot",
    emptySlot: "Empty slot - Click to edit",
    placeholder: "YouTube URL or ID",
    
    // Notifications
    exportSuccess: "exported successfully!",
    importSuccess: "Playlist import completed successfully!",
    importStarting: "videos from",
    importReplace: "This will replace current videos.",
    importError: "Failed to import playlist:",
    noVideosToExport: "No videos to export",
    switchedTo: "Switched to",
    gridView: "Grid",
    galleryView: "Gallery",
    view: "view",
    
    // Guide
    keyboardShortcuts: "Keyboard Shortcuts",
    toggleTopControls: "Toggle Top Controls Bar",
    toggleFullscreenGuide: "Toggle Fullscreen",
    toggleGridGallery: "Toggle Grid / Gallery View",
    focusVideo: "Focus/Select Video (in Gallery/Grid mode)",
    unfocusVideo: "Unfocus Video (in Gallery mode)",
    guideNote: "Hover over a video to see controls. Click a video to toggle mute.",
    
    // YouTube Embed
    emptySlotLabel: "Empty Slot",
    loadingVideo: "Loading...",
    errorLoading: "Error loading video.",
    videoId: "ID:",
    
    // Footer
    madeInFrance: "Made in France",
    by: "by",
  },
  fr: {
    // Layout
    title: "YT Mosaic Viewer",
    description: "Regardez plusieurs vidéos YouTube simultanément dans une mosaïque personnalisable.",
    loading: "Chargement...",
    
    // Controls
    videos: "Vidéos",
    addSlot: "Ajouter",
    clearAll: "Tout Effacer",
    export: "Exporter",
    import: "Importer",
    editVideos: "Modifier Vidéos",
    collapse: "Réduire",
    
    // Grid/Gallery
    switchToGallery: "Passer en mode Galerie (G)",
    switchToGrid: "Passer en mode Grille (G)",
    toggleFullscreen: "Basculer Plein Écran (F)",
    showGuide: "Afficher les Raccourcis Clavier (?)",
    hideControls: "Masquer les Contrôles (H)",
    showControls: "Afficher les Contrôles (H)",
    
    // Video inputs
    pasteClipboard: "Coller depuis le presse-papiers",
    removeSlot: "Supprimer l'emplacement vidéo",
    emptySlot: "Emplacement vide - Cliquer pour modifier",
    placeholder: "URL ou ID YouTube",
    
    // Notifications
    exportSuccess: "exportée avec succès !",
    importSuccess: "Import de playlist terminé avec succès !",
    importStarting: "vidéos depuis",
    importReplace: "Ceci remplacera les vidéos actuelles.",
    importError: "Échec de l'import de la playlist :",
    noVideosToExport: "Aucune vidéo à exporter",
    switchedTo: "Passage en mode",
    gridView: "Grille",
    galleryView: "Galerie",
    view: "",
    
    // Guide
    keyboardShortcuts: "Raccourcis Clavier",
    toggleTopControls: "Afficher/Masquer la Barre de Contrôle",
    toggleFullscreenGuide: "Basculer Plein Écran",
    toggleGridGallery: "Basculer Grille / Galerie",
    focusVideo: "Sélectionner Vidéo (en mode Galerie/Grille)",
    unfocusVideo: "Désélectionner Vidéo (en mode Galerie)",
    guideNote: "Survolez une vidéo pour voir les contrôles. Cliquez pour activer/désactiver le son.",
    
    // YouTube Embed
    emptySlotLabel: "Emplacement Vide",
    loadingVideo: "Chargement...",
    errorLoading: "Erreur de chargement de la vidéo.",
    videoId: "ID :",
    
    // Footer
    madeInFrance: "Made in France",
    by: "par",
  }
};

// Detect browser language
export const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('fr') ? 'fr' : 'en';
};

// Get translation
export const getTranslations = (lang?: Language) => {
  const language = lang || detectLanguage();
  return translations[language];
};


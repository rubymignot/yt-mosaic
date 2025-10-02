"use client";

import { useState, useRef } from "react";
import { extractVideoId, processPlaylistFile } from "../utils/importHelpers";
import { NotificationType } from "./Notification";
import {
  PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, ArrowsPointingOutIcon,
  Squares2X2Icon, RectangleStackIcon, QuestionMarkCircleIcon, XMarkIcon, PencilSquareIcon,
  ClipboardIcon, EyeIcon, EyeSlashIcon, ChevronUpIcon
} from '@heroicons/react/24/outline'; // Using Heroicons for consistency
import { Translations, Language } from "../utils/translations";

interface MosaicControlsProps {
  videoUrls: string[];
  updateVideo: (index: number, url: string, id: string) => void;
  addVideo: () => void;
  removeVideo: (index: number) => void;
  maxVideos: number;
  startPlaylistImport?: () => void;
  finishPlaylistImport?: () => void;
  showNotification: (message: string, type: NotificationType) => void;
  currentLayout: string;
  setLayout: (layout: "grid" | "focus" | ((prev: string) => "grid" | "focus")) => void;
  setFocusedVideo: (index: number | null | ((prev: number | null) => number | null)) => void;
  toggleFullscreen: () => void;
  toggleControls: () => void;
  toggleGuide: () => void;
  isControlsVisible: boolean;
  t: Translations;
  language: Language;
  toggleLanguage: () => void;
}

export default function MosaicControls({ 
  videoUrls, 
  updateVideo, 
  addVideo, 
  removeVideo,
  maxVideos = 12,
  startPlaylistImport,
  finishPlaylistImport,
  showNotification,
  currentLayout,
  setLayout,
  setFocusedVideo,
  toggleFullscreen,
  toggleControls,
  toggleGuide,
  isControlsVisible,
  t,
  language,
  toggleLanguage
}: MosaicControlsProps) {
  const [expandedInputs, setExpandedInputs] = useState(false);
  const [activeInput, setActiveInput] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (index: number, url: string) => {
    const videoId = extractVideoId(url);
    updateVideo(index, url, videoId);
  };

  const handlePaste = async (index: number) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInputChange(index, text);
        // Clear the clipboard notification
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const focusInput = (index: number) => {
    setActiveInput(index);
    setExpandedInputs(true);
  };

  const clearAllVideos = () => {
    // Create an array of the indices to remove in reverse order
    // We need to remove them from highest to lowest to avoid index shifting issues
    const indices = videoUrls.map((_, i) => i).filter(i => i >= 2); // Keep first 2
    
    // Remove videos from highest index to lowest (reversed)
    for (let i = indices.length - 1; i >= 0; i--) {
      removeVideo(indices[i]);
    }
    
    // Now clear the first two slots (if they exist)
    if (videoUrls.length > 0) updateVideo(0, "", "");
    if (videoUrls.length > 1) updateVideo(1, "", "");
  };
  
  // Get initials from URL for compact display
  const getVideoLabel = (url: string): string => {
    if (!url) return "•";
    
    try {
      if (url.includes("youtu.be") || url.includes("youtube.com")) {
        const videoId = extractVideoId(url);
        return videoId.substring(0, 3);
      }
      
      // Try to get domain for other URLs
      const urlObj = new URL(url);
      const hostnameParts = urlObj.hostname.split('.');
      if (hostnameParts.length > 1) {
        return hostnameParts[hostnameParts.length - 2].substring(0, 3).toUpperCase(); // e.g., GOO from google.com
      }
      return urlObj.hostname.substring(0, 1).toUpperCase();
    } catch {
      return url.substring(0, 3); // Fallback
    }
  };

  // Generate a random name for the playlist export
  const generatePlaylistName = (): string => {
    const adjectives = ['Awesome', 'Epic', 'Cool', 'Amazing', 'Great', 'Stellar', 'Fantastic', 'Incredible'];
    const nouns = ['Playlist', 'Collection', 'Mix', 'Set', 'Compilation', 'Selection', 'Tracks', 'Videos'];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return `${randomAdj}${randomNoun}_${dateStr}`;
  };

  // Export playlist to JSON file
  const exportPlaylist = () => {
    // Filter out empty URLs
    const nonEmptyUrls = videoUrls.filter(url => url.trim() !== '');
    
    if (nonEmptyUrls.length === 0) {
      alert(t.noVideosToExport);
      return;
    }
    
    const playlistData = {
      name: generatePlaylistName(),
      created: new Date().toISOString(),
      videos: nonEmptyUrls
    };
    
    const dataStr = JSON.stringify(playlistData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${playlistData.name}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    // Show success notification
    showNotification(`Playlist "${playlistData.name}" ${t.exportSuccess}`, 'success');
  };

  // Import playlist from JSON file - completely rewritten with a single-step approach
  const importPlaylist = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Start the import process - this blocks cookie operations
      if (startPlaylistImport) startPlaylistImport();
      
      // Process the file using our utility function
      const result = await processPlaylistFile(file, maxVideos);
      
      if (!result) {
        showNotification(`${t.importError} Invalid file format or content.`, 'error');
        if (finishPlaylistImport) finishPlaylistImport(); // Cancel import
        return;
      }
      
      const { urls, ids } = result;
      
      // Tell the user we're starting the import via notification
      showNotification(`${t.importStarting} ${urls.length} ${t.videos.toLowerCase()} "${file.name}"... ${t.importReplace}`, 'info');
      
      // Clear existing videos first - get down to the required minimum (e.g., 2)
      const minVideos = 2; // Keep at least 2 slots
      while (videoUrls.length > minVideos) {
        removeVideo(videoUrls.length - 1);
      }
      
      // Update the initial slots (up to minVideos)
      for (let i = 0; i < minVideos; i++) {
        updateVideo(i, urls[i] || "", ids[i] || ""); // Use || "" for empty slots
      }
      
      // Add and update remaining videos
      const videosToAdd = urls.slice(minVideos, Math.min(urls.length, maxVideos));
      
      // Use Promise.all for potentially faster updates if component handles it well
      await Promise.all(videosToAdd.map(async (url, idx) => {
        const targetIndex = minVideos + idx;
        if (targetIndex >= videoUrls.length) {
          addVideo(); // Add a slot if needed
          // Wait briefly for the state update if addVideo is async or has delays
          await new Promise(resolve => setTimeout(resolve, 50)); 
        }
        updateVideo(targetIndex, url, extractVideoId(url));
      }));
      
      // Final check: Remove any extra empty slots if import resulted in fewer than maxVideos but more slots than videos
      while (videoUrls.length > urls.length && videoUrls.length > minVideos) {
         removeVideo(videoUrls.length - 1);
      }

      // Finish the import and save to cookies
      if (finishPlaylistImport) {
        finishPlaylistImport();
      }
      
      // Show completion notification - no longer forcing reload
      showNotification(t.importSuccess, 'success');
      
    } catch (error) {
      console.error('Error importing playlist:', error);
      showNotification(`${t.importError} ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      if (finishPlaylistImport) finishPlaylistImport(); // Cancel import
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Base styles for control buttons
  const baseButtonClass = "flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const primaryButtonClass = `${baseButtonClass} bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500`;
  const secondaryButtonClass = `${baseButtonClass} bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500`;
  const dangerButtonClass = `${baseButtonClass} bg-red-700 hover:bg-red-600 text-white focus:ring-red-500`;
  const successButtonClass = `${baseButtonClass} bg-green-700 hover:bg-green-600 text-white focus:ring-green-500`;
  const purpleButtonClass = `${baseButtonClass} bg-purple-700 hover:bg-purple-600 text-white focus:ring-purple-500`;
  const iconButtonClass = "flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/80 hover:bg-gray-600/90 text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500";

  return (
    <div className="w-full flex flex-col gap-4"> {/* Increased gap slightly */}
      {/* Top Row: Main Actions & Info */} 
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Video Count & Basic Actions */} 
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-medium text-gray-400 bg-gray-800/60 px-2.5 py-1 rounded-md"> {/* Subtle background */}
            {videoUrls.length} / {maxVideos} {t.videos}
          </div>
          {videoUrls.length < maxVideos && (
            <button
              onClick={addVideo}
              className={`${primaryButtonClass}`}
              title={t.addSlot}
            >
              <PlusIcon className="w-4 h-4 mr-1.5" /> {t.addSlot}
            </button>
          )}
          <button
            onClick={clearAllVideos}
            className={`${dangerButtonClass}`}
            title={t.clearAll}
          >
             <TrashIcon className="w-4 h-4 mr-1.5" /> {t.clearAll}
          </button>
          <button
            onClick={exportPlaylist}
            className={`${successButtonClass}`}
            title={t.export}
          >
            <ArrowUpTrayIcon className="w-4 h-4 mr-1.5" /> {t.export}
          </button>
          <button
            onClick={handleImportClick}
            className={`${purpleButtonClass}`}
            title={t.import}
          >
             <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" /> {t.import}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={importPlaylist}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Right Side: View Controls & Edit Toggle */} 
        <div className="flex items-center gap-2 flex-wrap">
           {/* Relocated Controls */} 
          <button 
            onClick={() => {setLayout(prev => prev === "grid" ? "focus" : "grid"); setFocusedVideo(null);}}
            className={iconButtonClass}
            title={currentLayout === "grid" ? t.switchToGallery : t.switchToGrid}
          >
            {currentLayout === "grid" ? 
              <RectangleStackIcon className="h-5 w-5" /> 
              : 
              <Squares2X2Icon className="h-5 w-5" />
            }
          </button>
          <button 
            onClick={toggleFullscreen} 
            className={iconButtonClass}
            title={t.toggleFullscreen}
          >
             <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
           <button 
            onClick={toggleGuide} 
            className={`${iconButtonClass} hover:bg-blue-600/90`}
            title={t.showGuide}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={toggleLanguage}
            className={`${iconButtonClass} hover:bg-green-600/90`}
            title={`Language: ${language === 'en' ? 'English → Français' : 'Français → English'}`}
          >
            <span className="text-xs font-bold">{language.toUpperCase()}</span>
          </button>
          <button 
            onClick={toggleControls} 
            className={`${iconButtonClass} hover:bg-red-600/90`}
            title={isControlsVisible ? t.hideControls : t.showControls}
          >
            {isControlsVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
          
          {/* Edit Toggle */} 
          <button 
            className={`${secondaryButtonClass} ${expandedInputs ? '!bg-gray-600' : ''}`} // Use secondary style, override background when active
            onClick={() => setExpandedInputs(!expandedInputs)}
            title={expandedInputs ? t.collapse : t.editVideos}
          >
            {expandedInputs ? 
              <ChevronUpIcon className="w-4 h-4 mr-1.5" /> : 
              <PencilSquareIcon className="w-4 h-4 mr-1.5" /> // Use PencilSquare for "Edit" idea
            }
            {expandedInputs ? t.collapse : t.editVideos}
          </button>
        </div>
      </div>

      {/* Bottom Row: Expanded Inputs or Compact Buttons */} 
      {expandedInputs ? (
        // Expanded Inputs View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/50"> {/* Increased max-h slightly */}
          {videoUrls.map((url, index) => (
            <div key={index} className={`flex items-center rounded-md overflow-hidden shadow-sm transition-shadow bg-gray-800 ${activeInput === index ? 'ring-2 ring-blue-500 ring-inset' : 'ring-1 ring-gray-700/50'}`}> {/* Softer default ring */}
              <span className="bg-gray-700 text-xs font-mono px-2.5 py-2 text-gray-400 select-none">{index + 1}</span> {/* Slightly more padding */}
              <input
                type="text"
                value={url}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onFocus={() => setActiveInput(index)}
                onBlur={() => setActiveInput(null)}
                placeholder={t.placeholder}
                className="flex-grow bg-transparent border-none p-2 text-white text-sm focus:ring-0 placeholder-gray-500" // Increased size slightly
              />
              <button
                onClick={() => handlePaste(index)}
                className="bg-gray-700 hover:bg-blue-700 p-2 transition-colors border-l border-gray-600/50" // Match input padding, softer border
                title={t.pasteClipboard}
              >
                 <ClipboardIcon className="w-4 h-4 text-gray-300"/>
              </button>
              {videoUrls.length > 2 && (
                <button
                  onClick={() => removeVideo(index)}
                  className="bg-gray-700 hover:bg-red-700 p-2 transition-colors border-l border-gray-600/50" // Match input padding, softer border
                  title={t.removeSlot}
                >
                   <XMarkIcon className="w-4 h-4 text-gray-300"/>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Compact Buttons View
        <div className="flex flex-wrap gap-2"> {/* Slightly larger gap */}
          {videoUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => focusInput(index)}
              className={`px-2.5 py-1.5 rounded-md text-xs flex items-center transition-all duration-150 shadow-sm border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-900 focus:ring-blue-500 ${url ? 'bg-gray-700/80 hover:bg-gray-600/90 border-gray-600/50' : 'bg-gray-800/60 hover:bg-gray-700/80 border-dashed border-gray-600/80'}`}
              title={url || t.emptySlot}
            >
              <span className="w-5 text-center font-mono text-gray-400 mr-2 select-none">{index + 1}</span> {/* Slightly more space */}
              <span className={`truncate max-w-[50px] font-medium ${url ? 'text-gray-200' : 'text-gray-500'}`}>{url ? getVideoLabel(url) : t.emptySlotLabel}</span> {/* Clearer empty state */}
            </button>
          ))}
        </div>
      )}
      
      {/* Credit Row - Bottom of Top Bar */}
      <div className="flex justify-end">
        <div className="text-xs text-gray-500">
          {t.madeInFrance} {t.by} <a href="https://rubymignot.com" target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 transition-colors">Ruby Mignot</a>
        </div>
      </div>
    </div>
  );
} 
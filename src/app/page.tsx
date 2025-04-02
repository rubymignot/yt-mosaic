"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import YouTubeEmbed from "./components/YouTubeEmbed";
import MosaicControls from "./components/MosaicControls";
import { extractVideoId } from "./utils/importHelpers";
import Notification, { NotificationType } from "./components/Notification";
import GuidePopup from "./components/GuidePopup";

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 30) => {
  try {
    // Check if value is too large (4KB is a safe limit for cookies)
    if (value.length > 4000) {
      console.warn(`Cookie ${name} value too large (${value.length} chars), truncating`);
      // For URLs cookie, we'll truncate the list rather than the value
      if (name === 'yt-mosaic-urls') {
        const urls = JSON.parse(decodeURIComponent(value));
        while (encodeURIComponent(JSON.stringify(urls)).length > 4000 && urls.length > 2) {
          urls.pop(); // Remove the last URL
        }
        value = encodeURIComponent(JSON.stringify(urls));
      } else {
        // For other cookies, just truncate
        value = value.substring(0, 4000);
      }
    }
    
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
};

const getCookie = (name: string): string => {
  try {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.trim().substring(name.length + 1) : '';
  } catch (error) {
    console.error("Error reading cookie:", error);
    return '';
  }
};

// Delete a specific cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

export default function Home() {
  // State
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [focusedVideo, setFocusedVideo] = useState<number | null>(null);
  const [importInProgress, setImportInProgress] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Refs
  const hideUITimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_VIDEOS = 12;
  const hasLoadedFromCookies = useRef(false);

  // Load videos from cookies ONCE on initial load
  useEffect(() => {
    if (hasLoadedFromCookies.current || importInProgress) return;
    
    console.log("Loading initial state from cookies");
    const savedUrls = getCookie('yt-mosaic-urls');
    const savedLayout = getCookie('yt-mosaic-layout');
    
    if (savedUrls) {
      try {
        const parsedUrls = JSON.parse(decodeURIComponent(savedUrls));
        setVideoUrls(parsedUrls);
        setVideoIds(parsedUrls.map((url: string) => extractVideoId(url)));
      } catch {
        initializeDefault();
      }
    } else {
      initializeDefault();
    }
    
    if (savedLayout) {
      setLayout(savedLayout);
    }
    
    setIsLoaded(true);
    hasLoadedFromCookies.current = true;
  }, [importInProgress]);

  // Save to cookies when videoUrls change - but not during import
  useEffect(() => {
    if (!isLoaded || importInProgress || !hasLoadedFromCookies.current) return;
    
    if (videoUrls.length > 0) {
      setCookie('yt-mosaic-urls', encodeURIComponent(JSON.stringify(videoUrls)));
    }
  }, [videoUrls, isLoaded, importInProgress]);

  // Save layout to cookies when it changes
  useEffect(() => {
    if (!isLoaded || importInProgress || !hasLoadedFromCookies.current) return;
    setCookie('yt-mosaic-layout', layout);
  }, [layout, isLoaded, importInProgress]);

  // Initialize with default videos
  const initializeDefault = () => {
    const defaultUrls = ["", ""];
    setVideoUrls(defaultUrls);
    setVideoIds(["", ""]);
  };

  // Start playlist import - this is called before processing begins
  const startPlaylistImport = () => {
    console.log("Starting playlist import - blocking cookie operations");
    setImportInProgress(true);
    // Important: Delete the cookies to prevent them from being reloaded
    deleteCookie('yt-mosaic-urls');
  };

  // Finish playlist import - this is called after all videos are added
  const finishPlaylistImport = () => {
    // Save current state to cookies
    if (videoUrls.length > 0) {
      console.log("Finishing import - saving to cookies");
      setCookie('yt-mosaic-urls', encodeURIComponent(JSON.stringify(videoUrls)));
      setCookie('yt-mosaic-layout', layout);
      
      // Reset the import flag
      setImportInProgress(false);
    }
  };

  // Show a notification message
  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
  };

  // UI visibility based on mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate threshold - TOP 15% of screen for controls
      const controlsThreshold = window.innerHeight * 0.15;
      const shouldShowControlsUI = e.clientY <= controlsThreshold;
      setShowUI(shouldShowControlsUI);
      
      // Clear any existing timer
      if (hideUITimer.current) {
        clearTimeout(hideUITimer.current);
        hideUITimer.current = null; // Important: clear the ref
      }
      
      // Set a timer to hide the UI if the mouse stops moving in the top area or leaves it
      if (shouldShowControlsUI) {
        hideUITimer.current = setTimeout(() => {
          setShowUI(false);
        }, 3000); // Hide after 3 seconds of inactivity in the top area
      } else {
        // If outside the top area, ensure UI hides relatively quickly
        setShowUI(false);
      }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input fields
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'h': case 'H': setShowControls(prev => !prev); break;
        case 'f': case 'F': toggleFullscreen(); break;
        case 'g': case 'G': 
          setLayout(prev => prev === "grid" ? "focus" : "grid"); 
          setFocusedVideo(null);
          // Show notification when switching layout
          showNotification(`Switched to ${layout === "grid" ? "Gallery" : "Grid"} view`, 'info');
          break;
        case 'Escape': setFocusedVideo(null); break;
        default:
          // Number keys 1-9 for selecting videos
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= videoIds.length) {
            if (layout === "focus") {
              setFocusedVideo(num - 1);
            } else {
              setFocusedVideo(prev => prev === num - 1 ? null : num - 1);
            }
          }
      }
      
      // Show UI briefly when using keyboard
      setShowUI(true);
      
      if (hideUITimer.current) {
        clearTimeout(hideUITimer.current);
      }
      
      hideUITimer.current = setTimeout(() => {
        setShowUI(false);
      }, 2000); // Hide after 2 seconds
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    
    // Touch events to temporarily show UI
    const handleTouch = () => {
      setShowUI(true);
      if (hideUITimer.current) {
        clearTimeout(hideUITimer.current);
      }
      hideUITimer.current = setTimeout(() => {
        setShowUI(false);
      }, 3000); // Hide after 3 seconds
    };
    
    window.addEventListener('touchstart', handleTouch);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      
      if (hideUITimer.current) {
        clearTimeout(hideUITimer.current);
      }
    };
  }, [videoIds.length, layout]);

  const addVideo = () => {
    if (videoUrls.length < MAX_VIDEOS) {
      setVideoUrls(prevUrls => {
        const newUrls = [...prevUrls, ""];
        // Only save if not importing
        if (!importInProgress) {
          setTimeout(() => {
            if (videoUrls.length > 0) {
              setCookie('yt-mosaic-urls', encodeURIComponent(JSON.stringify(videoUrls)));
            }
          }, 100);
        }
        return newUrls;
      });
      setVideoIds(prevIds => [...prevIds, ""]);
    }
  };

  const removeVideo = (index: number) => {
    if (videoUrls.length > 2) {
      setVideoUrls(prevUrls => {
        const newUrls = prevUrls.filter((_, i) => i !== index);
        // Only save if not importing
        if (!importInProgress) {
          setTimeout(() => {
            if (videoUrls.length > 0) {
              setCookie('yt-mosaic-urls', encodeURIComponent(JSON.stringify(videoUrls)));
            }
          }, 100);
        }
        return newUrls;
      });
      setVideoIds(prevIds => prevIds.filter((_, i) => i !== index));
      
      if (focusedVideo === index) {
        setFocusedVideo(null);
      } else if (focusedVideo !== null && focusedVideo > index) {
        setFocusedVideo(prevFocused => prevFocused !== null ? prevFocused - 1 : null);
      }
    }
  };

  const updateVideo = (index: number, url: string, id: string) => {
    try {
      console.log(`Updating video ${index} with URL: ${url} and ID: ${id || extractVideoId(url)}`);
      
      // Use the ID from arguments or extract it if not provided
      const videoId = id || extractVideoId(url);
      
      // Update using functional form to ensure we always have the latest state
      setVideoUrls(prevUrls => {
        const newUrls = [...prevUrls];
        if (index >= 0 && index < newUrls.length) {
          newUrls[index] = url;
          return newUrls;
        }
        console.error(`Invalid video index: ${index}, max: ${newUrls.length-1}`);
        return prevUrls;
      });
      
      setVideoIds(prevIds => {
        const newIds = [...prevIds];
        if (index >= 0 && index < newIds.length) {
          newIds[index] = videoId;
          return newIds;
        }
        return prevIds;
      });

      // Only save cookies if not importing
      if (!importInProgress) {
        // Debounce cookie saves to prevent excessive writes
        if (hideUITimer.current) {
          clearTimeout(hideUITimer.current);
        }
        hideUITimer.current = setTimeout(() => {
          if (videoUrls.length > 0) {
            setCookie('yt-mosaic-urls', encodeURIComponent(JSON.stringify(videoUrls)));
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  // Generate CSS grid template
  const getGridTemplate = () => {
    const count = videoIds.length;
    let cols = 'grid-cols-2';
    let rows = '';
    if (count === 3) cols = 'grid-cols-3';
    else if (count === 4) { cols = 'grid-cols-2'; rows = 'grid-rows-2'; }
    else if (count >= 5 && count <= 6) { cols = 'grid-cols-3'; rows = 'grid-rows-2'; }
    else if (count >= 7 && count <= 8) { cols = 'grid-cols-4'; rows = 'grid-rows-2'; }
    else if (count === 9) { cols = 'grid-cols-3'; rows = 'grid-rows-3'; }
    else if (count >= 10) { cols = 'grid-cols-4'; rows = 'grid-rows-3'; }
    return `${cols} ${rows}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  if (!isLoaded) {
    return <div className="bg-black w-screen h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white">
      {/* Top controls */}
      {showControls && (
        <div className={`fixed top-0 left-0 right-0 bg-black/90 p-2 z-10 shadow-lg border-b border-gray-800 transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
          <MosaicControls 
            videoUrls={videoUrls}
            updateVideo={updateVideo}
            addVideo={addVideo}
            removeVideo={removeVideo}
            maxVideos={MAX_VIDEOS}
            startPlaylistImport={startPlaylistImport}
            finishPlaylistImport={finishPlaylistImport}
            showNotification={showNotification}
            currentLayout={layout}
            setLayout={setLayout}
            setFocusedVideo={setFocusedVideo}
            toggleFullscreen={toggleFullscreen}
            toggleControls={() => setShowControls(prev => !prev)}
            toggleGuide={() => setShowGuide(prev => !prev)}
            isControlsVisible={showControls}
          />
        </div>
      )}
      
      {/* Videos grid/focus */}
      {layout === "grid" ? (
        <main className={`grid ${getGridTemplate()} gap-[1px] w-full h-full ${showControls && showUI ? 'pt-[42px]' : ''} transition-padding duration-300`}>
          {videoIds.map((videoId, index) => (
            <div 
              key={index} 
              className="relative w-full h-full overflow-hidden"
              onClick={() => setFocusedVideo(prev => prev === index ? null : index)}
            >
              <YouTubeEmbed videoId={videoId} />
              <div className="absolute top-1 left-1 bg-black/50 text-xs text-white px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </main>
      ) : (
        <main className="w-full h-full flex flex-col">
          {focusedVideo !== null ? (
            <div className="relative w-full h-full overflow-hidden">
              <YouTubeEmbed videoId={videoIds[focusedVideo]} />
              <div className="absolute top-1 left-1 bg-black/50 text-xs text-white px-1 rounded">
                {focusedVideo + 1}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 p-4 mt-[42px] flex-grow">
              {videoIds.map((videoId, index) => (
                <div 
                  key={index}
                  className="relative aspect-video cursor-pointer hover:ring-2 hover:ring-blue-500 rounded overflow-hidden"
                  onClick={() => setFocusedVideo(index)}
                >
                  <div className="absolute inset-0 bg-black">
                    {videoId && (
                      <Image 
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={320}
                        height={180}
                        priority={index < 6}
                      />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2 text-xs">
                    {index + 1}. {videoId ? videoId.substring(0, 6) : "Empty"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
      
      {/* Notification Area */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Guide Popup */}
      {showGuide && (
        <GuidePopup onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}


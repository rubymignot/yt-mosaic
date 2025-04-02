/**
 * Helper functions for importing YouTube playlists
 */

/**
 * Extract video ID from a YouTube URL
 */
export function extractVideoId(url: string): string {
  if (!url) return "";
  
  if (url.includes("youtu.be")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id || "";
  }
  
  if (url.includes("youtube.com")) {
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    return urlParams.get("v") || "";
  }
  
  return url;
}

/**
 * Process a JSON file containing a playlist
 */
export async function processPlaylistFile(
  file: File,
  maxVideos: number = 12
): Promise<{ urls: string[]; ids: string[] } | null> {
  if (!file) return null;
  
  try {
    // Read the file
    const text = await file.text();
    const playlist = JSON.parse(text);
    
    // Validate playlist structure
    if (!playlist || !playlist.videos || !Array.isArray(playlist.videos)) {
      throw new Error('Invalid playlist format');
    }
    
    // Filter valid videos
    const validVideos = playlist.videos
      .filter((url: string) => typeof url === 'string' && url.trim() !== '')
      .slice(0, maxVideos);
    
    if (validVideos.length < 2) {
      throw new Error('Playlist must have at least 2 valid videos');
    }
    
    // Create arrays of URLs and IDs
    const urls = validVideos;
    const ids = validVideos.map((url: string) => extractVideoId(url));
    
    return { urls, ids };
  } catch (error) {
    console.error('Error processing playlist:', error);
    throw error;
  }
}

/**
 * Import playlist data from a file and handle the video data
 */
export function importPlaylistFile(
  file: File,
  options: {
    onSuccess: (videos: string[], name: string) => void;
    onError: (message: string) => void;
    maxVideos?: number;
  }
): void {
  const { onSuccess, onError, maxVideos = 12 } = options;
  
  if (!file) {
    onError("No file selected");
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const playlist = JSON.parse(content);
      
      if (!playlist || typeof playlist !== 'object') {
        onError("Invalid playlist format: not a valid JSON object");
        return;
      }
      
      if (!playlist.videos || !Array.isArray(playlist.videos)) {
        onError("Invalid playlist format: missing videos array");
        return;
      }
      
      // Validate videos are strings and filter out invalid ones
      const validVideos = playlist.videos
        .filter((url: string) => typeof url === 'string' && url.trim() !== '')
        .slice(0, maxVideos);
      
      if (validVideos.length < 2) {
        onError("Imported playlist must have at least 2 valid video URLs");
        return;
      }
      
      console.log(`Importing ${validVideos.length} videos from playlist`);
      
      // Send the validated videos back to the caller
      onSuccess(validVideos, playlist.name || 'Untitled');
      
    } catch (error) {
      console.error("Error importing playlist:", error);
      onError(`Failed to import playlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  reader.onerror = () => {
    onError("Error reading file");
  };
  
  reader.readAsText(file);
} 
import { useState, useEffect, useCallback } from 'react';
import {
  isMediaAccessGranted,
  getActiveSession,
  startListening,
  addMediaSessionListener,
  playPause as mediaPlayPause,
  skipNext as mediaSkipNext,
  skipPrevious as mediaSkipPrevious,
  openMediaAccessSettings,
  type MediaSessionData,
} from '@/services/media-service';

interface UseMediaSessionReturn {
  session: MediaSessionData | null;
  hasAccess: boolean;
  loading: boolean;
  playPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  requestAccess: () => Promise<void>;
}

export function useMediaSession(): UseMediaSessionReturn {
  const [session, setSession] = useState<MediaSessionData | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const granted = await isMediaAccessGranted();
      if (!mounted) return;
      setHasAccess(granted);

      if (granted) {
        try {
          await startListening();
          const current = await getActiveSession();
          if (mounted) setSession(current);
        } catch {
          // May fail if listener not ready yet
        }
      }
      if (mounted) setLoading(false);
    }

    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hasAccess) return;

    const sub = addMediaSessionListener((data) => {
      setSession(data);
    });
    return () => sub.remove();
  }, [hasAccess]);

  const playPause = useCallback(async () => {
    await mediaPlayPause();
  }, []);

  const skipNext = useCallback(async () => {
    await mediaSkipNext();
  }, []);

  const skipPrevious = useCallback(async () => {
    await mediaSkipPrevious();
  }, []);

  const requestAccess = useCallback(async () => {
    await openMediaAccessSettings();
  }, []);

  return {
    session,
    hasAccess,
    loading,
    playPause,
    skipNext,
    skipPrevious,
    requestAccess,
  };
}

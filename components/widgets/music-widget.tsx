import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMediaSession } from '@/hooks/use-media-session';
import type { Widget } from '@/db/schema/widgets';

interface MusicWidgetProps {
  widget: Widget;
}

export function MusicWidget({ widget }: MusicWidgetProps) {
  const { colors } = useTheme();
  const { session, hasAccess, loading, playPause, skipNext, skipPrevious, requestAccess } = useMediaSession();

  // Not yet granted notification access
  if (!hasAccess && !loading) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="music-note" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Now Playing</Text>
        </View>
        <Pressable onPress={requestAccess} style={[styles.grantBtn, { backgroundColor: colors.accent + '15' }]}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color={colors.accent} />
          <Text style={[styles.grantText, { color: colors.accent }]}>
            Grant notification access to see media
          </Text>
        </Pressable>
      </View>
    );
  }

  // No active session
  if (!session?.hasSession || !session.title) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="music-note" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Now Playing</Text>
        </View>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          No media playing
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="music-note" size={24} color={colors.accent} />
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
            {session.title}
          </Text>
          {!!session.artist && (
            <Text style={[styles.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>
              {session.artist}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={skipPrevious} style={styles.controlBtn}>
          <MaterialCommunityIcons name="skip-previous" size={28} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={playPause} style={[styles.playBtn, { backgroundColor: colors.accent + '20' }]}>
          <MaterialCommunityIcons
            name={session.isPlaying ? 'pause' : 'play'}
            size={32}
            color={colors.accent}
          />
        </Pressable>
        <Pressable onPress={skipNext} style={styles.controlBtn}>
          <MaterialCommunityIcons name="skip-next" size={28} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackInfo: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    padding: 4,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 13,
    textAlign: 'center',
  },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  grantText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});

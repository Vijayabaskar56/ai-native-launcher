import { useRef, useEffect } from 'react';
import { TextInput, StyleSheet, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-app-theme';
import type { SearchBarStyle } from '@/core/types/settings';

const BAR_HEIGHT = 52;

interface SearchBarProps {
  query: string;
  onQueryChange: (text: string) => void;
  style: SearchBarStyle;
  isBottom: boolean;
  fixed: boolean;
  scrollProgress: SharedValue<number>;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  filtersActive?: boolean;
  onToggleFilters?: () => void;
}

export function SearchBar({
  query,
  onQueryChange,
  style,
  isBottom,
  fixed,
  scrollProgress,
  onFocus,
  onBlur,
  autoFocus = false,
  onSubmitEditing,
  filtersActive = false,
  onToggleFilters,
}: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [autoFocus]);

  const animatedStyle = useAnimatedStyle(() => {
    if (fixed) {
      return {
        transform: [{ translateY: 0 }],
        opacity: 1,
      };
    }

    const factor = Math.pow(1 - scrollProgress.value, 2);
    return {
      transform: [
        { translateY: isBottom ? factor * BAR_HEIGHT : -(factor * BAR_HEIGHT) },
      ],
      opacity: interpolate(scrollProgress.value, [0, 0.3], [0.5, 1]),
    };
  });

  if (style === 'Hidden') return null;

  const isTransparent = style === 'Transparent';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isBottom ? styles.bottom : styles.top,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.container,
          isTransparent
            ? styles.transparent
            : [styles.solid, { backgroundColor: colors.surface }],
        ]}
      >
        <MaterialIcons
          name="search"
          size={22}
          color={colors.textSecondary}
          style={styles.icon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          placeholder="Search..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={onQueryChange}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="search"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
        />

        {onToggleFilters ? (
          <Pressable onPress={onToggleFilters} hitSlop={8} style={styles.trailingIcon}>
            <MaterialIcons
              name={filtersActive ? 'filter-alt' : 'filter-alt-off'}
              size={20}
              color={filtersActive ? colors.accent : colors.textSecondary}
            />
          </Pressable>
        ) : null}

        {query.length > 0 ? (
          <Pressable onPress={() => onQueryChange('')} hitSlop={8} style={styles.trailingIcon}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  top: {
    top: 0,
    paddingTop: 8,
  },
  bottom: {
    bottom: 0,
    paddingBottom: 8,
  },
  container: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 26,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  solid: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  trailingIcon: {
    marginLeft: 10,
  },
});

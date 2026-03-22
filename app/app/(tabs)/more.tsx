import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function MenuItem({ icon, label, onPress }: MenuItemProps): ReactElement {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Open ${label}`}
    >
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function MoreScreen(): ReactElement {
  return (
    <View style={styles.container}>
      <MenuItem
        icon="information-circle-outline"
        label="About CommonBoard"
        onPress={(): void => {
          // TODO: navigate to about screen
        }}
      />
      <MenuItem
        icon="settings-outline"
        label="Settings"
        onPress={(): void => {
          // TODO: navigate to settings screen
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSoft,
  },
});

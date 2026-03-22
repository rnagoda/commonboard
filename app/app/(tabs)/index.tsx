import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function HomeScreen(): ReactElement {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('display_order');
      if (data) setCategories(data);
    };
    void fetchCategories();
  }, []);

  const handleSearch = (): void => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Emergency Alert Banner Placeholder */}
      <View
        style={styles.alertBanner}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <Ionicons name="warning-outline" size={20} color={colors.white} />
        <Text style={styles.alertText}>
          Emergency alerts will appear here
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSoft}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor={colors.textSoft}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          accessibilityLabel="Search for community resources"
          accessibilityHint="Type a keyword and press search to find resources"
        />
      </View>

      {/* Quick Action Shortcuts (Tier 3) */}
      <Text style={styles.sectionTitle} accessibilityRole="header">
        I need help with...
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.shortcutsRow}
        accessibilityRole="list"
      >
        {[
          { label: 'Food tonight', icon: 'restaurant-outline' as const, slug: 'food-assistance' },
          { label: 'A place to stay', icon: 'bed-outline' as const, slug: 'shelters' },
          { label: 'Legal help', icon: 'shield-outline' as const, slug: 'legal-aid' },
          { label: 'Emergency', icon: 'alert-circle-outline' as const, slug: 'emergency-disaster' },
        ].map((shortcut) => (
          <TouchableOpacity
            key={shortcut.slug}
            style={styles.shortcutCard}
            onPress={(): void => {
              router.push(`/category/${shortcut.slug}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={shortcut.label}
            accessibilityHint="Find resources in this category"
          >
            <Ionicons
              name={shortcut.icon}
              size={28}
              color={colors.accent}
            />
            <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Grid */}
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Browse by category
      </Text>
      <View style={styles.categoryGrid} accessibilityRole="list">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={(): void => {
              router.push(`/category/${category.slug}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Browse ${category.name}`}
            accessibilityHint="View organizations in this category"
          >
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warm,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  alertText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  shortcutsRow: {
    marginBottom: spacing.lg,
  },
  shortcutCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    minHeight: 88,
  },
  shortcutLabel: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    width: '48%',
    flexGrow: 1,
  },
  categoryName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
});

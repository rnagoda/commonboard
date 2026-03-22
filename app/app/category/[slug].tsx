import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';

interface Organization {
  id: string;
  name: string;
  description: string;
  phone: string | null;
  address: string | null;
  target_audience: string[];
}

export default function CategoryScreen(): ReactElement {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async (): Promise<void> => {
      // Get category info
      const { data: category } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .single();

      if (!category) {
        setLoading(false);
        return;
      }

      setCategoryName(category.name);

      // Get orgs in this category
      const { data: orgCategories } = await supabase
        .from('organization_categories')
        .select('organization_id')
        .eq('category_id', category.id);

      if (!orgCategories || orgCategories.length === 0) {
        setLoading(false);
        return;
      }

      const orgIds = orgCategories.map((oc) => oc.organization_id);

      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, description, phone, address, target_audience')
        .in('id', orgIds)
        .eq('status', 'active')
        .order('name');

      setOrgs(organizations ?? []);
      setLoading(false);
    };
    void fetchOrgs();
  }, [slug]);

  return (
    <>
      <Stack.Screen options={{ title: categoryName || 'Category' }} />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={orgs}
        keyExtractor={(item): string => item.id}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>
                No organizations found in this category yet.
              </Text>
              <Text style={styles.emptySubtext}>
                We&apos;re still building out resources for this area.
              </Text>
            </View>
          )
        }
        renderItem={({ item }): ReactElement => (
          <TouchableOpacity
            style={styles.card}
            onPress={(): void => {
              router.push(`/org/${item.id}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityHint="View organization details"
          >
            <Text style={styles.orgName}>{item.name}</Text>
            <Text style={styles.orgDesc} numberOfLines={2}>
              {item.description}
            </Text>
            {item.target_audience.length > 0 &&
              !item.target_audience.includes('general') && (
              <View style={styles.tags}>
                {item.target_audience.map((audience) => (
                  <View key={audience} style={styles.tag}>
                    <Text style={styles.tagText}>{audience}</Text>
                  </View>
                ))}
              </View>
            )}
            {item.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color={colors.textSoft} />
                <Text style={styles.contactText}>{item.phone}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  orgName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orgDesc: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.accentLight,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contactText: {
    fontSize: fontSize.sm,
    color: colors.textSoft,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: 60,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

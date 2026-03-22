import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesScreen(): ReactElement {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

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

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={categories}
      keyExtractor={(item): string => item.id}
      renderItem={({ item }): ReactElement => (
        <TouchableOpacity
          style={styles.card}
          onPress={(): void => {
            router.push(`/category/${item.slug}`);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Browse ${item.name}`}
          accessibilityHint="View organizations in this category"
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: colors.text,
  },
  chevron: {
    fontSize: 24,
    color: colors.textSoft,
  },
});

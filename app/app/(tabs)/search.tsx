import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';

interface OrgResult {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function SearchScreen(): ReactElement {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const [results, setResults] = useState<OrgResult[]>([]);
  const [searched, setSearched] = useState(false);

  const search = async (searchTerm: string): Promise<void> => {
    if (!searchTerm.trim()) return;
    const { data } = await supabase
      .from('organizations')
      .select('id, name, description, slug')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,services.cs.{${searchTerm}}`)
      .eq('status', 'active')
      .limit(50);
    setResults(data ?? []);
    setSearched(true);
  };

  // Search on initial load if query param is provided
  useEffect(() => {
    if (!q) return;
    let cancelled = false;
    supabase
      .from('organizations')
      .select('id, name, description, slug')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,services.cs.{${q}}`)
      .eq('status', 'active')
      .limit(50)
      .then(({ data }) => {
        if (!cancelled) {
          setResults(data ?? []);
          setSearched(true);
        }
      });
    return (): void => { cancelled = true; };
  }, [q]);

  const handleSubmit = (): void => {
    void search(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textSoft}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations..."
          placeholderTextColor={colors.textSoft}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoFocus
          accessibilityLabel="Search for organizations"
          accessibilityHint="Type a keyword and press search"
        />
      </View>

      {searched && results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={colors.border} />
          <Text style={styles.emptyText}>
            No results found for &ldquo;{query}&rdquo;
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item): string => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }): ReactElement => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={(): void => {
                router.push(`/org/${item.id}`);
              }}
              accessibilityRole="button"
              accessibilityLabel={item.name}
              accessibilityHint="View organization details"
            >
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    margin: spacing.md,
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
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  resultCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  resultDesc: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

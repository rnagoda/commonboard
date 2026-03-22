import { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabase';

interface Organization {
  id: string;
  name: string;
  description: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: Record<string, string> | null;
  services: string[];
  target_audience: string[];
  languages_served: string[];
  eligibility_criteria: string | null;
  last_verified_at: string | null;
}

function InfoRow({ icon, label, value, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}): ReactElement {
  const content = (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoLink]}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Open ${label.toLowerCase()}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View accessibilityLabel={`${label}: ${value}`} accessibilityHint={`${label} information`}>
      {content}
    </View>
  );
}

export default function OrgProfileScreen(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async (): Promise<void> => {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single();
      setOrg(data);
      setLoading(false);
    };
    void fetchOrg();
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </>
    );
  }

  if (!org) {
    return (
      <>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.border} />
          <Text style={styles.loadingText}>Organization not found</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: org.name }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Text style={styles.name} accessibilityRole="header">
          {org.name}
        </Text>
        <Text style={styles.description}>{org.description}</Text>

        {/* Target Audience Tags */}
        {org.target_audience.length > 0 &&
          !org.target_audience.includes('general') && (
          <View style={styles.tags}>
            {org.target_audience.map((audience) => (
              <View key={audience} style={styles.tag}>
                <Text style={styles.tagText}>{audience}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Contact
          </Text>
          {org.address && (
            <InfoRow
              icon="location-outline"
              label="Address"
              value={org.address}
              onPress={(): void => {
                void Linking.openURL(
                  `https://maps.google.com/?q=${encodeURIComponent(org.address ?? '')}`
                );
              }}
            />
          )}
          {org.phone && (
            <InfoRow
              icon="call-outline"
              label="Phone"
              value={org.phone}
              onPress={(): void => {
                void Linking.openURL(`tel:${org.phone}`);
              }}
            />
          )}
          {org.email && (
            <InfoRow
              icon="mail-outline"
              label="Email"
              value={org.email}
              onPress={(): void => {
                void Linking.openURL(`mailto:${org.email}`);
              }}
            />
          )}
          {org.website && (
            <InfoRow
              icon="globe-outline"
              label="Website"
              value={org.website}
              onPress={(): void => {
                void Linking.openURL(org.website ?? '');
              }}
            />
          )}
        </View>

        {/* Services */}
        {org.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Services
            </Text>
            {org.services.map((service) => (
              <View key={service} style={styles.serviceRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Eligibility */}
        {org.eligibility_criteria && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Eligibility
            </Text>
            <Text style={styles.bodyText}>{org.eligibility_criteria}</Text>
          </View>
        )}

        {/* Languages */}
        {org.languages_served.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Languages
            </Text>
            <Text style={styles.bodyText}>
              {org.languages_served.join(', ')}
            </Text>
          </View>
        )}

        {/* Last Verified */}
        {org.last_verified_at && (
          <Text style={styles.verified}>
            Last verified:{' '}
            {new Date(org.last_verified_at).toLocaleDateString()}
          </Text>
        )}
      </ScrollView>
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
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    marginTop: spacing.md,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.accentLight,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSoft,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  infoLink: {
    color: colors.accent,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  serviceText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  bodyText: {
    fontSize: fontSize.md,
    color: colors.textSoft,
    lineHeight: 24,
  },
  verified: {
    fontSize: fontSize.sm,
    color: colors.textSoft,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

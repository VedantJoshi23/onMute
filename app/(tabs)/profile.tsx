import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const ProfileItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.profileItem, { borderBottomColor: colors.tabIconDefault }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <IconSymbol 
          name={icon as any} 
          size={24} 
          color={colors.icon} 
          style={styles.profileIcon}
        />
        <View style={styles.profileTextContainer}>
          <ThemedText style={styles.profileTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={[styles.profileSubtitle, { color: colors.tabIconDefault }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {onPress && (
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={colors.tabIconDefault} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </ThemedText>
        </View>
        <ThemedText style={styles.userName}>
          {user?.email?.split('@')[0] || 'User'}
        </ThemedText>
        <ThemedText style={[styles.userEmail, { color: colors.tabIconDefault }]}>
          {user?.email || 'user@example.com'}
        </ThemedText>
      </View>

      {/* Profile Options */}
      <View style={styles.section}>
        <ProfileItem
          icon="person.circle"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
        />
        
        <ProfileItem
          icon="bell"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
        />
        
        <ProfileItem
          icon="lock"
          title="Privacy & Security"
          subtitle="Control your privacy settings"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
        />
        
        <ProfileItem
          icon="questionmark.circle"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
        />
        
        <ProfileItem
          icon="info.circle"
          title="About"
          subtitle="App version and information"
          onPress={() => Alert.alert('About onMute', 'Version 1.0.0\nBuilt with Expo and React Native')}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.tint }]}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square" size={20} color="white" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    marginTop: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    marginRight: 16,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 14,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    marginTop: 'auto',
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

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

  const profileMenuItems = [
    {
      id: '1',
      title: 'Edit Profile',
      icon: 'person.circle' as const,
      onPress: () => Alert.alert('Edit Profile', 'Coming soon!'),
    },
    {
      id: '2',
      title: 'Settings',
      icon: 'gearshape' as const,
      onPress: () => Alert.alert('Settings', 'Coming soon!'),
    },
    {
      id: '3',
      title: 'Privacy',
      icon: 'lock' as const,
      onPress: () => Alert.alert('Privacy', 'Coming soon!'),
    },
    {
      id: '4',
      title: 'Help & Support',
      icon: 'questionmark.circle' as const,
      onPress: () => Alert.alert('Help & Support', 'Coming soon!'),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      </ThemedView>

      <ThemedView style={styles.profileSection}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=10' }} 
          style={styles.profileImage} 
        />
        <ThemedText style={styles.userName}>{user?.name || 'User'}</ThemedText>
        <ThemedText style={styles.userEmail}>{user?.email || 'user@example.com'}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.menuSection}>
        {profileMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <IconSymbol name={item.icon} size={24} color={colors.icon} />
              <ThemedText style={styles.menuItemText}>{item.title}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.icon} />
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedView style={styles.logoutSection}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#ff4757' }]} 
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right" size={20} color="white" />
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>onMute v1.0.0</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

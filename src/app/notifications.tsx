import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  CheckCheck,
  TrendingUp,
  FileText,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../constants/theme';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';

export default function NotificationsScreen() {
  const { notifications, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  const handleNotificationPress = async (notif: AppNotification) => {
    await markRead(notif.id);
    if (notif.articleId) {
      router.push({
        pathname: '/article/[id]',
        params: { id: notif.articleId },
      });
    }
  };

  const getCategoryIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'trending':
        return <TrendingUp size={16} color={COLORS.black} />;
      case 'editorial':
        return <FileText size={16} color={COLORS.black} />;
      case 'followed':
        return <BookmarkCheck size={16} color={COLORS.black} />;
      default:
        return <Sparkles size={16} color={COLORS.black} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity
          onPress={markAllRead}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.markAllBtn}
        >
          <CheckCheck size={18} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterLabel, filter === 'all' && styles.filterLabelActive]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterLabel, filter === 'unread' && styles.filterLabelActive]}>
            Unread ({notifications.filter((n) => !n.read).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, !item.read && styles.notifCardUnread]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.75}
          >
            <View style={styles.iconCircle}>{getCategoryIcon(item.category)}</View>

            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>

              <Text style={styles.notifBody}>{item.body}</Text>
            </View>

            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={36} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>
              You have no {filter === 'unread' ? 'unread ' : ''}notifications at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 2,
  },
  headerTitle: {
    fontFamily: FONTS.serif,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  markAllBtn: {
    padding: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.black,
  },
  filterLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingVertical: 8,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
    position: 'relative',
  },
  notifCardUnread: {
    backgroundColor: '#F9FAFB',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 14,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.black,
  },
  timestamp: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  notifBody: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentBlue,
    position: 'absolute',
    top: 18,
    right: 16,
  },
  emptyContainer: {
    paddingHorizontal: 32,
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.serif,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

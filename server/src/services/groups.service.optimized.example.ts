/**
 * Optimized Groups Service with Caching
 * 
 * This is an example of how to integrate caching into the groups service.
 * To use this optimization:
 * 1. Import the cache utilities
 * 2. Wrap read operations with cache
 * 3. Invalidate cache on write operations
 */

import axios from 'axios';
import Group from '../models/Group';
import GroupParticipant from '../models/GroupParticipant';
import GroupJoinRequest from '../models/GroupJoinRequest';
import { 
  groupsCache, 
  CacheKeys, 
  CacheInvalidation, 
  withCache 
} from '../utils/groups-cache';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

class OptimizedGroupsService {
  /**
   * Get group info with caching
   * 
   * Example of optimized read operation
   */
  async getGroupInfo(groupId: string, phoneNumberId: string) {
    // Use cache wrapper
    return withCache(
      CacheKeys.groupInfo(groupId),
      async () => {
        // Original fetch logic
        const response = await axios.get(
          `${WHATSAPP_API_URL}/${phoneNumberId}/groups/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            },
          }
        );

        // Update database
        await Group.upsert({
          group_id: response.data.id,
          phone_number_id: phoneNumberId,
          subject: response.data.subject,
          description: response.data.description,
          total_participant_count: response.data.participants?.length || 0,
          suspended: response.data.suspended || false,
          creation_timestamp: new Date(parseInt(response.data.created_timestamp) * 1000),
        });

        return response.data;
      },
      300000 // 5 minutes TTL
    );
  }

  /**
   * Get groups list with caching
   */
  async getGroups(phoneNumberId: string) {
    return withCache(
      CacheKeys.groupList(phoneNumberId),
      async () => {
        const groups = await Group.findAll({
          where: { 
            phone_number_id: phoneNumberId,
            deleted_at: null, // Exclude soft-deleted groups
          },
          order: [['created_at', 'DESC']],
        });

        return groups;
      },
      180000 // 3 minutes TTL
    );
  }

  /**
   * Update group with cache invalidation
   * 
   * Example of write operation with cache invalidation
   */
  async updateGroup(groupId: string, phoneNumberId: string, updates: any) {
    try {
      // Perform update
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${phoneNumberId}/groups/${groupId}`,
        {
          messaging_product: 'whatsapp',
          ...updates,
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update database
      await Group.update(updates, {
        where: { group_id: groupId },
      });

      // Invalidate cache
      CacheInvalidation.invalidateGroup(groupId);
      CacheInvalidation.invalidateGroupList(phoneNumberId);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete group with cache invalidation
   */
  async deleteGroup(groupId: string, phoneNumberId: string) {
    try {
      // Delete from WhatsApp
      await axios.delete(
        `${WHATSAPP_API_URL}/${phoneNumberId}/groups/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          },
        }
      );

      // Soft delete in database
      await Group.update(
        { deleted_at: new Date() },
        { where: { group_id: groupId } }
      );

      // Invalidate all cache for this group
      CacheInvalidation.invalidateGroup(groupId);
      CacheInvalidation.invalidateGroupList(phoneNumberId);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove participants with cache invalidation
   */
  async removeParticipants(groupId: string, phoneNumberId: string, waIds: string[]) {
    try {
      // Remove from WhatsApp
      const response = await axios.delete(
        `${WHATSAPP_API_URL}/${phoneNumberId}/groups/${groupId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          data: {
            messaging_product: 'whatsapp',
            participants: waIds.map(wa_id => ({ user: wa_id })),
          },
        }
      );

      // Update database
      await GroupParticipant.destroy({
        where: {
          group_id: groupId,
          wa_id: waIds,
        },
      });

      // Update participant count
      const remainingCount = await GroupParticipant.count({
        where: { group_id: groupId },
      });

      await Group.update(
        { total_participant_count: remainingCount },
        { where: { group_id: groupId } }
      );

      // Invalidate cache
      CacheInvalidation.invalidateGroup(groupId);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Batch operations with cache invalidation
   */
  async batchUpdateGroups(phoneNumberId: string, updates: Array<{ groupId: string; data: any }>) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.updateGroup(update.groupId, phoneNumberId, update.data);
        results.push({ groupId: update.groupId, success: true, result });
      } catch (error: any) {
        results.push({ groupId: update.groupId, success: false, error: error.message });
      }
    }

    // Invalidate list cache once after all updates
    CacheInvalidation.invalidateGroupList(phoneNumberId);

    return results;
  }

  /**
   * Prefetch and cache multiple groups
   */
  async prefetchGroups(groupIds: string[], phoneNumberId: string) {
    const promises = groupIds.map(groupId =>
      this.getGroupInfo(groupId, phoneNumberId).catch(err => {
        console.error(`Failed to prefetch group ${groupId}:`, err);
        return null;
      })
    );

    await Promise.all(promises);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return groupsCache.getStats();
  }

  /**
   * Clear all cache (admin operation)
   */
  clearCache() {
    CacheInvalidation.invalidateAll();
  }
}

export default new OptimizedGroupsService();

/**
 * Usage Examples:
 * 
 * 1. Get group info (cached):
 *    const group = await optimizedGroupsService.getGroupInfo(groupId, phoneNumberId);
 * 
 * 2. Update group (invalidates cache):
 *    await optimizedGroupsService.updateGroup(groupId, phoneNumberId, { subject: 'New Name' });
 * 
 * 3. Batch operations:
 *    await optimizedGroupsService.batchUpdateGroups(phoneNumberId, updates);
 * 
 * 4. Prefetch for better performance:
 *    await optimizedGroupsService.prefetchGroups(groupIds, phoneNumberId);
 * 
 * 5. Check cache stats:
 *    const stats = optimizedGroupsService.getCacheStats();
 * 
 * 6. Clear cache (admin):
 *    optimizedGroupsService.clearCache();
 */

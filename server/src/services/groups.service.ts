import axios from 'axios';
import Group from '../models/Group';
import GroupParticipant from '../models/GroupParticipant';
import GroupJoinRequest from '../models/GroupJoinRequest';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;

interface CreateGroupParams {
  userId: string;
  phoneNumberId: string;
  subject: string;
  description?: string;
  joinApprovalMode?: 'auto_approve' | 'approval_required';
}

interface UpdateGroupParams {
  subject?: string;
  description?: string;
  profilePictureFile?: string;
}

interface RemoveParticipantsParams {
  participants: Array<{ user: string }>;
}

class GroupsService {
  /**
   * Create a new WhatsApp group
   */
  async createGroup(params: CreateGroupParams) {
    const { userId, phoneNumberId, subject, description, joinApprovalMode = 'auto_approve' } = params;

    try {
      // Call WhatsApp API to create group
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${phoneNumberId}/groups`,
        {
          messaging_product: 'whatsapp',
          subject,
          description,
          join_approval_mode: joinApprovalMode,
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Note: The actual group_id and invite_link will come via webhook
      // For now, we create a placeholder record
      const group = await Group.create({
        user_id: userId,
        group_id: response.data.id || 'pending',
        subject,
        description: description || null,
        join_approval_mode: joinApprovalMode,
        total_participant_count: 0,
        suspended: false,
        creation_timestamp: new Date(),
      });

      return {
        success: true,
        group,
        message: 'Group creation initiated. You will receive the invite link via webhook.',
      };
    } catch (error: any) {
      console.error('Error creating group:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to create group');
    }
  }

  /**
   * Get all groups for a user
   */
  async getGroups(userId: string, phoneNumberId?: string) {
    try {
      // Get groups from database
      const groups = await Group.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
      });

      // Optionally sync with WhatsApp API
      if (phoneNumberId) {
        try {
          const response = await axios.get(`${WHATSAPP_API_URL}/${phoneNumberId}/groups`, {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            },
          });

          // Update local database with latest info
          if (response.data.data?.groups) {
            for (const apiGroup of response.data.data.groups) {
              await Group.update(
                {
                  subject: apiGroup.subject,
                },
                {
                  where: { group_id: apiGroup.id },
                }
              );
            }
          }
        } catch (syncError) {
          console.error('Error syncing groups:', syncError);
          // Continue with local data
        }
      }

      return groups;
    } catch (error: any) {
      console.error('Error getting groups:', error.message);
      throw new Error('Failed to get groups');
    }
  }

  /**
   * Get detailed information about a specific group
   */
  async getGroupInfo(groupId: string, fields?: string) {
    try {
      const fieldsParam = fields || 'subject,description,participants,join_approval_mode,total_participant_count,suspended,creation_timestamp';

      const response = await axios.get(`${WHATSAPP_API_URL}/${groupId}`, {
        params: { fields: fieldsParam },
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await localGroup.update({
          subject: response.data.subject,
          description: response.data.description,
          total_participant_count: response.data.total_participant_count,
          suspended: response.data.suspended,
        });

        // Update participants if included
        if (response.data.participants) {
          // Clear existing participants
          await GroupParticipant.destroy({ where: { group_id: localGroup.id } });

          // Add current participants
          for (const participant of response.data.participants) {
            await GroupParticipant.create({
              group_id: localGroup.id,
              wa_id: participant.wa_id,
              joined_at: new Date(),
            });
          }
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting group info:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get group info');
    }
  }

  /**
   * Update group settings
   */
  async updateGroup(groupId: string, params: UpdateGroupParams) {
    try {
      const updateData: any = {
        messaging_product: 'whatsapp',
      };

      if (params.subject) updateData.subject = params.subject;
      if (params.description !== undefined) updateData.description = params.description;
      if (params.profilePictureFile) updateData.profile_picture_file = params.profilePictureFile;

      const response = await axios.post(`${WHATSAPP_API_URL}/${groupId}`, updateData, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await localGroup.update({
          subject: params.subject || localGroup.subject,
          description: params.description !== undefined ? params.description : localGroup.description,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating group:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to update group');
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string) {
    try {
      await axios.delete(`${WHATSAPP_API_URL}/${groupId}`, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      // Delete from local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await GroupParticipant.destroy({ where: { group_id: localGroup.id } });
        await GroupJoinRequest.destroy({ where: { group_id: localGroup.id } });
        await localGroup.destroy();
      }

      return { success: true, message: 'Group deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting group:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to delete group');
    }
  }

  /**
   * Get group invite link
   */
  async getInviteLink(groupId: string) {
    try {
      const response = await axios.get(`${WHATSAPP_API_URL}/${groupId}/invite_link`, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await localGroup.update({
          invite_link: response.data.invite_link,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting invite link:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get invite link');
    }
  }

  /**
   * Reset group invite link
   */
  async resetInviteLink(groupId: string) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${groupId}/invite_link`,
        {
          messaging_product: 'whatsapp',
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await localGroup.update({
          invite_link: response.data.invite_link,
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Error resetting invite link:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to reset invite link');
    }
  }

  /**
   * Remove participants from group
   */
  async removeParticipants(groupId: string, params: RemoveParticipantsParams) {
    try {
      const response = await axios.delete(`${WHATSAPP_API_URL}/${groupId}/participants`, {
        data: {
          messaging_product: 'whatsapp',
          participants: params.participants,
        },
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        for (const participant of params.participants) {
          await GroupParticipant.destroy({
            where: {
              group_id: localGroup.id,
              wa_id: participant.user,
            },
          });
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Error removing participants:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to remove participants');
    }
  }

  /**
   * Get join requests for a group
   */
  async getJoinRequests(groupId: string) {
    try {
      const response = await axios.get(`${WHATSAPP_API_URL}/${groupId}/join_requests`, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup && response.data.data) {
        for (const request of response.data.data) {
          await GroupJoinRequest.upsert({
            group_id: localGroup.id,
            whatsapp_group_id: groupId,
            join_request_id: request.join_request_id,
            wa_id: request.wa_id,
            status: 'pending',
            request_timestamp: new Date(request.creation_timestamp * 1000),
          });
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Error getting join requests:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to get join requests');
    }
  }

  /**
   * Approve join requests
   */
  async approveJoinRequests(groupId: string, joinRequestIds: string[]) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${groupId}/join_requests`,
        {
          messaging_product: 'whatsapp',
          join_requests: joinRequestIds,
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await GroupJoinRequest.update(
          {
            status: 'approved',
            processed_at: new Date(),
          },
          {
            where: {
              group_id: localGroup.id,
              join_request_id: joinRequestIds,
            },
          }
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error approving join requests:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to approve join requests');
    }
  }

  /**
   * Reject join requests
   */
  async rejectJoinRequests(groupId: string, joinRequestIds: string[]) {
    try {
      const response = await axios.delete(`${WHATSAPP_API_URL}/${groupId}/join_requests`, {
        data: {
          messaging_product: 'whatsapp',
          join_requests: joinRequestIds,
        },
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local database
      const localGroup = await Group.findOne({ where: { group_id: groupId } });
      if (localGroup) {
        await GroupJoinRequest.update(
          {
            status: 'rejected',
            processed_at: new Date(),
          },
          {
            where: {
              group_id: localGroup.id,
              join_request_id: joinRequestIds,
            },
          }
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error rejecting join requests:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to reject join requests');
    }
  }

  /**
   * Send message to group
   */
  async sendGroupMessage(phoneNumberId: string, groupId: string, message: any) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'group',
          to: groupId,
          ...message,
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error sending group message:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Failed to send group message');
    }
  }
}

export default new GroupsService();

import { Request, Response } from 'express';
import groupsService from '../services/groups.service';

class GroupsController {
  /**
   * Create a new group
   * POST /api/groups
   */
  async createGroup(req: Request, res: Response) {
    try {
      const { subject, description, joinApprovalMode, phoneNumberId } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      if (!phoneNumberId) {
        return res.status(400).json({ error: 'Phone number ID is required' });
      }

      const result = await groupsService.createGroup({
        userId,
        phoneNumberId,
        subject,
        description,
        joinApprovalMode,
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error in createGroup:', error);
      res.status(500).json({ error: error.message || 'Failed to create group' });
    }
  }

  /**
   * Get all groups
   * GET /api/groups
   */
  async getGroups(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const phoneNumberId = req.query.phoneNumberId as string;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const groups = await groupsService.getGroups(userId, phoneNumberId);

      res.json({ groups });
    } catch (error: any) {
      console.error('Error in getGroups:', error);
      res.status(500).json({ error: error.message || 'Failed to get groups' });
    }
  }

  /**
   * Get group information
   * GET /api/groups/:id
   */
  async getGroupInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fields = req.query.fields as string;

      const groupInfo = await groupsService.getGroupInfo(id, fields);

      res.json(groupInfo);
    } catch (error: any) {
      console.error('Error in getGroupInfo:', error);
      res.status(500).json({ error: error.message || 'Failed to get group info' });
    }
  }

  /**
   * Update group settings
   * POST /api/groups/:id
   */
  async updateGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subject, description, profilePictureFile } = req.body;

      const result = await groupsService.updateGroup(id, {
        subject,
        description,
        profilePictureFile,
      });

      res.json(result);
    } catch (error: any) {
      console.error('Error in updateGroup:', error);
      res.status(500).json({ error: error.message || 'Failed to update group' });
    }
  }

  /**
   * Delete a group
   * DELETE /api/groups/:id
   */
  async deleteGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await groupsService.deleteGroup(id);

      res.json(result);
    } catch (error: any) {
      console.error('Error in deleteGroup:', error);
      res.status(500).json({ error: error.message || 'Failed to delete group' });
    }
  }

  /**
   * Get group invite link
   * GET /api/groups/:id/invite-link
   */
  async getInviteLink(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await groupsService.getInviteLink(id);

      res.json(result);
    } catch (error: any) {
      console.error('Error in getInviteLink:', error);
      res.status(500).json({ error: error.message || 'Failed to get invite link' });
    }
  }

  /**
   * Reset group invite link
   * POST /api/groups/:id/invite-link
   */
  async resetInviteLink(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await groupsService.resetInviteLink(id);

      res.json(result);
    } catch (error: any) {
      console.error('Error in resetInviteLink:', error);
      res.status(500).json({ error: error.message || 'Failed to reset invite link' });
    }
  }

  /**
   * Remove participants from group
   * DELETE /api/groups/:id/participants
   */
  async removeParticipants(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { participants } = req.body;

      if (!participants || !Array.isArray(participants)) {
        return res.status(400).json({ error: 'Participants array is required' });
      }

      const result = await groupsService.removeParticipants(id, { participants });

      res.json(result);
    } catch (error: any) {
      console.error('Error in removeParticipants:', error);
      res.status(500).json({ error: error.message || 'Failed to remove participants' });
    }
  }

  /**
   * Get join requests
   * GET /api/groups/:id/join-requests
   */
  async getJoinRequests(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await groupsService.getJoinRequests(id);

      res.json(result);
    } catch (error: any) {
      console.error('Error in getJoinRequests:', error);
      res.status(500).json({ error: error.message || 'Failed to get join requests' });
    }
  }

  /**
   * Approve join requests
   * POST /api/groups/:id/join-requests
   */
  async approveJoinRequests(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { joinRequestIds } = req.body;

      if (!joinRequestIds || !Array.isArray(joinRequestIds)) {
        return res.status(400).json({ error: 'Join request IDs array is required' });
      }

      const result = await groupsService.approveJoinRequests(id, joinRequestIds);

      res.json(result);
    } catch (error: any) {
      console.error('Error in approveJoinRequests:', error);
      res.status(500).json({ error: error.message || 'Failed to approve join requests' });
    }
  }

  /**
   * Reject join requests
   * DELETE /api/groups/:id/join-requests
   */
  async rejectJoinRequests(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { joinRequestIds } = req.body;

      if (!joinRequestIds || !Array.isArray(joinRequestIds)) {
        return res.status(400).json({ error: 'Join request IDs array is required' });
      }

      const result = await groupsService.rejectJoinRequests(id, joinRequestIds);

      res.json(result);
    } catch (error: any) {
      console.error('Error in rejectJoinRequests:', error);
      res.status(500).json({ error: error.message || 'Failed to reject join requests' });
    }
  }

  /**
   * Send message to group
   * POST /api/groups/:id/messages
   */
  async sendGroupMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { phoneNumberId, type, text, image, video, document, audio } = req.body;

      if (!phoneNumberId) {
        return res.status(400).json({ error: 'Phone number ID is required' });
      }

      if (!type) {
        return res.status(400).json({ error: 'Message type is required' });
      }

      const message: any = { type };

      switch (type) {
        case 'text':
          if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
          }
          message.text = text;
          break;
        case 'image':
          if (!image) {
            return res.status(400).json({ error: 'Image content is required' });
          }
          message.image = image;
          break;
        case 'video':
          if (!video) {
            return res.status(400).json({ error: 'Video content is required' });
          }
          message.video = video;
          break;
        case 'document':
          if (!document) {
            return res.status(400).json({ error: 'Document content is required' });
          }
          message.document = document;
          break;
        case 'audio':
          if (!audio) {
            return res.status(400).json({ error: 'Audio content is required' });
          }
          message.audio = audio;
          break;
        default:
          return res.status(400).json({ error: 'Invalid message type' });
      }

      const result = await groupsService.sendGroupMessage(phoneNumberId, id, message);

      res.json(result);
    } catch (error: any) {
      console.error('Error in sendGroupMessage:', error);
      res.status(500).json({ error: error.message || 'Failed to send group message' });
    }
  }
}

export default new GroupsController();

// Message grouping and date separator utilities

export interface MessageGroup {
  type: 'message-group' | 'date-separator';
  date?: Date;
  from?: string;
  messages?: any[];
}

/**
 * Groups messages by sender and adds date separators
 * @param messages Array of messages to group
 * @returns Array of message groups and date separators
 */
export const groupMessages = (messages: any[]): MessageGroup[] => {
  const grouped: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  messages.forEach((msg, index) => {
    const prevMsg = messages[index - 1];
    const isSameDay = prevMsg && 
      new Date(msg.timestamp).toDateString() === new Date(prevMsg.timestamp).toDateString();
    
    // Add date separator if new day
    if (!isSameDay) {
      // Push current group before adding separator
      if (currentGroup) {
        grouped.push(currentGroup);
        currentGroup = null;
      }
      
      grouped.push({
        type: 'date-separator',
        date: new Date(msg.timestamp)
      });
    }

    // Check if message should be grouped with previous
    const shouldGroup = prevMsg && 
      prevMsg.from === msg.from &&
      isSameDay &&
      (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) < 60000; // 1 minute

    if (shouldGroup && currentGroup && currentGroup.type === 'message-group') {
      currentGroup.messages!.push(msg);
    } else {
      // Push previous group if exists
      if (currentGroup) {
        grouped.push(currentGroup);
      }
      
      // Start new group
      currentGroup = {
        type: 'message-group',
        from: msg.from,
        messages: [msg]
      };
    }
  });

  // Push last group
  if (currentGroup) {
    grouped.push(currentGroup);
  }

  return grouped;
};

/**
 * Format timestamp for display
 * @param timestamp ISO timestamp string
 * @returns Formatted time string
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Format date for separator
 * @param date Date object
 * @returns Formatted date string (Today, Yesterday, etc.)
 */
export const formatSeparatorDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }
};

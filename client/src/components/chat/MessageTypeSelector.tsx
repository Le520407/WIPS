import React, { useState } from 'react';
import { 
  Image, FileText, Mic, MapPin, User, 
  Sticker, List, Link, MessageSquare,
  MapPinned, Home, Repeat
} from 'lucide-react';

interface MessageTypeSelectorProps {
  onSelect: (type: string) => void;
}

const MessageTypeSelector: React.FC<MessageTypeSelectorProps> = ({ 
  onSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const messageTypes = [
    { type: 'image', icon: Image, label: 'Photo/Video', category: 'media' },
    { type: 'document', icon: FileText, label: 'Document', category: 'media' },
    { type: 'audio', icon: Mic, label: 'Audio', category: 'media' },
    { type: 'location', icon: MapPin, label: 'Location', category: 'basic' },
    { type: 'contact', icon: User, label: 'Contact', category: 'basic' },
    { type: 'sticker', icon: Sticker, label: 'Sticker', category: 'basic' },
    { type: 'buttons', icon: List, label: 'Interactive Buttons', category: 'interactive' },
    { type: 'list', icon: List, label: 'Interactive List', category: 'interactive' },
    { type: 'cta', icon: Link, label: 'CTA Button', category: 'interactive' },
    { type: 'location_request', icon: MapPinned, label: 'Location Request', category: 'interactive' },
    { type: 'address', icon: Home, label: 'Address', category: 'basic' },
    { type: 'media_carousel', icon: Repeat, label: 'Media Carousel', category: 'advanced' },
    { type: 'product_carousel', icon: Repeat, label: 'Product Carousel', category: 'advanced' },
    { type: 'template', icon: MessageSquare, label: 'Template', category: 'advanced' },
  ];

  const handleSelect = (type: string) => {
    onSelect(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        title="Message types"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border z-20 max-h-96 overflow-y-auto">
            {messageTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleSelect(item.type)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageTypeSelector;

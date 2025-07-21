import React from 'react';
import FullScreenModal from '../common/FullScreenModal';
import EditChannelForm from './EditChannelForm';

interface Channel {
  _id: string;
  name: string;
  type: 'chat' | 'announcement' | 'showcase';
  group: 'getting-started' | 'community' | 'hackathons';
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  moderators: string[];
  permissions: {
    canMessage: boolean;
    canRead: boolean;
  };
  parentChannelId?: string | null;
  children?: Channel[];
}

interface EditChannelModalProps {
  channel: Channel | null;
  onClose: () => void;
  onChannelUpdated: () => void;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({ channel, onClose, onChannelUpdated }) => {
  return (
    <FullScreenModal isOpen={!!channel} onClose={onClose} title="Edit Channel">
      {channel && (
        <EditChannelForm channel={channel} onClose={onClose} onChannelUpdated={onChannelUpdated} />
      )}
    </FullScreenModal>
  );
};

export default EditChannelModal; 
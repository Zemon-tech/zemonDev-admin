import React, { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import ChannelTable from '../components/channels/ChannelTable';

// Channel type based on backend model
interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'announcement' | 'readonly';
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

interface GroupedChannels {
  [group: string]: Array<Channel & { children?: Channel[] }>;
}

const groupNames: Record<string, string> = {
  'getting-started': 'Getting Started',
  'community': 'Community',
  'hackathons': 'Hackathons',
};

const ChannelsPage: React.FC = () => {
  const apiFetch = useApi();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [grouped, setGrouped] = useState<GroupedChannels>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch('/channels');
        setChannels(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch channels');
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [apiFetch]);

  // Process channels into groups and parent-child structure
  useEffect(() => {
    const grouped: GroupedChannels = {
      'getting-started': [],
      'community': [],
      'hackathons': [],
    };
    // Map for quick parent lookup
    const idToParent: Record<string, Channel & { children?: Channel[] }> = {};
    channels.forEach((ch) => {
      if (ch.parentChannelId == null) {
        const parent = { ...ch, children: [] };
        grouped[ch.group].push(parent);
        idToParent[ch._id] = parent;
      }
    });
    channels.forEach((ch) => {
      if (ch.parentChannelId) {
        const parent = idToParent[ch.parentChannelId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(ch);
        }
      }
    });
    setGrouped(grouped);
  }, [channels]);

  if (loading) return <div className="flex justify-center items-center h-32"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Channels</h1>
      <ChannelTable title={groupNames['getting-started']} channels={grouped['getting-started'] || []} />
      <ChannelTable title={groupNames['community']} channels={grouped['community'] || []} />
      <ChannelTable title={groupNames['hackathons']} channels={grouped['hackathons'] || []} />
    </div>
  );
};

export default ChannelsPage; 
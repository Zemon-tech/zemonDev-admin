import React, { useEffect, useState } from 'react';
import { useApi } from '../lib/api';
import ChannelTable from '../components/channels/ChannelTable';
import FullScreenModal from '../components/common/FullScreenModal';
import AddChannelForm from '../components/channels/AddChannelForm';
import EditChannelModal from '../components/channels/EditChannelModal';

// Channel type based on backend model
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
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Channel | null>(null);

  // Fetch channels logic
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

  useEffect(() => {
    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Delete logic
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await apiFetch(`/channels/${deleteTarget._id}`, { method: 'DELETE' });
      if (!deleteTarget.parentChannelId) {
        // Parent: remove parent and all its children
        setChannels((prev) => prev.filter(c => c._id !== deleteTarget._id && c.parentChannelId !== deleteTarget._id));
      } else {
        // Child: remove only the child
        setChannels((prev) => prev.filter(c => c._id !== deleteTarget._id));
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete channel');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-32"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Channels</h1>
      <div className="mb-4 flex justify-end">
        <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>Add Channel</button>
      </div>
      <FullScreenModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add Channel">
        <AddChannelForm onClose={() => setAddModalOpen(false)} onChannelAdded={fetchChannels} />
      </FullScreenModal>
      <EditChannelModal channel={editTarget} onClose={() => setEditTarget(null)} onChannelUpdated={fetchChannels} />
      <ChannelTable title={groupNames['getting-started']} channels={grouped['getting-started'] || []} onDelete={(ch) => setDeleteTarget(ch)} onEdit={(ch) => setEditTarget(ch)} />
      <ChannelTable title={groupNames['community']} channels={grouped['community'] || []} onDelete={(ch) => setDeleteTarget(ch)} onEdit={(ch) => setEditTarget(ch)} />
      <ChannelTable title={groupNames['hackathons']} channels={grouped['hackathons'] || []} onDelete={(ch) => setDeleteTarget(ch)} onEdit={(ch) => setEditTarget(ch)} />
      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-base-100 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-error">Confirm Delete</h3>
            <p className="mb-4">
              {(!deleteTarget.parentChannelId)
                ? 'Deleting this parent channel will also delete all its child channels. This action cannot be undone.'
                : 'Are you sure you want to delete this channel?'}
            </p>
            {deleteError && <div className="alert alert-error mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage; 
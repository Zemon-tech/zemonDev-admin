import React, { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';
import { useUser } from '@clerk/clerk-react';

interface ChannelOption {
  _id: string;
  name: string;
  type: string;
}
interface ModeratorOption {
  _id: string;
  username: string;
}
interface AddChannelFormProps {
  onClose: () => void;
  onChannelAdded?: () => void;
}

const initialPermissions = { canRead: true, canMessage: true };

const AddChannelForm: React.FC<AddChannelFormProps> = ({ onClose, onChannelAdded }) => {
  const apiFetch = useApi();
  const { user, isLoaded, isSignedIn } = useUser();

  // Form state
  const [name, setName] = useState('');
  const [group, setGroup] = useState('getting-started');
  const [type, setType] = useState<'chat' | 'announcement' | 'showcase'>('chat');
  const [parentChannelId, setParentChannelId] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState({ ...initialPermissions });
  const [moderators, setModerators] = useState<string[]>([]);

  // Data for selects
  const [parentChannels, setParentChannels] = useState<ChannelOption[]>([]);
  const [moderatorOptions, setModeratorOptions] = useState<ModeratorOption[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Current user MongoDB info
  const [mongoUser, setMongoUser] = useState<{ _id: string; username: string } | null>(null);

  // Fetch parent channels, moderators, and current user MongoDB record
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      apiFetch('/channels'),
      apiFetch('/users?role=moderator'),
      apiFetch('/users/me'),
    ])
      .then(([channels, mods, me]) => {
        setParentChannels(channels.filter((ch: any) => !ch.parentChannelId));
        setModeratorOptions(mods);
        setMongoUser(me);
      })
      .catch((err) => setError(err.message || 'Failed to load form data'))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  // Conditional logic: Parent Channel -> Type
  useEffect(() => {
    if (!parentChannelId) {
      setType('announcement');
    }
  }, [parentChannelId]);

  // Conditional logic: Type -> Permissions
  useEffect(() => {
    if (type === 'announcement' || type === 'showcase') {
      setPermissions((p) => ({ ...p, canMessage: false }));
    }
  }, [type]);

  // Disable type select if parentChannelId is empty (i.e., this is a parent channel)
  const typeDisabled = !parentChannelId;
  // Disable canMessage if type is announcement/showcase
  const canMessageDisabled = type === 'announcement' || type === 'showcase';

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (!isLoaded || !isSignedIn || !user || !mongoUser) throw new Error('User not loaded');
      const payload = {
        name,
        group,
        type,
        parentChannelId: parentChannelId || null,
        description,
        isActive,
        permissions,
        moderators,
        createdBy: mongoUser._id,
      };
      await apiFetch('/channels', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onClose();
      if (onChannelAdded) onChannelAdded();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create channel');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading || !isLoaded) return <div className="flex justify-center items-center h-32"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="alert alert-error">Error: {error}</div>;

  return (
    <form className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
      {/* Channel Name */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Channel Name</label>
        <input type="text" className="input input-bordered w-full" placeholder="Enter channel name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      {/* Group */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Group</label>
        <select className="select select-bordered w-full" value={group} onChange={e => setGroup(e.target.value)} required>
          <option value="getting-started">Getting Started</option>
          <option value="community">Community</option>
          <option value="hackathons">Hackathons</option>
        </select>
      </div>
      {/* Type */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Type</label>
        <select className="select select-bordered w-full" value={type} onChange={e => setType(e.target.value as any)} disabled={typeDisabled} required>
          <option value="chat">Chat</option>
          <option value="announcement">Announcement</option>
          <option value="showcase">Showcase</option>
        </select>
        {typeDisabled && (
          <span className="text-xs text-info mt-1">Type is automatically set to announcement for parent channels.</span>
        )}
      </div>
      {/* Parent Channel */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Parent Channel</label>
        <select className="select select-bordered w-full" value={parentChannelId} onChange={e => setParentChannelId(e.target.value)}>
          <option value="">None (Parent)</option>
          {parentChannels.map((ch) => (
            <option key={ch._id} value={ch._id}>{ch.name}</option>
          ))}
        </select>
        {typeDisabled && (
          <span className="text-xs text-info mt-1">Type is automatically set to announcement for parent channels.</span>
        )}
      </div>
      {/* Description */}
      <div className="form-control col-span-2">
        <label className="label font-semibold">Description</label>
        <textarea className="textarea textarea-bordered w-full min-h-[80px]" placeholder="Enter channel description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      {/* Active */}
      <div className="form-control col-span-1 flex-row items-center gap-2">
        <label className="cursor-pointer label font-semibold">
          <input type="checkbox" className="checkbox mr-2" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
          Active
        </label>
      </div>
      {/* Permissions */}
      <div className="form-control col-span-1 flex flex-row items-center gap-6">
        <label className="cursor-pointer label font-semibold">
          <input type="checkbox" className="checkbox mr-2" checked={permissions.canRead} onChange={e => setPermissions(p => ({ ...p, canRead: e.target.checked }))} />
          Can Read
        </label>
        <label className="cursor-pointer label font-semibold">
          <input type="checkbox" className="checkbox mr-2" checked={permissions.canMessage} onChange={e => setPermissions(p => ({ ...p, canMessage: e.target.checked }))} disabled={canMessageDisabled} />
          Can Message
        </label>
        {canMessageDisabled && (
          <span className="text-xs text-info mt-1">Announcement and Showcase channels can't have can message permission.</span>
        )}
      </div>
      {/* CreatedBy (read-only) */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Created By</label>
        <input type="text" className="input input-bordered w-full" value={mongoUser?.username || ''} readOnly />
        <span className="text-xs text-base-content/60">MongoDB UserId: {mongoUser?._id}</span>
      </div>
      {/* Moderators */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Moderators</label>
        <select className="select select-bordered w-full" multiple value={moderators} onChange={e => setModerators(Array.from(e.target.selectedOptions, o => o.value))}>
          {moderatorOptions.map((mod) => (
            <option key={mod._id} value={mod._id}>{mod.username}</option>
          ))}
        </select>
      </div>
      {/* Submit Button & Error */}
      <div className="col-span-2 flex flex-col items-end mt-8 gap-2">
        {submitError && <div className="alert alert-error w-full">{submitError}</div>}
        <button type="submit" className="btn btn-primary px-8" disabled={submitLoading}>{submitLoading ? 'Adding...' : 'Add Channel'}</button>
      </div>
    </form>
  );
};

export default AddChannelForm; 
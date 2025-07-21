import React, { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

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

interface EditChannelFormProps {
  channel: Channel;
  onClose: () => void;
  onChannelUpdated: () => void;
}

const EditChannelForm: React.FC<EditChannelFormProps> = ({ channel, onClose, onChannelUpdated }) => {
  const apiFetch = useApi();
  const [name, setName] = useState(channel.name);
  const [group, setGroup] = useState(channel.group);
  const [type, setType] = useState(channel.type);
  const [description, setDescription] = useState(channel.description || '');
  const [isActive, setIsActive] = useState(channel.isActive);
  const [permissions, setPermissions] = useState({ ...channel.permissions });
  const [moderators, setModerators] = useState<string[]>(channel.moderators);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // For demo: not allowing parent/child or createdBy to be changed in edit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        name,
        group,
        type,
        description,
        isActive,
        permissions,
        moderators,
      };
      await apiFetch(`/channels/${channel._id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      onClose();
      onChannelUpdated();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update channel');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
      {/* Channel Name */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Channel Name</label>
        <input type="text" className="input input-bordered w-full" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      {/* Group */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Group</label>
        <select className="select select-bordered w-full" value={group} onChange={e => setGroup(e.target.value as 'getting-started' | 'community' | 'hackathons')} required>
          <option value="getting-started">Getting Started</option>
          <option value="community">Community</option>
          <option value="hackathons">Hackathons</option>
        </select>
      </div>
      {/* Type */}
      <div className="form-control col-span-1">
        <label className="label font-semibold">Type</label>
        <select className="select select-bordered w-full" value={type} onChange={e => setType(e.target.value as any)} required>
          <option value="chat">Chat</option>
          <option value="announcement">Announcement</option>
          <option value="showcase">Showcase</option>
        </select>
      </div>
      {/* Description */}
      <div className="form-control col-span-2">
        <label className="label font-semibold">Description</label>
        <textarea className="textarea textarea-bordered w-full min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} />
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
          <input type="checkbox" className="checkbox mr-2" checked={permissions.canMessage} onChange={e => setPermissions(p => ({ ...p, canMessage: e.target.checked }))} />
          Can Message
        </label>
      </div>
      {/* Moderators */}
      <div className="form-control col-span-2">
        <label className="label font-semibold">Moderators</label>
        <input type="text" className="input input-bordered w-full" value={moderators.join(', ')} onChange={e => setModerators(e.target.value.split(',').map(s => s.trim()))} />
        <span className="text-xs text-base-content/60">(Comma-separated user IDs; replace with a multi-select in production)</span>
      </div>
      {/* Submit Button & Error */}
      <div className="col-span-2 flex flex-col items-end mt-8 gap-2">
        {submitError && <div className="alert alert-error w-full">{submitError}</div>}
        <button type="submit" className="btn btn-primary px-8" disabled={submitLoading}>{submitLoading ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </form>
  );
};

export default EditChannelForm; 
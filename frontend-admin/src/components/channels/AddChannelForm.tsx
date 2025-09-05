import React, { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';
import { useUser } from '@clerk/clerk-react';
import { MessageSquare, Hash, Users, Shield, Settings, Plus, X, Tag, Target, CheckCircle2, Layers, User, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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
  const [type, setType] = useState<'chat' | 'announcement' | 'showcase'>('announcement');
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
  // Note: Removed automatic type setting to allow all types for parent channels
  // Parent channels can be announcement, showcase, or chat

  // Conditional logic: Type -> Permissions
  useEffect(() => {
    if (type === 'announcement' || type === 'showcase') {
      setPermissions((p) => ({ ...p, canMessage: false }));
    } else if (type === 'chat') {
      setPermissions((p) => ({ ...p, canMessage: true }));
    }
  }, [type]);

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
        parentChannelId: parentChannelId === 'none' || !parentChannelId ? null : parentChannelId,
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
          <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageSquare size={18} />
            </div>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Channel Name */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Hash size={14} className="text-primary" /> 
                Channel Name 
                <span className="badge badge-xs badge-error">Required</span>
              </Label>
              <Input 
                type="text" 
                placeholder="Enter channel name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <div className="text-xs text-base-content/70">A clear, descriptive name for the channel</div>
            </div>

            {/* Group */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Globe size={14} className="text-primary" /> 
                Group 
                <span className="badge badge-xs badge-error">Required</span>
              </Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger className="w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="getting-started">Getting Started</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="hackathons">Hackathons</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-base-content/70">Select the channel group category</div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Tag size={14} className="text-primary" /> 
                Type 
                <span className="badge badge-xs badge-error">Required</span>
              </Label>
              <RadioGroup value={type} onValueChange={(value) => setType(value as any)} className="grid grid-cols-3 gap-2">
                {[
                  { value: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
                  { value: 'announcement', label: 'Announcement', icon: <Target size={14} /> },
                  { value: 'showcase', label: 'Showcase', icon: <Layers size={14} /> },
                ].map(opt => (
                  <Label key={opt.value} className={`cursor-pointer border rounded-md p-3 text-center transition-all ${type === opt.value ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/50'}`}>
                    <div className="sr-only">
                      <RadioGroupItem value={opt.value} />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`${type === opt.value ? 'text-primary' : 'text-base-content/70'}`}>
                        {opt.icon}
                      </span>
                      <span className={`text-sm ${type === opt.value ? 'text-primary font-medium' : ''}`}>
                        {opt.label}
                      </span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
              <div className="text-xs text-base-content/70">Choose the channel type and purpose</div>
            </div>

            {/* Parent Channel */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Layers size={14} className="text-primary" /> 
                Parent Channel
              </Label>
              <Select value={parentChannelId} onValueChange={setParentChannelId}>
                <SelectTrigger className="w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select parent channel (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Parent Channel)</SelectItem>
                  {parentChannels.map((ch) => (
                    <SelectItem key={ch._id} value={ch._id}>{ch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-base-content/70">
                {!parentChannelId || parentChannelId === 'none' ? 'This will be a parent channel' : 'This will be a child channel'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 space-y-2">
            <Label className="inline-flex items-center gap-2 text-sm font-medium">
              <Layers size={14} className="text-primary" /> 
              Description
            </Label>
            <div className="relative">
              <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                <Layers size={60} className="text-primary/10" />
              </div>
              <Textarea 
                placeholder="Enter channel description..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="min-h-[120px] focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="text-xs text-base-content/70">Describe the channel's purpose and content</div>
          </div>
        </div>

        {/* Settings & Permissions Card */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
          <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Settings size={18} />
            </div>
            Settings & Permissions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Status */}
            <div className="space-y-3">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={14} className="text-primary" /> 
                Channel Status
              </Label>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                />
                <span className="text-sm">Active Channel</span>
              </div>
              <div className="text-xs text-base-content/70">Active channels are visible to users</div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Shield size={14} className="text-primary" /> 
                Permissions
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={permissions.canRead} 
                    onChange={e => setPermissions(p => ({ ...p, canRead: e.target.checked }))} 
                  />
                  <span className="text-sm">Can Read</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary" 
                    checked={permissions.canMessage} 
                    onChange={e => setPermissions(p => ({ ...p, canMessage: e.target.checked }))} 
                    disabled={canMessageDisabled} 
                  />
                  <span className={`text-sm ${canMessageDisabled ? 'text-base-content/50' : ''}`}>Can Message</span>
                </div>
                {canMessageDisabled && (
                  <div className="text-xs text-warning bg-warning/10 p-2 rounded-md">
                    Announcement and Showcase channels can't have message permissions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Moderators & Creator Card */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
          <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users size={18} />
            </div>
            Moderators & Creator
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Created By (read-only) */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <User size={14} className="text-primary" /> 
                Created By
              </Label>
              <Input 
                type="text" 
                value={mongoUser?.username || ''} 
                readOnly 
                className="bg-base-200"
              />
              <div className="text-xs text-base-content/60">MongoDB UserId: {mongoUser?._id}</div>
            </div>

            {/* Moderators */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Shield size={14} className="text-primary" /> 
                Moderators
              </Label>
              <Select 
                value={moderators[0] || 'none'} 
                onValueChange={(value) => setModerators(value === 'none' ? [] : [value])}
              >
                <SelectTrigger className="w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select moderators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Moderators</SelectItem>
                  {moderatorOptions.map((mod) => (
                    <SelectItem key={mod._id} value={mod._id}>{mod.username}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-base-content/70">Select users who can moderate this channel</div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200">
          <div className="flex flex-col items-end gap-4">
            {submitError && (
              <div className="alert alert-error w-full">
                <X size={16} />
                <span>{submitError}</span>
              </div>
            )}
            <Button 
              type="submit" 
              className="btn-primary px-8" 
              disabled={submitLoading}
            >
              {submitLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Channel...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2" />
                  Create Channel
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddChannelForm; 
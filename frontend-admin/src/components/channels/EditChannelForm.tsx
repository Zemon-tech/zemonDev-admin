import React, { useState } from 'react';
import { useApi } from '../../lib/api';
import { MessageSquare, Hash, Users, Shield, Settings, Save, X, Tag, Target, CheckCircle2, Layers, User, Calendar, Globe, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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

  // Conditional logic: Type -> Permissions
  React.useEffect(() => {
    if (type === 'announcement' || type === 'showcase') {
      setPermissions((p) => ({ ...p, canMessage: false }));
    } else if (type === 'chat') {
      setPermissions((p) => ({ ...p, canMessage: true }));
    }
  }, [type]);

  // Disable canMessage if type is announcement/showcase
  const canMessageDisabled = type === 'announcement' || type === 'showcase';

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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
          <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Edit size={18} />
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
              <Select value={group} onValueChange={(value) => setGroup(value as 'getting-started' | 'community' | 'hackathons')}>
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

            {/* Channel Status Info */}
            <div className="space-y-2">
              <Label className="inline-flex items-center gap-2 text-sm font-medium">
                <Calendar size={14} className="text-primary" /> 
                Channel Info
              </Label>
              <div className="bg-base-200 p-3 rounded-lg space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Created:</span> {new Date(channel.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Last Updated:</span> {new Date(channel.updatedAt).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Channel ID:</span> 
                  <code className="ml-1 text-xs bg-base-300 px-1 rounded">{channel._id}</code>
                </div>
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

        {/* Moderators Card */}
        <div className="card bg-base-100 p-6 rounded-xl border border-base-200 transition-all hover:border-primary/30">
          <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users size={18} />
            </div>
            Moderators
          </h2>
          
          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2 text-sm font-medium">
              <Shield size={14} className="text-primary" /> 
              Moderator User IDs
            </Label>
            <Input 
              type="text" 
              value={moderators.join(', ')} 
              onChange={e => setModerators(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
              placeholder="Enter user IDs separated by commas"
              className="focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <div className="text-xs text-base-content/70">
              Enter MongoDB user IDs separated by commas (e.g., 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012)
            </div>
            
            {/* Current Moderators Display */}
            {moderators.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-2">Current Moderators:</div>
                <div className="flex flex-wrap gap-2">
                  {moderators.map((modId, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      <User size={12} />
                      {modId}
                      <button 
                        type="button" 
                        onClick={() => setModerators(prev => prev.filter((_, i) => i !== index))} 
                        className="btn btn-ghost btn-xs px-1"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
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
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditChannelForm; 
import React, { useEffect, useState } from 'react';
import { useAcademyApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

type Phase = {
  _id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  estimatedDuration?: number;
  color?: string;
};

export default function AcademyPhasesPage() {
  const { academy: api } = useAcademyApi();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Phase>>({ name: '', order: 1, color: '#3B82F6', isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listPhases();
      setPhases(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await api.updatePhase(editingId, form);
    } else {
      await api.createPhase(form);
    }
    setForm({ name: '', order: 1, color: '#3B82F6', isActive: true });
    setEditingId(null);
    load();
  };

  const startEdit = (p: Phase) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      order: p.order,
      isActive: p.isActive,
      estimatedDuration: p.estimatedDuration,
      color: p.color
    });
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Academy Phases</CardTitle>
          <CardDescription>Macro stages of the curriculum. Control order, color and active status.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div>Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phases.map(p => (
                  <TableRow key={p._id}>
                    <TableCell>{p.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                        <div className="font-medium">{p.name}</div>
                      </div>
                      {p.description && <div className="text-xs text-muted-foreground mt-1">{p.description}</div>}
                    </TableCell>
                    <TableCell>
                      {p.isActive ? <Badge variant="default">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => startEdit(p)}>Edit</Button>
                        <Button variant="outline" onClick={async () => { await api.togglePhase(p._id); load(); }}>Toggle</Button>
                        <Button variant="destructive" onClick={async () => { if (confirm('Delete this phase?')) { await api.deletePhase(p._id); load(); } }}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Phase' : 'Create Phase'}</CardTitle>
          <CardDescription>Set a friendly name, order, and an optional color for UI accents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
            <div className="md:col-span-1">
              <label className="text-sm text-muted-foreground">Name</label>
              <Input placeholder="e.g. Fundamentals" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Order</label>
              <Input type="number" placeholder="1" value={form.order || 1} onChange={e => setForm({ ...form, order: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Color</label>
              <Input placeholder="#3B82F6" value={form.color || ''} onChange={e => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-muted-foreground">Description</label>
              <Input placeholder="Short description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Estimated Duration (days)</label>
              <Input type="number" placeholder="0" value={form.estimatedDuration || 0} onChange={e => setForm({ ...form, estimatedDuration: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" className="toggle" checked={!!form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span>Active</span>
            </div>
            <Separator className="md:col-span-3" />
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit">{editingId ? 'Update Phase' : 'Create Phase'}</Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ name: '', order: 1, color: '#3B82F6', isActive: true }); }}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




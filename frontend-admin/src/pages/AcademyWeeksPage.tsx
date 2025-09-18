import React, { useEffect, useState } from 'react';
import { useAcademyApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

type Phase = { _id: string; name: string };
type Week = { _id: string; phaseId: string; weekNumber: number; title: string; isActive: boolean; };

export default function AcademyWeeksPage() {
  const { academy: api } = useAcademyApi();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('');
  const [form, setForm] = useState<Partial<Week>>({ title: '', weekNumber: 1, isActive: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const ps = await api.listPhases();
    setPhases(ps);
    const pid = selectedPhaseId || ps[0]?._id || '';
    if (pid) {
      setSelectedPhaseId(pid);
      const ws = await api.listWeeks(pid);
      setWeeks(ws);
    } else {
      setWeeks([]);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { (async () => { if (selectedPhaseId) setWeeks(await api.listWeeks(selectedPhaseId)); })(); }, [selectedPhaseId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, phaseId: selectedPhaseId };
    if (editingId) await api.updateWeek(editingId, data); else await api.createWeek(data);
    setForm({ title: '', weekNumber: 1, isActive: true });
    setEditingId(null);
    setWeeks(await api.listWeeks(selectedPhaseId));
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Weeks</CardTitle>
          <CardDescription>Time-boxed segments within a phase. Manage titles, week numbers and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center mb-3">
            <select className="select select-bordered" value={selectedPhaseId} onChange={e => setSelectedPhaseId(e.target.value)}>
              <option value="">Select Phase</option>
              {phases.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map(w => (
                <TableRow key={w._id}>
                  <TableCell>{w.weekNumber}</TableCell>
                  <TableCell>{w.title}</TableCell>
                  <TableCell>{w.isActive ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={() => { setEditingId(w._id); setForm({ title: w.title, weekNumber: w.weekNumber, isActive: w.isActive }); }}>Edit</Button>
                      <Button variant="outline" onClick={async () => { await api.toggleWeek(w._id); setWeeks(await api.listWeeks(selectedPhaseId)); }}>Toggle</Button>
                      <Button variant="destructive" onClick={async () => { if (confirm('Delete this week?')) { await api.deleteWeek(w._id); setWeeks(await api.listWeeks(selectedPhaseId)); } }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Week' : 'Create Week'}</CardTitle>
          <CardDescription>Weeks are scoped to a selected phase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground">Title</label>
              <Input placeholder="e.g. Week 1: Basics" value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Week Number</label>
              <Input type="number" placeholder="1" value={form.weekNumber || 1} onChange={e => setForm({ ...form, weekNumber: Number(e.target.value) })} required />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" className="toggle" checked={!!form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span>Active</span>
            </div>
            <Separator className="md:col-span-3" />
            <div className="md:col-span-3"><Button type="submit">{editingId ? 'Update Week' : 'Create Week'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




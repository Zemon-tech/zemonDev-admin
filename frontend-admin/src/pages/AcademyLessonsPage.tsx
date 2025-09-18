import React, { useEffect, useState } from 'react';
import { useAcademyApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';

type Phase = { _id: string; name: string };
type Week = { _id: string; title: string };
type Lesson = { _id: string; weekId: string; title: string; order: number; type: string; isActive: boolean };

export default function AcademyLessonsPage() {
  const { academy: api } = useAcademyApi();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [phaseId, setPhaseId] = useState('');
  const [weekId, setWeekId] = useState('');
  const emptyForm = {
    title: '',
    order: 1,
    type: 'reading',
    dayNumber: 1,
    isActive: true,
    points: 10,
    content: {
      duration: undefined as number | undefined,
      videoUrl: '',
      readingUrl: '',
      instructions: '',
      resources: [] as Array<{ title: string; url: string; type: string }>,
    }
  };
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { (async () => {
    const ps = await api.listPhases();
    setPhases(ps);
    if (ps[0]?._id) setPhaseId(ps[0]._id);
  })(); }, []);

  useEffect(() => { (async () => {
    if (!phaseId) { setWeeks([]); setWeekId(''); return; }
    const ws = await api.listWeeks(phaseId);
    setWeeks(ws);
    if (ws[0]?._id) setWeekId(ws[0]._id);
  })(); }, [phaseId]);

  useEffect(() => { (async () => {
    if (!weekId) { setLessons([]); return; }
    setLessons(await api.listLessons(weekId));
  })(); }, [weekId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, weekId };
    if (editingId) await api.updateLesson(editingId, data); else await api.createLesson(data);
    setForm(emptyForm);
    setEditingId(null);
    setLessons(await api.listLessons(weekId));
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lessons</CardTitle>
          <CardDescription>Atomic learning units within a week. Manage type, order and status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center mb-3">
            <select className="select select-bordered" value={phaseId} onChange={e => setPhaseId(e.target.value)}>
              {phases.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            <select className="select select-bordered" value={weekId} onChange={e => setWeekId(e.target.value)}>
              {weeks.map(w => <option key={w._id} value={w._id}>{w.title}</option>)}
            </select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map(l => (
                <TableRow key={l._id}>
                  <TableCell>{l.order}</TableCell>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell><Badge variant="secondary">{l.type}</Badge></TableCell>
                  <TableCell>{l.isActive ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" onClick={async () => { const full = await api.getLesson(l._id); setEditingId(l._id); setForm({ title: full.title, order: full.order, type: full.type, dayNumber: (full as any).dayNumber || 1, isActive: full.isActive, points: (full as any).points ?? 10, content: { duration: full.content?.duration, videoUrl: full.content?.videoUrl || '', readingUrl: full.content?.readingUrl || '', instructions: full.content?.instructions || '', resources: (full.content?.resources || []).map((r: any) => ({ title: r.title || '', url: r.url || '', type: r.type || 'link' })) } }); }}>Edit</Button>
                      <Button variant="outline" onClick={async () => { await api.toggleLesson(l._id); setLessons(await api.listLessons(weekId)); }}>Toggle</Button>
                      <Button variant="destructive" onClick={async () => { if (confirm('Delete this lesson?')) { await api.deleteLesson(l._id); setLessons(await api.listLessons(weekId)); } }}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{editingId ? 'Edit Lesson' : 'Create Lesson'}</CardTitle><CardDescription>Lessons belong to the selected week.</CardDescription></CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={submit}>
            <div className="md:col-span-1">
              <label className="text-sm text-muted-foreground">Title</label>
              <Input placeholder="e.g. HTTP Basics" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Order</label>
              <Input type="number" placeholder="1" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })} required />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Type</label>
              <select className="select select-bordered w-full" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['video','workshop','project','reading','quiz','assignment'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Day Number</label>
              <Input type="number" placeholder="1" value={form.dayNumber} onChange={e => setForm({ ...form, dayNumber: Number(e.target.value) })} required />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input type="checkbox" className="toggle" checked={!!form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
              <span>Active</span>
            </div>
            <Separator className="md:col-span-3" />

            <div>
              <label className="text-sm text-muted-foreground">Duration (minutes)</label>
              <Input type="number" placeholder="30" value={form.content?.duration ?? ''} onChange={e => setForm({ ...form, content: { ...form.content, duration: e.target.value ? Number(e.target.value) : undefined } })} />
            </div>
            {form.type === 'video' && (
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Video URL</label>
                <Input placeholder="https://..." value={form.content?.videoUrl || ''} onChange={e => setForm({ ...form, content: { ...form.content, videoUrl: e.target.value } })} />
              </div>
            )}
            {form.type === 'reading' && (
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Reading URL</label>
                <Input placeholder="https://..." value={form.content?.readingUrl || ''} onChange={e => setForm({ ...form, content: { ...form.content, readingUrl: e.target.value } })} />
              </div>
            )}
            <div className="md:col-span-3">
              <label className="text-sm text-muted-foreground">Instructions</label>
              <Textarea placeholder="Markdown/text instructions..." value={form.content?.instructions || ''} onChange={e => setForm({ ...form, content: { ...form.content, instructions: e.target.value } })} />
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Resources</div>
                <Button type="button" variant="outline" onClick={() => setForm({ ...form, content: { ...form.content, resources: [...(form.content?.resources || []), { title: '', url: '', type: 'link' }] } })}>Add Resource</Button>
              </div>
              {(form.content?.resources || []).map((r: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
                  <div className="md:col-span-2">
                    <Input placeholder="Title" value={r.title} onChange={e => {
                      const resources = [...form.content.resources];
                      resources[idx] = { ...resources[idx], title: e.target.value };
                      setForm({ ...form, content: { ...form.content, resources } });
                    }} />
                  </div>
                  <div className="md:col-span-3">
                    <Input placeholder="URL" value={r.url} onChange={e => {
                      const resources = [...form.content.resources];
                      resources[idx] = { ...resources[idx], url: e.target.value };
                      setForm({ ...form, content: { ...form.content, resources } });
                    }} />
                  </div>
                  <div className="md:col-span-1 flex gap-2 items-center">
                    <select className="select select-bordered w-full" value={r.type} onChange={e => {
                      const resources = [...form.content.resources];
                      resources[idx] = { ...resources[idx], type: e.target.value };
                      setForm({ ...form, content: { ...form.content, resources } });
                    }}>
                      {['youtube','pdf','notion','link','meet'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Button type="button" variant="destructive" onClick={() => {
                      const resources = [...form.content.resources];
                      resources.splice(idx, 1);
                      setForm({ ...form, content: { ...form.content, resources } });
                    }}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="md:col-span-3" />
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit">{editingId ? 'Update Lesson' : 'Create Lesson'}</Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




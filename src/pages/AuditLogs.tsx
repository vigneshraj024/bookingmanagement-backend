import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ShieldAlert } from 'lucide-react';

interface AuditLog {
  Id: number;
  Action: string;
  Entity: string | null;
  EntityId: string | null;
  ActorId: string | null;
  ActorEmail: string | null;
  Meta: any;
  CreatedAt: string;
}

export function AuditLogsPage() {
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [actorEmail, setActorEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (entity) params.set('entity', entity);
    if (actorEmail) params.set('actorEmail', actorEmail);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return `/api/booking/audits${qs ? `?${qs}` : ''}`;
  }, [action, entity, actorEmail, from, to]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(query);
      setLogs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldAlert className="h-4 w-4" /></span>
            Audit Logs
          </h2>
          <p className="text-sm text-muted-foreground">Inspect system activity with flexible filters.</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm border-border/60 mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Input id="action" placeholder="LOGIN, BOOKING_CREATE, ..." value={action} onChange={(e) => setAction(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="entity">Entity</Label>
              <Input id="entity" placeholder="Admin, Booking, PriceMaster" value={entity} onChange={(e) => setEntity(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="actorEmail">Actor Email</Label>
              <Input id="actorEmail" placeholder="user@example.com" value={actorEmail} onChange={(e) => setActorEmail(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={load} disabled={loading} className="bg-primary hover:bg-primary-hover">{loading ? 'Loading...' : 'Apply'}</Button>
            <Button variant="secondary" onClick={() => { setAction(''); setEntity(''); setActorEmail(''); setFrom(''); setTo(''); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 text-destructive">{error}</div>
      )}

      {/* Results */}
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Results ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Entity</th>
                  <th className="py-2 pr-4">EntityId</th>
                  <th className="py-2 pr-4">Actor</th>
                  <th className="py-2 pr-4">Meta</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.Id} className="border-b last:border-0 align-top hover:bg-muted/40">
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(l.CreatedAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-medium">{l.Action}</td>
                    <td className="py-2 pr-4">{l.Entity || '-'}</td>
                    <td className="py-2 pr-4">{l.EntityId || '-'}</td>
                    <td className="py-2 pr-4">{l.ActorEmail || l.ActorId || '-'}</td>
                    <td className="py-2 pr-4 max-w-[420px]">
                      <pre className="whitespace-pre-wrap break-words text-xs bg-muted/50 p-2 rounded">
                        {typeof l.Meta === 'string' ? l.Meta : JSON.stringify(l.Meta, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-4 text-muted-foreground text-center">No logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

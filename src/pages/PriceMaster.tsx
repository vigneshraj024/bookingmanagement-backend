import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { priceService } from '@/lib/prices';
import { apiFetch } from '@/lib/api';
import { Sparkles } from 'lucide-react';

interface PriceRow {
  Id: number;
  Sport: 'Cricket' | 'Football' | 'Pickleball' | 'Gaming' | string;
  Price: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export function PriceMasterPage() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sports: Array<'Cricket' | 'Football' | 'Pickleball' | 'Gaming'> = ['Cricket', 'Football', 'Pickleball', 'Gaming'];
  const [newSport, setNewSport] = useState<typeof sports[number] | ''>('');
  const [newPrice, setNewPrice] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/api/prices');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!newSport || !newPrice) return;
    try {
      setLoading(true);
      await apiFetch('/api/prices', {
        method: 'POST',
        body: JSON.stringify({ sport: newSport, price: Number(newPrice) })
      });
      priceService.clearCache();
      setNewSport('');
      setNewPrice('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  }

  async function update(row: PriceRow, priceStr: string) {
    const price = Number(priceStr);
    if (!Number.isFinite(price)) return;
    try {
      setLoading(true);
      await apiFetch(`/api/prices/${row.Id}`, {
        method: 'PUT',
        body: JSON.stringify({ price })
      });
      priceService.clearCache();
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  async function remove(row: PriceRow) {
    if (!confirm(`Delete price config for ${row.Sport}?`)) return;
    try {
      setLoading(true);
      await apiFetch(`/api/prices/${row.Id}`, { method: 'DELETE' });
      priceService.clearCache();
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
            Price Master
          </h2>
          <p className="text-sm text-muted-foreground">Configure hourly prices for each sport.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create/Update panel */}
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Add or Update Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Sport</Label>
                <Select value={newSport || ''} onValueChange={(v) => setNewSport(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price per hour (₹)</Label>
                <Input className="mt-1" type="number" placeholder="600" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button onClick={create} disabled={loading || !newSport || !newPrice} className="w-full bg-primary hover:bg-primary-hover">Add/Update</Button>
              </div>
            </div>
            {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
          </CardContent>
        </Card>

        {/* Existing list */}
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Configured Prices ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.length === 0 && !loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No prices configured yet. Add your first one on the left.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Sport</th>
                      <th className="py-2 pr-4">Price/hr (₹)</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.Id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2 pr-4 font-medium">{r.Sport}</td>
                        <td className="py-2 pr-4">
                          <Input defaultValue={String(r.Price)} onBlur={(e) => update(r, e.target.value)} />
                        </td>
                        <td className="py-2 pr-4">
                          <Button variant="destructive" className="bg-destructive hover:bg-destructive/90" onClick={() => remove(r)} disabled={loading}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

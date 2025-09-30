import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckSquare } from 'lucide-react';

interface TodoItem {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'sbm:todos';

export default function TodoPanel() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const remaining = useMemo(() => todos.filter(t => !t.done).length, [todos]);

  const addTodo = () => {
    const title = newTitle.trim();
    if (!title) return;
    setTodos(prev => [
      { id: crypto.randomUUID(), title, done: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setNewTitle('');
    setOpen(false);
  };

  const toggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));
  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.done));

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary" /> To-Do List</span>
            <div className="text-sm text-muted-foreground">{remaining} remaining</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setOpen(true)} className="bg-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
            <Button variant="secondary" onClick={clearCompleted} disabled={!todos.some(t => t.done)}>
              Clear Completed
            </Button>
          </div>

          {todos.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No tasks yet. Add your first task.</div>
          ) : (
            <div className="space-y-2">
              {todos.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} />
                    <div className={`text-sm ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.title}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(t.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="task">Task</Label>
              <Input id="task" placeholder="e.g., Call supplier at 4pm" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addTodo} disabled={!newTitle.trim()} className="bg-primary hover:bg-primary-hover">Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

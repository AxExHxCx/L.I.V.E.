const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Package } from 'lucide-react';
import ComponentCard from '@/components/inventory/ComponentCard';
import ComponentDetail from '@/components/map/ComponentDetail';
import { useQueryClient } from '@tanstack/react-query';

const statuses = ['all', 'marked', 'collected', 'cataloged', 'deployed'];

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['components'],
    queryFn: () => db.entities.Component.list('-created_date', 500),
  });

  const filtered = components.filter((c) => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (selected) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <ComponentDetail
          component={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['components'] });
            setSelected(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border space-y-3 shrink-0">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-sm tracking-widest text-foreground">COMPONENT VAULT</h2>
          <span className="ml-auto font-heading text-xs text-muted-foreground">{filtered.length} ITEMS</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="pl-9 bg-muted border-border font-body text-sm"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-muted w-full justify-start overflow-x-auto">
            {statuses.map((s) => (
              <TabsTrigger key={s} value={s} className="font-heading text-[10px] tracking-wider capitalize">
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-heading text-xs tracking-wider text-muted-foreground">VAULT EMPTY</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Go find some components!</p>
          </div>
        ) : (
          filtered.map((c) => (
            <ComponentCard
              key={c.id}
              component={c}
              onClick={setSelected}
              onDelete={() => queryClient.invalidateQueries({ queryKey: ['components'] })}
            />
          ))
        )}
      </div>
    </div>
  );
}
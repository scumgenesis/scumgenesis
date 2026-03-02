import { useState, useEffect } from 'react';
import { FolderOpen, File, Loader2, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { fetchPresetsOverride, type PresetDirectory } from '@/api/loot';
import { cn } from '@/lib/utils';

export function LootView() {
  const [data, setData] = useState<PresetDirectory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchPresetsOverride()
      .then((res) => {
        if (!cancelled) {
          setData(res.directories);
          if (res.directories.length > 0) setExpandedDirs(new Set([res.directories[0].name]));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar Presets/Override.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDir = (name: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <Card className="overflow-hidden border-2 border-genesis-border/80 shadow-xl ring-1 ring-white/5">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-genesis-muted">
              <Loader2 className="size-5 animate-spin text-genesis-accent" />
              Carregando…
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <FolderOpen className="size-10 text-genesis-muted opacity-60" />
              <p>Nenhum diretório encontrado em Presets/Override.</p>
            </div>
          ) : (
            <div className="divide-y divide-genesis-border/50">
              {data.map((dir) => {
                const isExpanded = expandedDirs.has(dir.name);
                return (
                  <div key={dir.name} className="bg-card">
                    <button
                      type="button"
                      onClick={() => toggleDir(dir.name)}
                      className={cn(
                        'flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/5',
                        isExpanded && 'bg-white/5'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4 shrink-0 text-genesis-muted" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-genesis-muted" />
                      )}
                      <Folder className="size-5 shrink-0 text-genesis-accent" />
                      <span className="font-medium text-foreground">{dir.name}</span>
                      <span className="text-muted-foreground text-sm">
                        ({dir.items.length} {dir.items.length === 1 ? 'item' : 'itens'})
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-genesis-border/40 bg-background/50">
                        <div className="grid gap-0 py-2">
                          {dir.items.length === 0 ? (
                            <div className="px-4 py-2 pl-12 text-sm text-muted-foreground">
                              Diretório vazio
                            </div>
                          ) : (
                            dir.items.map((item) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-2 px-4 py-2 pl-12 text-sm"
                              >
                                {item.type === 'directory' ? (
                                  <Folder className="size-4 shrink-0 text-genesis-muted" />
                                ) : (
                                  <File className="size-4 shrink-0 text-genesis-muted" />
                                )}
                                <span
                                  className={cn(
                                    item.type === 'directory'
                                      ? 'font-medium text-foreground'
                                      : 'font-mono text-muted-foreground'
                                  )}
                                >
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  {item.type === 'directory' ? 'pasta' : 'arquivo'}
                                </span>
                                {item.lastModified && (
                                  <span className="ml-auto text-muted-foreground text-xs tabular-nums">
                                    {new Date(item.lastModified).toLocaleString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

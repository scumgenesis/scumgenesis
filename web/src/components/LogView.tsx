import { useState, useEffect } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchLogList, downloadLog, type LogFile } from '@/api/logs';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatSize(bytes: number): string {
  if (bytes == null || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

export function LogView() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchLogList()
      .then((list) => {
        if (!cancelled) setFiles(list);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar lista.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = async (filename: string) => {
    setDownloading(filename);
    setError(null);
    try {
      await downloadLog(filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao baixar arquivo.');
    } finally {
      setDownloading(null);
    }
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
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <FileText className="size-10 text-genesis-muted opacity-60" />
              <p>Nenhum arquivo encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-genesis-border/60 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">
                    Tamanho
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">
                    Criado
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-muted-foreground">
                    Modificado
                  </TableHead>
                  <TableHead className="w-[120px] text-right text-muted-foreground">
                    Ação
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.name} className="border-genesis-border/40 hover:bg-white/5">
                    <TableCell className="font-mono text-sm text-foreground">
                      {file.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {formatSize(file.size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDateTime(file.lastAccess)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDateTime(file.lastModified)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-genesis-accent/50 text-genesis-accent hover:bg-genesis-accent/15 hover:text-genesis-accent"
                        onClick={() => handleDownload(file.name)}
                        disabled={downloading !== null}
                      >
                        {downloading === file.name ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        <span className="sr-only">Baixar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

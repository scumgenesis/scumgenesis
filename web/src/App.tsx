import { useState } from 'react';
import { FileText, Package } from 'lucide-react';
import { LogView } from '@/components/LogView';
import { LootView } from '@/components/LootView';
import { cn } from '@/lib/utils';

/** Ícone oficial do Discord (mark) */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

type TabId = 'log' | 'loot';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('log');

  return (
    <div className="min-h-screen bg-background p-6 theme-genesis">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col items-center gap-4 pb-2">
          <img
            src="/genesis-logo.png"
            alt="Genesis"
            className="h-24 w-auto object-contain drop-shadow-[0_0_12px_rgba(230,120,50,0.3)]"
          />
        </header>

        <nav
          role="tablist"
          className="flex gap-1 rounded-xl border-2 border-genesis-border/80 bg-card/50 p-1 shadow-lg ring-1 ring-white/5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'log'}
            aria-controls="panel-log"
            id="tab-log"
            onClick={() => setActiveTab('log')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'log'
                ? 'bg-genesis-accent/20 text-genesis-accent shadow-inner'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <FileText className="size-4" />
            Log
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'loot'}
            aria-controls="panel-loot"
            id="tab-loot"
            onClick={() => setActiveTab('loot')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'loot'
                ? 'bg-genesis-accent/20 text-genesis-accent shadow-inner'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <Package className="size-4" />
            Loot
          </button>
        </nav>

        <main>
          {activeTab === 'log' && (
            <div id="panel-log" role="tabpanel" aria-labelledby="tab-log">
              <LogView />
            </div>
          )}
          {activeTab === 'loot' && (
            <div id="panel-loot" role="tabpanel" aria-labelledby="tab-loot">
              <LootView />
            </div>
          )}
        </main>

        <footer className="flex justify-center pt-6">
          <a
            href="https://discord.gg/zfVGNWVY"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg text-muted-foreground transition-colors hover:text-genesis-accent"
            title="Entrar no Discord"
          >
            <DiscordIcon className="size-6" />
            <span>Discord</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;

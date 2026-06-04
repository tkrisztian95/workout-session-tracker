'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MuscleBadge from '@/components/MuscleBadge';
import { Page, PageHeader, HeadingXL, Input } from '@/components/ui';
import { useTranslations } from '@/lib/locale-context';
import {
  catalogAliases,
  catalogByGroup,
  catalogHint,
  catalogName,
  catalogSearchText,
} from '@/lib/exerciseCatalog';

export default function CatalogPage() {
  const router = useRouter();
  const t = useTranslations();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!query) return catalogByGroup();
    return catalogByGroup()
      .map((g) => ({
        group: g.group,
        entries: g.entries.filter((e) => catalogSearchText(e.id).includes(query)),
      }))
      .filter((g) => g.entries.length > 0);
  }, [query]);

  return (
    <Page className="pb-24">
      <PageHeader>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="w-8 h-8 rounded-xl flex items-center justify-center active:bg-elevated transition-colors"
            aria-label={t.back}
          >
            <ChevronLeft className="w-5 h-5 text-secondary" />
          </button>
          <HeadingXL className="flex-1">{t.catalog_screen_title}</HeadingXL>
        </div>
      </PageHeader>

      <div className="flex-1 px-5 overflow-y-auto pb-4">
        <p className="text-muted text-sm mb-4">{t.catalog_screen_subtitle}</p>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.catalog_picker_search_placeholder}
            className="pl-9"
            autoComplete="off"
          />
        </div>

        {groups.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">{t.catalog_picker_no_results}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ group, entries }) => (
              <div key={group}>
                <h2 className="text-xs font-semibold text-secondary tracking-widest uppercase mb-2">
                  {t.muscle_group_labels[group]}
                </h2>
                <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border/60">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5">
                      <div className="flex-1 min-w-0">
                        <span className="block text-foreground text-sm font-medium">
                          {catalogName(t, entry.id)}
                        </span>
                        {(catalogHint(t, entry.id) || catalogAliases(t, entry.id).length > 0) && (
                          <span className="block text-muted text-xs mt-0.5">
                            {catalogHint(t, entry.id)}
                            {catalogHint(t, entry.id) &&
                              catalogAliases(t, entry.id).length > 0 &&
                              ' · '}
                            {catalogAliases(t, entry.id).length > 0 &&
                              t.catalog_also_called.replace(
                                '{names}',
                                catalogAliases(t, entry.id).join(', '),
                              )}
                          </span>
                        )}
                      </div>
                      <MuscleBadge muscle={entry.muscle} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </Page>
  );
}

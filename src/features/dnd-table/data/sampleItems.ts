import type { DndTableItem } from '@/features/dnd-table/schema.ts';

export const initialDndTableItems: DndTableItem[] = [
  {
    id: 'task-auth-flow',
    title: '認証フローの確認',
    owner: 'Aki',
    status: 'ready',
    priority: 'High',
    estimate: 3,
  },
  {
    id: 'task-router-migration',
    title: 'Router 移行メモの整理',
    owner: 'Mika',
    status: 'review',
    priority: 'Medium',
    estimate: 2,
  },
  {
    id: 'task-query-cache',
    title: 'Query cache の無効化条件を見直す',
    owner: 'Ren',
    status: 'blocked',
    priority: 'High',
    estimate: 5,
  },
  {
    id: 'task-msw-fixtures',
    title: 'MSW fixture を追加する',
    owner: 'Yui',
    status: 'ready',
    priority: 'Low',
    estimate: 1,
  },
  {
    id: 'task-ui-polish',
    title: '一覧 UI の余白を調整する',
    owner: 'Sora',
    status: 'review',
    priority: 'Medium',
    estimate: 2,
  },
];

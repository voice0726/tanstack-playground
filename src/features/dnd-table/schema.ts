export type DndTableStatus = 'ready' | 'blocked' | 'review';

export type DndTableItem = {
  id: string;
  title: string;
  owner: string;
  status: DndTableStatus;
  priority: 'High' | 'Medium' | 'Low';
  estimate: number;
};

export interface ActionInput {
  title: string;
  description: string;
  date: string;
  type: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  volunteer_count: number;
  families_served: number;
  dishOfTheDay?: string;
  actionCost?: number;
}

export interface ActionOutput extends ActionInput {
  id: string;
  created_at: string;
  updated_at: string;
}

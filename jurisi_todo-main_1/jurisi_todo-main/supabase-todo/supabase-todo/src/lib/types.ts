export type Category = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  created_at: string;
};

export type Todo = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  note: string | null;
  done: boolean;
  done_at: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CategoryInsert = Omit<Category, "id" | "created_at"> &
  Partial<Pick<Category, "id" | "created_at">>;

export type TodoInsert = Omit<
  Todo,
  "id" | "created_at" | "updated_at" | "done_at"
> &
  Partial<Pick<Todo, "id" | "created_at" | "updated_at" | "done_at">>;

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
        Relationships: [];
      };
      todos: {
        Row: Todo;
        Insert: TodoInsert;
        Update: Partial<TodoInsert>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

/** Īpašās "kategorijas", kas nav datubāzē. */
export const ALL_VIEW = "__all__" as const;
export const UNCATEGORIZED_VIEW = "__none__" as const;

export type ViewId = typeof ALL_VIEW | typeof UNCATEGORIZED_VIEW | string;

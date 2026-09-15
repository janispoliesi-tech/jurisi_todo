import { redirect } from "next/navigation";
import SetupNotice from "@/components/SetupNotice";
import TodoApp from "@/components/TodoApp";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, Todo } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!supabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [categoriesResult, todosResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const categories: Category[] = categoriesResult.data ?? [];
  const todos: Todo[] = todosResult.data ?? [];

  return (
    <TodoApp
      userId={user.id}
      userEmail={user.email ?? ""}
      initialCategories={categories}
      initialTodos={todos}
    />
  );
}

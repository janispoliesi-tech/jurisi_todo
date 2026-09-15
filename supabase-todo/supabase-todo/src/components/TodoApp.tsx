"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CircleDashed,
  Inbox,
  Pencil,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ALL_VIEW,
  ARCHIVE_VIEW,
  UNCATEGORIZED_VIEW,
  type Category,
  type Todo,
  type ViewId,
} from "@/lib/types";
import { colorValue, suggestColor } from "@/lib/colors";
import { getIcon } from "@/lib/icons";
import { cn, localToday, taskCountLabel, tempId } from "@/lib/utils";
import { CategoryRail, CategorySidebar, type NavItem } from "./Navigation";
import Composer from "./Composer";
import TodoRow from "./TodoRow";
import TodoSheet, { type TodoPatch } from "./TodoSheet";
import CategorySheet, { type CategoryDraft } from "./CategorySheet";
import ConfirmDialog from "./ConfirmDialog";
import { AccountPanel, AccountSheet } from "./AccountPanel";
import { iconBtn } from "./ui";

const FAR_FUTURE = "9999-12-31";
const VIEW_STORAGE_KEY = "saraksts-view";

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => void;
} | null;

export default function TodoApp({
  userId,
  userEmail,
  initialCategories,
  initialTodos,
}: {
  userId: string;
  userEmail: string;
  initialCategories: Category[];
  initialTodos: Todo[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [selectedView, setView] = useState<ViewId>(ALL_VIEW);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [today, setToday] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [categorySheet, setCategorySheet] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });
  const [openTodoId, setOpenTodoId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const lastLoad = useRef(0);

  /* ---------------- sākotnējā puse, kas atkarīga no pārlūka ------------- */

  // Šodienas datums un pēdējā izvēlētā sadaļa ir pieejami tikai pārlūkā.
  useEffect(() => {
    lastLoad.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(localToday());
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored) setView(stored);
    } catch {
      /* ignorējam */
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------------- datu pārlāde (cita ierīce / atgriešanās) ----------- */

  const reload = useCallback(async () => {
    const [cats, items] = await Promise.all([
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
    if (cats.data) setCategories(cats.data);
    if (items.data) setTodos(items.data);
    lastLoad.current = Date.now();
  }, [supabase]);

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastLoad.current < 20_000) return;
      void reload();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [reload]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, router]);

  /* ---------------- atvasinātie dati ----------------------------------- */

  const activeTodos = useMemo(() => todos.filter((t) => !t.done), [todos]);

  const archivedTodos = useMemo(
    () =>
      todos
        .filter((t) => t.done)
        .sort((a, b) =>
          (b.done_at ?? b.updated_at).localeCompare(a.done_at ?? a.updated_at),
        ),
    [todos],
  );

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of activeTodos) {
      const key = t.category_id ?? UNCATEGORIZED_VIEW;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [activeTodos]);

  const uncategorizedCount = countByCategory.get(UNCATEGORIZED_VIEW) ?? 0;

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        id: ALL_VIEW,
        label: "Visi",
        Icon: Inbox,
        color: "var(--accent)",
        count: activeTodos.length,
        editable: false,
      },
      ...categories.map((c) => ({
        id: c.id,
        label: c.name,
        Icon: getIcon(c.icon),
        color: colorValue(c.color),
        count: countByCategory.get(c.id) ?? 0,
        editable: true,
      })),
    ];
    if (uncategorizedCount > 0) {
      items.push({
        id: UNCATEGORIZED_VIEW,
        label: "Bez kategorijas",
        Icon: CircleDashed,
        color: colorValue("slate"),
        count: uncategorizedCount,
        editable: false,
      });
    }
    items.push({
      id: ARCHIVE_VIEW,
      label: "Arhīvs",
      Icon: Archive,
      color: colorValue("slate"),
      count: archivedTodos.length,
      editable: false,
    });
    return items;
  }, [
    activeTodos.length,
    archivedTodos.length,
    categories,
    countByCategory,
    uncategorizedCount,
  ]);

  // Ja izvēlētā sadaļa pazūd (piem. kategorija izdzēsta citā ierīcē),
  // automātiski rādām "Visi".
  const view: ViewId = navItems.some((i) => i.id === selectedView)
    ? selectedView
    : ALL_VIEW;

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, String(view));
    } catch {
      /* ignorējam */
    }
  }, [view]);

  const currentCategory = categories.find((c) => c.id === view) ?? null;
  const isArchive = view === ARCHIVE_VIEW;
  const currentItem = navItems.find((i) => i.id === view) ?? navItems[0];

  const visibleTodos = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: Todo[];

    if (isArchive) {
      list = archivedTodos;
    } else {
      list = activeTodos.filter((t) => {
        if (view === ALL_VIEW) return true;
        if (view === UNCATEGORIZED_VIEW) return !t.category_id;
        return t.category_id === view;
      });
      list = [...list].sort((a, b) => {
        const da = a.due_date ?? FAR_FUTURE;
        const db = b.due_date ?? FAR_FUTURE;
        if (da !== db) return da < db ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      });
    }

    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.note ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeTodos, archivedTodos, isArchive, query, view]);

  const openTodo = todos.find((t) => t.id === openTodoId) ?? null;

  /* ---------------- darbības ------------------------------------------- */

  const fail = (message: string) => setToast(message);

  async function addTodo(title: string, dueDate: string | null) {
    const categoryId = currentCategory?.id ?? null;
    const id = tempId();
    const now = new Date().toISOString();
    const optimistic: Todo = {
      id,
      user_id: userId,
      category_id: categoryId,
      title,
      note: null,
      done: false,
      done_at: null,
      due_date: dueDate,
      position: 0,
      created_at: now,
      updated_at: now,
    };
    setTodos((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("todos")
      .insert({
        user_id: userId,
        category_id: categoryId,
        title,
        due_date: dueDate,
        done: false,
        note: null,
        position: 0,
      })
      .select()
      .single();

    if (error || !data) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      fail("Neizdevās pievienot uzdevumu. Pamēģini vēlreiz.");
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  }

  async function toggleDone(todo: Todo) {
    const done = !todo.done;
    const doneAt = done ? new Date().toISOString() : null;
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, done, done_at: doneAt } : t)),
    );

    const { error } = await supabase
      .from("todos")
      .update({ done, done_at: doneAt })
      .eq("id", todo.id);

    if (error) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      fail("Neizdevās saglabāt izmaiņas.");
    }
  }

  async function saveTodo(todo: Todo, patch: TodoPatch) {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, ...patch } : t)),
    );
    setOpenTodoId(null);

    const { error } = await supabase
      .from("todos")
      .update(patch)
      .eq("id", todo.id);

    if (error) {
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? todo : t)));
      fail("Neizdevās saglabāt uzdevumu.");
    }
  }

  async function deleteTodo(todo: Todo) {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    setOpenTodoId(null);

    const { error } = await supabase.from("todos").delete().eq("id", todo.id);
    if (error) {
      setTodos(snapshot);
      fail("Neizdevās izdzēst uzdevumu.");
    }
  }

  async function clearArchive() {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => !t.done));

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("user_id", userId)
      .eq("done", true);

    if (error) {
      setTodos(snapshot);
      fail("Neizdevās iztīrīt arhīvu.");
    }
  }

  async function saveCategory(draft: CategoryDraft) {
    const editing = categorySheet.category;
    setCategorySheet({ open: false, category: null });

    if (editing) {
      const snapshot = categories;
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...draft } : c)),
      );
      const { error } = await supabase
        .from("categories")
        .update(draft)
        .eq("id", editing.id);
      if (error) {
        setCategories(snapshot);
        fail("Neizdevās saglabāt kategoriju.");
      }
      return;
    }

    const id = tempId();
    const position = categories.length;
    const optimistic: Category = {
      id,
      user_id: userId,
      ...draft,
      position,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, optimistic]);
    setView(id);

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: userId, ...draft, position })
      .select()
      .single();

    if (error || !data) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setView(ALL_VIEW);
      fail("Neizdevās pievienot kategoriju.");
      return;
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
    setView((v) => (v === id ? data.id : v));
  }

  async function deleteCategory(category: Category) {
    const snapshotCats = categories;
    const snapshotTodos = todos;

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setTodos((prev) =>
      prev.map((t) =>
        t.category_id === category.id ? { ...t, category_id: null } : t,
      ),
    );
    setView((v) => (v === category.id ? ALL_VIEW : v));
    setCategorySheet({ open: false, category: null });

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setCategories(snapshotCats);
      setTodos(snapshotTodos);
      fail("Neizdevās izdzēst kategoriju.");
    }
  }

  async function signOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  /* ---------------- skats ---------------------------------------------- */

  const HeaderIcon = currentItem?.Icon ?? Inbox;
  const headerColor = currentItem?.color ?? "var(--accent)";

  const subtitle = isArchive
    ? archivedTodos.length > 0
      ? `${taskCountLabel(archivedTodos.length)} arhīvā`
      : "Arhīvs ir tukšs"
    : taskCountLabel(visibleTodos.length);

  return (
    <div className="flex min-h-dvh">
      <CategorySidebar
        items={navItems}
        active={view}
        onSelect={setView}
        onAdd={() => setCategorySheet({ open: true, category: null })}
        onEdit={(id) => {
          const cat = categories.find((c) => c.id === id);
          if (cat) setCategorySheet({ open: true, category: cat });
        }}
        footer={
          <AccountPanel
            email={userEmail}
            onSignOut={signOut}
            signingOut={signingOut}
          />
        }
      />

      <div className="safe-x flex min-w-0 flex-1 flex-col">
        {/* Galvene */}
        <header className="safe-top sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-3xl items-center gap-2.5 px-3 py-2.5 md:px-5 md:py-3">
            <span
              className="cat-tint cat-text grid size-9 shrink-0 place-items-center rounded-xl md:hidden"
              style={{ ["--cat" as string]: headerColor }}
            >
              <HeaderIcon size={18} />
            </span>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] font-semibold tracking-tight md:text-[19px]">
                {currentItem?.label ?? "Visi"}
              </h1>
              <p className="truncate text-[12.5px] text-muted">{subtitle}</p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {currentCategory ? (
                <button
                  type="button"
                  className={iconBtn}
                  aria-label="Rediģēt kategoriju"
                  title="Rediģēt kategoriju"
                  onClick={() =>
                    setCategorySheet({ open: true, category: currentCategory })
                  }
                >
                  <Pencil size={17} />
                </button>
              ) : null}

              {isArchive && archivedTodos.length > 0 ? (
                <button
                  type="button"
                  className={iconBtn}
                  aria-label="Iztīrīt arhīvu"
                  title="Iztīrīt arhīvu"
                  onClick={() =>
                    setConfirm({
                      title: "Iztīrīt arhīvu?",
                      message: `Tiks neatgriezeniski izdzēsti visi ${archivedTodos.length} arhivētie uzdevumi.`,
                      confirmLabel: "Iztīrīt",
                      action: () => {
                        void clearArchive();
                        setConfirm(null);
                      },
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              ) : null}

              <button
                type="button"
                className={iconBtn}
                aria-label={searchOpen ? "Aizvērt meklēšanu" : "Meklēt"}
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((s) => !s);
                  if (searchOpen) setQuery("");
                }}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              <button
                type="button"
                className={cn(iconBtn, "md:hidden")}
                aria-label="Konts"
                onClick={() => setAccountOpen(true)}
              >
                <UserRound size={18} />
              </button>
            </div>
          </div>

          {searchOpen ? (
            <div className="mx-auto w-full max-w-3xl px-3 pb-2.5 md:px-5">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setQuery("");
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Meklēt uzdevumos…"
                  aria-label="Meklēt uzdevumos"
                  className="field !pl-9"
                />
              </div>
            </div>
          ) : null}
        </header>

        {/* Kategoriju sloksne — tikai mazajos ekrānos */}
        <CategoryRail
          items={navItems}
          active={view}
          onSelect={setView}
          onAdd={() => setCategorySheet({ open: true, category: null })}
        />

        {/* Saraksts */}
        <main className="flex-1">
          <div className="mx-auto w-full max-w-3xl px-2 py-2 md:px-5 md:py-4">
            {visibleTodos.length === 0 ? (
              <EmptyState
                archive={isArchive}
                searching={query.trim().length > 0}
                categoryName={currentCategory?.name}
              />
            ) : (
              <ul className="animate-fade-in">
                {visibleTodos.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    category={
                      categories.find((c) => c.id === todo.category_id) ?? null
                    }
                    showCategory={view === ALL_VIEW || isArchive}
                    today={today}
                    onToggle={() => void toggleDone(todo)}
                    onOpen={() => setOpenTodoId(todo.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </main>

        {/* Jauna uzdevuma lauks */}
        {!isArchive ? (
          <Composer category={currentCategory} onAdd={addTodo} />
        ) : (
          <div className="safe-bottom" />
        )}
      </div>

      {/* Paziņojums */}
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4">
          <div className="animate-pop-in pointer-events-auto rounded-xl bg-[var(--text)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--bg-elevated)] shadow-[var(--shadow-lg)]">
            {toast}
          </div>
        </div>
      ) : null}

      {/* Dialogi */}
      {categorySheet.open ? (
        <CategorySheet
          key={categorySheet.category?.id ?? "jauna"}
          category={categorySheet.category}
          defaultColor={suggestColor(categories.length)}
          existingNames={categories
            .filter((c) => c.id !== categorySheet.category?.id)
            .map((c) => c.name)}
          onClose={() => setCategorySheet({ open: false, category: null })}
          onSave={saveCategory}
          onDelete={
            categorySheet.category
              ? () => {
                  const cat = categorySheet.category;
                  if (!cat) return;
                  const count = countByCategory.get(cat.id) ?? 0;
                  setConfirm({
                    title: `Dzēst "${cat.name}"?`,
                    message:
                      count > 0
                        ? `${taskCountLabel(count)} paliks sarakstā sadaļā "Bez kategorijas". Kategorija tiks izdzēsta.`
                        : "Kategorija tiks izdzēsta. Uzdevumi netiks zaudēti.",
                    confirmLabel: "Dzēst kategoriju",
                    action: () => {
                      void deleteCategory(cat);
                      setConfirm(null);
                    },
                  });
                }
              : undefined
          }
        />
      ) : null}

      {openTodo ? (
        <TodoSheet
          key={openTodo.id}
          todo={openTodo}
          categories={categories}
          onClose={() => setOpenTodoId(null)}
          onSave={(patch) => void saveTodo(openTodo, patch)}
          onToggleDone={() => {
            void toggleDone(openTodo);
            setOpenTodoId(null);
          }}
          onDelete={() => {
            const target = openTodo;
            setConfirm({
              title: "Dzēst uzdevumu?",
              message: `"${target.title}" tiks neatgriezeniski izdzēsts.`,
              confirmLabel: "Dzēst",
              action: () => {
                void deleteTodo(target);
                setConfirm(null);
              },
            });
          }}
        />
      ) : null}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => confirm?.action()}
        onCancel={() => setConfirm(null)}
      />

      <AccountSheet
        open={accountOpen}
        email={userEmail}
        onClose={() => setAccountOpen(false)}
        onSignOut={signOut}
        signingOut={signingOut}
      />
    </div>
  );
}

/* -------------------------------------------------------------------- */

function EmptyState({
  archive,
  searching,
  categoryName,
}: {
  archive: boolean;
  searching: boolean;
  categoryName?: string;
}) {
  let title = "Nekas nav pievienots";
  let text = "Ieraksti pirmo uzdevumu laukā lapas apakšā.";

  if (searching) {
    title = "Nekas netika atrasts";
    text = "Pamēģini citu meklējamo vārdu.";
  } else if (archive) {
    title = "Arhīvs ir tukšs";
    text = "Izdarītie uzdevumi automātiski nonāks šeit.";
  } else if (categoryName) {
    title = `Sadaļā "${categoryName}" nekā nav`;
    text = "Pievieno pirmo uzdevumu laukā lapas apakšā.";
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-surface-2 text-faint">
        {archive ? <Archive size={24} /> : <Inbox size={24} />}
      </div>
      <p className="text-[15px] font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-[13.5px] text-muted">{text}</p>
    </div>
  );
}

-- =====================================================================
--  supabase-todo — datubāzes shēma
--  Palaid šo vienu reizi Supabase projektā: SQL Editor → New query → Run.
--  Skripts ir idempotents — to var droši palaist atkārtoti.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabulas
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 40),
  icon        text not null default 'list',
  color       text not null default 'slate',
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid references public.categories (id) on delete set null,
  title        text not null check (char_length(btrim(title)) between 1 and 500),
  note         text,
  done         boolean not null default false,
  done_at      timestamptz,
  due_date     date,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Indeksi
-- ---------------------------------------------------------------------

create index if not exists categories_user_id_idx
  on public.categories (user_id, position, created_at);

create index if not exists todos_user_id_idx
  on public.todos (user_id, done, position, created_at desc);

create index if not exists todos_category_id_idx
  on public.todos (category_id);

create index if not exists todos_archive_idx
  on public.todos (user_id, done_at desc) where done;

-- ---------------------------------------------------------------------
-- 3. Trigeri: updated_at un arhivēšanas laikspiedols
-- ---------------------------------------------------------------------

create or replace function public.todos_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();

  -- Uzdevums tikko atzīmēts kā izdarīts → ieliekam arhīva laiku.
  if tg_op = 'INSERT' then
    if new.done then
      new.done_at := coalesce(new.done_at, now());
    end if;
  elsif new.done and not old.done then
    new.done_at := coalesce(new.done_at, now());
  end if;

  -- Uzdevums atjaunots no arhīva → laiku noņemam.
  if not new.done then
    new.done_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists todos_touch_trg on public.todos;
create trigger todos_touch_trg
  before insert or update on public.todos
  for each row execute function public.todos_touch();

-- ---------------------------------------------------------------------
-- 4. Row Level Security — katrs lietotājs redz tikai savus ierakstus
-- ---------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.todos      enable row level security;

drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "todos_select_own" on public.todos;
create policy "todos_select_own" on public.todos
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "todos_insert_own" on public.todos;
create policy "todos_insert_own" on public.todos
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "todos_update_own" on public.todos;
create policy "todos_update_own" on public.todos
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "todos_delete_own" on public.todos;
create policy "todos_delete_own" on public.todos
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. Tiesības (Supabase tās parasti piešķir pats; šeit drošības pēc)
-- ---------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.todos to authenticated;

-- ---------------------------------------------------------------------
-- 6. Jaunam lietotājam — dažas sākuma kategorijas
--    (nav obligāti; ja trigeris neizdodas, reģistrācija tāpat notiek
--     un lietotājs kategorijas var pievienot pats)
-- ---------------------------------------------------------------------

create or replace function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon, color, position)
  values
    (new.id, 'Mājas',   'home',      'emerald', 0),
    (new.id, 'Darbs',   'briefcase', 'blue',    1),
    (new.id, 'Pirkumi', 'cart',      'amber',   2),
    (new.id, 'Idejas',  'lightbulb', 'violet',  3);
  return new;
exception
  when others then
    return new;
end;
$$;

drop trigger if exists seed_default_categories_trg on auth.users;
create trigger seed_default_categories_trg
  after insert on auth.users
  for each row execute function public.seed_default_categories();

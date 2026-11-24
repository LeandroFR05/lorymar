-- RLS y permisos del catálogo público.
-- Lectura anónima solo en categorías, productos, variedades y presentaciones sin baja lógica (propia ni en cascada).
-- Aromas e imágenes quedan cerradas al rol anónimo. Cero escritura pública.

alter table public.categories enable row level security;
alter table public.aromas enable row level security;
alter table public.products enable row level security;
alter table public.varieties enable row level security;
alter table public.presentations enable row level security;
alter table public.pictures enable row level security;

revoke insert, update, delete, truncate on table
  public.categories,
  public.aromas,
  public.products,
  public.varieties,
  public.presentations,
  public.pictures
from anon, authenticated;

grant select on table
  public.categories,
  public.products,
  public.varieties,
  public.presentations
to anon;

create policy categories_select_anon on public.categories
  for select
  to anon
  using (true);

create policy products_select_anon on public.products
  for select
  to anon
  using (deleted_at is null);

create policy varieties_select_anon on public.varieties
  for select
  to anon
  using (
    deleted_at is null
    and exists (
      select 1
      from public.products p
      where p.id = varieties.product_id
        and p.deleted_at is null
    )
  );

create policy presentations_select_anon on public.presentations
  for select
  to anon
  using (
    deleted_at is null
    and exists (
      select 1
      from public.varieties v
      join public.products p on p.id = v.product_id
      where v.id = presentations.variety_id
        and v.deleted_at is null
        and p.deleted_at is null
    )
  );

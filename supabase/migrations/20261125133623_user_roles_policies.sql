-- Grants y políticas de roles de usuario (spec 003).
-- El rol vive en el claim "role" de app_metadata del JWT de Supabase Auth:
-- el administrador lleva "admin"; el cliente es la ausencia de ese valor.
-- Sin tablas, funciones ni triggers nuevos: solo grants y políticas sobre las
-- seis tablas del catálogo. Las políticas "to anon" de la migración 002 no se tocan.

-- Grants de lectura: aromas e imágenes se abren al anónimo (las otras cuatro
-- tablas ya la tienen desde la 002); el cliente y el admin leen las seis.
grant select on table public.aromas, public.pictures to anon;

grant select on table
  public.categories, public.aromas, public.products,
  public.varieties, public.presentations, public.pictures
to authenticated;

-- Grants de escritura: solo al rol autenticado; el paso real lo decide RLS por
-- claim (el cliente choca con las políticas y no escribe nada). Sin "truncate":
-- sigue revocado desde la 002.
grant insert, update, delete on table
  public.categories, public.aromas, public.products,
  public.varieties, public.presentations, public.pictures
to authenticated;

-- Secuencias identity que generan los identificadores al insertar.
grant usage on sequence
  public.categories_id_seq, public.aromas_id_seq, public.products_id_seq,
  public.varieties_id_seq, public.presentations_id_seq, public.pictures_id_seq
to authenticated;



-- Lectura del anónimo: aromas completos (la tabla no tiene baja lógica, como las
-- categorías) e imágenes solo de presentaciones visibles con la cascada completa
-- de la 002 (presentación sin baja propia y con variedad y producto sin baja).
create policy aromas_select_anon on public.aromas
  for select
  to anon
  using (true);

create policy pictures_select_anon on public.pictures
  for select
  to anon
  using (
    exists (
      select 1
      from public.presentations pr
      join public.varieties v on v.id = pr.variety_id
      join public.products p on p.id = v.product_id
      where pr.id = pictures.presentation_id
        and pr.deleted_at is null
        and v.deleted_at is null
        and p.deleted_at is null
    )
  );

-- Lectura del cliente: espejo exacto de las del anónimo (ni más ni menos).
create policy categories_select_authenticated on public.categories
  for select
  to authenticated
  using (true);

create policy aromas_select_authenticated on public.aromas
  for select
  to authenticated
  using (true);

create policy products_select_authenticated on public.products
  for select
  to authenticated
  using (deleted_at is null);

create policy varieties_select_authenticated on public.varieties
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.products p
      where p.id = varieties.product_id
        and p.deleted_at is null
    )
  );

create policy presentations_select_authenticated on public.presentations
  for select
  to authenticated
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

create policy pictures_select_authenticated on public.pictures
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.presentations pr
      join public.varieties v on v.id = pr.variety_id
      join public.products p on p.id = v.product_id
      where pr.id = pictures.presentation_id
        and pr.deleted_at is null
        and v.deleted_at is null
        and p.deleted_at is null
    )
  );

-- Administrador: una política por tabla que cubre select, insert, update y delete.
-- El claim va envuelto en una subconsulta (regla de rendimiento de la skill: se
-- evalúa una vez por sentencia, no por fila) y "using" y "with check" son
-- idénticos: solo el valor exacto 'admin' abre la administración.
create policy categories_admin_all on public.categories
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy aromas_admin_all on public.aromas
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy products_admin_all on public.products
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy varieties_admin_all on public.varieties
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy presentations_admin_all on public.presentations
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy pictures_admin_all on public.pictures
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

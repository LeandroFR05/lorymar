-- Datos demo del catálogo.
-- Idempotente: se puede volver a aplicar sin duplicar filas.
-- Las referencias se resuelven por nombre con subconsultas; no se hardcodean IDs.

-- Categorías
insert into public.categories (name)
select v.name
from (values ('Rostro'), ('Cabello'), ('Cuerpo'), ('Aromaterapia')) as v(name)
on conflict do nothing;

-- Aromas
insert into public.aromas (name)
select v.name
from (values ('Romero'), ('Lavanda'), ('Menta')) as v(name)
on conflict do nothing;

-- Productos
insert into public.products (name, description, category_id)
select v.name, v.description, c.id
from (values
  ('Sérum de Rosa Mosqueta', 'Regenerador e iluminador con aceite de rosa mosqueta prensado en frío.', 'Rostro'),
  ('Champú Sólido de Romero', 'Champú sólido elaborado en frío, con romero y arcilla.', 'Cabello'),
  ('Crema Hidratante de Aloe', 'Hidratación ligera diaria con aloe vera ecológico y ácido hialurónico vegetal.', 'Rostro'),
  ('Jabón de Avena y Miel', 'Elaborado en frío, suave para pieles sensibles y atópicas.', 'Cuerpo'),
  ('Manteca Corporal de Karité', 'Nutrición intensa para pieles secas, con manteca de karité pura.', 'Cuerpo'),
  ('Aceite Capilar de Argán', 'Aceite ligero para puntas y cuero cabelludo, con argán orgánico.', 'Cabello'),
  ('Difusor de Aromaterapia', 'Difusor de cerámica para aceites esenciales, sin electricidad.', 'Aromaterapia')
) as v(name, description, category_name)
join public.categories c on lower(btrim(c.name)) = lower(v.category_name)
where not exists (
  select 1 from public.products p where p.name = v.name
);

-- Variedades
insert into public.varieties (product_id, name, description)
select p.id, v.name, v.description
from (values
  ('Sérum de Rosa Mosqueta', 'Única', null),
  ('Champú Sólido de Romero', 'Cabello graso', 'Para cabello con exceso de sebo.'),
  ('Champú Sólido de Romero', 'Cabello seco', null),
  ('Crema Hidratante de Aloe', 'Única', null),
  ('Jabón de Avena y Miel', 'Única', null),
  ('Manteca Corporal de Karité', 'Única', null),
  ('Aceite Capilar de Argán', 'Cabello fino', null),
  ('Aceite Capilar de Argán', 'Cabello grueso', null),
  ('Difusor de Aromaterapia', 'Única', null)
) as v(product_name, name, description)
join public.products p on p.name = v.product_name
on conflict do nothing;

-- Presentaciones
insert into public.presentations (variety_id, aroma_id, description, weight, unit, price, stock, tag)
select va.id, a.id, v.description, v.weight, v.unit, v.price, v.stock, v.tag
from (values
  ('Sérum de Rosa Mosqueta', 'Única', 'Aceite de rosa mosqueta prensado en frío.', null, 30.00, 'ml', 24900.00, 12, 'Más vendido'),
  ('Sérum de Rosa Mosqueta', 'Única', 'Muestra de 5 ml.', null, 5.00, 'ml', 0.00, 20, null),
  ('Champú Sólido de Romero', 'Cabello graso', null, 'Romero', 100.00, 'g', 8900.00, 30, null),
  ('Champú Sólido de Romero', 'Cabello seco', null, 'Menta', 120.00, 'g', 9500.00, 18, null),
  ('Crema Hidratante de Aloe', 'Única', null, null, 50.00, 'g', 15900.00, 25, 'Nuevo'),
  ('Crema Hidratante de Aloe', 'Única', null, null, 100.00, 'g', 24900.00, 10, null),
  ('Jabón de Avena y Miel', 'Única', null, null, 100.00, 'g', 4500.00, 40, null),
  ('Manteca Corporal de Karité', 'Única', null, 'Lavanda', 200.00, 'ml', 18500.00, 8, null),
  ('Aceite Capilar de Argán', 'Cabello fino', null, null, 50.00, 'ml', 12900.00, 15, null),
  ('Aceite Capilar de Argán', 'Cabello grueso', null, null, 100.00, 'ml', 19900.00, 9, null),
  ('Difusor de Aromaterapia', 'Única', 'Incluye una vela de té.', null, 1.00, 'unidad', 8500.00, 5, null)
) as v(product_name, variety_name, description, aroma_name, weight, unit, price, stock, tag)
join public.products p on p.name = v.product_name
join public.varieties va
  on va.product_id = p.id and lower(btrim(va.name)) = lower(v.variety_name)
left join public.aromas a on lower(btrim(a.name)) = lower(v.aroma_name)
on conflict do nothing;

-- Imágenes: dos principales en la misma presentación para probar la regla.
insert into public.pictures (presentation_id, storage_path, is_main)
select pr.id, v.storage_path, v.is_main
from (values
  ('Champú Sólido de Romero', 'Cabello graso', 100.00, 'g', 'demo/champu-romero-1.jpg', true),
  ('Champú Sólido de Romero', 'Cabello graso', 100.00, 'g', 'demo/champu-romero-2.jpg', true)
) as v(product_name, variety_name, weight, unit, storage_path, is_main)
join public.products p on p.name = v.product_name
join public.varieties va
  on va.product_id = p.id and lower(btrim(va.name)) = lower(v.variety_name)
join public.presentations pr
  on pr.variety_id = va.id and pr.weight = v.weight and pr.unit = v.unit
where not exists (
  select 1 from public.pictures pi
  where pi.presentation_id = pr.id and pi.storage_path = v.storage_path
);

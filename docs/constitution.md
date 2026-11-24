# Constitución — cosmetica-natural (LoryMar)
Principios innegociables del proyecto. Rigen por encima de cualquier spec, plan o
código: si algo los contradice, se corrige lo que los contradice, no la constitución.
Solo se cambian con aprobación explícita del usuario.

## 1. Stack mínimo
Vite + React 19. JavaScript puro mientras no exista una spec aprobada que justifique
migrar a TypeScript. Se utiliza Zustand cuando es necesario estados globales.
No se añade un UI-kit sin una spec aprobada que lo justifique.

## 2. La spec manda
No se escribe ni se cambia código sin una spec aprobada en `specs/`. Si el código y la
spec difieren, se corrige primero la spec y después el código.

## 3. Lógica fuera de componentes
Los componentes (`src/components/`, `src/pages/`) solo renderizan y orquestan props.
Cálculos, validaciones y acceso a datos viven en `src/hooks/` o `src/utils/`.

## 4. Tests para lógica, no para UI
Toda función no trivial en `src/hooks/` o `src/utils/` lleva test con `node --test`. La
UI se valida manualmente con el MCP de Chrome DevTools; no se automatizan tests de UI.

## 5. Cero datos reales en el cliente
Ninguna credencial, dato personal o secreto real se guarda en el repositorio ni en el
frontend. Solo se permiten valores demo, marcados explícitamente como tales, hasta que
exista un backend real.

**Excepción aprobada por el usuario (spec 002):** la URL del proyecto Supabase y su
clave pública (la clave `anon` o la `publishable`) pueden llegar al navegador y estar en
el frontend mediante variables de entorno `VITE_*`, porque la clave pública está diseñada
para el cliente y no otorga más acceso que el que permiten las políticas de seguridad de
la base (RLS). La clave de servicio (`service_role`) y cualquier otro secreto o
credencial privada siguen **prohibidos** en el frontend, en el repositorio y en la
plantilla de variables. La lectura anónima está limitada a las tablas que la web usa; las
políticas RLS son la barrera real, no el cliente.

## 6. Idioma
Identificadores de código (variables, funciones, componentes) en inglés. Comentarios,
specs, `MEMORY.md` y todo texto visible para el usuario, en español.

---
name: react
description: Úsala siempre que tengas que escribir código de react.
---

## Reglas
- Usar React Router para navegación SPA; evitar recargas completas para la navegación interna.
- Aplicar lazy() y Suspense a páginas o módulos.
- Mantener separadas páginas, componentes reutilizables, hooks, estado global y estilos.
- Utilizar Zustand para estados globales compartidos.
- Sincronizar filtros y paginación relevantes con la URL.
- Tratar con cuidado el HTML generado o recibido externamente: no usar dangerouslySetInnerHTML con datos no confiables sin sanitización.
- Preguntar siempre antes de sumar alguna dependencia.
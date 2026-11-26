## Flujo del catálogo:
1-App
2-HomePage
3-Llama a useCatalog, que lee el catálogo de la bd. Revisa posibles errores, estados, carga.
4-El catálogo pasa a Product grid
5-Sea realizan los filtros necesarios en useProductFilter
6-Mensajes informativos, de carga o error en CatalogFeedback
7-Si todo está correcto se llama a ProductCard que muestra las tarjetas con las variedades de los productos.
# Buen Camino

Aplicación web para el tramo Sarria–Santiago. El enlace normal es de solo lectura; el enlace de edición lleva una clave privada en el fragmento `#editar=...`. Los cambios se guardan en Supabase y los ven todas las personas.

## Activar guardado compartido

1. Crea un proyecto en Supabase.
2. En el SQL Editor del proyecto, ejecuta `supabase.sql`.
3. En `config.js`, añade la Project URL y la clave anon/public del proyecto. No uses la clave `service_role`.
4. Sube los cambios a la rama `main` de GitHub para que GitHub Pages publique la versión conectada.

La clave del enlace de edición está guardada localmente en `.editor-key`, que está excluida de Git. No la compartas en el enlace público de solo lectura. El hash configurado en SQL no permite leer la clave.

# Guía de despliegue del SIGC (producción)

Resumen de la arquitectura en el servidor:

| Sitio | Qué sirve | Carpeta web | Tipo |
|---|---|---|---|
| `api.romanmegavallas.com` | API Laravel | `backend/public` | PHP 8.3 |
| `sigc.romanmegavallas.com` | SIGC (empleados) y portal de clientes en `/portal/` | `frontend` | Estático |

El portal queda en `https://sigc.romanmegavallas.com/portal/` (es el enlace para el botón del sitio web de la empresa).

## 1. DNS (lo hace quien administra el dominio)
Registros nuevos (no tocar los existentes de la web ni del correo):

| Tipo | Nombre | Valor |
|---|---|---|
| A | `api` | IP del servidor |
| A | `sigc` | IP del servidor |
| Los que indique Brevo (TXT/CNAME) | — | — |

## 2. Servidor (Ploi o Forge)
1. Crear el servidor (Ubuntu, PHP 8.3, MySQL, Nginx).
2. Crear la base de datos `sigc` y un usuario propio (no root).
3. Sitio `api.romanmegavallas.com`: repositorio de GitHub, directorio web `/backend/public`, PHP 8.3.
4. Sitio `sigc.romanmegavallas.com`: mismo repositorio, directorio web `/frontend`, sitio estático (sin PHP).
5. Activar HTTPS (Let's Encrypt) en los dos sitios, cuando el DNS ya apunte al servidor.
6. En el sitio de la API, agregar la tarea programada (cron), cada minuto:
   `php /RUTA/backend/artisan schedule:run`

## 3. Primer despliegue de la API
En la carpeta `backend` del servidor:
```
composer install --no-dev --optimize-autoloader
cp .env.production.example .env      # y completar los CAMBIAR
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force          # solo la primera vez (crea el admin con SEED_ADMIN_PASSWORD)
php artisan storage:link
php artisan config:cache && php artisan route:cache
```
Permisos: `storage` y `bootstrap/cache` deben poder escribirse por el usuario web.

## 4. Cada actualización
```
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache
```
(Ploi/Forge lo hacen con el botón "Deploy" si pones estos comandos en el script de despliegue.)

## 5. Comprobaciones después de lanzar
- `https://api.romanmegavallas.com/up` responde OK.
- Entrar a `https://sigc.romanmegavallas.com`, iniciar sesión y cambiar la contraseña del admin.
- Abrir el portal, enviar una solicitud de prueba (y cerrarla en Solicitudes para liberar las vallas).
- Configuración → "Última corrida del Scheduler" se actualiza (prueba que el cron funciona).
- `php artisan respaldo:base-datos` crea un archivo en `storage/app/respaldos`.

## 6. Respaldos (importante)
- El sistema genera un respaldo diario de la base de datos (02:00) y guarda los últimos 14.
- Eso vive en el mismo servidor: **activar además los respaldos/snapshots del proveedor** y, idealmente, copiar
  `storage/app/respaldos` y `storage/app/public` (fotos de vallas) a otro lugar (Google Drive, otro servidor).
- Probar de vez en cuando que un respaldo se puede restaurar.

## 7. Seguridad
- `APP_DEBUG=false` y `APP_ENV=production`.
- Contraseña del admin larga y propia (nunca `1234`).
- `.env` nunca en git. El `.gitignore` ya bloquea `.env` y `*.zip`.
- `CORS_ALLOWED_ORIGINS` solo con el dominio del SIGC.

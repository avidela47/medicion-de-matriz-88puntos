# ITELSA — Relevamiento Lumínico

App para cargar relevamientos de iluminancia (grilla de 88 puntos), calcular
Media / Máxima / Mínima / Uniformidad por plano (Horizontal, Vertical T1, T2,
Gol 1, Gol 2), guardar historial con registro de quién cargó cada versión, y
exportar a Excel / PDF.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Base de datos (MongoDB Atlas)

Ya tenés cuenta en Atlas, así que:

1. Entrá a tu cluster → **Database Access** → creá (o usá) un usuario de base de datos con contraseña.
2. **Network Access** → agregá tu IP (para probar local) y, para producción, `0.0.0.0/0`
   (o mejor: las IPs salientes de Vercel, si las fijaste) para que Vercel pueda conectarse.
3. **Connect → Drivers** → copiá la cadena de conexión (`mongodb+srv://...`).
4. Copiá `.env.local.example` a `.env.local` y pegá esa cadena en `MONGODB_URI`.
5. Generá un secreto para las sesiones:
   ```bash
   openssl rand -base64 32
   ```
   y pegalo en `NEXTAUTH_SECRET` dentro de `.env.local`.

**Importante:** `.env.local` nunca se sube a git (ya está en `.gitignore`). Las
credenciales de Mongo las cargás vos, acá o en Vercel — nunca se las pasés a
un asistente de IA para que las tipee por vos.

## 3. Crear el primer técnico (usuario que va a iniciar sesión)

```bash
npm run create-user -- juan.perez "unaContraseñaSegura123" "Juan Pérez"
```

Repetilo por cada técnico que vaya a cargar relevamientos. El campo
"Responsable" en la app se completa solo con el usuario que inició sesión —
no hace falta tipearlo cada vez, y así queda registrado quién cargó qué en el
historial de cambios de cada relevamiento.

## 4. Correr en local

```bash
npm run dev
```

Abrí `http://localhost:3000`, iniciá sesión con el usuario que creaste.

## 5. Deploy a Vercel

1. Subí este proyecto a un repo de GitHub (o pedime que lo despliegue
   directo desde acá).
2. En Vercel → **New Project** → importá el repo.
3. En **Settings → Environment Variables**, cargá manualmente (vos, no un
   asistente de IA) las mismas variables de `.env.local`:
   `MONGODB_URI`, `MONGODB_DB`, `NEXTAUTH_SECRET`, y `NEXTAUTH_URL` con la URL
   que te asigne Vercel (ej: `https://tu-app.vercel.app`).
4. Deploy.

## Estructura

```
pages/index.js              → app principal (grilla + resultados + guardar)
pages/login.js               → login
pages/api/auth/[...nextauth] → autenticación contra la colección "users"
pages/api/relevamientos/     → CRUD de relevamientos (protegido por sesión)
lib/gridLogic.js             → cálculo de Media/Máx/Mín/Uniformidad (compartido)
lib/mongodb.js                → conexión a Atlas
lib/exportExcel.js           → generación del .xlsx
components/GridInput.js      → grilla de 440 celdas
components/ResultsPanel.js   → tarjetas de resultados por plano
components/Historial.js      → listado + changelog por relevamiento
scripts/create-user.js       → alta de técnicos (usuario/contraseña)
```

## Nota sobre las fórmulas de uniformidad

Se usa la definición estándar: **U1 = mínima/máxima**, **U2 = mínima/media**.
La planilla Excel original de referencia (Godoy Cruz) tenía las etiquetas de
U1/U2 cruzadas respecto a sus propias fórmulas — se corrigió acá.

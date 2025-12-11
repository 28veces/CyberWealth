# Configuración de Firebase para CyberWealth

Este documento te guiará paso a paso para configurar Firebase Authentication y Firestore en tu proyecto CyberWealth.

## 1. Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"** o **"Add project"**
3. Ingresa un nombre para tu proyecto (ej: `cyberwealth-finanzas`)
4. (Opcional) Puedes deshabilitar Google Analytics si no lo necesitas
5. Haz clic en **"Crear proyecto"**

## 2. Registrar tu Aplicación Web

1. En el panel de Firebase, haz clic en el ícono **"Web"** (</>) para agregar una aplicación web
2. Registra tu app con un nombre (ej: `CyberWealth Web App`)
3. **NO marques** "Firebase Hosting" por ahora (a menos que lo vayas a usar)
4. Haz clic en **"Registrar app"**

## 3. Copiar las Credenciales

Firebase te mostrará un objeto de configuración como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Copia estos valores** - los necesitarás en el siguiente paso.

## 4. Configurar las Credenciales en tu Proyecto

Abre el archivo `plugins/firebase.js` y reemplaza los valores `TU_*` con tus credenciales reales:

```javascript
const firebaseConfig = {
  apiKey: 'TU_API_KEY',           // ← Reemplaza aquí
  authDomain: 'TU_AUTH_DOMAIN',   // ← Reemplaza aquí
  projectId: 'TU_PROJECT_ID',     // ← Reemplaza aquí
  storageBucket: 'TU_STORAGE_BUCKET',        // ← Reemplaza aquí
  messagingSenderId: 'TU_MESSAGING_SENDER_ID', // ← Reemplaza aquí
  appId: 'TU_APP_ID',             // ← Reemplaza aquí
}
```

### ⚠️ Importante para Producción

**NO subas tus credenciales a un repositorio público**. Para producción, usa variables de entorno:

1. Crea un archivo `.env` en la raíz del proyecto:
```env
NUXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NUXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

2. Agrega `.env` a tu `.gitignore`

3. Modifica `plugins/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... etc
}
```

## 5. Activar Firebase Authentication

1. En Firebase Console, ve a **"Authentication"** en el menú lateral
2. Haz clic en **"Get started"** o **"Comenzar"**
3. Ve a la pestaña **"Sign-in method"**
4. Haz clic en **"Email/Password"**
5. **Activa** la opción "Email/Password" (el primer toggle)
6. Haz clic en **"Guardar"**

## 6. Crear la Base de Datos Firestore

1. En Firebase Console, ve a **"Firestore Database"** en el menú lateral
2. Haz clic en **"Create database"** o **"Crear base de datos"**
3. Selecciona **"Start in test mode"** (modo de prueba) para desarrollo
   - Esto permite lectura/escritura sin restricciones por 30 días
4. Selecciona la ubicación más cercana a tus usuarios (ej: `us-central`, `southamerica-east1`)
5. Haz clic en **"Habilitar"** o **"Enable"**

### ⚠️ Configurar Reglas de Seguridad (Importante para Producción)

El modo de prueba es solo para desarrollo. Antes de lanzar a producción, configura reglas de seguridad:

1. Ve a la pestaña **"Rules"** en Firestore
2. Reemplaza las reglas con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir sus propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Denegar todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Haz clic en **"Publicar"**

## 7. Estructura de Datos en Firestore

El proyecto guarda los datos con la siguiente estructura:

```
/users/{userId}/
  ├── ingresos/         # Ingresos del usuario
  ├── gastos/           # Gastos del usuario
  ├── deudas/           # Deudas a largo plazo
  ├── ahorros/          # Cuentas de ahorro
  ├── inversiones/      # Cuentas de inversión
  └── configuracion/    # Configuración (ej: ingreso quincenal)
```

Cada usuario solo puede acceder a sus propios datos.

## 8. Probar la Configuración

1. Inicia tu aplicación:
```bash
npm run dev
```

2. Ve a `http://localhost:3000/login`

3. **Registra un nuevo usuario**:
   - Haz clic en "Regístrate"
   - Ingresa un email y contraseña (mínimo 6 caracteres)
   - Si todo está bien configurado, serás redirigido al dashboard

4. **Verifica en Firebase Console**:
   - Ve a **Authentication** > **Users** - deberías ver tu usuario registrado
   - Ve a **Firestore Database** - deberías ver una colección `users` con tu UID

## 9. Crear Datos de Prueba

Una vez autenticado:
1. Ve a "Ingresos" y agrega un ingreso
2. Ve a "Gastos" y agrega un gasto
3. Ve a Firestore Console y verifica que los datos se hayan guardado en:
   - `/users/{tu-user-id}/ingresos/{doc-id}`
   - `/users/{tu-user-id}/gastos/{doc-id}`

## 10. Solución de Problemas

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que copiaste correctamente el `apiKey` de Firebase Console
- Asegúrate de que no haya espacios o comillas extras

### Error: "Missing or insufficient permissions"
- Ve a Firestore > Rules y verifica que las reglas permitan acceso
- En desarrollo, usa las reglas del "modo de prueba"

### Los datos no se guardan
- Abre la consola del navegador (F12) y busca errores
- Verifica que estés autenticado (deberías ver tu email en el header)
- Verifica que Firebase esté inicializado correctamente

### No puedo registrar usuarios
- Ve a Authentication > Sign-in method
- Verifica que "Email/Password" esté habilitado (toggle en verde)

## 11. Límites del Plan Gratuito

Firebase Spark (plan gratuito) incluye:
- ✅ **50,000 lecturas/día**
- ✅ **20,000 escrituras/día**
- ✅ **20,000 eliminaciones/día**
- ✅ **1 GB de almacenamiento**
- ✅ **10 GB de transferencia/mes**

Para una aplicación de finanzas personales con usuarios individuales, esto es más que suficiente.

## 12. Próximos Pasos

- [ ] Configurar variables de entorno para producción
- [ ] Actualizar reglas de Firestore antes de lanzar
- [ ] (Opcional) Configurar Firebase Hosting para deployment
- [ ] (Opcional) Agregar recuperación de contraseña
- [ ] (Opcional) Agregar verificación de email

## Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de Seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Precios de Firebase](https://firebase.google.com/pricing)

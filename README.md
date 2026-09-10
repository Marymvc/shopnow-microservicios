# ShopNow — Microservicios

Proyecto con 3 servicios: `ms-usuarios`, `ms-productos` y `gateway`.

## 1. Requisitos antes de correr en local

Para cada uno de `ms-usuarios/` y `ms-productos/` necesitas colocar tu archivo
`serviceAccount.json` (descargado desde Firebase Console → Configuración del
proyecto → Cuentas de servicio → Generar nueva clave privada) directamente
en esa carpeta.

**Nunca subas ese archivo a GitHub** — ya está en `.gitignore`.

## 2. Instalar dependencias

Desde la raíz del proyecto:

```bash
cd ms-usuarios && npm install && cd ..
cd ms-productos && npm install && cd ..
cd gateway && npm install && cd ..
```

## 3. Configurar variables de entorno (opcional en local)

Cada carpeta tiene un `.env.example`. Si quieres, copia a `.env` y ajusta:

```bash
cp ms-usuarios/.env.example ms-usuarios/.env
cp ms-productos/.env.example ms-productos/.env
cp gateway/.env.example gateway/.env
```

En local no es obligatorio crear `.env` porque el código ya trae valores
por defecto (puertos 3001, 3002, 3000 y las URLs de localhost).

## 4. Correr los 3 servicios (en 3 terminales separadas)

```bash
# Terminal 1
cd ms-usuarios && npm start

# Terminal 2
cd ms-productos && npm start

# Terminal 3
cd gateway && npm start
```

## 5. Probar en local (Thunder Client / Postman)

```
POST http://localhost:3000/api/users/register
Body: { "nombre": "Juan", "email": "juan@test.com", "password": "123456" }
→ 201 + token

GET http://localhost:3000/api/products
→ 401 Token requerido

GET http://localhost:3000/api/products
Header: Authorization: Bearer <token>
→ 200 []

POST http://localhost:3000/api/products
Header: Authorization: Bearer <token>
Body: { "nombre": "Laptop", "precio": 999, "stock": 10 }
→ 201 + producto creado
```

Cuando todo esto funcione en local, sigue la guía **"ShopNow en Producción —
Despliegue de microservicios en Railway"** para publicarlo.

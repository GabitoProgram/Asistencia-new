# Sistema de Asistencia — Facultad de Medicina U.M.S.A.

Sistema web para el registro de asistencia de doctores mediante firma digital.

## Tecnologías

- **Backend:** Django 4.2 + Django REST Framework
- **Frontend:** React 19 + Vite + Bootstrap 5
- **Base de datos:** PostgreSQL
- **Zona horaria:** America/La_Paz (Bolivia)

## Requisitos previos

- Python 3.8+
- Node.js 18+
- PostgreSQL instalado y corriendo

---

## Instalación del Backend (Django)

### Windows (PowerShell)

```powershell
# 1. Ir a la carpeta del backend
cd asistencia2

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
.\venv\Scripts\Activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear la base de datos en PostgreSQL
# (abrir psql o pgAdmin y ejecutar):
# CREATE DATABASE asistencia_db;

# 6. Aplicar migraciones
python manage.py migrate

# 7. Crear superusuario (admin)
python manage.py createsuperuser

# 8. Iniciar el servidor
python manage.py runserver
```

### Git Bash / Linux / macOS

```bash
# 1. Ir a la carpeta del backend
cd asistencia2

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Crear la base de datos en PostgreSQL
# (abrir psql y ejecutar):
# CREATE DATABASE asistencia_db;

# 6. Aplicar migraciones
python manage.py migrate

# 7. Crear superusuario (admin)
python manage.py createsuperuser

# 8. Iniciar el servidor
python manage.py runserver
```

> El backend corre en `http://localhost:8000`

### Configuración de la base de datos

Editar `asistencia2/asistencia/settings.py` si los datos de PostgreSQL son diferentes:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'asistencia_db',
        'USER': 'postgres',
        'PASSWORD': 'tu_contraseña',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## Instalación del Frontend (React)

### Windows (PowerShell) / Git Bash / Linux / macOS

```bash
# 1. Ir a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

> El frontend corre en `http://localhost:5173`

---

## Uso

1. Iniciar el backend: `python manage.py runserver` (en la carpeta `asistencia2`)
2. Iniciar el frontend: `npm run dev` (en la carpeta `frontend`)
3. Abrir `http://localhost:5173` en el navegador

### Páginas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Lista de doctores para firmar asistencia |
| `/login` | Público | Inicio de sesión para administradores |
| `/dashboard` | Admin | Panel con métricas, gráficas y exportaciones (Excel, PDF, CSV) |
| `/doctores` | Admin | Gestión de doctores y horarios |
| `/admins` | Admin | Gestión de administradores |

---

## Dependencias del Backend

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| Django | 4.2.29 | Framework web |
| djangorestframework | 3.15.2 | API REST |
| django-cors-headers | 4.4.0 | Manejo de CORS |
| psycopg2-binary | 2.9.9 | Conector PostgreSQL |
| openpyxl | 3.1.5 | Exportación Excel |
| reportlab | 4.0.4 | Exportación PDF con firmas |

## Dependencias del Frontend

| Paquete | Descripción |
|---------|-------------|
| react | Librería UI |
| react-router-dom | Enrutamiento SPA |
| axios | Cliente HTTP |
| bootstrap | Estilos CSS |
| bootstrap-icons | Iconos |
| signature_pad | Captura de firma digital |

---

## 📚 Documentación Técnica de Análisis

Se incluyen 3 documentos de referencia completos que mapean toda la arquitectura del sistema:

### 1. 📋 [ANALISIS_ARQUITECTURA.md](./ANALISIS_ARQUITECTURA.md)
**Análisis completo de la arquitectura del sistema**
- ✅ Dónde se captura firma y foto (componentes React)
- ✅ Modelo de datos Asistencia (estructura BD)
- ✅ APIs e endpoints para guardar asistencias
- ✅ Serializers para conversión JSON
- ✅ Exportación y visualización de reportes
- ✅ Rutas API completas (todos los endpoints)
- ✅ Flujo completo: captura → almacenamiento → visualización

**Ideal para:** Entender la arquitectura general, qué archivo hace qué.

---

### 2. 🔌 [EJEMPLOS_API.md](./EJEMPLOS_API.md)
**Ejemplos prácticos de request/response y flujos**
- ✅ Ejemplos reales de POST/GET con JSON
- ✅ Estructura de directorios de almacenamiento (firmas/fotos)
- ✅ Tabla de Asistencia en BD (estructura SQL)
- ✅ Validaciones en backend (día, hora, duplicados)
- ✅ Ciclo de vida: captura → guardado → refresco UI
- ✅ Tabla comparativa: CSV vs Excel vs PDF
- ✅ Contexto de autenticación (tokens CSRF)

**Ideal para:** Desarrolladores que necesitan integración, debugging.

---

### 3. ⚡ [REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md)
**Referencia rápida por funcionalidad**
- ✅ Tabla "Búsqueda por funcionalidad" (¿Dónde está X?)
- ✅ Tabla de rutas API completa (visual ASCII)
- ✅ Ciclo completo en diagrama ASCII
- ✅ Resumen ejecutivo (componentes, BD, almacenamiento)
- ✅ Checklist: entender el flujo
- ✅ Archivos más importantes por función
- ✅ Debugging: cómo verificar
- ✅ Errores comunes + soluciones

**Ideal para:** Búsquedas rápidas, referencia visual, troubleshooting.

---

## 🎯 Guía rápida - "¿Dónde está X?"

### Captura de firma
**Archivo:** `frontend/src/pages/ListaDoctores.jsx` (línea 26-31)
- Usa `signature_pad` librería (Canvas HTML5)
- Modal con SignaturePad + cámara web

### Captura de foto
**Archivo:** `frontend/src/pages/ListaDoctores.jsx` (línea 77-91)
- `navigator.mediaDevices.getUserMedia()` API
- Conversión a Base64 vía Canvas

### API para guardar firma/foto
**Endpoint:** `POST /api/firmar/<doctor_id>/<horario_id>/<tipo>/`
**Archivo:** `asistencia2/mi_app/api_views.py` (línea 91-193)
- Decodifica Base64
- Guarda archivos en `media/firmas/` y `media/fotos/`
- Actualiza modelo Asistencia en BD

### Modelo Asistencia
**Archivo:** `asistencia2/mi_app/models.py` (línea 54-88)
- Campos: firma_entrada, foto_entrada, firma_salida, foto_salida
- También: hora_entrada, hora_salida, doctor (FK), horario (FK)

### Dashboard - Visualización
**Archivo:** `frontend/src/pages/Dashboard.jsx`
- Tabla de asistencias con thumbnails
- `ImageModal.jsx` para fullscreen

### Exportación (CSV/Excel/PDF)
**Archivo:** `asistencia2/mi_app/api_views.py`
- CSV: línea 327-383
- Excel: línea 391-515 (con imágenes)
- PDF: línea 517-750 (con imágenes)

---

## 🚀 Comienza aquí

1. **Primer vistazo:** Lee [REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md)
2. **Entender flujo:** Revisa [ANALISIS_ARQUITECTURA.md](./ANALISIS_ARQUITECTURA.md)
3. **Implementar/Debuggear:** Consulta [EJEMPLOS_API.md](./EJEMPLOS_API.md)

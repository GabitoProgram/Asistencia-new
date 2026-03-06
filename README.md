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

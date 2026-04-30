# Referencia Rápida - Sistema de Asistencia

Tabla de referencia rápida para búsquedas y consultas frecuentes.

---

## 1. BÚSQUEDA POR FUNCIONALIDAD

### ¿Dónde se captura la firma?

| **Ubicación** | **Archivo** | **Línea** | **Tecnología** |
|---|---|---|---|
| Frontend | `frontend/src/pages/ListaDoctores.jsx` | L26-31 | `signature_pad` (Canvas HTML5) |
| Hook inicialización | `frontend/src/pages/ListaDoctores.jsx` | L26-45 | React useEffect + SignaturePad |
| Guardado de firma | `frontend/src/pages/ListaDoctores.jsx` | L134-147 | `padRef.current.toDataURL('image/png')` |

---

### ¿Dónde se captura la foto?

| **Ubicación** | **Archivo** | **Línea** | **Tecnología** |
|---|---|---|---|
| Función captura | `frontend/src/pages/ListaDoctores.jsx` | L77-91 | `navigator.mediaDevices.getUserMedia()` |
| Inicio de cámara | `frontend/src/pages/ListaDoctores.jsx` | L48-66 | `videoRef.current.srcObject = stream` |
| Conversión a imagen | `frontend/src/pages/ListaDoctores.jsx` | L82-87 | Canvas drawImage() + toDataURL |

---

### ¿Dónde se guardan firma y foto?

| **Ubicación** | **Archivo** | **Línea** | **Función** |
|---|---|---|---|
| Decodificación | `asistencia2/mi_app/api_views.py` | L29-35 | `_decode_base64_image()` |
| Guardado en disco | `asistencia2/mi_app/api_views.py` | L38-48 | `_save_image_bytes()` |
| Actualización BD | `asistencia2/mi_app/api_views.py` | L175-184 | Asistencia.save() |

---

### ¿Dónde está el modelo Asistencia?

| **Ubicación** | **Archivo** | **Línea** | **Campos** |
|---|---|---|---|
| Definición | `asistencia2/mi_app/models.py` | L54-88 | doctor, horario, fecha, firma_entrada, foto_entrada, hora_entrada, firma_salida, foto_salida, hora_salida |
| Propiedades | `asistencia2/mi_app/models.py` | L80-87 | `firmo_entrada`, `firmo_salida` |

---

### ¿Dónde está el Serializer de Asistencia?

| **Ubicación** | **Archivo** | **Línea** | **Campos serializables** |
|---|---|---|---|
| Definición | `asistencia2/mi_app/serializers.py` | L26-42 | id, doctor, doctor_nombre, doctor_ci, horario, horario_detalle, fecha, firma_entrada, foto_entrada, hora_entrada, firma_salida, foto_salida, hora_salida, firmo_entrada, firmo_salida |

---

### ¿Cuál es el endpoint para guardar firma/foto?

| **Endpoint** | **Método** | **Ubicación** | **Autenticación** | **Parámetros** |
|---|---|---|---|---|
| `/api/firmar/<doctor_id>/<horario_id>/<tipo>/` | POST | `asistencia2/mi_app/api_urls.py` L17 | AllowAny | tipo: "entrada" o "salida" |
| Implementación | - | `asistencia2/mi_app/api_views.py` L91-193 | - | - |

---

### ¿Dónde se visualizan las asistencias?

| **Ubicación** | **Archivo** | **Funcionalidad** |
|---|---|---|
| Dashboard tabla | `frontend/src/pages/Dashboard.jsx` | L260-340: Tabla con firma/foto |
| Modal imagen | `frontend/src/components/ImageModal.jsx` | Fullscreen de imágenes |
| Datos | GET `/api/dashboard/` | Backend: `api_views.py` L233-300 |

---

### ¿Dónde se exportan reportes?

| **Formato** | **Endpoint** | **Archivo** | **Línea** | **Librería** |
|---|---|---|---|---|
| CSV | `/api/exportar/csv/` | `asistencia2/mi_app/api_views.py` | L327-383 | csv (Python built-in) |
| Excel | `/api/exportar/excel/` | `asistencia2/mi_app/api_views.py` | L391-515 | openpyxl |
| PDF | `/api/exportar/pdf/` | `asistencia2/mi_app/api_views.py` | L517-750 | reportlab |

---

## 2. TABLA DE RUTAS API

```
╔════════════════════════════════════════════════════════════════════════════╗
║                           RUTAS API COMPLETAS                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║ AUTENTICACIÓN                                                               ║
├────────────────────────────────────────────────────────────────────────────┤
║ POST   /api/auth/login/                  ← Login admin/usuario             ║
║ POST   /api/auth/logout/                 ← Logout                         ║
║ GET    /api/auth/me/                     ← Info usuario actual (CSRF)      ║
╠════════════════════════════════════════════════════════════════════════════╣
║ FIRMAS Y DOCTORES (PÚBLICO - sin autenticación)                            ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/doctores-hoy/                ← Lista doctores c/ horario hoy   ║
║ POST   /api/firmar/<d>/<h>/<tipo>/       ← Guardar firma+foto (entrada/s) ║
╠════════════════════════════════════════════════════════════════════════════╣
║ DASHBOARD (AUTENTICADO)                                                    ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/dashboard/                   ← Tabla de asistencias            ║
║ GET    /api/dashboard/charts/            ← Estadísticas (gráficos)         ║
╠════════════════════════════════════════════════════════════════════════════╣
║ EXPORTACIONES (AUTENTICADO)                                                ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/exportar/csv/                ← Descargar CSV                   ║
║ GET    /api/exportar/excel/              ← Descargar XLSX c/ imágenes      ║
║ GET    /api/exportar/pdf/                ← Descargar PDF c/ imágenes       ║
╠════════════════════════════════════════════════════════════════════════════╣
║ GESTIÓN DE DOCTORES (AUTENTICADO)                                          ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/doctores/                    ← Listar todos                    ║
║ POST   /api/doctores/crear/              ← Crear nuevo                     ║
║ PUT    /api/doctores/<id>/editar/        ← Editar                          ║
║ DELETE /api/doctores/<id>/eliminar/      ← Eliminar                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ GESTIÓN DE HORARIOS (AUTENTICADO)                                          ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/doctores/<d>/horarios/       ← Horarios de un doctor           ║
║ POST   /api/doctores/<d>/horarios/crear/ ← Crear horario                   ║
║ PUT    /api/horarios/<h>/editar/         ← Editar                          ║
║ DELETE /api/horarios/<h>/eliminar/       ← Eliminar                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ REPORTES DE CAMBIOS DE HORARIO (AUTENTICADO)                               ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/cambios-horarios/            ← Listar cambios                  ║
║ GET    /api/cambios-horarios/exportar-pdf/  ← Descargar PDF                ║
║ GET    /api/cambios-horarios/exportar-excel/← Descargar XLSX               ║
╠════════════════════════════════════════════════════════════════════════════╣
║ GESTIÓN DE ADMINS (AUTENTICADO - SUPERUSER)                                ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/admins/                      ← Listar admins                   ║
║ POST   /api/admins/crear/                ← Crear admin                     ║
║ PUT    /api/admins/<u>/cambiar-password/ ← Cambiar contraseña              ║
║ PUT    /api/admins/<u>/toggle-status/    ← Activar/Desactivar             ║
║ PUT    /api/admins/<u>/toggle-superuser/ ← Hacer superuser                 ║
║ DELETE /api/admins/<u>/eliminar/         ← Eliminar                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ CALENDARIO (AUTENTICADO)                                                   ║
├────────────────────────────────────────────────────────────────────────────┤
║ GET    /api/calendario/                  ← Vista calendario doctores       ║
╚════════════════════════════════════════════════════════════════════════════╝

LEYENDA:
  <d>    = doctor_id (integer)
  <h>    = horario_id (integer)
  <u>    = user_id (integer)
  <tipo> = "entrada" | "salida" (string)
```

---

## 3. CICLO COMPLETO - FIRMA A REPORTE

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO COMPLETO DE FIRMA                      │
└─────────────────────────────────────────────────────────────────┘

PASO 1: CAPTURA (Frontend - ListaDoctores.jsx)
  │
  ├─ User abre ListaDoctores.jsx
  │  GET /api/doctores-hoy/ → obtiene lista de doctores con horario
  │
  ├─ User hace click "Firmar Entrada"
  │  ├─ Modal abre
  │  ├─ Canvas (firma) se inicializa
  │  ├─ Cámara inicia automáticamente
  │  └─ User firma manualmente
  │
  └─ User click "Guardar Firma"
     └─ Captura foto automática

PASO 2: TRANSMISIÓN (Frontend API)
  │
  └─ POST /api/firmar/1/2/entrada/
     │
     Body: {
       firma: "data:image/png;base64,iVBOR...",
       foto: "data:image/png;base64,iVBOR..."
     }

PASO 3: PROCESAMIENTO (Backend - api_views.py)
  │
  ├─ _decode_base64_image() → convierte a bytes
  ├─ _save_image_bytes() → guarda en disco
  │  ├─ Crea carpeta: media/firmas/2026/03/04/
  │  ├─ Crea carpeta: media/fotos/2026/03/04/
  │  └─ Retorna rutas relativas
  ├─ Asistencia.objects.get_or_create() → BD
  ├─ asistencia.firma_entrada = "firmas/2026/03/04/1-2-..."
  ├─ asistencia.foto_entrada = "fotos/2026/03/04/1-2-..."
  ├─ asistencia.hora_entrada = now()
  └─ asistencia.save() → confirma en BD

PASO 4: RESPUESTA (Backend → Frontend)
  │
  └─ 200 OK: {
       "success": true,
       "mensaje": "Firma de entrada registrada correctamente",
       "hora": "14:32:15"
     }

PASO 5: REFRESCO (Frontend)
  │
  ├─ Modal cierra
  ├─ Cámara se detiene
  └─ fetchDoctores() → GET /api/doctores-hoy/
     └─ Tabla se actualiza
        ├─ "Firmar Entrada" cambia a "✓ Entrada Firmada"
        ├─ Botón "Firmar Salida" se habilita
        └─ Imagen de firma se muestra como thumbnail

PASO 6: VISUALIZACIÓN (Dashboard)
  │
  ├─ Admin accede Dashboard
  ├─ GET /api/dashboard/ → tabla de todas las asistencias
  ├─ Muestra thumbnails de firmas/fotos
  ├─ Click imagen → ImageModal.jsx (fullscreen)
  └─ Admin puede filtrar por fecha/doctor

PASO 7: EXPORTACIÓN (Dashboard → Reportes)
  │
  ├─ Admin click "Descargar CSV" → GET /api/exportar/csv/
  │  └─ Archivo: asistencias_2026-02-04_2026-03-04.csv (5 KB)
  │
  ├─ Admin click "Descargar Excel" → GET /api/exportar/excel/
  │  └─ Archivo: asistencias_2026-02-04_2026-03-04.xlsx (500 KB-2 MB)
  │     Contiene: imágenes de firma/foto incrustadas
  │
  └─ Admin click "Descargar PDF" → GET /api/exportar/pdf/
     └─ Archivo: asistencias_2026-02-04_2026-03-04.pdf (1-3 MB)
        Contiene: imágenes de firma/foto incrustadas + estilos

┌─────────────────────────────────────────────────────────────────┐
│                       FIN DEL CICLO                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. RESUMEN EJECUTIVO

### Componentes Principales

| Componente | Lenguaje | Archivo | Líneas | Responsabilidad |
|---|---|---|---|---|
| Lista de Doctores | React | `ListaDoctores.jsx` | ~450 | Captura firma/foto |
| Modal Firma | React | `ListaDoctores.jsx` | ~80 | Interfaz firma + cámara |
| Dashboard | React | `Dashboard.jsx` | ~300 | Visualización asistencias |
| API Firma | Django | `api_views.py` | ~100 | POST guardar firma/foto |
| Modelo BD | Django | `models.py` | ~35 | Estructura Asistencia |
| Serializer | Django | `serializers.py` | ~15 | JSON conversion |
| Exportaciones | Django | `api_views.py` | ~400 | CSV/XLSX/PDF |

---

### Base de Datos

| Tabla | Registros | Campos Clave | FK |
|---|---|---|---|
| `app_doctor` | ~30 | id, nombres, apellidos, ci | - |
| `app_horario` | ~60 | id, doctor_id, dia_semana, hora_entrada, hora_salida | Doctor |
| `app_asistencia` | ~900/mes | id, doctor_id, horario_id, fecha, firma*, foto*, hora* | Doctor, Horario |
| `app_cambio_horario` | ~10 | id, horario_id, admin_id | Horario, User |

**Campos con asterisco (*) = pueden ser NULL**

---

### Almacenamiento de Archivos

```
Total firmas/día:  ~30 doctores × 2 turnos = ~60 archivos × 130 KB = ~7.8 MB/día
Total fotos/día:   ~30 doctores × 2 turnos = ~60 archivos × 200 KB = ~12 MB/día
Total/día:         ~20 MB (sin compresión)

Mensual:   ~600 MB
Anual:     ~7.2 GB (sin compresión)
```

---

## 5. CHECKLIST - ENTENDER EL FLUJO

- [x] **Captura:** Firma usando `signature_pad` + Foto usando `getUserMedia()`
- [x] **Transmisión:** Base64 encoding → POST `/api/firmar/`
- [x] **Decodificación:** Backend decodifica Base64 → bytes en memoria
- [x] **Almacenamiento:** Bytes guardados en carpeta `media/firmas/` y `media/fotos/`
- [x] **Base de Datos:** Rutas relativas guardadas en campos `firma_entrada`, `foto_entrada`
- [x] **Visualización:** URLs públicas `/media/{ruta}` en HTML `<img>`
- [x] **Reportes:** Exportación a CSV/XLSX/PDF con embebidas o referencias
- [x] **Autenticación:** `AllowAny` para captura, `IsAuthenticated` para admin

---

## 6. ARCHIVOS MÁS IMPORTANTES (por función)

### Captura
1. `frontend/src/pages/ListaDoctores.jsx` ← **PRIMERO AQUÍ**
2. `frontend/src/api.js` (cliente HTTP)

### Backend
1. `asistencia2/mi_app/api_views.py` (lógica)
2. `asistencia2/mi_app/models.py` (BD)
3. `asistencia2/mi_app/serializers.py` (JSON)
4. `asistencia2/mi_app/api_urls.py` (rutas)

### Visualización
1. `frontend/src/pages/Dashboard.jsx`
2. `frontend/src/components/ImageModal.jsx`

### Reportes
1. `asistencia2/mi_app/api_views.py` (exportar_csv, exportar_excel, exportar_pdf)

---

## 7. VARIABLES DE ENTORNO / CONFIGURACIÓN

**Django settings.py:**
```python
MEDIA_URL = '/media/'              # URL pública
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Ruta en disco

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

**Frontend - Vite/React:**
```javascript
// api.js
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
```

---

## 8. DEBUGGING - Cómo verificar

**Verificar que signature_pad carga:**
```javascript
// En consola browser
typeof SignaturePad  // Debe ser "function"
```

**Verificar que cámara funciona:**
```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => console.log("Cámara OK", stream))
  .catch(err => console.error("Cámara ERROR", err))
```

**Verificar archivos guardados:**
```bash
ls -la e:\Pasantia\ 1\Sistema\ de\ Asistencia\asistencia2\media\firmas\2026\03\04\
```

**Verificar BD:**
```bash
# En Django shell
python manage.py shell
>>> from mi_app.models import Asistencia
>>> Asistencia.objects.filter(fecha='2026-03-04').first()
```

---

## 9. ERRORES COMUNES

| Error | Causa | Solución |
|---|---|---|
| "No se pudo capturar la foto" | Cámara no disponible o sin permisos | Verificar permisos, usar HTTPS en producción |
| "Firma o foto inválida" | Base64 corrupto | Verificar que canvas/video tengan datos |
| "Ya firmó entrada" | Intenta firmar dos veces | Validación correcta, UI debe mostrar botón deshabilitado |
| "Aún no puede firmar" | Antes de la hora esperada | Esperar 15 min antes o cambiar hora del turno |
| Imágenes no se muestran | Ruta incorrecta o archivo no existe | Verificar `/media/` ruta correcta en disco |
| "Doctor no encontrado" | ID incorrecto | Verificar que doctor_id exista en BD |

---

## 10. PRÓXIMAS MEJORAS (ideas)

- [ ] Compresión automática de imágenes (reducir tamaño)
- [ ] Verificación de imagen de firma (mínimo de píxeles dibujados)
- [ ] Captura de huella dactilar + firma (biometría)
- [ ] Sincronización offline (capturar sin internet, sincronizar después)
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Análisis de asistencias (ML - predicción de inasistencia)
- [ ] Integración con sistema de nómina


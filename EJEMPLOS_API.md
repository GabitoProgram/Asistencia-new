# Ejemplos Prácticos - API y Flujos de Firma

Referencia rápida con ejemplos reales de requests/responses y casos de uso.

---

## 1. EJEMPLO COMPLETO: CAPTURA Y GUARDADO DE FIRMA

### 1.1 Frontend - Captura en ListaDoctores.jsx

```javascript
// Usuario abre modal de firma
const abrirModalFirma = (doctorId, horarioId, tipo) => {
  setModal({
    doctorId,
    horarioId,
    doctorNombre: `Dr(a). ${doctor.nombres} ${doctor.apellidos}`,
    tipo  // 'entrada' o 'salida'
  });
  // → useEffect inicia cámara automáticamente
};

// Usuario firma en canvas y hace click en "Guardar Firma"
const guardarFirma = async () => {
  // 1. Obtiene firma de canvas
  const firmaBase64 = padRef.current.toDataURL('image/png');
  // Resultado: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
  
  // 2. Captura foto de la cámara (espera max 4 segundos)
  const fotoBase64 = await capturarFotoConTimeout(4000);
  // Resultado: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
  
  // 3. Envía al backend
  try {
    const response = await api.post(
      `/firmar/1/2/entrada/`,  // doctor_id=1, horario_id=2, tipo=entrada
      {
        firma: firmaBase64,
        foto: fotoBase64
      }
    );
    console.log(response.data); // { success: true, ... }
    setModal(null);  // Cierra modal
    fetchDoctores(); // Recarga lista
  } catch (err) {
    alert(err.response?.data?.error);
  }
};
```

---

## 2. EJEMPLOS DE REQUEST/RESPONSE

### 2.1 POST /api/firmar/<doctor_id>/<horario_id>/<tipo>/

#### Request:
```bash
POST /api/firmar/1/2/entrada/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json
X-CSRFToken: 7K8mzP2q4xL9nK6...

{
  "firma": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAACwCAIAAAB...bHbqQAAAA==",
  "foto": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAcACAIAAACK...xvM7k="
}
```

#### Response 200 OK:
```json
{
  "success": true,
  "mensaje": "Firma de entrada registrada correctamente",
  "hora": "14:32:15"
}
```

#### Response 400 Error:
```json
{
  "error": "Ya firmó entrada en este turno"
}
```

Otros errores posibles:
- `"No puede firmar en un día que no corresponde a su horario"`
- `"Aún no puede firmar entrada. Su turno inicia a las 14:00"`
- `"Debe firmar entrada primero"` (si intenta salida sin entrada)
- `"Doctor no encontrado"`
- `"Horario no encontrado"`

---

### 2.2 GET /api/doctores-hoy/

#### Request:
```bash
GET /api/doctores-hoy/ HTTP/1.1
Host: localhost:8000
```

#### Response 200:
```json
{
  "doctores_info": [
    {
      "doctor": {
        "id": 1,
        "nombres": "Juan",
        "apellidos": "Pérez",
        "ci": "12345678",
        "especialidad": "Cardiología",
        "activo": true,
        "nombre_completo": "Juan Pérez"
      },
      "turnos": [
        {
          "horario": {
            "id": 2,
            "doctor": 1,
            "dia_semana": 0,
            "dia_semana_display": "Lunes",
            "hora_entrada_esperada": "14:00:00",
            "hora_salida_esperada": "18:00:00"
          },
          "firmo_entrada": true,
          "firmo_salida": false,
          "hora_entrada": "2026-03-04T14:15:32.123456Z",
          "hora_salida": null
        }
      ]
    }
  ],
  "fecha_hoy": "2026-03-04",
  "dia_semana": 0
}
```

---

### 2.3 GET /api/dashboard/

#### Request:
```bash
GET /api/dashboard/?fecha_desde=2026-02-04&fecha_hasta=2026-03-04&doctor_id=1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

#### Response:
```json
{
  "asistencias": [
    {
      "id": 1,
      "doctor": 1,
      "doctor_nombre": "Juan Pérez",
      "doctor_ci": "12345678",
      "horario": 2,
      "horario_detalle": {
        "id": 2,
        "doctor": 1,
        "dia_semana": 0,
        "dia_semana_display": "Lunes",
        "hora_entrada_esperada": "14:00:00",
        "hora_salida_esperada": "18:00:00"
      },
      "fecha": "2026-03-04",
      "firma_entrada": "firmas/2026/03/04/1-2-2026-03-04-entrada.png",
      "hora_entrada": "2026-03-04T14:15:32.123456Z",
      "foto_entrada": "fotos/2026/03/04/1-2-2026-03-04-entrada-foto.png",
      "firma_salida": "firmas/2026/03/04/1-2-2026-03-04-salida.png",
      "hora_salida": "2026-03-04T17:52:15.654321Z",
      "foto_salida": "fotos/2026/03/04/1-2-2026-03-04-salida-foto.png",
      "firmo_entrada": true,
      "firmo_salida": true
    }
  ],
  "firmaron_hoy_entrada": 15,
  "firmaron_hoy_salida": 12,
  "no_firmaron_hoy": 3,
  "total_doctores": 30,
  "fecha_desde": "2026-02-04",
  "fecha_hasta": "2026-03-04"
}
```

---

### 2.4 GET /api/exportar/csv/

#### Request:
```bash
GET /api/exportar/csv/?fecha_desde=2026-02-04&fecha_hasta=2026-03-04&doctor_id=1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

#### Response (Content-Type: text/csv):
```csv
Doctor,CI,Fecha,Turno,Hora Entrada,Hora Salida,Firma Entrada,Foto Entrada,Firma Salida,Foto Salida
Juan Pérez,12345678,04/03/2026,14:00-18:00,14:15:32,17:52:15,firmas/2026/03/04/1-2-2026-03-04-entrada.png,fotos/2026/03/04/1-2-2026-03-04-entrada-foto.png,firmas/2026/03/04/1-2-2026-03-04-salida.png,fotos/2026/03/04/1-2-2026-03-04-salida-foto.png
```

---

### 2.5 GET /api/exportar/excel/

#### Request:
```bash
GET /api/exportar/excel/?fecha_desde=2026-02-04&fecha_hasta=2026-03-04 HTTP/1.1
```

#### Response:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Header: `Content-Disposition: attachment; filename="asistencias_2026-02-04_2026-03-04.xlsx"`
- **Contiene:** Tabla con imágenes de firma/foto incrustadas (60x28 px cada una)

---

### 2.6 GET /api/exportar/pdf/

#### Request:
```bash
GET /api/exportar/pdf/?fecha_desde=2026-02-04&fecha_hasta=2026-03-04&doctor_ci=123 HTTP/1.1
```

#### Response:
- Content-Type: `application/pdf`
- Header: `Content-Disposition: attachment; filename="asistencias_2026-02-04_2026-03-04.pdf"`
- **Formato:** Landscape, con imágenes de firma/foto incrustadas

---

## 3. ESTRUCTURA DE DIRECTORIOS - ALMACENAMIENTO

```
proyecto/
├── asistencia2/
│   ├── manage.py
│   ├── media/                          ← Raíz para archivos
│   │   ├── firmas/
│   │   │   └── 2026/
│   │   │       ├── 03/
│   │   │       │   ├── 04/
│   │   │       │   │   ├── 1-2-2026-03-04-entrada.png      (128 KB)
│   │   │       │   │   ├── 2-3-2026-03-04-entrada.png      (135 KB)
│   │   │       │   │   ├── 1-2-2026-03-04-salida.png       (140 KB)
│   │   │       │   │   └── ...
│   │   │       │   ├── 05/
│   │   │       │   │   └── ...
│   │   │   └── ...
│   │   │
│   │   └── fotos/
│   │       └── 2026/
│   │           ├── 03/
│   │           │   ├── 04/
│   │           │   │   ├── 1-2-2026-03-04-entrada-foto.png   (200 KB)
│   │           │   │   ├── 2-3-2026-03-04-entrada-foto.png   (210 KB)
│   │           │   │   ├── 1-2-2026-03-04-salida-foto.png    (195 KB)
│   │           │   │   └── ...
│   └── settings.py
│       └── MEDIA_URL = '/media/'         → URL base en navegador
│       └── MEDIA_ROOT = 'media/'         → Ruta en servidor
```

### Convención de nombres:
```
firmas/2026/03/04/{doctor_id}-{horario_id}-{YYYY-MM-DD}-{tipo}.png
fotos/2026/03/04/{doctor_id}-{horario_id}-{YYYY-MM-DD}-{tipo}-foto.png

Ejemplo:
  1-2-2026-03-04-entrada.png        → Doctor 1, Horario 2, 04/03/2026, Entrada
  1-2-2026-03-04-salida.png         → Doctor 1, Horario 2, 04/03/2026, Salida
  2-3-2026-03-04-entrada-foto.png   → Doctor 2, Horario 3, 04/03/2026, Foto Entrada
```

---

## 4. TABLA - ASISTENCIA EN BASE DE DATOS

```sql
CREATE TABLE app_asistencia (
  id INTEGER PRIMARY KEY,
  doctor_id INTEGER NOT NULL,         -- FK → app_doctor
  horario_id INTEGER NOT NULL,        -- FK → app_horario
  fecha DATE NOT NULL,                -- e.g., "2026-03-04"
  
  -- ENTRADA
  firma_entrada VARCHAR(255),         -- e.g., "firmas/2026/03/04/1-2-..."
  foto_entrada VARCHAR(255),          -- e.g., "fotos/2026/03/04/1-2-..."
  hora_entrada DATETIME,              -- e.g., "2026-03-04T14:15:32.123456Z"
  
  -- SALIDA
  firma_salida VARCHAR(255),          -- e.g., "firmas/2026/03/04/1-2-..."
  foto_salida VARCHAR(255),           -- e.g., "fotos/2026/03/04/1-2-..."
  hora_salida DATETIME,               -- e.g., "2026-03-04T17:52:15.654321Z"
  
  UNIQUE(doctor_id, fecha, horario_id),
  KEY (fecha),
  KEY (doctor_id)
);
```

**Propiedades calculadas (read-only en Serializer):**
- `firmo_entrada` → `firma_entrada IS NOT NULL AND firma_entrada != ''`
- `firmo_salida` → `firma_salida IS NOT NULL AND firma_salida != ''`

---

## 5. VALIDACIONES EN API

### 5.1 Validación de día y hora - Entrada

```python
# api_views.py → api_firmar()

# 1. Día correcto
dia_semana_hoy = hoy.weekday()  # 0=Lunes ... 6=Domingo
if horario.dia_semana != dia_semana_hoy:
    return error("No puede firmar en un día que no corresponde a su horario")

# 2. Tolerancia de 15 minutos antes
ahora_local = timezone.localtime(ahora)
entrada_dt = timezone.make_aware(
    datetime.combine(hoy, horario.hora_entrada_esperada),
    timezone.get_current_timezone()
)
limite = entrada_dt - timedelta(minutes=15)
if ahora_local < limite:
    return error(f"Aún no puede firmar entrada. Su turno inicia a las {entrada_dt}")

# 3. No duplicados
if asistencia.firmo_entrada:
    return error("Ya firmó entrada en este turno")
```

### 5.2 Validación - Salida

```python
# 1. Ya debe haber firmado entrada
if not asistencia.firmo_entrada:
    return error("Debe firmar entrada primero")

# 2. No puede firmar salida dos veces
if asistencia.firmo_salida:
    return error("Ya firmó salida en este turno")
```

### 5.3 Validación - Archivos

```python
# Ambos campos deben venir
if not firma_data:
    return error("No se recibió la firma")
if not foto_data:
    return error("No se recibió la foto")

# Se decodifican correctamente
try:
    firma_bytes = _decode_base64_image(firma_data)
    foto_bytes = _decode_base64_image(foto_data)
except Exception:
    return error("Firma o foto inválida")

# No pueden ser vacíos
if not firma_bytes or not foto_bytes:
    return error("Firma inválida")
```

---

## 6. FLUJO DE ACTUALIZACIÓN DE ESTADO EN FRONTEND

```javascript
// ListaDoctores.jsx - Ciclo de vida tras guardar firma

1. Usuario en modal, firma y hace click "Guardar"
   ↓
2. setSaving(true)  → Botón muestra spinner
   ↓
3. POST /firmar/... → Backend procesa (1-2 segundos)
   ↓
4. Respuesta exitosa
   ↓
5. setModal(null)       → Cierra modal
6. detenerCamara()      → Libera stream de cámara
7. fetchDoctores()      → Recarga datos del servidor
   ↓
8. GET /doctores-hoy/  → Servidor retorna lista actualizada
   ↓
9. setData(res.data)    → Acepta datos nuevos
   ↓
10. UI re-renderiza:
    - Botón cambia de "Firmar Entrada" → "✓ Entrada Firmada"
    - Si era entrada, ahora muestra firma_entrada con thumb
    - Botón "Firmar Salida" se habilita (antes estaba deshabilitado)
```

---

## 7. TABLA COMPARATIVA - TIPOS DE EXPORTACIÓN

| Aspecto | CSV | Excel | PDF |
|---------|-----|-------|-----|
| **Formato** | Texto plano (.csv) | Binario (.xlsx) | Binario (.pdf) |
| **Imágenes** | Rutas de texto | Incrustadas (60x28 px) | Incrustadas (60x28 px) |
| **Estilos** | No | Sí (colores, bordes, fuentes) | Sí (fuentes, títulos, tablas) |
| **Tamaño** | Muy pequeño (~5 KB) | Mediano (~500 KB - 2 MB) | Grande (~1-3 MB) |
| **Apertura** | Excel, cualquier editor | Excel, aplicaciones Office | Adobe, navegadores |
| **Librería** | csv (built-in Python) | openpyxl | reportlab |
| **Apto para email** | ✓ | ✓ | ✓ |
| **Apto para imprimir** | Limitado | Mejor | ✓✓ (Mejor) |

---

## 8. CONTEXTO DE AUTENTICACIÓN

### 8.1 Token CSRF en requests

Automáticamente manejado por `api.js`:

```javascript
// frontend/src/api.js
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});
```

### 8.2 Endpoint personas públicas vs autenticadas

```python
# Públicos (AllowAny)
@permission_classes([AllowAny])
def api_lista_doctores(request):      # GET /doctores-hoy/
def api_firmar(request, ...):         # POST /firmar/...
def api_login(request):               # POST /auth/login/

# Autenticados (IsAuthenticated)
@permission_classes([IsAuthenticated])
def api_dashboard(request):            # GET /dashboard/
def api_exportar_csv(request):        # GET /exportar/csv/
def api_exportar_excel(request):      # GET /exportar/excel/
def api_exportar_pdf(request):        # GET /exportar/pdf/
```

---

## 9. MONITOREO - Verificar archivos guardados

```bash
# Ver estructura de carpetas
ls -la media/firmas/2026/03/04/
ls -la media/fotos/2026/03/04/

# Contar archivos por día
find media/firmas/2026/03/04 -type f | wc -l

# Listar por tamaño
du -h media/firmas/2026/03/04/*
du -h media/fotos/2026/03/04/*

# Total ocupado
du -sh media/

# Verificar integridad de PNG
file media/firmas/2026/03/04/*.png
```

---

## 10. NOTAS IMPORTANTES

✅ **Rutas relativas:** Todos los paths se guardan relativos (`firmas/2026/03/04/...`)  
✅ **URLs públicas:** Frontend accede via `/media/{ruta_relativa}`  
✅ **Creación de carpetas:** Se hacen automáticas con `os.makedirs(..., exist_ok=True)`  
✅ **Transacciones:** Cada firma/foto se guarda y luego se actualiza Asistencia  
✅ **Campos opcionales:** `firma_entrada`, `foto_entrada`, `firma_salida`, `foto_salida` pueden ser NULL  
✅ **Timestamps:** `hora_entrada`, `hora_salida` son UTC (Django con timezone.now())


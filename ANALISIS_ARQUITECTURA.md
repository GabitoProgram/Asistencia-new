# Análisis Arquitectura - Sistema de Asistencia Django/React

Documento de referencia que mapea cómo funciona la captura de firma/foto, modelos de datos y exportación de reportes.

---

## 1. CAPTURA DE FIRMA Y FOTO DE DOCTORES

### 1.1 Frontend - Componente Principal
**Archivo:** [frontend/src/pages/ListaDoctores.jsx](frontend/src/pages/ListaDoctores.jsx)

#### Características:
- **Librería de firma:** `signature_pad` (npm package)
- **Captura de foto:** API de `navigator.mediaDevices.getUserMedia()` (cámara web)
- **Canvas para firma:** `<canvas>` HTML5 con eventos de mouse/lápiz digital

#### Flujo de captura:
1. **Modal de firma** se abre cuando usuario hace click en "Firmar Entrada" o "Firmar Salida"
2. **Inicia cámara automáticamente** cuando modal se abre
3. **Usuario firma en el canvas** con mouse/lápiz
4. **Al guardar:**
   - Obtiene firma en Base64: `padRef.current.toDataURL('image/png')`
   - Captura foto automática de la cámara tras 4 segundos de espera
   - Ambas se envían al API POST

#### Variables de estado en componente:
```javascript
const [modal, setModal] = useState(null); // { doctorId, horarioId, doctorNombre, tipo }
const canvasRef = useRef(null);          // Canvas para firma
const padRef = useRef(null);             // Instancia SignaturePad
const videoRef = useRef(null);           // Video element para cámara
const cameraStreamRef = useRef(null);   // Stream de cámara
```

#### Función principal - Guardar firma:
```javascript
const guardarFirma = async () => {
  const firmaBase64 = padRef.current.toDataURL('image/png');
  const fotoBase64 = await capturarFotoConTimeout(4000);
  
  await api.post(`/firmar/${modal.doctorId}/${modal.horarioId}/${modal.tipo}/`, {
    firma: firmaBase64,
    foto: fotoBase64,
  });
};
```

---

## 2. MODELO DE DATOS - ASISTENCIA

### 2.1 Definición del Modelo
**Archivo:** [asistencia2/mi_app/models.py](asistencia2/mi_app/models.py#L54-L88)

```python
class Asistencia(models.Model):
    doctor = ForeignKey(Doctor, on_delete=CASCADE, related_name='asistencias')
    horario = ForeignKey(Horario, on_delete=CASCADE, related_name='asistencias')
    fecha = DateField(default=timezone.localdate)
    
    # ENTRADA
    firma_entrada = CharField(max_length=255, blank=True, null=True)  # Ruta relativa
    foto_entrada = CharField(max_length=255, blank=True, null=True)   # Ruta relativa
    hora_entrada = DateTimeField(blank=True, null=True)
    
    # SALIDA
    firma_salida = CharField(max_length=255, blank=True, null=True)   # Ruta relativa
    foto_salida = CharField(max_length=255, blank=True, null=True)    # Ruta relativa
    hora_salida = DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['doctor', 'fecha', 'horario']
        ordering = ['-fecha', '-hora_entrada']
    
    @property
    def firmo_entrada(self):
        return self.firma_entrada is not None and self.firma_entrada != ''
    
    @property
    def firmo_salida(self):
        return self.firma_salida is not None and self.firma_salida != ''
```

### 2.2 Modelos Relacionados

**Doctor:**
- `id`, `nombres`, `apellidos`, `ci` (único), `especialidad`, `activo`

**Horario:**
- `doctor` (FK)
- `dia_semana` (0-6: Lunes-Domingo)
- `hora_entrada_esperada`, `hora_salida_esperada`

---

## 3. APIS Y ENDPOINTS PARA GUARDAR ASISTENCIAS

### 3.1 API de Firma
**Endpoint:** `POST /api/firmar/<doctor_id>/<horario_id>/<tipo>/`

**Ubicación:** [asistencia2/mi_app/api_views.py](asistencia2/mi_app/api_views.py#L91-L193)

#### Parámetros:
- `doctor_id` (int): ID del doctor
- `horario_id` (int): ID del horario/turno
- `tipo` (str): `"entrada"` o `"salida"`

#### Body (JSON):
```json
{
  "firma": "data:image/png;base64,iVBORw0KGg...",
  "foto": "data:image/png;base64,iVBORw0KGg..."
}
```

#### Lógica de validación:
1. Verifica que hoy sea el día del horario programado
2. **Entrada:** Valida tolerancia de 15 minutos antes de la hora esperada
3. **Salida:** Valida que haya firmado entrada primero
4. Evita duplicados en el mismo turno/día

#### Tratamiento de imágenes:
```python
def _decode_base64_image(image_data):
    if not image_data:
        return None
    if ',' in image_data:  # Elimina encabezado data:image/png;base64,
        image_data = image_data.split(',')[1]
    return base64.b64decode(image_data)

def _save_image_bytes(image_bytes, folder_name, year, month, day, filename):
    # Estructura: media/firmas/2026/03/04/filename.png
    #             media/fotos/2026/03/04/filename.png
    carpeta_relativa = os.path.join(folder_name, str(year), str(month).zfill(2), str(day).zfill(2))
    carpeta_absoluta = os.path.join(settings.MEDIA_ROOT, carpeta_relativa)
    os.makedirs(carpeta_absoluta, exist_ok=True)
    # Guarda y retorna ruta relativa
```

#### Estructura de carpetas en disco:
```
media/
├── firmas/
│   └── 2026/
│       └── 03/
│           └── 04/
│               └── 1-2-2026-03-04-entrada.png    (doctor_id-horario_id-fecha-tipo.png)
└── fotos/
    └── 2026/
        └── 03/
            └── 04/
                └── 1-2-2026-03-04-entrada-foto.png
```

#### Respuesta exitosa:
```json
{
  "success": true,
  "mensaje": "Firma de entrada registrada correctamente",
  "hora": "14:32:15"
}
```

### 3.2 API de Lista de Doctores (para firmar)
**Endpoint:** `GET /api/doctores-hoy/`

**Ubicación:** [asistencia2/mi_app/api_views.py](asistencia2/mi_app/api_views.py#L42-L80)

Retorna doctores activos con horario de hoy y estado de firmas.

---

## 4. SERIALIZERS

### 4.1 AsistenciaSerializer
**Archivo:** [asistencia2/mi_app/serializers.py](asistencia2/mi_app/serializers.py#L26-L42)

```python
class AsistenciaSerializer(serializers.ModelSerializer):
    doctor_nombre = serializers.CharField(source='doctor.nombre_completo', read_only=True)
    doctor_ci = serializers.CharField(source='doctor.ci', read_only=True)
    horario_detalle = HorarioSerializer(source='horario', read_only=True)
    firmo_entrada = serializers.BooleanField(read_only=True)
    firmo_salida = serializers.BooleanField(read_only=True)

    class Meta:
        model = Asistencia
        fields = ['id', 'doctor', 'doctor_nombre', 'doctor_ci', 'horario',
                  'horario_detalle', 'fecha', 'firma_entrada', 'hora_entrada',
                  'foto_entrada', 'firma_salida', 'hora_salida', 'foto_salida',
                  'firmo_entrada', 'firmo_salida']
```

---

## 5. EXPORTACIÓN Y VISUALIZACIÓN DE REPORTES

### 5.1 Dashboard - Visualización de Asistencias
**Archivo:** [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)

#### Características:
- Tabla de asistencias con filtros por rango de fecha y doctor
- Muestra thumbnails de firma/foto (pequeñas imágenes)
- Click en imagen abre modal de visualización completa
- Componente: `ImageModal.jsx`

#### URLs de imágenes en frontend:
```html
<img src={`/media/${a.firma_entrada}`} alt="Firma" />
<img src={`/media/${a.foto_entrada}`} alt="Foto entrada" />
```

### 5.2 Exportación - CSV
**Endpoint:** `GET /api/exportar/csv/`

**Ubicación:** [asistencia2/mi_app/api_views.py](asistencia2/mi_app/api_views.py#L327-L383)

**Parámetros de query:**
- `fecha_desde`, `fecha_hasta` (formato ISO: YYYY-MM-DD)
- `doctor_id`, `doctor_ci`, `doctor_nombre` (filtros)

**Retorna:** Archivo CSV descargable con columnas:
- Doctor, CI, Fecha, Turno, Hora Entrada, Hora Salida
- Firma Entrada, Foto Entrada, Firma Salida, Foto Salida

**Uso en frontend:**
```javascript
// Dashboard.jsx línea 232-238
<a href={exportUrl('excel')} className="btn btn-sm">Descargar Excel</a>
<a href={exportUrl('pdf')} className="btn btn-sm">Descargar PDF</a>
<a href={exportUrl('csv')} className="btn btn-sm">Descargar CSV</a>

const exportUrl = (type) => {
  const params = new URLSearchParams({
    fecha_desde: fechaDesde,
    fecha_hasta: fechaHasta,
    doctor_id: doctorId,
    // ...
  });
  return `/api/exportar/${type}/?${params}`;
};
```

### 5.3 Exportación - Excel
**Endpoint:** `GET /api/exportar/excel/`

**Ubicación:** [asistencia2/mi_app/api_views.py](asistencia2/mi_app/api_views.py#L391-L515)

**Características:**
- Usa librería `openpyxl`
- Inserta imágenes de firma y foto directamente en celdas
- Estilos: fuentes, colores, bordes
- Tamaño de imagen en Excel: 60x28 puntos (firma_width x firma_height)

### 5.4 Exportación - PDF
**Endpoint:** `GET /api/exportar/pdf/`

**Ubicación:** [asistencia2/mi_app/api_views.py](asistencia2/mi_app/api_views.py#L517-750)

**Características:**
- Usa librería `reportlab`
- Formato: landscape (apaisado)
- Inserta imágenes de firma/foto en tabla
- Título con rango de fechas
- Encabezado "Facultad de Medicina — U.M.S.A."

---

## 6. REPORTES DE CAMBIOS DE HORARIO

### 6.1 Modelo CambioHorario
**Archivo:** [asistencia2/mi_app/models.py](asistencia2/mi_app/models.py#L99-120)

```python
class CambioHorario(models.Model):
    horario = ForeignKey(Horario, on_delete=CASCADE)
    admin = ForeignKey(User, on_delete=SET_NULL, null=True)
    
    # Valores anteriores y nuevos
    dia_semana_anterior, hora_entrada_anterior, hora_salida_anterior
    dia_semana_nuevo, hora_entrada_nueva, hora_salida_nueva
    
    fecha_cambio = DateTimeField(auto_now_add=True)
```

### 6.2 Frontend - Reportes de Cambios
**Archivo:** [frontend/src/pages/ReportesCambiosHorarios.jsx](frontend/src/pages/ReportesCambiosHorarios.jsx)

**Endpoints de exportación:**
- `GET /api/cambios-horarios/exportar-pdf/`
- `GET /api/cambios-horarios/exportar-excel/`

---

## 7. RUTAS API COMPLETAS

**Archivo:** [asistencia2/mi_app/api_urls.py](asistencia2/mi_app/api_urls.py)

```python
# Autenticación
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/me/

# Firmas y doctores (público)
GET    /api/doctores-hoy/
POST   /api/firmar/<doctor_id>/<horario_id>/<tipo>/

# Dashboard (autenticado)
GET    /api/dashboard/
GET    /api/dashboard/charts/

# Exportaciones (autenticado)
GET    /api/exportar/csv/
GET    /api/exportar/excel/
GET    /api/exportar/pdf/

# Gestión de doctores
GET    /api/doctores/
POST   /api/doctores/crear/
PUT    /api/doctores/<doctor_id>/editar/
DELETE /api/doctores/<doctor_id>/eliminar/

# Gestión de horarios
GET    /api/doctores/<doctor_id>/horarios/
POST   /api/doctores/<doctor_id>/horarios/crear/
PUT    /api/horarios/<horario_id>/editar/
DELETE /api/horarios/<horario_id>/eliminar/

# Cambios de horarios
GET    /api/cambios-horarios/
GET    /api/cambios-horarios/exportar-pdf/
GET    /api/cambios-horarios/exportar-excel/

# Gestión de admins
GET    /api/admins/
POST   /api/admins/crear/
PUT    /api/admins/<user_id>/cambiar-password/
PUT    /api/admins/<user_id>/toggle-status/
```

---

## 8. FLUJO COMPLETO - CAPTURA Y ALMACENAMIENTO

```
ENTRADA DEL USUARIO
    ↓
ListaDoctores.jsx (Frontend)
├─ Muestra lista de doctores con horario hoy
├─ Usuario click en "Firmar Entrada"
│
└─ Modal: 
   ├─ Canvas (Firma) - SignaturePad
   ├─ Video (Cámara) - getUserMedia()
   ├─ Usuario firma manualmente
   ├─ Usuario click "Guardar"
   │
   └─→ API POST /firmar/<doctor_id>/<horario_id>/entrada/
       ├─ Body: { firma: "base64...", foto: "base64..." }
       │
       └─→ Backend api_firmar() - api_views.py
           ├─ Decodifica Base64 a bytes
           ├─ _save_image_bytes()
           │  ├─ Crea carpeta: media/firmas/2026/03/04/
           │  ├─ Guarda archivo: 1-2-2026-03-04-entrada.png
           │  └─ Retorna ruta relativa
           ├─ _save_image_bytes()
           │  ├─ Crea carpeta: media/fotos/2026/03/04/
           │  ├─ Guarda archivo: 1-2-2026-03-04-entrada-foto.png
           │  └─ Retorna ruta relativa
           ├─ Crea/Actualiza Asistencia
           │  ├─ asistencia.firma_entrada = "firmas/2026/03/04/..."
           │  ├─ asistencia.foto_entrada = "fotos/2026/03/04/..."
           │  ├─ asistencia.hora_entrada = now()
           │  └─ Save()
           └─ Retorna: { success: true, mensaje: "...", hora: "14:32:15" }

VISUALIZACIÓN EN DASHBOARD
    ↓
Dashboard.jsx - Tabla de asistencias
├─ GET /api/dashboard/ → Lista asistencias
├─ Muestra URLs de imágenes: /media/firmas/2026/03/04/...
├─ Click imagen → ImageModal.jsx (fullscreen)
│
EXPORTACIÓN
├─ GET /api/exportar/csv/
├─ GET /api/exportar/excel/  (Inserta imágenes)
└─ GET /api/exportar/pdf/    (Inserta imágenes)
```

---

## 9. RESUMEN - ARCHIVOS CLAVE

| Componente | Archivo | Responsabilidad |
|-----------|---------|-----------------|
| **Captura Firma/Foto** | `frontend/src/pages/ListaDoctores.jsx` | Modal con SignaturePad + Cámara |
| **Modelo BD** | `asistencia2/mi_app/models.py` | Asistencia, Doctor, Horario, CambioHorario |
| **API Firma** | `asistencia2/mi_app/api_views.py` (L91-193) | POST `/firmar/` - Recibe y guarda firma/foto |
| **Serializers** | `asistencia2/mi_app/serializers.py` | AsistenciaSerializer |
| **Rutas API** | `asistencia2/mi_app/api_urls.py` | Mapeo de endpoints |
| **Dashboard** | `frontend/src/pages/Dashboard.jsx` | Visualización de asistencias |
| **Exportaciones** | `asistencia2/mi_app/api_views.py` (L327+) | CSV, Excel, PDF |
| **Cliente HTTP** | `frontend/src/api.js` | Axios configurado |

---

## 10. FLUJO DE DATOS - CAMPOS ALMACENADOS

```
Asistencia {
  doctor_id ────────→ Doctor
  horario_id ────────→ Horario  
  fecha ─────────────→ "2026-03-04"
  
  [ENTRADA]
  firma_entrada ─────→ "firmas/2026/03/04/1-2-2026-03-04-entrada.png"
  foto_entrada ──────→ "fotos/2026/03/04/1-2-2026-03-04-entrada-foto.png"
  hora_entrada ──────→ "2026-03-04T14:32:15.123456Z"
  
  [SALIDA]
  firma_salida ──────→ "firmas/2026/03/04/1-2-2026-03-04-salida.png"
  foto_salida ───────→ "fotos/2026/03/04/1-2-2026-03-04-salida-foto.png"
  hora_salida ───────→ "2026-03-04T18:45:30.654321Z"
}
```


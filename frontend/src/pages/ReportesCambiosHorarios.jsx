import { useEffect, useState } from 'react';
import api from '../api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ReportesCambiosHorarios() {
  const [cambios, setCambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctores, setDoctores] = useState([]);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [doctorIdFiltro, setDoctorIdFiltro] = useState('');

  useEffect(() => { fetchDoctores(); fetchCambios(); }, []);

  const fetchDoctores = async () => {
    try {
      const res = await api.get('/doctores/');
      setDoctores(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCambios = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (doctorIdFiltro) params.append('doctor_id', doctorIdFiltro);

      const res = await api.get(`/cambios-horarios/?${params.toString()}`);
      setCambios(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleFiltrar = () => {
    fetchCambios();
  };

  const handleLimpiar = () => {
    setFechaDesde('');
    setFechaHasta('');
    setDoctorIdFiltro('');
    setCambios([]);
    setLoading(true);
    setTimeout(() => {
      api.get('/cambios-horarios/')
        .then(res => setCambios(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }, 0);
  };

  const descargarPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (doctorIdFiltro) params.append('doctor_id', doctorIdFiltro);

      const res = await api.get(`/cambios-horarios/exportar-pdf/?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cambios_horarios.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error descargando PDF');
      console.error(err);
    }
  };

  const descargarExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
      if (doctorIdFiltro) params.append('doctor_id', doctorIdFiltro);

      const res = await api.get(`/cambios-horarios/exportar-excel/?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cambios_horarios.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error descargando Excel');
      console.error(err);
    }
  };

  if (loading && cambios.length === 0) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1a1f71' }}>
            <i className="bi bi-clock-history me-2"></i>Reportes de Cambios de Horarios
          </h2>
          <p className="text-muted mb-0">Auditoría de cambios realizados en horarios de doctores</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-4" style={{ borderLeft: '4px solid #1a1f71' }}>
        <h5 className="fw-bold mb-3">Filtros</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Desde</label>
            <input type="datetime-local" className="form-control" value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Hasta</label>
            <input type="datetime-local" className="form-control" value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Doctor</label>
            <select className="form-select" value={doctorIdFiltro}
              onChange={(e) => setDoctorIdFiltro(e.target.value)}>
              <option value="">-- Todos --</option>
              {doctores.map(d => (
                <option key={d.id} value={d.id}>
                  {d.apellidos} {d.nombres}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">&nbsp;</label>
            <div className="d-flex gap-2">
              <button className="btn text-white w-100" style={{ background: '#1a1f71' }}
                onClick={handleFiltrar}>
                <i className="bi bi-search me-1"></i>Filtrar
              </button>
              <button className="btn btn-outline-secondary w-100" onClick={handleLimpiar}>
                <i className="bi bi-x-lg me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de descarga */}
      {cambios.length > 0 && (
        <div className="mb-4 d-flex gap-2 flex-wrap">
          <button className="btn btn-danger" onClick={descargarPDF}>
            <i className="bi bi-file-pdf me-2"></i>Descargar PDF
          </button>
          <button className="btn btn-success" onClick={descargarExcel}>
            <i className="bi bi-file-excel me-2"></i>Descargar Excel
          </button>
        </div>
      )}

      {/* Tabla de cambios */}
      {cambios.length === 0 ? (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          No hay cambios de horarios registrados
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead style={{ background: '#f8f9fa', borderTop: '2px solid #1a1f71' }}>
              <tr>
                <th style={{ color: '#1a1f71' }}>Doctor</th>
                <th style={{ color: '#1a1f71' }}>C.I.</th>
                <th style={{ color: '#1a1f71' }}>Día Anterior</th>
                <th style={{ color: '#1a1f71' }}>Horario Anterior</th>
                <th style={{ color: '#1a1f71' }}>Día Nuevo</th>
                <th style={{ color: '#1a1f71' }}>Horario Nuevo</th>
                <th style={{ color: '#1a1f71' }}>Admin</th>
                <th style={{ color: '#1a1f71' }}>Fecha Cambio</th>
              </tr>
            </thead>
            <tbody>
              {cambios.map((cambio) => (
                <tr key={cambio.id}>
                  <td>
                    <strong>{cambio.doctor_nombre}</strong>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">{cambio.doctor_ci}</span>
                  </td>
                  <td>
                    <span className="badge bg-warning text-dark">
                      {cambio.dia_semana_anterior_display}
                    </span>
                  </td>
                  <td>
                    <code>{cambio.hora_entrada_anterior?.slice(0, 5)}-{cambio.hora_salida_anterior?.slice(0, 5)}</code>
                  </td>
                  <td>
                    <span className="badge bg-success">
                      {cambio.dia_semana_nuevo_display}
                    </span>
                  </td>
                  <td>
                    <code style={{ color: '#16a34a', fontWeight: 'bold' }}>
                      {cambio.hora_entrada_nueva?.slice(0, 5)}-{cambio.hora_salida_nueva?.slice(0, 5)}
                    </code>
                  </td>
                  <td>
                    <small>{cambio.admin_nombre}</small>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(cambio.fecha_cambio).toLocaleString('es-ES')}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-muted small mt-2">
            <i className="bi bi-info-circle me-1"></i>
            Total de cambios: <strong>{cambios.length}</strong>
          </div>
        </div>
      )}
    </>
  );
}

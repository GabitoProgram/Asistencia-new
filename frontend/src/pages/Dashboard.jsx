import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [filters, setFilters] = useState({
    fecha_desde: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    fecha_hasta: new Date().toISOString().split('T')[0],
    doctor_id: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchCharts();
  }, []);

  const fetchData = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.fecha_desde) params.set('fecha_desde', f.fecha_desde);
      if (f.fecha_hasta) params.set('fecha_hasta', f.fecha_hasta);
      if (f.doctor_id) params.set('doctor_id', f.doctor_id);
      const res = await api.get(`/dashboard/?${params}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await api.get('/dashboard/charts/');
      setCharts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData(filters);
  };

  const exportUrl = (type) => {
    const params = new URLSearchParams();
    if (filters.fecha_desde) params.set('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta);
    if (filters.doctor_id) params.set('doctor_id', filters.doctor_id);
    return `/api/exportar/${type}/?${params}`;
  };

  if (loading && !data) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <>
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1a1f71' }}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </h2>
          <p className="text-muted mb-0">Panel de control de asistencias</p>
        </div>
        <span className="badge px-3 py-2" style={{ background: 'rgba(26,31,113,0.1)', color: '#1a1f71' }}>
          <i className="bi bi-calendar3 me-1"></i>{data?.fecha_hoy}
        </span>
      </div>

      {/* Métricas */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Doctores', value: data?.total_doctores, icon: 'bi-people-fill', bg: 'linear-gradient(135deg, #1a1f71, #0f1352)' },
          { label: 'Firmaron Entrada Hoy', value: data?.firmaron_hoy_entrada, icon: 'bi-box-arrow-in-right', bg: 'linear-gradient(135deg, #16a34a, #15803d)' },
          { label: 'Firmaron Salida Hoy', value: data?.firmaron_hoy_salida, icon: 'bi-box-arrow-right', bg: 'linear-gradient(135deg, #d4a841, #b8922e)' },
          { label: 'No Firmaron Hoy', value: data?.no_firmaron_hoy, icon: 'bi-exclamation-triangle', bg: 'linear-gradient(135deg, #8b1a1a, #6b1010)' },
        ].map((m, i) => (
          <div key={i} className="col-md-3 col-sm-6">
            <div className="p-4 text-white position-relative overflow-hidden" style={{ borderRadius: 12, background: m.bg }}>
              <i className={`bi ${m.icon}`} style={{ fontSize: '3rem', opacity: 0.2, position: 'absolute', right: 15, top: 15 }}></i>
              <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{m.value ?? 0}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficas simples */}
      {charts && (
        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="card p-4">
              <h6 className="fw-bold mb-3" style={{ color: '#1a1f71' }}>
                <i className="bi bi-bar-chart me-2"></i>Asistencias - Últimos 7 días
              </h6>
              <div className="d-flex align-items-end gap-2" style={{ height: 180 }}>
                {charts.asistencias_por_dia.map((d, i) => {
                  const max = Math.max(...charts.asistencias_por_dia.map(x => x.cantidad), 1);
                  const h = (d.cantidad / max) * 150;
                  return (
                    <div key={i} className="text-center flex-fill">
                      <div className="mx-auto" style={{
                        width: '70%', height: h, background: 'rgba(26,31,113,0.75)',
                        borderRadius: '6px 6px 0 0', minHeight: 4
                      }}></div>
                      <small className="text-muted d-block mt-1">{d.fecha}</small>
                      <small className="fw-bold">{d.cantidad}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-4">
              <h6 className="fw-bold mb-3" style={{ color: '#b8922e' }}>
                <i className="bi bi-trophy me-2"></i>Top 5 Doctores (30 días)
              </h6>
              {charts.top_doctores.length === 0 ? (
                <p className="text-muted text-center">Sin datos</p>
              ) : (
                charts.top_doctores.map((d, i) => {
                  const colors = ['#1a1f71', '#8b1a1a', '#d4a841', '#16a34a', '#7c3aed'];
                  return (
                    <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors[i] }}></div>
                        <small>{d.doctor__nombres} {d.doctor__apellidos}</small>
                      </div>
                      <span className="badge" style={{ background: colors[i] }}>{d.total}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4 mb-4">
        <form onSubmit={handleFilter} className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Desde</label>
            <input type="date" className="form-control" value={filters.fecha_desde}
              onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })} />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Hasta</label>
            <input type="date" className="form-control" value={filters.fecha_hasta}
              onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Doctor</label>
            <select className="form-select" value={filters.doctor_id}
              onChange={(e) => setFilters({ ...filters, doctor_id: e.target.value })}>
              <option value="">Todos</option>
              {data?.doctores?.map((d) => (
                <option key={d.id} value={d.id}>Dr(a). {d.nombres} {d.apellidos}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex gap-2 flex-wrap">
            <button type="submit" className="btn text-white" style={{ background: '#1a1f71' }}>
              <i className="bi bi-filter me-1"></i>Filtrar
            </button>
            <a href={exportUrl('excel')} className="btn text-white" style={{ background: '#16803d' }}>
              <i className="bi bi-file-earmark-excel me-1"></i>Excel
            </a>
            <a href={exportUrl('pdf')} className="btn text-white" style={{ background: '#8b1a1a' }}>
              <i className="bi bi-file-earmark-pdf me-1"></i>PDF
            </a>
            <a href={exportUrl('csv')} className="btn btn-outline-secondary">
              <i className="bi bi-filetype-csv me-1"></i>CSV
            </a>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card-header bg-white py-3">
          <h6 className="fw-bold mb-0" style={{ color: '#1a1f71' }}>
            <i className="bi bi-table me-2"></i>Registro de Asistencias
            <span className="badge ms-2" style={{ background: '#1a1f71' }}>{data?.asistencias?.length ?? 0}</span>
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr style={{ background: '#1a1f71', color: 'white' }}>
                  <th>Doctor</th>
                  <th>CI</th>
                  <th>Fecha</th>
                  <th>Turno</th>
                  <th>Hora Entrada</th>
                  <th>Firma Entrada</th>
                  <th>Hora Salida</th>
                  <th>Firma Salida</th>
                </tr>
              </thead>
              <tbody>
                {data?.asistencias?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                      No hay registros para el rango seleccionado
                    </td>
                  </tr>
                ) : (
                  data?.asistencias?.map((a) => (
                    <tr key={a.id}>
                      <td className="fw-semibold">{a.doctor_nombre}</td>
                      <td>{a.doctor_ci}</td>
                      <td>{a.fecha}</td>
                      <td>
                        {a.horario_detalle ? (
                          <small className="badge bg-light text-dark">
                            {a.horario_detalle.hora_entrada_esperada?.slice(0, 5)}-{a.horario_detalle.hora_salida_esperada?.slice(0, 5)}
                          </small>
                        ) : '—'}
                      </td>
                      <td>
                        {a.hora_entrada ? (
                          <span className="text-success fw-semibold">
                            {new Date(a.hora_entrada).toLocaleTimeString('es-BO')}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {a.firma_entrada ? (
                          <img src={`/media/${a.firma_entrada}`} alt="Firma"
                            style={{ width: 80, height: 40, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}
                            loading="lazy" />
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {a.hora_salida ? (
                          <span className="fw-semibold" style={{ color: '#8b1a1a' }}>
                            {new Date(a.hora_salida).toLocaleTimeString('es-BO')}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {a.firma_salida ? (
                          <img src={`/media/${a.firma_salida}`} alt="Firma"
                            style={{ width: 80, height: 40, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer' }}
                            loading="lazy" />
                        ) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import api from '../api';

export default function Calendario() {
  const [calendario, setCalendario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCalendario();
  }, [selectedDate]);

  const fetchCalendario = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/calendario/?fecha=${selectedDate}`);
      setCalendario(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el calendario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const getStatusColor = (turno) => {
    if (turno.firmo_entrada && turno.firmo_salida) {
      return 'success'; // Verde - Completo
    } else if (turno.firmo_entrada) {
      return 'warning'; // Amarillo - Solo entrada
    } else {
      return 'danger'; // Rojo - No asistió
    }
  };

  const getStatusText = (turno) => {
    if (turno.firmo_entrada && turno.firmo_salida) {
      return 'Completo';
    } else if (turno.firmo_entrada) {
      return 'Pendiente salida';
    } else {
      return 'No asistió';
    }
  };

  if (loading && !calendario) {
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
            <i className="bi bi-calendar-event me-2"></i>Calendario de Doctores
          </h2>
          <p className="text-muted mb-0">Visualiza los horarios y asistencias de los doctores</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Selector de fecha */}
      <div className="card p-4 mb-4">
        <div className="row align-items-center">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Selecciona una fecha</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="col-md-6">
            <div className="p-3 rounded" style={{ background: 'rgba(26,31,113,0.08)' }}>
              <div className="fw-bold text-center" style={{ color: '#1a1f71' }}>
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-BO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información general */}
      {calendario && (
        <div className="mb-4">
          <div className="alert alert-info d-flex align-items-center">
            <i className="bi bi-info-circle me-2 fs-5"></i>
            <span>Se encontraron <strong>{calendario.total_doctores}</strong> doctor(es) con horario para este día</span>
          </div>
        </div>
      )}

      {/* Grilla de doctores */}
      {calendario && calendario.doctores && calendario.doctores.length > 0 ? (
        <div className="row g-3">
          {calendario.doctores.map((doctor) => (
            <div key={doctor.doctor_id} className="col-md-6 col-lg-4">
              <div className="card h-100" style={{ borderLeft: '5px solid #1a1f71' }}>
                {/* Header Doctor */}
                <div className="card-header p-3" style={{ background: 'rgba(26,31,113,0.08)' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 className="mb-1 fw-bold">{doctor.nombre}</h6>
                      <small className="text-muted">
                        <i className="bi bi-card-text me-1"></i>{doctor.ci}
                      </small>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{
                      width: 50,
                      height: 50,
                      background: 'rgba(26,31,113,0.1)'
                    }}>
                      <i className="bi bi-person-circle fs-4" style={{ color: '#1a1f71' }}></i>
                    </div>
                  </div>
                  {doctor.especialidad && doctor.especialidad !== 'N/A' && (
                    <small className="d-block mt-2" style={{ color: '#1a1f71', fontStyle: 'italic' }}>
                      {doctor.especialidad}
                    </small>
                  )}
                </div>

                {/* Turnos */}
                <div className="card-body p-3">
                  {doctor.turnos && doctor.turnos.length > 0 ? (
                    <>
                      {doctor.turnos.map((turno, idx) => (
                        <div key={idx} className="mb-3 pb-3 border-bottom">
                          {/* Horario */}
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-clock-history me-2" style={{ color: '#b8922e' }}></i>
                            <span className="fw-semibold">{turno.hora_entrada} - {turno.hora_salida}</span>
                          </div>

                          {/* Estado */}
                          <div className="d-flex gap-2 flex-wrap">
                            {/* Entrada */}
                            <div className="flex-fill">
                              <small className="d-block text-muted mb-1">Entrada</small>
                              {turno.firmo_entrada ? (
                                <div className="badge bg-success p-2 w-100 text-center">
                                  <i className="bi bi-check-circle me-1"></i>Firmó
                                </div>
                              ) : (
                                <div className="badge bg-danger p-2 w-100 text-center">
                                  <i className="bi bi-x-circle me-1"></i>No firmó
                                </div>
                              )}
                            </div>

                            {/* Salida */}
                            <div className="flex-fill">
                              <small className="d-block text-muted mb-1">Salida</small>
                              {turno.firmo_salida ? (
                                <div className="badge bg-success p-2 w-100 text-center">
                                  <i className="bi bi-check-circle me-1"></i>Firmó
                                </div>
                              ) : (
                                <div className="badge bg-warning p-2 w-100 text-center" style={{ color: '#000' }}>
                                  <i className="bi bi-clock me-1"></i>Pendiente
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Estado general */}
                      <div className="p-2 rounded" style={{ background: 'rgba(26,31,113,0.05)' }}>
                        <small className="text-muted d-block mb-2">Estado del día:</small>
                        <div className={`badge bg-${getStatusColor(doctor.turnos[0])} p-2 w-100 text-center`}>
                          {getStatusText(doctor.turnos[0])}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted mb-0 text-center">
                      <i className="bi bi-info-circle me-1"></i>Sin horario para hoy
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
          <span>No hay doctores con horario para esta fecha</span>
        </div>
      )}
    </>
  );
}

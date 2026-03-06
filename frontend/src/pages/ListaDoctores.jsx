import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import api from '../api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ListaDoctores() {
  const [data, setData] = useState({ doctores_info: [], fecha_hoy: '', dia_semana: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { doctorId, horarioId, doctorNombre, tipo }
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef(null);
  const padRef = useRef(null);

  useEffect(() => {
    fetchDoctores();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (modal && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = 250;
      padRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3,
      });
    }
  }, [modal]);

  const fetchDoctores = async () => {
    try {
      const res = await api.get('/doctores-hoy/');
      setData(res.data);
    } catch (err) {
      console.error('Error cargando doctores:', err);
    } finally {
      setLoading(false);
    }
  };

  const esTurnoActivo = (horaEntrada) => {
    if (!horaEntrada) return false;
    const [h, m] = horaEntrada.split(':').map(Number);
    const entradaDate = new Date(currentTime);
    entradaDate.setHours(h, m, 0, 0);
    const limiteDate = new Date(entradaDate.getTime() - 15 * 60 * 1000);
    return currentTime >= limiteDate;
  };

  const limpiarFirma = () => {
    if (padRef.current) padRef.current.clear();
  };

  const guardarFirma = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alert('Por favor, firme antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      const firmaBase64 = padRef.current.toDataURL('image/png');
      await api.post(`/firmar/${modal.doctorId}/${modal.horarioId}/${modal.tipo}/`, {
        firma: firmaBase64,
      });
      setModal(null);
      fetchDoctores();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la firma');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const fechaFormateada = data.fecha_hoy
    ? new Date(data.fecha_hoy + 'T12:00:00').toLocaleDateString('es-BO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  return (
    <>
      {/* Encabezado */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">
            <i className="bi bi-people-fill me-2" style={{ color: '#1a1f71' }}></i>
            Control de Asistencia
          </h2>
          <p className="text-muted mb-0">
            <i className="bi bi-calendar3 me-1"></i>
            {fechaFormateada} — {DIAS[data.dia_semana]}
          </p>
        </div>
      </div>

      {/* Lista de Doctores */}
      <div className="row g-3">
        {data.doctores_info.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              <i className="bi bi-info-circle me-2"></i>
              No hay doctores con horario programado para hoy.
            </div>
          </div>
        ) : (
          data.doctores_info.map(({ doctor, turnos }) => (
            <div key={doctor.id} className="col-12">
              <div className="card">
                <div className="card-body px-4 py-3">
                  {/* Info Doctor */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: 50, height: 50, background: 'rgba(26,31,113,0.1)' }}>
                      <i className="bi bi-person-badge fs-4" style={{ color: '#1a1f71' }}></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Dr(a). {doctor.nombres} {doctor.apellidos}</h5>
                      {doctor.especialidad && (
                        <small className="text-muted">{doctor.especialidad}</small>
                      )}
                    </div>
                  </div>

                  {/* Turnos del día */}
                  {turnos.map((turno) => (
                    <div key={turno.horario.id}
                      className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3 mb-2 rounded"
                      style={{ background: '#f8f9fa' }}>
                      <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                          <i className="bi bi-clock me-1"></i>
                          {turno.horario.hora_entrada_esperada?.slice(0, 5)} - {turno.horario.hora_salida_esperada?.slice(0, 5)}
                        </span>
                        {turno.hora_entrada && (
                          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 ms-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Entrada: {new Date(turno.hora_entrada).toLocaleTimeString('es-BO')}
                          </span>
                        )}
                        {turno.hora_salida && (
                          <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 ms-2">
                            <i className="bi bi-check-circle me-1"></i>
                            Salida: {new Date(turno.hora_salida).toLocaleTimeString('es-BO')}
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        {turno.firmo_entrada ? (
                          <button className="btn btn-sm" disabled style={{
                            background: '#94a3b8', color: 'white', borderRadius: 8
                          }}>
                            <i className="bi bi-check2 me-1"></i>Entrada Firmada
                          </button>
                        ) : esTurnoActivo(turno.horario.hora_entrada_esperada) ? (
                          <button className="btn btn-sm text-white" onClick={() => setModal({
                            doctorId: doctor.id,
                            horarioId: turno.horario.id,
                            doctorNombre: `Dr(a). ${doctor.nombres} ${doctor.apellidos}`,
                            tipo: 'entrada'
                          })} style={{ background: '#16a34a', borderRadius: 8, fontWeight: 600 }}>
                            <i className="bi bi-pen me-1"></i>Firmar Entrada
                          </button>
                        ) : (
                          <button className="btn btn-sm" disabled style={{
                            background: '#e2e8f0', color: '#64748b', borderRadius: 8
                          }}>
                            <i className="bi bi-clock me-1"></i>Entrada a las {turno.horario.hora_entrada_esperada?.slice(0, 5)}
                          </button>
                        )}

                        {turno.firmo_salida ? (
                          <button className="btn btn-sm" disabled style={{
                            background: '#94a3b8', color: 'white', borderRadius: 8
                          }}>
                            <i className="bi bi-check2 me-1"></i>Salida Firmada
                          </button>
                        ) : !turno.firmo_entrada ? (
                          <button className="btn btn-sm" disabled title={
                            esTurnoActivo(turno.horario.hora_entrada_esperada)
                              ? "Debe firmar entrada primero"
                              : `Turno inicia a las ${turno.horario.hora_entrada_esperada?.slice(0, 5)}`
                          } style={{
                            background: '#e2e8f0', color: '#64748b', borderRadius: 8, opacity: 0.5
                          }}>
                            <i className="bi bi-pen me-1"></i>Firmar Salida
                          </button>
                        ) : (
                          <button className="btn btn-sm text-white" onClick={() => setModal({
                            doctorId: doctor.id,
                            horarioId: turno.horario.id,
                            doctorNombre: `Dr(a). ${doctor.nombres} ${doctor.apellidos}`,
                            tipo: 'salida'
                          })} style={{ background: '#8b1a1a', borderRadius: 8, fontWeight: 600 }}>
                            <i className="bi bi-pen me-1"></i>Firmar Salida
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Firma */}
      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => !saving && setModal(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-pen me-2"></i>
                  {modal.tipo === 'entrada' ? 'Firma de Entrada' : 'Firma de Salida'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setModal(null)} disabled={saving}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  {modal.doctorNombre} — {modal.tipo === 'entrada' ? 'Firma de Entrada' : 'Firma de Salida'}
                </p>
                <div className="mb-3" style={{
                  border: '2px dashed #cbd5e1', borderRadius: 12, background: 'white'
                }}>
                  <canvas ref={canvasRef} style={{ width: '100%', height: 250, cursor: 'crosshair', touchAction: 'none' }}></canvas>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>Use el mouse o lápiz digital para firmar
                  </small>
                  <button className="btn btn-outline-secondary btn-sm" onClick={limpiarFirma}>
                    <i className="bi bi-eraser me-1"></i>Limpiar
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancelar</button>
                <button className="btn btn-primary fw-bold px-4" onClick={guardarFirma} disabled={saving}>
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                  ) : (
                    <><i className="bi bi-save me-1"></i>Guardar Firma</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

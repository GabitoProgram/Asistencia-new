import { useEffect, useState } from 'react';
import api from '../api';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const diaSemanaActual = () => (new Date().getDay() + 6) % 7;

export default function GestionarDoctores() {
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Formulario doctor
  const [form, setForm] = useState({ nombres: '', apellidos: '', ci: '', especialidad: '', activo: true });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Horarios
  const [horarioDoctor, setHorarioDoctor] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [horarioForm, setHorarioForm] = useState({ dia_semana: diaSemanaActual(), hora_entrada_esperada: '', hora_salida_esperada: '' });

  useEffect(() => { fetchDoctores(); }, []);

  const fetchDoctores = async () => {
    try {
      const res = await api.get('/doctores/');
      setDoctores(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/doctores/${editId}/editar/`, form);
        setMsg({ type: 'success', text: 'Doctor actualizado correctamente.' });
      } else {
        await api.post('/doctores/crear/', form);
        setMsg({ type: 'success', text: 'Doctor creado correctamente.' });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ nombres: '', apellidos: '', ci: '', especialidad: '', activo: true });
      fetchDoctores();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Error al guardar.' });
    }
  };

  const handleEdit = (d) => {
    setForm({ nombres: d.nombres, apellidos: d.apellidos, ci: d.ci, especialidad: d.especialidad || '', activo: d.activo });
    setEditId(d.id);
    setShowForm(true);
  };

  const handleToggleActivo = async (doctor) => {
    const nuevoEstado = !doctor.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} al Dr(a). ${doctor.nombres} ${doctor.apellidos}?`)) return;
    try {
      await api.put(`/doctores/${doctor.id}/editar/`, {
        nombres: doctor.nombres,
        apellidos: doctor.apellidos,
        ci: doctor.ci,
        especialidad: doctor.especialidad || '',
        activo: nuevoEstado,
      });
      setMsg({ type: 'success', text: `Doctor ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente.` });
      fetchDoctores();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || `Error al ${accion}.` });
    }
  };

  // Horarios
  const openHorarios = async (doctor) => {
    setHorarioDoctor(doctor);
    setHorarioForm({ dia_semana: diaSemanaActual(), hora_entrada_esperada: '', hora_salida_esperada: '' });
    try {
      const res = await api.get(`/doctores/${doctor.id}/horarios/`);
      setHorarios(res.data);
    } catch (err) { console.error(err); }
  };

  const addHorario = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/doctores/${horarioDoctor.id}/horarios/crear/`, horarioForm);
      setHorarioForm({ dia_semana: diaSemanaActual(), hora_entrada_esperada: '', hora_salida_esperada: '' });
      const res = await api.get(`/doctores/${horarioDoctor.id}/horarios/`);
      setHorarios(res.data);
      fetchDoctores();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar horario.');
    }
  };

  const deleteHorario = async (id) => {
    try {
      await api.delete(`/horarios/${id}/eliminar/`);
      const res = await api.get(`/doctores/${horarioDoctor.id}/horarios/`);
      setHorarios(res.data);
      fetchDoctores();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar horario.');
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1a1f71' }}>
            <i className="bi bi-person-badge me-2"></i>Gestión de Doctores
          </h2>
          <p className="text-muted mb-0">Agregar, editar, eliminar doctores y gestionar horarios</p>
        </div>
        <button className="btn text-white" style={{ background: '#1a1f71' }}
          onClick={() => { setShowForm(true); setEditId(null); setForm({ nombres: '', apellidos: '', ci: '', especialidad: '', activo: true }); }}>
          <i className="bi bi-person-plus me-1"></i>Nuevo Doctor
        </button>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show`}>
          {msg.text}
          <button className="btn-close" onClick={() => setMsg(null)}></button>
        </div>
      )}

      {/* Lista */}
      <div className="row g-3">
        {doctores.map((d) => (
          <div key={d.id} className="col-md-6 col-lg-4">
            <div className="card p-3" style={{ borderLeft: '4px solid #1a1f71' }}>
              <div className="d-flex align-items-center mb-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 45, height: 45, background: 'rgba(26,31,113,0.1)' }}>
                  <i className="bi bi-person-fill fs-5" style={{ color: '#1a1f71' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-bold">{d.apellidos} {d.nombres}</h6>
                  <small className="text-muted">CI: {d.ci}</small>
                </div>
                <span className={`badge ${d.activo ? 'bg-success' : 'bg-danger'}`}>
                  {d.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {d.especialidad && (
                <div className="mb-2">
                  <small className="text-muted"><i className="bi bi-bookmark-star me-1"></i>{d.especialidad}</small>
                </div>
              )}
              {/* Mostrar horarios resumidos */}
              {d.horarios?.length > 0 && (
                <div className="mb-2">
                  <small className="text-muted"><i className="bi bi-clock me-1"></i>Horarios:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {d.horarios.map((h) => (
                      <span key={h.id} className="badge bg-light text-dark" style={{ fontSize: '0.7rem' }}>
                        {DIAS[h.dia_semana]?.slice(0, 3)} {h.hora_entrada_esperada?.slice(0, 5)}-{h.hora_salida_esperada?.slice(0, 5)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <hr className="my-2" />
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => handleEdit(d)}>
                  <i className="bi bi-pencil me-1"></i>Editar
                </button>
                <button className="btn btn-sm btn-outline-success" onClick={() => openHorarios(d)}>
                  <i className="bi bi-clock me-1"></i>Horarios
                </button>
                <button className={`btn btn-sm ${d.activo ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => handleToggleActivo(d)}
                  title={d.activo ? 'Desactivar doctor' : 'Activar doctor'}>
                  <i className={`bi ${d.activo ? 'bi-person-dash' : 'bi-person-check'}`}></i>
                </button>
              </div>
            </div>
          </div>
        ))}
        {doctores.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info text-center">No hay doctores registrados.</div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Doctor */}
      {showForm && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowForm(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: '#1a1f71' }}>
                <h6 className="modal-title fw-bold">
                  <i className={`bi ${editId ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                  {editId ? 'Editar Doctor' : 'Nuevo Doctor'}
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nombres <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={form.nombres} required
                      onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Apellidos <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={form.apellidos} required
                      onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">C.I. <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={form.ci} required
                      onChange={(e) => setForm({ ...form, ci: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Especialidad</label>
                    <input type="text" className="form-control" value={form.especialidad}
                      onChange={(e) => setForm({ ...form, especialidad: e.target.value })} placeholder="Ej: Cardiología" />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={form.activo}
                      onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                    <label className="form-check-label fw-semibold">Doctor activo</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn text-white" style={{ background: '#1a1f71' }}>
                    <i className="bi bi-check-lg me-1"></i>{editId ? 'Guardar Cambios' : 'Crear Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Horarios */}
      {horarioDoctor && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setHorarioDoctor(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: '#16a34a' }}>
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-clock me-2"></i>
                  Horarios — Dr(a). {horarioDoctor.nombres} {horarioDoctor.apellidos}
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setHorarioDoctor(null)}></button>
              </div>
              <div className="modal-body">
                {/* Agregar horario */}
                <form onSubmit={addHorario} className="row g-2 mb-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Día</label>
                    <select className="form-select" value={horarioForm.dia_semana}
                      onChange={(e) => setHorarioForm({ ...horarioForm, dia_semana: parseInt(e.target.value) })}>
                      {DIAS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Entrada</label>
                    <input type="time" className="form-control" value={horarioForm.hora_entrada_esperada} required
                      onChange={(e) => setHorarioForm({ ...horarioForm, hora_entrada_esperada: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Salida</label>
                    <input type="time" className="form-control" value={horarioForm.hora_salida_esperada} required
                      onChange={(e) => setHorarioForm({ ...horarioForm, hora_salida_esperada: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn text-white w-100" style={{ background: '#16a34a' }}>
                      <i className="bi bi-plus-lg me-1"></i>Agregar
                    </button>
                  </div>
                </form>

                <p className="text-muted mb-2"><small>Un doctor puede tener <strong>varios turnos el mismo día</strong>.</small></p>

                {/* Lista de horarios */}
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {horarios.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-muted">Sin horarios asignados</td></tr>
                    ) : (
                      horarios.map((h) => (
                        <tr key={h.id}>
                          <td><span className="badge bg-primary">{DIAS[h.dia_semana]}</span></td>
                          <td>{h.hora_entrada_esperada?.slice(0, 5)}</td>
                          <td>{h.hora_salida_esperada?.slice(0, 5)}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteHorario(h.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

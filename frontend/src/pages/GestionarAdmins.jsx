import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function GestionarAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showCrear, setShowCrear] = useState(false);
  const [crearForm, setCrearForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [passModal, setPassModal] = useState(null);
  const [passForm, setPassForm] = useState({ new_password: '', new_password2: '' });
  const [loadingToggle, setLoadingToggle] = useState(null);
  
  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admins/');
      setAdmins(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admins/crear/', crearForm);
      setMsg({ type: 'success', text: 'Administrador creado correctamente.' });
      setShowCrear(false);
      setCrearForm({ username: '', email: '', password: '', password2: '' });
      fetchAdmins();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Error al crear.' });
    }
  };

  const handleCambiarPass = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admins/${passModal.id}/cambiar-password/`, passForm);
      setMsg({ type: 'success', text: `Contraseña de "${passModal.username}" actualizada.` });
      setPassModal(null);
      setPassForm({ new_password: '', new_password2: '' });
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Error al cambiar contraseña.' });
    }
  };

  const handleToggleStatus = async (adminId) => {
    if (!user?.is_superuser) {
      setMsg({ type: 'danger', text: 'Solo el súper administrador puede cambiar el estado.' });
      return;
    }
    
    try {
      setLoadingToggle(adminId);
      await api.put(`/admins/${adminId}/toggle-status/`);
      setMsg({ type: 'success', text: 'Estado del administrador actualizado.' });
      fetchAdmins();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Error al cambiar estado.' });
    } finally {
      setLoadingToggle(null);
    }
  };

  const handleToggleSuperuser = async (adminId) => {
    if (!user?.is_superuser) {
      setMsg({ type: 'danger', text: 'Solo el súper administrador puede cambiar roles.' });
      return;
    }

    if (adminId === user.id) {
      setMsg({ type: 'danger', text: 'No se puede cambiar tu propio rol.' });
      return;
    }
    
    try {
      setLoadingToggle(adminId);
      await api.put(`/admins/${adminId}/toggle-superuser/`);
      setMsg({ type: 'success', text: 'Rol del administrador actualizado.' });
      fetchAdmins();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Error al cambiar rol.' });
    } finally {
      setLoadingToggle(null);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1a1f71' }}>
            <i className="bi bi-person-gear me-2"></i>Gestión de Administradores
          </h2>
          <p className="text-muted mb-0">Crear, editar y administrar cuentas de administrador</p>
        </div>
        {user?.is_superuser && (
          <button className="btn text-white" style={{ background: '#1a1f71' }}
            onClick={() => setShowCrear(true)}>
            <i className="bi bi-person-plus me-1"></i>Nuevo Administrador
          </button>
        )}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show`}>
          {msg.text}
          <button className="btn-close" onClick={() => setMsg(null)}></button>
        </div>
      )}

      {!user?.is_superuser && (
        <div className="alert alert-info mb-4">
          <i className="bi bi-info-circle me-2"></i>
          <span>Solo el súper administrador puede crear nuevos administradores y cambiar sus estados.</span>
        </div>
      )}

      <div className="row g-3">
        {admins.map((a) => (
          <div key={a.id} className="col-md-6 col-lg-4">
            <div className="card p-3" style={{ borderLeft: '4px solid #1a1f71', opacity: a.is_active ? 1 : 0.7 }}>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 45, height: 45, background: 'rgba(26,31,113,0.1)' }}>
                  <i className="bi bi-person-fill fs-5" style={{ color: '#1a1f71' }}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-0 fw-bold">{a.username}</h6>
                  <small className="text-muted">{a.email || 'Sin email'}</small>
                </div>
              </div>

              {/* Badges de estado */}
              <div className="d-flex gap-2 mb-3 flex-wrap">
                {a.is_superuser && (
                  <span className="badge" style={{ background: '#d4a841', color: '#0f1352' }}>
                    <i className="bi bi-star-fill me-1"></i>Super Admin
                  </span>
                )}
                {a.is_active ? (
                  <span className="badge bg-success">
                    <i className="bi bi-check-circle me-1"></i>Activo
                  </span>
                ) : (
                  <span className="badge bg-danger">
                    <i className="bi bi-x-circle me-1"></i>Deshabilitado
                  </span>
                )}
              </div>

              <small className="text-muted d-block mb-3">
                <i className="bi bi-clock me-1"></i>Último acceso:{' '}
                {a.last_login ? new Date(a.last_login).toLocaleString('es-BO') : 'Nunca'}
              </small>
              <hr className="my-2" />
              
              <div className="d-flex gap-2 flex-column">
                {/* Cambiar contraseña solo para super admin */}
                {user?.is_superuser && (
                  <button className="btn btn-sm btn-outline-primary"
                    onClick={() => setPassModal(a)}
                    disabled={loadingToggle === a.id}>
                    <i className="bi bi-key me-1"></i>Cambiar Contraseña
                  </button>
                )}

                {/* Botón de habilitar/deshabilitar - solo para super admin y no en sí mismo */}
                {user?.is_superuser && !a.is_superuser && (
                  <button 
                    className={`btn btn-sm ${a.is_active ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleStatus(a.id)}
                    disabled={loadingToggle === a.id}
                  >
                    <i className={`bi bi-${a.is_active ? 'ban' : 'check-circle'} me-1`}></i>
                    {a.is_active ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                )}

                {/* Botón de promover/degradar a Super Admin - solo super admin y no en sí mismo */}
                {user?.is_superuser && user.id !== a.id && (
                  <button 
                    className={`btn btn-sm ${a.is_superuser ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => handleToggleSuperuser(a.id)}
                    disabled={loadingToggle === a.id}
                  >
                    <i className={`bi bi-${a.is_superuser ? 'arrow-down' : 'arrow-up'} me-1`}></i>
                    {a.is_superuser ? 'Degradar a Admin' : 'Promover a Super Admin'}
                  </button>
                )}
              </div>

              {!a.is_staff && (
                <small className="text-muted mt-2 d-block">
                  <i className="bi bi-info-circle me-1"></i>No es administrador
                </small>
              )}

              {a.is_superuser && (
                <small className="text-muted mt-2 d-block">
                  <i className="bi bi-shield-lock me-1"></i>Este es el súper administrador
                </small>
              )}
            </div>
          </div>
        ))}
        {admins.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info text-center">No hay administradores registrados.</div>
          </div>
        )}
      </div>

      {/* Modal Crear Admin */}
      {showCrear && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCrear(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: '#1a1f71' }}>
                <h6 className="modal-title fw-bold"><i className="bi bi-person-plus me-2"></i>Nuevo Administrador</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowCrear(false)}></button>
              </div>
              <form onSubmit={handleCrear}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Usuario</label>
                    <input type="text" className="form-control" value={crearForm.username} required
                      onChange={(e) => setCrearForm({ ...crearForm, username: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email (opcional)</label>
                    <input type="email" className="form-control" value={crearForm.email}
                      onChange={(e) => setCrearForm({ ...crearForm, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Contraseña</label>
                    <input type="password" className="form-control" value={crearForm.password} required minLength={4}
                      onChange={(e) => setCrearForm({ ...crearForm, password: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Confirmar Contraseña</label>
                    <input type="password" className="form-control" value={crearForm.password2} required minLength={4}
                      onChange={(e) => setCrearForm({ ...crearForm, password2: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCrear(false)}>Cancelar</button>
                  <button type="submit" className="btn text-white" style={{ background: '#1a1f71' }}>
                    <i className="bi bi-check-lg me-1"></i>Crear Administrador
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {passModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setPassModal(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ background: '#1a1f71' }}>
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-key me-2"></i>Cambiar Contraseña — {passModal.username}
                </h6>
                <button className="btn-close btn-close-white" onClick={() => setPassModal(null)}></button>
              </div>
              <form onSubmit={handleCambiarPass}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nueva Contraseña</label>
                    <input type="password" className="form-control" value={passForm.new_password} required minLength={4}
                      onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Confirmar Contraseña</label>
                    <input type="password" className="form-control" value={passForm.new_password2} required minLength={4}
                      onChange={(e) => setPassForm({ ...passForm, new_password2: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setPassModal(null)}>Cancelar</button>
                  <button type="submit" className="btn text-white" style={{ background: '#1a1f71' }}>
                    <i className="bi bi-check-lg me-1"></i>Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

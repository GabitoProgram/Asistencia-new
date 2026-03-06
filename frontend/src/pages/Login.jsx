import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-5 col-lg-4">
        <div className="card p-4" style={{ borderTop: '4px solid #1a1f71' }}>
          <div className="text-center mb-4">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 70, height: 70, background: 'rgba(26,31,113,0.1)' }}>
              <i className="bi bi-shield-lock fs-2" style={{ color: '#1a1f71' }}></i>
            </div>
            <h4 className="fw-bold" style={{ color: '#1a1f71' }}>Acceso Administrador</h4>
            <p className="text-muted">Facultad de Medicina - U.M.S.A.</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              <i className="bi bi-exclamation-circle me-1"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Usuario</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-person"></i></span>
                <input type="text" className="form-control" value={username}
                  onChange={(e) => setUsername(e.target.value)} placeholder="Ingrese su usuario" required autoFocus />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock"></i></span>
                <input type="password" className="form-control" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" required />
              </div>
            </div>
            <button type="submit" className="btn w-100 py-2 fw-bold text-white" disabled={loading}
              style={{ background: '#1a1f71' }}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Ingresando...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

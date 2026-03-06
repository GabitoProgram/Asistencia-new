import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark py-2" style={{
      background: 'linear-gradient(135deg, #1a1f71, #0f1352)',
      boxShadow: '0 4px 15px rgba(26, 31, 113, 0.3)'
    }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-clipboard2-pulse me-2 fs-4" style={{ color: '#d4a841' }}></i>
          <div>
            <span className="d-block" style={{ lineHeight: 1.1, fontWeight: 700 }}>Sistema de Asistencia</span>
            <small className="d-block fw-normal" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
              Facultad de Medicina - U.M.S.A.
            </small>
          </div>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-house-door me-1"></i>Inicio
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/doctores')}`} to="/doctores">
                    <i className="bi bi-person-badge me-1"></i>Doctores
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admins')}`} to="/admins">
                    <i className="bi bi-person-gear me-1"></i>Admins
                  </Link>
                </li>
                <li className="nav-item ms-2">
                  <span className="nav-link d-flex align-items-center gap-2">
                    <small className="opacity-75">{user.username}</small>
                    <button className="btn btn-sm" onClick={handleLogout} style={{
                      background: '#d4a841', color: '#0f1352', fontWeight: 700, borderRadius: 8
                    }}>
                      <i className="bi bi-box-arrow-right me-1"></i>Salir
                    </button>
                  </span>
                </li>
              </>
            ) : (
              <li className="nav-item ms-2">
                <Link className="btn btn-sm px-3" to="/login" style={{
                  background: '#d4a841', color: '#0f1352', fontWeight: 700, borderRadius: 8
                }}>
                  <i className="bi bi-box-arrow-in-right me-1"></i>Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

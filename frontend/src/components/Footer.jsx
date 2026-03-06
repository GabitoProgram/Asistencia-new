export default function Footer() {
  return (
    <footer className="py-3 mt-auto" style={{ background: '#0f1352', color: 'rgba(255,255,255,0.7)' }}>
      <div className="container text-center">
        <small>
          &copy; {new Date().getFullYear()} Sistema de Asistencia — Facultad de Medicina, U.M.S.A.
        </small>
      </div>
    </footer>
  );
}

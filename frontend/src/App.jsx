import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import ListaDoctores from './pages/ListaDoctores'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GestionarDoctores from './pages/GestionarDoctores'
import GestionarAdmins from './pages/GestionarAdmins'
import Calendario from './pages/Calendario'
import ReportesCambiosHorarios from './pages/ReportesCambiosHorarios'

function App() {
  const { loading } = useAuth();

  // Mostrar un spinner mínimo mientras carga
  if (loading) {
    return null; // Sin renderizar nada hasta verificar sesión
  }

  return (
    <>
      <Navbar />
      <main className="container py-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<ListaDoctores />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/doctores" element={<PrivateRoute><GestionarDoctores /></PrivateRoute>} />
          <Route path="/admins" element={<PrivateRoute><GestionarAdmins /></PrivateRoute>} />
          <Route path="/calendario" element={<PrivateRoute><Calendario /></PrivateRoute>} />
          <Route path="/reportes-cambios-horarios" element={<PrivateRoute><ReportesCambiosHorarios /></PrivateRoute>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App

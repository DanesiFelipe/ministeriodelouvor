import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLayout from './layouts/AdminLayout';
import Members from './pages/Members';
import Roles from './pages/Roles';
import Bands from './pages/Bands';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Songs from './pages/Songs';
import Notices from './pages/Notices';
import WhatsAppSettings from './pages/WhatsAppSettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="roles" element={<Roles />} />
          <Route path="bands" element={<Bands />} />
          <Route path="songs" element={<Songs />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="notices" element={<Notices />} />
          <Route path="whatsapp" element={<WhatsAppSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

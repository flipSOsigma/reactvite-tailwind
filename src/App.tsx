import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoutes from './utils/protectedRoutes'
import Dashboard from './pages/Dashboard'
import WeddingUpdate from './pages/WeddingUpdate'
import CreateOrderWedding from './pages/WeddingCreate'
function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wedding/create/" element={<CreateOrderWedding />} />
          <Route path="/wedding/update/:uid" element={<WeddingUpdate />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Agenda from './pages/Agenda/Agenda';
import Financeiro from './pages/Financeiro/Financeiro';
import Estoque from './pages/Estoque/Estoque';
import Especialidades from './pages/Especialidades/Especialidades';
import Pacientes from './pages/Pacientes/Pacientes';
import Avaliacoes from './pages/Avaliacoes/Avaliacoes';

export default function App() {
 return <BrowserRouter><Routes>
  <Route element={<MainLayout />}><Route path="/" element={<Home/>}/></Route>
  <Route path="/login" element={<Login/>}/>
  <Route path="/dashboard" element={<Dashboard/>}/>
  <Route path="/pacientes" element={<Pacientes/>}/>
  <Route path="/agenda" element={<Agenda/>}/>
  <Route path="/financeiro" element={<Financeiro/>}/>
  <Route path="/estoque" element={<Estoque/>}/>
  <Route path="/especialidades" element={<Especialidades/>}/>
  <Route path="/avaliacoes" element={<Avaliacoes/>}/>
 </Routes></BrowserRouter>
}

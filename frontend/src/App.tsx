import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './pages/Landing';
import { Simulator } from './pages/Simulator';
import { Dashboard } from './pages/Dashboard';
import { Comparison } from './pages/Comparison';
import { Pipeline } from './pages/Pipeline';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/pipeline" element={<Pipeline />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

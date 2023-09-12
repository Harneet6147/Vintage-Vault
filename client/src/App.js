import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Vault } from './pages/Vault';
import { Listed } from './pages/Listed';
import { DashBoard } from './pages/DashBoard';
import { Owned } from './pages/Owned';
import { Register } from './pages/Register';
import { Navbar } from './components/Navbar';
import { Welcome } from './pages/welcome';

function App() {
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={< Welcome />} />
          <Route path='/vault' element={<Vault />} />
          <Route path='/register' element={<Register />} />
          <Route path='/owned' element={<Owned />} />
          <Route path='/dashboard' element={<DashBoard />} />
          <Route path='/listed' element={<Listed />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

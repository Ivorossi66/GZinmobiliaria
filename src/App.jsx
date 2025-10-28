import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Home } from './pages/Home'
import { Deptos } from './pages/Deptos'
import { ErrorPage } from './pages/ErrorPage'
import { NavigateApp } from './components/NavigateApp'

function App() {

  return (
    <>
      <BrowserRouter>
      <NavigateApp />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deptos/:id" element={<Deptos />} /> {/* :id -- cambia el contenido según el id */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter> 
    </>
  )
}

export default App

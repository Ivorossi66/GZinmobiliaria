import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import "../styles/FormComponent.css";

function TextControlsExample() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [consulta, setConsulta] = useState('');

  const handleWhatsApp = () => {
    const numeroDestino = "3533407785";
    const mensaje = `Hola, soy ${nombre}. Mi teléfono es ${telefono}. Quisiera consultar sobre: ${consulta}`;
    const url = `https://wa.me/${numeroDestino}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="formNombre">
        <Form.Label>Nombre Completo</Form.Label>
        <Form.Control type="text" placeholder="Ingrese su nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formTelefono">
        <Form.Label>Teléfono / WhatsApp</Form.Label>
        <Form.Control
          type="number" placeholder="Ingrese su teléfono" min="0" max="99999999999" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formConsulta">
        <Form.Label>¿Cuál es su consulta?</Form.Label>
        <Form.Control as="textarea" rows={3} value={consulta} onChange={(e) => setConsulta(e.target.value)}/>
      </Form.Group>

      <Button variant="success" onClick={handleWhatsApp}>
        Enviar
      </Button>
    </Form>
  );
}

export default TextControlsExample;

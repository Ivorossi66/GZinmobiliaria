import { Card, CardGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { IoPersonSharp } from "react-icons/io5";
import '../styles/CardComponent.css';
import apart2 from '../assets/images/Apart 2/apart2.5.jpeg';
import apart6 from '../assets/images/Apart 6/apart6.1.jpg';
import apart7 from '../assets/images/Apart 7/apart7.7.jpg';

function CardGroupExample() {
  return (
    <CardGroup>
      <Card>
        <Card.Img variant="top" src={apart2} />
        <Card.Body>
          <Card.Title>Apart 2</Card.Title>
          <Card.Text>
            Enriqueta Funes 130 - Las Varillas, Córdoba
          </Card.Text>
          <div className="card-icons">
            <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp />
          </div>
          <Button as = {Link} to="/deptos/2" variant="primary">Ver más</Button>  {/* Acá le establezco el id */}
        </Card.Body>
      </Card>
      <Card>
        <Card.Img variant="top" src={apart6} />
        <Card.Body>
          <Card.Title>Apart 6</Card.Title>
          <Card.Text>
            Diego Montoya 77 - Las Varillas, Córdoba
          </Card.Text>
          <div className="card-icons">
            <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp />
          </div>
          <Button as = {Link} to="/deptos/6" variant="primary">Ver más</Button>
        </Card.Body>
      </Card>
      <Card>
        <Card.Img variant="top" src={apart7} />
        <Card.Body>
          <Card.Title>Apart 7</Card.Title>
          <Card.Text>
            España 56 - Las Varillas, Córdoba
          </Card.Text>
          <div className="card-icons">
            <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp /> <IoPersonSharp />
          </div>
          <Button as = {Link} to="/deptos/7" variant="primary">Ver más</Button>
        </Card.Body>
      </Card>
    </CardGroup>
  );
}

export default CardGroupExample;
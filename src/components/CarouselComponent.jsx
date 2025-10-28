import { Carousel } from "react-bootstrap";

function CarouselComponent({ imagenes, titulo }) {
  return (
    <Carousel>
      {imagenes.map((img, index) => (
        <Carousel.Item key={index}>
          <img
            className="d-block w-100"
            src={img}
            alt={`slide-${index}`}
            style={{ height: "600px", objectFit: "contain" }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselComponent;
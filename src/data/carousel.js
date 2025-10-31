import apart2img1 from "../assets/images/Apart 2/living.h3.jpg";
import apart2img2 from "../assets/images/Apart 2/living.h2.jpg";
import apart2img3 from "../assets/images/Apart 2/cocina.h2.jpg";
import apart2img4 from "../assets/images/Apart 2/cocina.h1.jpg";
import apart2img5 from "../assets/images/Apart 2/hab.h2.jpg";
import apart2img6 from "../assets/images/Apart 2/hab.h1.jpg";
import apart2img7 from "../assets/images/Apart 2/hab.h4.jpg";
import apart2img8 from "../assets/images/Apart 2/baño.h1.jpg";
import apart2img9 from "../assets/images/Apart 2/baño.h2.jpg";

import apart6img1 from "../assets/images/Apart 6/comedor.h1.jpg";
import apart6img2 from "../assets/images/Apart 6/comedor.h2.jpg";
import apart6img3 from "../assets/images/Apart 6/cocina.h1.jpg";
import apart6img4 from "../assets/images/Apart 6/balcon.h1.jpg";
import apart6img5 from "../assets/images/Apart 6/hab.h4.jpg";
import apart6img6 from "../assets/images/Apart 6/hab.h2.jpg";
import apart6img7 from "../assets/images/Apart 6/baño.h1.jpg";

import apart7img1 from "../assets/images/Apart 7/living.h4.jpg";
import apart7img2 from "../assets/images/Apart 7/living.h2.jpg";
import apart7img3 from "../assets/images/Apart 7/cocina.h1.jpg";
import apart7img4 from "../assets/images/Apart 7/cocina.h2.jpg";
import apart7img5 from "../assets/images/Apart 7/hab.h2.jpg";
import apart7img6 from "../assets/images/Apart 7/hab.h1.jpg";
import apart7img7 from "../assets/images/Apart 7/baño.h1.jpg";
import apart7img8 from "../assets/images/Apart 7/baño.h3.jpg";

export const deptos = [
  {
    id: "2",
    nombre: "Apart 2",
    capacidad: 4,
    precios_senia: {
      1: 22500,
      2: 27500,
      3: 37500,
      4: 45000,
    },
    senia: "Se reserva con un anticipo del 50%",
    direccion: "Enriqueta Funes 130 - Las Varillas, Córdoba",
    ubicacion: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388.3097516247385!2d-62.72255122351951!3d-31.870993218376714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb646d65436c91%3A0x56f45f3c5cd0bfc5!2sEnriqueta%20Funes%20130%2C%20X5940%20Las%20Varillas%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1759679723960!5m2!1ses!2sar" width="850" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    precio: [
      { personas: 1, precio: 45000 },
      { personas: 2, precio: 55000 },
      { personas: 3, precio: 75000 },
      { personas: 4, precio: 90000 },
    ],
    descuento: "Grupo familiar de 4 personas a partir del tercer dia 10% de descuento",
    servicios: ["Wifi", "Aire acondicionado", "TV", "Cocina equipada", "Vajilla completa", "Espacios totalmente amoblados", "Confort"],
    descripcion: "Estar-Comedor con sillón cama / Ante-Baño / Baño / 2 patios de luz / 2 dormitorios",
    horario: "Check In: 13:00 hs – Check Out: 10:00 hs",
    imagenes: [apart2img1, apart2img2, apart2img3, apart2img4, apart2img5, apart2img6, apart2img7, apart2img8, apart2img9]
  },
  {
    id: "6",
    nombre: "Apart 6",
    capacidad: 4,
    precios_senia: {
      1: 20000,
      2: 25000,
      3: 32500,
      4: 40000,
    },
    senia: "Se reserva con un anticipo del 50%",
    direccion: "Diego Montoya 77 - Las Varillas, Córdoba",
    ubicacion: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388.358446414122!2d-62.72429272351959!3d-31.869668818311798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb6472b37e96b5%3A0xa8c13662986643f2!2sDr.%20Montoya%2077%2C%20X5941%20Las%20Varillas%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1759685504902!5m2!1ses!2sar" width="850" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    precio: [
      { personas: 1, precio: 40000 },
      { personas: 2, precio: 50000 },
      { personas: 3, precio: 65000 },
      { personas: 4, precio: 80000 },
    ],
    descuento: "Grupo familiar de 4 personas a partir del tercer dia 10% de descuento",
    servicios: ["Wifi", "Aire acondicionado", "TV", "Cocina equipada", "Vajilla completa", "Espacios totalmente amoblados", "Confort"],
    descripcion: "Estar-Comedor / Baño / Cocina integrada al comedor / Balcón con vista al complejo / Dormitorio con cama Matrimonial / 2 camas individuales / 1 habitación",
    horario: "Check In: 13:00 hs – Check Out: 10:00 hs",
    imagenes: [apart6img1, apart6img2, apart6img3, apart6img4, apart6img5, apart6img6, apart6img7]
  },
  {
    id: "7",
    nombre: "Apart 7",
    capacidad: 4,
    precios_senia: {
      1: 20000,
      2: 25000,
      3: 32500,
      4: 40000,
    },
    senia: "Se reserva con un anticipo del 50%",
    direccion: "España 56 - Las Varillas, Córdoba",
    ubicacion: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388.3683660457996!2d-62.72230302351953!3d-31.869399018298626!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95cb646d4c2aeabb%3A0x15b6142c4e83d3c2!2sEspa%C3%B1a%2056%2C%20X5941%20Las%20Varillas%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1759685341212!5m2!1ses!2sar" width="850" height="600" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    precio: [
      { personas: 1, precio: 40000 },
      { personas: 2, precio: 50000 },
      { personas: 3, precio: 65000 },
      { personas: 4, precio: 80000 },
    ],
    descuento: "Grupo familiar de 4 personas a partir del tercer dia 10% de descuento",
    servicios: ["Wifi", "Aire acondicionado", "TV", "Cocina equipada", "Vajilla completa", "Espacios totalmente amoblados", "Confort"],
    descripcion: "Estar-Comedor con sillón cama / Baño / Cocina separada / Patio de Luz / Dormitorio con cama Matrimonial / 1 habitación",
    horario: "Check In: 13:00 hs – Check Out: 10:00 hs",
    imagenes: [apart7img1, apart7img2, apart7img3, apart7img4, apart7img5, apart7img6, apart7img7, apart7img8]
  },
];
let mic, amplitude, fft;
let micReady = false;

let fondo;
let bordes = [];
let rellenos1 = [];
let rellenos2 = [];

let threshold = 0.015;
let Dibujos = [];
let tiempoUltimoDibujo = 0;
let tiempoEspera = 300; // milisegundos (0.3s)
let duracionDibujo = 5000; // 5 segundos
let sonidoActivoDesde = null;
let dibujoActual = null; // Guarda el último dibujo creado

function preload() {
  fondo = loadImage("imagenes/fondo.png");

  // Cargar 5 bordes
  bordes.push(loadImage("imagenes/delineado.png")); // primer borde sin número
  for (let i = 1; i <= 4; i++) {
    bordes.push(loadImage(`imagenes/delineado${i}.png`));
  }

  // Colores disponibles
  let colores = ["amarillo", "azul", "bordo", "rojo", "verde"];

  // Cargar rellenos para cada delineado
  for (let i = 0; i <= 4; i++) {
    let grupo = [];
    let baseNombre = i === 0 ? "relleno" : `relleno${i}`;
    for (let color of colores) {
      grupo.push(loadImage(`imagenes/${baseNombre}_${color}.png`));
    }
    rellenos1.push(grupo); // rellenos1 es un array de arrays de imágenes
  }
}


function setup() {
  createCanvas(fondo.width, fondo.height);
  imageMode(CENTER);

  mic = new p5.AudioIn();
  mic.start(
    () => {
      console.log("✅ Micrófono activado correctamente");
      mic.connect();

      amplitude = new p5.Amplitude();
      amplitude.setInput(mic);

      fft = new p5.FFT();
      fft.setInput(mic);

      micReady = true;
    },
    (err) => {
      console.error("❌ Error al activar el micrófono:", err);
    }
  );

}function draw() {
  if (!micReady || !amplitude) {
    background(200);
    fill(0);
    text("Esperando al micrófono...", 20, 30);
    return;
  }

  background(230, 244, 254);
  image(fondo, width / 2, height / 2);

  let ahora = millis();
  let level = amplitude.getLevel();

  // Dibujar y filtrar dibujos vivos
  Dibujos = Dibujos.filter((d) => d.estaVivo());
  for (let d of Dibujos) {
    d.dibujar();
  }

  if (level > threshold) {
    if (sonidoActivoDesde === null) {
      sonidoActivoDesde = ahora;
    }

    // Crear un nuevo dibujo si pasó el tiempo suficiente
    if (ahora - tiempoUltimoDibujo > tiempoEspera) {
      dibujoActual = agregarDibujo(level);
      tiempoUltimoDibujo = ahora;
    }

    // Si el sonido lleva más de 3 segundos sostenido
    if (dibujoActual && ahora - sonidoActivoDesde > 3000) {
      dibujoActual.incrementarRotacion();
    }

  } else {
    sonidoActivoDesde = null; // reiniciar si el sonido se corta
  }
}

// Clase Dibujo
class Dibujo {
  constructor(x, y, tam, rellenos, borde, rotacionInicial) {
    this.x = x;
    this.y = y;
    this.tam = tam;
    this.rellenos = rellenos; // array de imágenes
    this.borde = borde;
    this.rotacion = rotacionInicial;
    this.tiempoCreacion = millis();
    this.velRotacion = 0;

    // Para transición de color
    this.colorIndex = 0;
    this.transicionVel = 0.02; // velocidad de transición
  }

  estaVivo() {
    return millis() - this.tiempoCreacion < duracionDibujo;
  }

  incrementarRotacion() {
    this.velRotacion += 0.01;

    // Avanzar el índice de color
    this.colorIndex += this.transicionVel;
    if (this.colorIndex >= this.rellenos.length) {
      this.colorIndex = 0;
    }
  }

  dibujar() {
    let vida = millis() - this.tiempoCreacion;
    let alpha = vida < duracionDibujo - 1000
      ? 255
      : map(vida, duracionDibujo - 1000, duracionDibujo, 255, 0);

    // Elegir imágenes entre las cuales interpolar
    let idxA = floor(this.colorIndex) % this.rellenos.length;
    let idxB = (idxA + 1) % this.rellenos.length;
    let inter = this.colorIndex % 1;

    // Para simular interpolación visual: cambiamos de imagen bruscamente entre frames
    let imagenInterpolada = inter < 0.5 ? this.rellenos[idxA] : this.rellenos[idxB];

    push();
    translate(this.x, this.y);
    rotate(this.rotacion + this.velRotacion);
    tint(255, alpha);
    image(imagenInterpolada, 0, 0, this.tam, this.tam);
    image(this.borde, 0, 0, this.tam, this.tam);
    pop();
  }
}

function agregarDibujo(level) {
  let tipo = floor(random(0, bordes.length)); // entre 0 y 4
  let tam = map(level, threshold, 0.3, 50, 200, true);
  let x = random(100, width - 100);
  let y = random(100, height - 100);
  let rotacion = random(-PI, PI);

  let rellenoSet = rellenos1[tipo]; // conjunto correspondiente
  let borde = bordes[tipo];

  let rellenosClon = shuffle(rellenoSet.slice());
  let nuevoDibujo = new Dibujo(x, y, tam, rellenosClon, borde, rotacion);
  Dibujos.push(nuevoDibujo);
  return nuevoDibujo;
}

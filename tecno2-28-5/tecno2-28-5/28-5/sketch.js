// variables  sonido
let mic; // micrófono
let amp; // amplitud del sonido
let frec; // frecuencia del sonido
let fft; // frecuencia

// variables de calibracion
ampMin = 0.07; // valor mínimo de amplitud
ampMax = 0.3; // valor máximo de amplitud

// variables del programa
let c;
let fondo;
let margen = 50;
let caminantes = [];

function preload() {
  fondo = loadImage("data/img-fondo.png");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  image(fondo, 0, 0, width, height);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  c = new Caminante();
  caminantes.push(c);
}

function draw() {

  c.mover(frec);
  

  amp = mic.getLevel();

   //  frecuencia 
  let spectrum = fft.analyze();
  let freq = fft.getCentroid(); // frecuencia dominante en Hz

  // Cambia el tamaño del círculo según el volumen
  c.t = map(amp, 0, 0.5, 50, 400, true);

  //  Mover según frecuencia  
  let freqGrave = 200; // Hz
  let freqAguda = 1000; // Hz

  if (freq < freqGrave) {
    c.y += c.dir * 1; // Grave: baja
  } else if (freq > freqAguda) {
    c.y -= c.dir * 1; // Agudo: sube
  }
 

  // Cuando el volumen supera el umbral, crea un nuevo círculo/caminante
  //let umbral = 0.1;
  //if (amp > umbral) {
    //let nuevo = new Caminante();
    //nuevo.x = c.x;
    //nuevo.y = c.y;
    //nuevo.t = c.t;
    //caminantes.push(nuevo);
  //}

  // Dibuja todos los círculos/caminantes
  for (let cam of caminantes) {
    cam.dibujar();
  }

  if(keyIsDown(69)){ // e
    c.mayorFrec(); //más agudo
  } else if(keyIsDown(81)){ // q
    c.menorFrec(); //más grave
  }

  amp = mic.getLevel();
  //calibrar();
  console.log("Calibración completada: " + ampMin + " - " + ampMax);
  push();
  textSize(50);
  fill(0);
  text("AMPLITUD: " + nfc(amp, 4), margen, margen);
  pop();
}

/*function keyPressed() {
  if (keyCode === 87) { // w
    c.mayorAmpl();
  } else if (keyCode === 83) { // s
    c.menorAmpl();
  } else if (keyCode === 65) { // a
    c.mayorDurac();
  } else if (keyCode === 68) { // d
    c.menorDurac();
  }
}*/

function mousePressed() {
  c.sinInterac();
  userStartAudio();
  c.sinInterac();
}

function calibrar() { // calibrar el micrófono
  console.log("Calibración completada: " + ampMin + " - " + ampMax);
  push();
  textSize(50);
  fill(255);
  text("AMPLITUD: " + nfc(amp, 4), margen, margen);
  pop();
}

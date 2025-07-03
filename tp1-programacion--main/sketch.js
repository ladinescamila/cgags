// variables de sonido
let mic; // micrófono
let amp; // amplitud del sonido


let pitch; // tono del sonido
let audioContext; // contexto de audio
let frecCruda; // frecuencia del sonido
let gestorFrec; // objeto gestor de frecuencia
let ampCruda; // amplitud cruda del micrófono

// variables de calibracion
let ampMin = 0.04; // valor mínimo de amplitud
let ampMax = 0.9; // valor máximo de amplitud
let AMORTIGUACION = 0.9; // factor de amortiguación para la amplitud
let monitor =  false;
let FRECUENCIA_MIN = 100; 
let FRECUENCIA_MAX = 1500; 

const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/'; // modelo entrenado para reconocer frecuencia

let haySonido = false // variable para saber si hay sonido
let antesHabiaSonido = false; // variable para saber si antes había sonid
let enSilencio = false;
// variables del programa
let c;
let fondo;
let margen = 10;

// Gestor
let gestorAmp; // objeto gestor de señal

let tiempoSilencio = 0;
let umbralSilencio = 3 * 60; // 3 segundos si usas 60 FPS

function preload() {
  fondo = loadImage("data/img-fondo.png");
}
function setup() {
  createCanvas(640, windowHeight);
  image(fondo, 0, 0, width, height);

  mic = new p5.AudioIn();
  //document.getElementById("startButton").addEventListener("click", () => {
  userStartAudio().then(() => {
    mic.start(startPitch);
  });

  c = new Caminante;

  //Gestor
  gestorAmp = new GestorSenial(ampMin, ampMax); //inicializa el gestor de señal con los valores mínimos y máximos de amplitud
  gestorAmp.f= AMORTIGUACION; // establece el factor de amortiguación para el gestor de señal
  audioContext = getAudioContext();
  mic.start(startPitch); // inicia el micrófono y llama a startPitch cuando esté listo


  userStartAudio(); // para que funcione el micrófono en algunos navegadores
  gestorFrec = new GestorSenial(FRECUENCIA_MIN, FRECUENCIA_MAX);
}

function draw() {
//background(0); // para callibrar

  ampCruda = mic.getLevel(); // señal de entrada de mic DIRECTA

  gestorAmp.actualizar(ampCruda); // el gestor está procesando la señal de entrada (ampmlitud cruda / directa)
  amp = gestorAmp.filtrada; // obtiene la amplitud filtrada del gestor de señal
  haySonido = amp > ampMin; // si hay sonido
  
  let empezoElSonido = haySonido && !antesHabiaSonido; // si empezó el sonido
  
  if (haySonido){
    c.dibujar();
    c.actualizar();
  }

  if (empezoElSonido) {
    c = new Caminante();
  }

  let umbral = 0.09; // Usa el umbral que ya funciona para ti

  if (gestorFrec && gestorFrec.filtrada > 0 && amp > ampMin) {
    tiempoSilencio = 0;
    if (enSilencio) {
      enSilencio = false; // Salió del silencio
    }
    c.moverPorFrecuencia(gestorFrec.filtrada, umbral);
    if (gestorFrec.filtrada < umbral) {
      c.menorFrec();
    } else {
      c.mayorFrec();
    }
  } else {
    tiempoSilencio++;
    if (tiempoSilencio > umbralSilencio) {
      enSilencio = true;
    }
    c.moverPorFrecuencia(gestorFrec ? gestorFrec.filtrada : 0, umbral); // Sigue moviéndose aunque esté en silencio
  }

// Cambia a gris si está en silencio
if (enSilencio) {
  //c.sinInterac();
}

/*if(keyIsDown(69)){ // e
    c.mayorFrec(); //más agudo
  } else if(keyIsDown(81)){ // q
    c.menorFrec(); //más grave
  }*/

  //calibrar();
  if(monitor){
    imprimir();
  }

  antesHabiaSonido = haySonido; // actualiza la variable antesHabiaSonido

} 


//Pitch detection
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      frecCruda = frequency;
      gestorFrec.actualizar(frecCruda);
    }
    getPitch(); // vuelve a escuchar
  });
}

function keyPressed() {
  /*if (keyCode === 87) { // w
    c.mayorAmpl();
  } else if (keyCode === 83) { // s
    c.menorAmpl(); 
    }*/
   if (keyCode === 65) { // a
    c.mayorDurac();
  } else if (keyCode === 68) { // d
    c.menorDurac();
  }
}

function mousePressed() {
  //c.sinInterac();
}

function calibrar() { // calibrar el micrófono
  push();
  textSize(50);
  fill(0);
  text("AMPLITUD: " + nfc(amp, 4), margen, margen);
  pop();
  gestorAmp.dibujar(0, height - 100); // dibuja el gestor de señal en la parte inferior de la pantalla
}

function imprimir(){
  background(0);
  push();
  textSize(20);
  fill(255);
  let texto = "Amplitud Cruda: " + ampCruda;
  text(texto, 50, 50);

  texto = "Frecuencia Cruda: " + frecCruda;
  text(texto, 50, 100);

  noStroke();
  fill(255, 0, 0);
  let posY = map(ampCruda, ampMin, ampMax, height, 0  );
  ellipse(width/2 - 50, posY, 50, 50 );

  fill(0, 255, 0);
  posY = map(amp, 0, 1, height, 0  );
  ellipse(width/2 +  50, posY, 50, 50 );

  gestorAmp.dibujar(50, 150);
  gestorFrec.dibujar(50, 300);

  pop();

if (gestorFrec.filtrada > 0) {
  console.log("Frecuencia filtrada:", gestorFrec.filtrada);
  if (gestorFrec.filtrada < umbral) {
    c.menorFrec(); // Grave: azul
  } else {
    c.mayorFrec(); // Agudo: rojo
  }
}

}


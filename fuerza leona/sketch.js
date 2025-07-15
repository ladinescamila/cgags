/* para que respondiera bien a mi mic:
cambie los valores de VolMin 
agregué VolMax y lo voy cambiando segun se necesite
puse cosas como userStartAudio()
y mic.getLevel() en el draw

cami */

let mic, amplitude, fft;
let micReady = false;

// VARIABLES DE CALIBRACIÓN DEL MICRÓFONO
let volMin = 0.05; 
let volMax = 0.5; 
let freqMin = 170; // graves
let freqMax = 171; // agudos

let Dibujos = [];
let duracionDibujo = 10000;
let margen = 10; 

let sonidoActivo = false;
let sonidoActivoDesde = null;
let dibujosActuales = [];

// variables para la opacidad del fondo
let alphaFondo = 255;        // valor inicial -> se interpola para hacer el fade
let alphaMin = 168;          // 66% de opacidad
let alphaRecuperacion = 3;   // velocidad de recuperación
let alphaOscurecimiento = 3; // qué tan rápido baja la opacidad
let alphaFondoObjetivo = 255; // el alpha deseado

function preload() {
  cargarImagenes(); // desde gestor.js
}

function setup() {
  createCanvas(fondo.width, fondo.height);
  imageMode(CENTER);

  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(() => {
    mic.connect();
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    fft = new p5.FFT();
    fft.setInput(mic);
    micReady = true;
  }, (err) => {
    console.error("❌ Error al activar el micrófono:", err);
  });
  userStartAudio();
}

function draw() {
  if (!micReady || !amplitude) {
    background(200);
    fill(0);
    text("Esperando al micrófono...", 20, 30);
    return;
  }

  // Fondo: imagen con opacidad variable sobre negro
  background(0); 
  tint(255, alphaFondo);
  image(fondo, width / 2, height / 2);
  tint(255, 255); // reset para otros elementos
  let ahora = millis();
  let level = amplitude.getLevel(); // LEVEL ES AMPLITUD DEL MICRÓFONO

  mic.getLevel(); // Actualizar el nivel del micrófono

  // Dibujos activos
  Dibujos = Dibujos.filter(d => d.estaVivo());
  for (const d of Dibujos) {
    d.dibujar();
  }

  calibrar(); // Mostrar info de audio, cuando no es necesario se comenta

  const freq = obtenerFrecuenciaDominante();
  const tipoSonido = freq < 400 ? "Grave" : "Agudo";
  text(`🎵 Frecuencia: ${nf(freq, 1, 2)} Hz (${tipoSonido})`, 20, 40);

  if (level > volMin && level < volMax) {
    if (!sonidoActivo) {
      sonidoActivo = true;
      sonidoActivoDesde = ahora;
      dibujosActuales = agregarDibujos(level);

      // Oscurecer el fondo con tope
      alphaFondoObjetivo = alphaMin;
    }
    
    if (ahora - sonidoActivoDesde > 1200) {
      for (let d of dibujosActuales) {
        d.incrementarRotacion();
      }
    }
  } else {
    if (sonidoActivo) {
      for (let d of dibujosActuales) {
        if (d.esProlongado) d.comenzarCountdown();
      }
    }
    sonidoActivo = false;
    sonidoActivoDesde = null;

    // Recuperar suavemente el fondo
    alphaFondoObjetivo = 255;
  }

    //  Interpolación suave del alphaFondo hacia el de objetivo
  if (alphaFondo < alphaFondoObjetivo) {
    alphaFondo = min(alphaFondo + alphaRecuperacion, alphaFondoObjetivo);
  } else if (alphaFondo > alphaFondoObjetivo) {
    alphaFondo = max(alphaFondo - alphaOscurecimiento, alphaFondoObjetivo);
  }
}
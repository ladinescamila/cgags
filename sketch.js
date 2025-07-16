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
let alphaFondo = 255;        
let alphaMin = 168;          
let alphaRecuperacion = 3; 
let alphaOscurecimiento = 3;
let alphaFondoObjetivo = 255; 

function preload() {
  cargarImagenes();
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
    console.error("Error al activar el micrófono:", err);
  });
  userStartAudio();
}

function draw() {
  if (!micReady || !amplitude) {
    background(200);
    fill(0);
    text("Esperando al micrófono", 20, 30);
    return;
  }

  // fondo
  background(0); 
  tint(255, alphaFondo);
  image(fondo, width / 2, height / 2);
  tint(255, 255); 
  let ahora = millis();
  let level = amplitude.getLevel(); // LEVEL ES AMPLITUD DEL MICRÓFONO

  mic.getLevel(); 

  // dibujos 
  Dibujos = Dibujos.filter(d => d.estaVivo());
  for (const d of Dibujos) {
    d.dibujar();
  }

  calibrar(); // cuando no es necesario se comenta

  const freq = obtenerFrecuenciaDominante();
  const tipoSonido = freq < 400 ? "Grave" : "Agudo";
  text(`🎵 Frecuencia: ${nf(freq, 1, 2)} Hz (${tipoSonido})`, 20, 40);

  if (level > volMin && level < volMax) {
    if (!sonidoActivo) {
      sonidoActivo = true;
      sonidoActivoDesde = ahora;
      dibujosActuales = agregarDibujos(level);

      // oscurecer el fondo con tope
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

    // recuperar suavemente el fondo
    alphaFondoObjetivo = 255;
  }

  if (alphaFondo < alphaFondoObjetivo) {
    alphaFondo = min(alphaFondo + alphaRecuperacion, alphaFondoObjetivo);
  } else if (alphaFondo > alphaFondoObjetivo) {
    alphaFondo = max(alphaFondo - alphaOscurecimiento, alphaFondoObjetivo);
  }
}
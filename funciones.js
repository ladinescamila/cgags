function calibrar(){
  let level = amplitude.getLevel();

  // mostrar info de audio
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`🎚 Volumen: ${nf(level, 1, 3)}`, 20, 20);
}

function obtenerFrecuenciaDominante() {
  const spectrum = fft.analyze();
  let maxIndex = 0;
  let maxEnergy = 0;

  for (let i = 0; i < spectrum.length; i++) {
    if (spectrum[i] > maxEnergy) {
      maxEnergy = spectrum[i];
      maxIndex = i;
    }
  }

  const nyquist = sampleRate() / 2;
  return maxIndex * nyquist / spectrum.length;
}

function agregarDibujos(level) {
  const freq = obtenerFrecuenciaDominante();

  // Índices colores: 0=amarillo,1=azul,2=bordo,3=rojo,4=verde
  let indicesDeseados;
  if (freq < freqMin) {
    indicesDeseados = [1, 4, 2]; // grave: azul, verde, bordo
  } else if (freq > freqMax) {
    indicesDeseados = [3, 0]; // agudo: rojo, amarillo
  } else {
    indicesDeseados = [0, 1, 2, 3, 4]; // medio: todos
  }

  const nuevos = [];
  for (let i = 0; i < 5; i++) {
    const tipo = floor(random(0, bordesDibujo.length));
    const tam = map(level, volMin, volMax, 100, 300, true);
    const x = random(margen, width - margen);
    const y = random(margen, height - margen);
    const rotacion = random(-PI, PI);

    const rellenoSetCompleto = rellenosDibujo[tipo];
    const rellenosFiltrados = indicesDeseados.map(i => rellenoSetCompleto[i]);
    const rellenosClon = shuffle(rellenosFiltrados.slice());
    const borde = bordesDibujo[tipo];

    const nuevo = new Dibujo(x, y, tam, rellenosClon, borde, rotacion);
    Dibujos.push(nuevo);
    nuevos.push(nuevo);
  }
  return nuevos;
}

class Caminante {
    constructor() {
        this.x = int(random(margen, width - margen));
        this.y = int(random(margen, height - margen));
        this.t = 150;
        //this.distancia = 50;
        this.miColor = color(0, 255, 0);

        //this.dir = radians(30);
        //this.velocidad = 50;

        this.theta = random(TWO_PI); // ángulo inicial aleatorio
        this.step = 5; // tamaño del paso
        this.dir = 1;
    }
    dibujar() {
        fill(this.miColor);
        strokeWeight(5);
        ellipse(this.x, this.y, this.t, this.t);
    }
    mover(freq) {
        //this.dir += radians( random(-10,10) );

        /*let dx = this.velocidad * cos( this.dir );
        let dy = this.velocidad * sin( this.dir );*/

        //this.x += dx;
        //this.y += dy;

        //sistema toroidal
        //         condicion      valor-si       valor-no
        /*this.x = ( this.x>width ? this.x-width : this.x ); 
        this.x = ( this.x<0 ? this.x+width : this.x ); 
        this.y = ( this.y>height ? this.y-height : this.y );
        this.y = ( this.y<0 ? this.y+height : this.y );*/

        // COPILOT
        // Cambia el ángulo aleatoriamente para moverse en distintas direcciones
        //this.theta += random(-PI / 8, PI / 8);
        // Define los umbrales de frecuencia
        let freqGrave = 200; // Hz
        let freqAguda = 1000; // Hz

        // Ajusta el ángulo según la frecuencia
        if (freq < freqGrave) {
            // Grave: hacia abajo (PI/2)
            this.theta = PI / 2 + random(-PI / 8, PI / 8);
        } else if (freq > freqAguda) {
            // Aguda: hacia arriba (-PI/2)
            this.theta = -PI / 2 + random(-PI / 8, PI / 8);
        } else {
            // Medio: dirección aleatoria
            this.theta += random(-PI / 8, PI / 8);
        }

        // Calcula el nuevo x, y usando coordenadas polares
        this.x += this.step * cos(this.theta);
        this.y += this.step * sin(this.theta);

        // Opcional: Mantener dentro de la pantalla
        this.x = constrain(this.x, 0, width);
        this.y = constrain(this.y, 0, height);
    }
    mayorAmpl() {
        this.t += 50;
    }
    menorAmpl() {
        this.t -= 50;
    }
    mayorFrec() { // más agudo
        this.x += this.distancia;
        this.y += this.distancia;
    }
    menorFrec() { // más grave
        this.x -= this.distancia;
        this.y -= this.distancia;
    }
    mayorDurac() { // aumenta la distancia recorrida
        this.distancia += 10;
    }
    menorDurac() {
        this.distancia -= 10;
    }
    sinInterac() {
        this.miColor = color(200);
    }
    
}
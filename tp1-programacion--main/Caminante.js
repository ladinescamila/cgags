class Caminante{
    constructor(){
        this.x= int(random(margen, width-margen));
        this.y= int(random(margen, height-margen));
        this.t = 10;
        this.distancia = 10;
        this.miColor = color(0, 255, 0);
        //this.vel = 2;
        //this.dir = radians( 30 );
    }
    dibujar(){ // hay q cambiarlo x la img
        fill(this.miColor); 
        strokeWeight(1);
        //noStroke();
        ellipse(this.x, this.y, this.t, this.t);
    }

    actualizar(){ // actualiza el tamaño segun la amplitud del micrófono
      this.t = map(amp, ampMin, ampMax, 10, 200);
      //this.x += this.distancia; //* cos(radians(45)); // mueve en diagonal
      //this.y += this.distancia; // sin(radians(45)); // mueve en diagonal
    }
        /*interacciones
    mayorAmpl(){ //auenta el tamaño 
        this.t += 50;
    }
    menorAmpl(){
        this.t -= 50;
    }*/
    
    mayorFrec(){ // mas agudo
        this.miColor = color(255, 0, 0); // cambia el color a rojo
        /* this.x += this.distancia;
        this.y += this.distancia;

        //sistema toroidal
        //         condicion      valor-si       valor-no
        this.x = ( this.x>width ? this.x-width : this.x ); 
        this.x = ( this.x<0 ? this.x+width : this.x ); 
        this.y = ( this.y>height ? this.y-height : this.y );
        this.y = ( this.y<0 ? this.y+height : this.y );*/
    }
    menorFrec(){ // mas grave
        this.miColor = color(0, 0, 255); // cambia el color a azul
        /*this.x -= this.distancia;
        this.y -= this.distancia;

        this.x = ( this.x>width ? this.x-width : this.x ); 
        this.x = ( this.x<0 ? this.x+width : this.x ); 
        this.y = ( this.y>height ? this.y-height : this.y );
        this.y = ( this.y<0 ? this.y+height : this.y );*/
    }
    mayorDurac(){ // aumenta la distancia recorrida
        this.distancia += 10;
    }
    menorDurac(){
        this.distancia -= 10;
    }
    sinInterac() {
        this.miColor = color(150); // Gris
    }
    moverPorFrecuencia(frec, umbral) {
        let velocidad = 5; // Puedes ajustar la velocidad
        if (frec < umbral) {
            this.y += velocidad; // Grave: baja
        } else {
            this.y -= velocidad; // Agudo: sube
        }
        // Limita para que no salga de la pantalla
        this.y = constrain(this.y, margen, height - margen);
    }
}
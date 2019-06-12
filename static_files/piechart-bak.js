const vistasPorAct2=()=>{
    var miCanvas = document.getElementById('canvas');
    miCanvas.width = 300;
    miCanvas.height = 300;
    var visitas = {
        "Módulo 0": 367,
        "Módulo 1": 277,
        "Módulo 2": 207,
        "Módulo 3": 652,
        "Sintesis del curso": 19
    }

    var ctx = miCanvas.getContext("2d");
    var grafico = new Piechart({
        canvas:miCanvas,
        data:visitas,
        colores:["#fde23e","#f16e23", "#57d9ff","#937e88","#A02A2A"]
    })
    grafico.dibujar()
}

var Piechart = function(params){
    console.log("hola")
    this.params = params;
    this.canvas = this.params.canvas;
    //getContext retorna un objeto que nos permite dibujar dentro de un canvas
    this.ctx = this.canvas.getContext("2d");
    this.colores = this.params.colores;

    this.dibujar = function(){
        var total = 0;
        var valor_mod = 0;
        let data = this.params.data;
        //primero extraigo la cant de visitas de cada modulo y las sumo para obtener el total
        for (var interacciones in data){
            valor_mod = data[interacciones]
            total += valor_mod;
        }
        //luego dibujo el slice de cada uno de los datos
        var ang_ini=0;
        var angulo_slice;
        valor_mod = 0;
        const ancho = this.canvas.width/2;
        const alto = this.canvas.height/2;
        var x = 0;
        for (var interacciones in this.params.data){

            valor_mod = data[interacciones];
            angulo_slice = 2 * Math.PI * valor_mod/total;

            dibujarSlice(
                this.ctx,
                ancho,
                alto,
                Math.min(ancho,alto),
                ang_ini,
                ang_ini+angulo_slice,
                this.colores[x]
            );
            x+=1;
            ang_ini+=angulo_slice;
        }
    }
}

function dibujarLinea(ctx,iniX,endX,iniY,endY){
    ctx.beginPath();
    ctx.moveTo(iniX,iniY);
    ctx.lineTo(endX,endY);
    //stroke se encarga de realmente dibujar la linea
    ctx.stroke();
}
function dibujarArco(ctx,centroX,centroY,radio,initAngulo,endAngulo){
    ctx.beginPath();
    ctx.arc(centroX,centroY,radio,initAngulo,endAngulo);
    ctx.stroke();
}
function dibujarSlice(ctx,centroX,centroY,radio,initAngulo,endAngulo,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centroX,centroY);
    ctx.arc(centroX,centroY,radio,initAngulo,endAngulo);
    ctx.closePath();
    ctx.fill();
}
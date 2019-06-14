
const clickParser = (res)=>{
    return "<br>"+res.interacciones.join(',')+"<br>"
}


const crearTabla = (rangos)=>{
    //como los valores estan guardados en un array de 3 dimensiones, debo sacarlos y dejarlos en un
    //unico array
    for (let i = 0; i < rangos.length; i++) {
        const tipo = rangos[i];
        //en nros voy a guardar los valores de cada rango
        let nros = [];
        tipo.forEach(cantPersonas =>{
            cantPersonas.forEach(elem=>{
                nros.push(elem)
            })
        })
        añadirFila(nros,i+1)
    }

}

const añadirFila=(texto,nroRango)=>{
    //obtengo la tabla de la pagina
    var tabla = document.getElementById("tabla");
    //obtengo la ultima fila
    var newRow = tabla.insertRow(tabla.rows.length);

    //inserto celda con el nombre de la fila
    var celda = newRow.insertCell(0).innerHTML="<b>Rango "+nroRango+"</b>"
    //inserto celdas con los valores
    texto.forEach(element => {
        //el -1 indica que añada una celda en la ultima posicion
        var celda = newRow.insertCell(-1)
        celda.innerHTML = element
    });
}

const resParser = (res)=>{
    //esta funcion extrae y muestra los datos relevantes obtenidos(como el minimo,el maximo, etc)
    const min = "<b>Valor mínimo: </b>"+res.valores.min+"<br>";
    const max = "<b>Valor máximo: </b>"+res.valores.max+"<br>";
    const q1  = "<b>Cuartil 1: </b>"+res.valores.q1+"<br>";
    const q3  = "<b>Cuartil 3: </b>"+res.valores.q3+"<br>";
    const mediana = "<b>Mediana: </b>"+res.valores.mediana+"<br>";
    const media = "<b>Media: </b>"+res.valores.media+"<br>";
    const rango = "<b>Rango: </b>"+res.valores.rango+"<br>";
    const ref1 = "<b>Referencia 1: </b>"+res.valores.ref1+"<br>";
    const ref2 = "<b>Referencia 2: </b>"+res.valores.ref2+"<br>";
    const ref3 = "<b>Referencia 3: </b>"+res.valores.ref3+"<br>";
    const ref4 = "<b>Referencia 4: </b>"+res.valores.ref4+"<br>";

    const rel_info = min+max+q1+q3+mediana+media+rango+ref1+ref2+ref3+ref4;        
    return rel_info;
}

$(document).ready(()=>{

    $.when(
        $.ajax({
            url: 'graficocaja',
            method: 'GET',
            dataType:'json'
        }),
        $.ajax({
            url: 'actmasusada',
            method: 'GET',
            dataType:'json'
        })
    ).then(function(resp1,resp2){
        // console.log(resp1[0])
        document.getElementById('resultados').innerHTML = resParser(resp1[0]);
        document.getElementById('clicks').innerHTML = clickParser(resp1[0]);
        crearTabla(resp1[0].tabla);
        console.log("Más visitada: "+resp2[0].masUsado);  
        document.getElementById('masvisitas').innerHTML = "Actividad más visitada: "+resp2[0].masUsado;
        vistasPorAct(resp2[0].data);
    })
})

function getRandomColor(cant) {
    //elementos del sistema hexadecimal
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < cant; i++) {
        //tomo 6 letras/nros aleatorios de los posibles en el sistema hexadecimal
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

const vistasPorAct = (datos)=>{
    var miCanvas = document.getElementById("canvas");
    var ctx = miCanvas.getContext("2d");

    let labels = [];
    let data = [];
    let colors = [];

    var elem = "";
    for (let i = 0; i < datos.length; i++) {
        elem = datos[i];
        labels.push(elem.Nombre.split(":")[0]);
        data.push(elem.CantInteracciones);
        colors.push(getRandomColor(datos.length));
    }

    var pie = new Chart(ctx,{
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                backgroundColor:colors,
                data: data
            }]
        },
    });
}

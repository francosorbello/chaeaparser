//como los valores estan guardados en un array de 3 dimensiones, debo sacarlos y dejarlos en un unico array
const crearTabla = (rangos,limites)=>{
    //obtengo los titulos para los rangos
    let titulos = displayRangos(limites);
    for (let i = 0; i < rangos.length; i++) {
        const tipo = rangos[i];
        //en nros voy a guardar los valores de cada rango
        let nros = [];
        tipo.forEach(cantPersonas =>{
            cantPersonas.forEach(elem=>{
                nros.push(elem)
            })
        })
        añadirFila(nros,titulos[i],"tablagen")
    }

}
const crearTabla2 = (interacciones,titulos)=>{
    for (let i = 0; i < interacciones.length; i++) {
        añadirFila(interacciones[i],titulos[i],"tablaact")
        
    }
}

const displayRangos = (limites)=>{
    return [
        "Entre "+limites.min+" y "+limites.q1,
        "Entre "+limites.q1+" y "+limites.q2,
        "Entre "+limites.q2+" y "+limites.q3,
        "Entre "+limites.q3+" y "+limites.max,
    ]
}

const añadirFila=(texto,titulo,id)=>{
    //obtengo la tabla de la pagina
    var tabla = document.getElementById(id);
    //obtengo la ultima fila
    var newRow = tabla.insertRow(tabla.rows.length);

    //inserto celda con el nombre de la fila
    var celda = newRow.insertCell(0).innerHTML="<b>"+titulo+"</b>"
    //inserto celdas con los valores
    texto.forEach(element => {
        //el -1 indica que añada una celda en la ultima posicion
        var celda = newRow.insertCell(-1)
        celda.innerHTML = element
    });
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
        }),
        $.ajax({
            url: 'chaeaxactividad',
            method: 'GET',
            dataType: 'json'
        })
    ).then(function(resp1,resp2,resp3){
        crearTabla(resp1[0].tabla,resp1[0].limites);
        vistasPorAct(resp2[0].data);
        crearTabla2(resp3[0].clicks,resp3[0].titulos)
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

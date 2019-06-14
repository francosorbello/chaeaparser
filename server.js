//importacion de librerias
const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser')

//creo la conexion
const conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	database: 'proyectodb'
})
//establezco conexion
conn.connect((err)=>{
	if(err){
		console.log("Error al conectarse a la base de datos.");
		throw err;
	}
	console.log('Base de datos conectada.');
})
//con express me conecto al front
const app = express();
//seteo el lugar donde guardo los archivos estaticos(paginas html,imagenes,etc)
app.use(express.static('static_files'));

// utilidades para obtener archivos json en los ajax request
app.use(bodyParser.json({limit: "10mb"}));
app.use(bodyParser.urlencoded({limit: "10mb",extended: true,parameterLimit: 100000}));

//abro puerto 
app.listen(3001,()=>{
    console.log('Server iniciado.')
});

app.get('/', (req,res)=>{
	res.sendFile('./static_files/index.html')
})

const bigInsert = (data)=>{
	console.log("Comenzando super insert...")
	return new Promise((res,rej)=>{
		conn.query('INSERT INTO logs VALUES ?',[data],(err,response)=>{
			if (err) {
				rej(err)
			} else {
				console.log("Filas afectadas: "+response.affectedRows);
				res({isWorking: true})
				res.toString			}
		});
	})
}

app.post('/insertlogs', async (req,res)=>{
	var data = req.body.logs;
	//para insertar necesito crear un array que contenga los objetos recibidos(tambien separados en array)
	data = data.map((item)=>{
		//creo un array con los datos del json
		let aux = [parseInt(item.id),
			parseInt(item["roleid"]),
			item["student"],
			item["email"],
			item["module type"],
			item["module id"],
			item["nombre evento"],
			item["hora"],
			item["module name"],
			item["user groups"],
			item["section name"],
		]
		return aux;
	})
	//realizo la query
	const aux = await bigInsert(data)
	if(aux.isWorking){
		res.send({success: true})
	} else{
		res.send({success: false})	
	}
})


const bigquery = "SELECT student, COUNT(`student`) as CantInteracciones from logs LEFT OUTER JOIN testCHAEA ON `logs`.email = testCHAEA.email WHERE roleid=5 and testCHAEA.email IS NOT NULL GROUP BY `student` ORDER BY CantInteracciones"
// "SkELECT COUNT(`student`) as CantInteracciones from logs WHERE roleid=5 GROUP BY `student` ORDER BY CantInteracciones"
app.get('/graficocaja',(req,res)=>{
	conn.query(bigquery,async (req,resp)=>{
		//primero paso los resultados a enteros.
		let interacciones=[];
		interacciones = resp.map((item)=>{
			return parseInt(item.CantInteracciones);
		})
		let estudiantes = resp.map((item)=>{
			return item.student;
		})
		const valores = calculosCaja(interacciones);
		const rangos = calculosRangos(interacciones,estudiantes,valores);

		const tabla = await tabladobleEntrada(rangos);		

		res.send({interacciones, valores, tabla})
	})
})

app.get('/actmasusada',(req,res)=>{
	const query = "SELECT `section name` as Nombre,COUNT(`section name`) as CantInteracciones from logs LEFT OUTER JOIN testCHAEA ON logs.email=testCHAEA.email WHERE roleid=5 and testCHAEA.email IS NOT NULL GROUP BY `section name`"
	conn.query(query,(err,resp)=>{
		if (err) throw err;

		let CantInteracciones = resp.map((item)=>{
			return parseInt(item.CantInteracciones);
		})

		let nombreActividades = resp.map((item=>{
			return item.Nombre;
		}))

		let max = CantInteracciones[0];
		let x = 0;

		for (let i = 0; i < CantInteracciones.length; i++) {
			if (CantInteracciones[i]>max){
				max=CantInteracciones[i];
				x=i;
			}
		}
		const masUsado=nombreActividades[x];
		let data = resp;
		res.send({masUsado,data});
	})
});

const calculosRangos = (interacciones,estudiantes,valores)=>{
	//genero los rangos entre los que deben estar los estudiantes
	const largo = interacciones.length;
	const aux = Math.floor((largo+1)/4);
	// console.log(aux+","+(aux+1))
	const min = interacciones[0];
	const max = interacciones[largo-1];
	var q1 = interacciones[aux-1];
	var q2 = interacciones[2*aux-1];
	var q3 = interacciones[3*aux-1];

	//declaro las variables donde guardo a cada estudiante segun su rango
	var rango1=[];
	var rango2=[];
	var rango3=[];
	var rango4=[];
	
	const prueba=false;
	if(prueba){
		q1=valores.ref1;
		q2=valores.ref2;
		q3=valores.ref3;
	}

	var compare = 0;
	for (let i = 0; i < interacciones.length; i++) {
		compare = interacciones[i];
		if (compare<q1){
			rango1.push(estudiantes[i]);
		} else if (compare<q2){
			rango2.push(estudiantes[i]);
		} else if (compare<q3){
			rango3.push(estudiantes[i]);
		} else{
			rango4.push(estudiantes[i]);
		}
	}
	return [rango1,rango2,rango3,rango4]
}

const tabladobleEntrada = (rangos)=>{

	var new_rangos = []
	const query = "SELECT DISTINCT logs.student, activo,teorico,pragmatico, reflexivo FROM logs,testCHAEA WHERE logs.email = testCHAEA.email";
	return new Promise((resolve,reject)=>{
		conn.query(query,(err,resp)=>{
			if(err) throw err;
	
			//primero extraigo la info de la rta de la base de datos
			let estudiantes = resp.map((item)=>{
				return item.student;
			})
			var aux = 0;
			rangos.forEach(rango => {
				//cada posicion del vector representa la afinidad con el estilo de aprendizaje.Ej. activo[0] = muy bajo
				//el nro que hay en esa posicion es la cantidad de gente con esa afinidad en ese estilo de aprendizaje
				var activo = [0,0,0,0,0];
				var teorico = [0,0,0,0,0];
				var pragmatico = [0,0,0,0,0];
				var reflexivo = [0,0,0,0,0];
				rango.forEach(persona => {
					if (estudiantes.includes(persona)) {
						// console.log(persona+": "+resp[aux].activo+","+resp[aux].teorico+","+resp[aux].pragmatico+","+resp[aux].reflexivo)
						activo=sumoAprendizaje(activo,resp[aux].activo);
						teorico=sumoAprendizaje(teorico,resp[aux].teorico);
						pragmatico=sumoAprendizaje(pragmatico,resp[aux].pragmatico);
						reflexivo=sumoAprendizaje(reflexivo,resp[aux].reflexivo);
					}
					aux+=1;
				});
				new_rangos.push([activo,teorico,pragmatico,reflexivo])
				// console.log("---------")
			});
			// console.log(new_rangos)
			resolve(new_rangos)
		})	
	})
}

const sumoAprendizaje = (tipoAprendizaje,persona)=>{
	let x = 0;
	let aux = true;
	switch (persona) {
		case "Muy bajo":
			x=0;
			break;
		case "Bajo":
			x=1;
			break;
		case "Moderado":
			x=2;
			break;
		case "Alto":
			x=3;
			break;
		case "Muy alto":
			x=4;
			break;
		default:
			aux=false;
			break;
	}
	if(aux) tipoAprendizaje[x]+=1;
	return tipoAprendizaje;
}



calculosCaja = (interacciones)=>{
	const largo = interacciones.length;
	const min = interacciones[0];
	const max = interacciones[largo-1];
	var n = 0;
	interacciones.forEach(element => {
		n += element;
	});
	var aux = Math.floor((largo+1)/4);
	const q1 = interacciones[aux-1];
	const q3 = interacciones[3*aux-1];
	aux = Math.floor((largo+1)/2);
	const mediana = interacciones[aux-1]; 
	const media  = n/largo; 
	const rango = q3-q1; //rango intercuartilico
	const ref1 = q1 - 3*rango;
	const ref2 = q1 - 1.5*rango;
	const ref3 = q3 + 1.5*rango;
	const ref4 = q3 + 3*rango;

	return {min,max, q1, q3,mediana,media, rango, ref1,ref2,ref3,ref4}
}

app.get("/personasxestilo",(req,res)=>{
	const query = "SELECT DISTINCT logs.student, activo,teorico,pragmatico, reflexivo FROM logs,testCHAEA WHERE logs.email = testCHAEA.email";
	conn.query(query,(err,resp)=>{
		if (err) throw err;
		

		var activo = [0,0,0,0,0];
		var teorico = [0,0,0,0,0];
		var pragmatico = [0,0,0,0,0];
		var reflexivo = [0,0,0,0,0];
		rango.forEach(persona => {
			if (estudiantes.includes(persona)) {
				// console.log(persona+": "+resp[aux].activo+","+resp[aux].teorico+","+resp[aux].pragmatico+","+resp[aux].reflexivo)
				activo=sumoAprendizaje(activo,resp[aux].activo);
				teorico=sumoAprendizaje(teorico,resp[aux].teorico);
				pragmatico=sumoAprendizaje(pragmatico,resp[aux].pragmatico);
				reflexivo=sumoAprendizaje(reflexivo,resp[aux].reflexivo);
			}
			aux+=1;
		});
		
	})
})
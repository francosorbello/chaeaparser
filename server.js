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

app.post('/insertchaea',(req,res)=>{
	var data = req.body.logs[0];
	//quito la informacion que no guardo, como el nombre de user
	var ins_data = data.map(item=>{
		return [item[2],item[1],item[3],item[4],item[5],item[6]]
	})
	conn.query('INSERT INTO testCHAEA (tiempo,email,activo,teorico,pragmatico,reflexivo) VALUES ?',[ins_data],(err,resp)=>{
		if (err) throw err;

		console.log("Filas afectadas: "+resp.affectedRows)
		res.send({success: true})
	})
})

const checking = (tabla)=>{
	return new Promise((resolve,reject)=>{
		conn.query("select * from ??",[tabla],(err,res)=>{
			if (err) throw err;
			console.log(tabla+": "+res.length)
			if(res == ""){
				resolve(true);
			}
			resolve(false)
		})
	})
}

const cleaning = (tabla)=>{
	conn.query("DELETE FROM ??",[tabla],(err,res)=>{
		if (err) throw err;

		console.log("Filas afectadas: "+res.affectedRows)
	})
} 

app.delete('/cleartables',(req,res)=>{
	cleaning("logs");
	cleaning("testCHAEA");
	res.send({success: true})
})

app.get('/checkdb',async (req,res)=>{
	const texto = "testCHAEA"
	const logs = await checking("logs")
	const test = await checking("testCHAEA")

	if(!(logs && test)){
		res.send({vacio: true})
	}else {
		res.send({vacio: false})
	}
})

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

//con esta query obtengo la cantidad de interacciones de cada estudiante para el curso en general
const bigquery = "SELECT student, COUNT(`student`) as CantInteracciones from logs LEFT OUTER JOIN testCHAEA ON `logs`.email = testCHAEA.email WHERE roleid=5 and testCHAEA.email IS NOT NULL GROUP BY `student` ORDER BY CantInteracciones"
app.get('/graficocaja',(req,res)=>{
	conn.query(bigquery,async (req,resp)=>{
		//primero paso los resultados a enteros.
		let interacciones = resp.map((item)=>{
			return parseInt(item.CantInteracciones);
		})
		let estudiantes = resp.map((item)=>{
			return item.student;
		})
		const limites = calculoLimites(interacciones);
		const rangos = calculosRangos(interacciones,estudiantes);

		const tabla = await tabladobleEntrada(rangos);		
		res.send({limites,tabla})
	})
})

const calculoLimites = (interacciones)=>{
	//genero los rangos entre los que deben estar los estudiantes
	const largo = interacciones.length;
	const aux = Math.floor((largo+1)/4);
	const min = interacciones[0];
	const max = interacciones[largo-1];
	var q1 = interacciones[aux-1];
	var q2 = interacciones[2*aux-1];
	var q3 = interacciones[3*aux-1];

	return {min,max,q1,q2,q3}
}

const calculosRangos = (interacciones,estudiantes)=>{
	var limites = calculoLimites(interacciones)
	//declaro las variables donde guardo a cada estudiante segun su rango
	var rango1=[];
	var rango2=[];
	var rango3=[];
	var rango4=[];
	
	var compare = 0;
	for (let i = 0; i < interacciones.length; i++) {
		compare = interacciones[i];
		if (compare<limites.q1){
			rango1.push(estudiantes[i]);
		} else if (compare<limites.q2){
			rango2.push(estudiantes[i]);
		} else if (compare<limites.q3){
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
						activo=sumoAprendizaje(activo,resp[aux].activo);
						teorico=sumoAprendizaje(teorico,resp[aux].teorico);
						pragmatico=sumoAprendizaje(pragmatico,resp[aux].pragmatico);
						reflexivo=sumoAprendizaje(reflexivo,resp[aux].reflexivo);
					}
					aux+=1;
				});
				new_rangos.push([activo,teorico,pragmatico,reflexivo])
			});
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


app.get("/chaeaxactividad", (req,res)=>{
	conn.query("select DISTINCT `module name` from logs",async (err,resp)=>{
		const actividades =	resp.map(item=>{
			return item["module name"];
		})
		let clicks = [];
		for (let i = 0; i < actividades.length; i++) {
			let new_click = await personasxactividad(actividades[i]);
			clicks.push(new_click);
		}
		var titulos = extraerNombres(actividades);
		res.send({titulos,clicks});
	})
})

const extraerNombres = (actividades)=>{
	return actividades.map((act)=>{
		var pos = act.indexOf("title");
		if(pos !== -1){
			var titulo=""
			var comas=0;
			while(comas<2){
				if(act[pos]=='"'){
					comas+=1;
				}
				titulo += act[pos];
				pos+=1;
			}
			return titulo
		} else{
			return act
		}
	})
}

const personasxactividad = (actividad)=>{
	return new Promise((resolve,reject)=>{
		const query='SELECT student, logs.`module name`,logs.email, COUNT(student) as cant from logs LEFT OUTER JOIN testCHAEA ON logs.email = testCHAEA.email WHERE roleid=5 and `module name`=? and testCHAEA.email IS NOT NULL GROUP BY student ORDER BY cant'
		conn.query(query,actividad,async (err,resp)=>{
			if (err) throw err;
	
			const tests = await getTests();
	
			let interacciones = resp.map((item)=>{
				return parseInt(item.cant);
			})
			let estudiantes = resp.map((item)=>{
				return item.student;
			})
			let usersTests = tests.map((item)=>{
				return item.student
			})
			let clicks = clickxact(estudiantes,interacciones,usersTests,tests)	
			resolve(clicks)
		})
	})
}

const getTests = () =>{
	return new Promise((resolve,reject)=>{
		const query = "SELECT DISTINCT logs.student, activo,teorico,pragmatico, reflexivo FROM logs,testCHAEA WHERE logs.email = testCHAEA.email";
		conn.query(query,(err,resp)=>{
			if(err) {
				reject(err);
				throw err;
			}
			resolve(resp)
		})		
	})
}
const clickxact = (alumnos,interacciones,test_usr,test_res)=>{
	//tengo que tomar cada persona, fijarme sus estilos y multiplicar la cant de interacciones por estilo matcheado
	var pos = -1;
	var estilos = "";
	let x = 0;
	//creo un array que almacena los clicks por estilo. Es de 20 porque 5 posiciones representan un estilo con sus distintos niveles.
	var clicks = Array(20).fill(0);
	for (let i = 0; i < alumnos.length; i++) {
		pos = test_usr.indexOf(alumnos[i]);
		if(pos !== -1){
			estilos = test_res[pos];
			// console.log(alumnos[i]+","+interacciones[i]+" interacciones; "+estilos.activo+" ,"+estilos.teorico+" ,"+estilos.pragmatico+", "+estilos.reflexivo)
			//activo
			x = getPos(0,estilos.activo);
			clicks[x] += interacciones[i];
			//teorico
			x = getPos(5,estilos.teorico);
			clicks[x] += interacciones[i];
			//pragmatico
			x = getPos(10,estilos.pragmatico);
			clicks[x] += interacciones[i];
			//reflexivo
			x = getPos(15,estilos.reflexivo);
			clicks[x] += interacciones[i];
		}
	}
	return clicks
}

const getPos = (posIni,estilo)=>{
	let aux = true;
	let x = posIni;
	switch (estilo) {
		case "Muy bajo":
			x+=0;
			break;
		case "Bajo":
			x+=1;
			break;
		case "Moderado":
			x+=2;
			break;
		case "Alto":
			x+=3;
			break;
		case "Muy alto":
			x+=4;
			break;
		default:
			aux=false;
			break;
	}
	if(aux) return x;
}

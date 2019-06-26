(function () {
	function onLoadFile(e) {
		var reader = new FileReader()
		reader.onload = (event)=>onReaderRead(event,e.target.id);
		reader.readAsText(e.target.files[0])
	}
	function onReaderRead(e,id) {
		var direccion = (id=="logs") ? "insertlogs" : "insertchaea"
		//esta variable solo sirve para mostrar el simbolo de "cargando" correcto
		var aux_loader = (id=="logs") ? 1 : 2

		document.getElementById('loader'+aux_loader).style.display="inline"
		var x = 0
		var json = JSON.parse(e.target.result)

		$.ajax({
			url: direccion,
			method: "POST",
			data: { logs: json },
			success: (data) => {
				if (data['success']) {
					document.getElementById('loader'+aux_loader).style.display="none"
					document.getElementById('loaded'+aux_loader).style.display="inline"
					
					if (document.getElementById('loaded1').style.display=="inline" && 
					document.getElementById('loaded2').style.display=="inline")
						document.getElementById('boton').disabled = false;
					return;
				}
				alert("Oops! Los datos no se han cargado correctamente.")
				document.getElementById('loader1').style.display="none"
			}
		})
	}
	
	document.getElementById('logs').addEventListener('change', onLoadFile)
	document.getElementById('chaea').addEventListener('change', onLoadFile)
	

}());
$(document).ready(()=>{
	$.ajax({
		url:'checkdb',
		method: 'GET',
		success: (data)=>{
			if(data.vacio){
				document.getElementById("resultados").style.pointerEvents = "auto";
			}
		}
	})
})
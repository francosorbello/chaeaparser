(function () {
	function onLoadFile(e) {
		var reader = new FileReader()
		reader.onload = onReaderRead;
		reader.readAsText(e.target.files[0])
	}
	function onReaderRead(e) {
		document.getElementById('loader1').style.display="inline"
		var x = 0
		var json = JSON.parse(e.target.result)

		// document.getElementsByName('loader')[0].style.display= "block"
		// document.getElementsByName('loader')[1].style.display= "block"

		$.ajax({
			url: "insertlogs",
			method: "POST",
			data: { logs: json },
			success: (data) => {
				if (data['success']) {
					// alert("Los datos se han cargado correctamente.")
					document.getElementById('loader1').style.display="none"
					document.getElementById('loaded1').style.display="inline"
					document.getElementById('boton').disabled = false;
					return;
				}
				alert("Oops! Los datos no se han cargado correctamente.")
				document.getElementById('loader1').style.display="none"
			}
		})

	}
	document.getElementById('json').addEventListener('change', onLoadFile)

}());
(function () {
	function onPrueba(e) {
		console.log(e.target.name)
	}
	document.getElementById('try').addEventListener('change', onPrueba)
}())
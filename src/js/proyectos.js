(function () {
  //Función anónima no tiene nombre (funcion IIFE)
  obtenerProyectos();
  let arrayProyectos = [];

  // Consulta la api y obtiene los projectos del usuario actual
  async function obtenerProyectos() {
    try {
      const url = "http://localhost:3000/api/proyectos";
      const respuesta = await fetch(url);
      const resultado = await respuesta.json(); //Obtenemos la respuesta json que ahora js lo interpreta como objeto.
      arrayProyectos = resultado.proyectos; // Guardamos en memoria el array obtenido con los proyectos del usuario.
      mostrarProyectos(); //Mostramos las proyectos
    } catch (error) {
      console.log(error);
    }
  } // End obtenerProjectos

  function mostrarProyectos() {
    if (arrayProyectos.length === 0) { //Si no hay Proyectos

      const textoNoProyectos = document.createElement("P");
      textoNoProyectos.textContent = "No Hay Proyectos Áun ";
      textoNoProyectos.classList.add("no-proyectos");

      const enlaceCrearProyecto = document.createElement("A");
      enlaceCrearProyecto.href = "/crear-proyecto";
      enlaceCrearProyecto.textContent = "Comienza Creando Uno";
      // Agregar el enlace al P
      textoNoProyectos.appendChild(enlaceCrearProyecto);
      // Agregar el P al contenido
      document.querySelector(".contenido").appendChild(textoNoProyectos);
      return;
    }

    // ul donde insertaremos los proyectos
    const listadoProyectos = document.querySelector("#listado-proyectos"); 
    arrayProyectos.forEach((project) => {
      const { proyecto, url } = project; //Extraemos datos del proyecto

      //Creamos un li por cada proyecto
      const contenedorProyecto = document.createElement("LI");
      contenedorProyecto.classList.add("proyecto"); //Estilos generales al proyecto

      const enlaceProyecto = document.createElement("A");
      enlaceProyecto.href = `/proyecto?url=${url}`;
      enlaceProyecto.textContent = proyecto;

      // Agregar el enlace al LI
      contenedorProyecto.appendChild(enlaceProyecto);
      // Agregamos el LI al Ul
      listadoProyectos.appendChild(contenedorProyecto);
    });
  }
})(); //End funcion anónima.'()' ejecuta la función inmediatamente. Si no colocamos los '()' no se ejecuta

(function () { //Función anónima no tiene nombre (funcion IIFE)

  obtenerTareas(); //Al ingresar a un proyecto, cargamos inmediatamente las tareas asociadas a ese proyecto.

  let arrayTareas = [];
  let filtradas = [];

  //Boton para eliminar proyecto
  const eliminarProyectoBtn = document.querySelector("#eliminar-proyecto");
  eliminarProyectoBtn.addEventListener("dblclick", function () {
    confirmarEliminarProyecto();
  });

  // Botón para mostrar el Modal de agregar tarea
  const nuevaTareaBtn = document.querySelector("#agregar-tarea");
  nuevaTareaBtn.addEventListener("click", function () {
    mostrarFormulario(); //Creamos una nueva tarea
  });

  // Filtros de búsqueda
  const filtros = document.querySelectorAll('#filtros input[type="radio"]')
  filtros.forEach( radio => {
    radio.addEventListener('input', filtrarTareas); //Al seleccionar un input radio, llamamos la funcion filtrar tareas. Si no pasamos parametros se pasa el evento automaticamente
  } )

  function filtrarTareas(e){
    const filtro = e.target.value; //Accedemos al valor del radio seleccionado (0/1/'').

    if(filtro !== ''){ //Si el filtro es 0/1
      filtradas = arrayTareas.filter(tarea => tarea.estado === filtro); //Obtenemos todas las tareas con el filtro seleccionado
    } else {
      filtradas = []; //Si el filtro es '', el array estara vacío.
    }

    mostrarTareas(); //volvemos a mostramos las tareas segun sea el filtro.
  }
  // Consulta la api y obtiene las tareas del proyecto actual
  async function obtenerTareas() {
    try {
      const proyectoURL = obtenerProyecto();
      const url = `/api/tareas?url=${proyectoURL}`;
      const respuesta = await fetch(url);
  
      const resultado = await respuesta.json(); //Obtenemos la respuesta json que ahora js lo interpreta como objeto.
     
      arrayTareas = resultado.tareas; // Guardamos en memoria el array obtenido con las tareas del proyecto.
     
      mostrarTareas(); //Mostramos las tareas
    } catch (error) {
      console.log(error);
    }
  } // End obtenerTareas

  // Renderiza las tareas del proyecto actual
  function mostrarTareas() {
    const listadoTareas = document.querySelector("#listado-tareas"); // ul donde insertaremos las tareas
    limpiarTareas(); // Limpiamos el ul.
    radioPendientes(); //Si no hay tareas pendientes, desabilita el radio.
    radioCompletas(); //Si no hay tareas completas desabilita el radio .
  
    const tareas = filtradas.length ? filtradas : arrayTareas; //Si el array de tareas filtradas tiene elementos vamos a mostrar las tareas filtradas, de lo contrario mostraremos todas las tareas obtenidas (arrayTareas).
   
    if (tareas.length === 0) {
      //Si no hay tareas
      const textoNoTareas = document.createElement("LI");
      textoNoTareas.textContent = "No Hay Tareas";
      textoNoTareas.classList.add("no-tareas");

      // Agregar el li al ul
      listadoTareas.appendChild(textoNoTareas);
      return;
    }

    //Si el estado de la tarea es 0 imprime 'Pendiente', si es 1 imprime 'Completa'.
    const estados = {
      0: "Pendiente",
      1: "Completa",
    };

    tareas.forEach((tarea) => {
      //Creamos un li por cada tarea
      const contenedorTarea = document.createElement("LI");
      contenedorTarea.dataset.tareaId = tarea.id;
      contenedorTarea.classList.add("tarea"); //Estilos generales a la tarea

      //Creamos el P con el nombre de la tarea
      const nombreTarea = document.createElement("P");
      nombreTarea.textContent = tarea.nombre;
      nombreTarea.ondblclick = function () {
        //Al dar doble click, podemos editar el nombre de la tarea
        mostrarFormulario((editarNombre = true), { ...tarea }); // Pasamos una copia de la tarea (Para no modificar la tarea original del arrayTareas)
      };

      //Creamos el DIV de opciones que contendra los botones
      const opcionesDiv = document.createElement("DIV");
      opcionesDiv.classList.add("opciones");

      // Boton con el estado de la tarea
      const btnEstadoTarea = document.createElement("BUTTON");
      btnEstadoTarea.classList.add(`${estados[tarea.estado].toLowerCase()}`); // agregamos la clase pendiente/completa para cambiar el color de la tarea.
      btnEstadoTarea.textContent = estados[tarea.estado]; //El texto puede ser Pendiente/Completa
      btnEstadoTarea.dataset.estadoTarea = tarea.estado; //Creamos un atributo personalizado 0/1
      btnEstadoTarea.ondblclick = function () {
        //Al dar doble click, cambia el estado de la tarea
        cambiarEstadoTarea({ ...tarea }); //Pasamos una copia de la tarea (Para no modificar la tarea original del arrayTareas)
      };

      // Boton para eliminar la tarea
      const btnEliminarTarea = document.createElement("BUTTON");
      btnEliminarTarea.classList.add("eliminar-tarea");
      btnEliminarTarea.dataset.idTarea = tarea.id;
      btnEliminarTarea.textContent = "Eliminar";
      btnEliminarTarea.ondblclick = function () {
        confirmarEliminarTarea({ ...tarea });
      };

      //Agregar los botones al Div de opcines
      opcionesDiv.appendChild(btnEstadoTarea);
      opcionesDiv.appendChild(btnEliminarTarea);

      //Agregar el nombre de la tarea y el Div de opciones al li
      contenedorTarea.appendChild(nombreTarea);
      contenedorTarea.appendChild(opcionesDiv);

      //Agregamos el li al ul
      listadoTareas.appendChild(contenedorTarea);
    });
  } // End mostrarTareas

 // Habilita/Desabilita el inputRadio de tareas pendientes. 
  function radioPendientes() {
    const tareasPendientes = arrayTareas.filter(tarea => tarea.estado === "0");
    const radioPendientes = document.querySelector('#pendientes');

    if(tareasPendientes.length === 0) { //Si no tenemos tareas pendientes
      radioPendientes.disabled = true; // Desabilitamos el input
    } else {
      radioPendientes.disabled = false; // Si tenemos entonces lo habilitamos
    }
      /* POR QUE LO HACEMOS?
       Lo desabilitamos por que si presionamos el inputRadio pendientes cuando no hay
       tareas pendientes. Entonces el arreglo filtradas estara vacio y nuestra condicion
       mostrará todas las tareas (Se entendera que no queremos filtrar nada).
      
      Entonces mostrara todas las tareas completadas, por eso desabilitamos el inputRadio
      de tareas pendientes mientras no existan tareas pendientes. */

  } // End totalPendientes

  // Habilita/Desabilita el inputRadio de tareas completadas
  function radioCompletas() {
    const tareasCompletas = arrayTareas.filter(tarea => tarea.estado === "1");
    const radioCompletadas = document.querySelector('#completadas');

    if(tareasCompletas.length === 0) { //Si no tenemos tareas completadas
      radioCompletadas.disabled = true; // Desabilitamos
    } else {
      radioCompletadas.disabled = false; // Si tenemos entonces lo habilitamos
    }
  } // End totalCompletas

  function mostrarFormulario(editarNombre = false, tarea = {}) {
    //El form por defecto es para agregar una tarea nueva. Si editarNombre es true y existe un objeto con valores entonces se mostrara un form diferente para editar nombre de la tarea.
    const modal = document.createElement("DIV"); //Crear ventana modal
    modal.classList.add("modal"); //Estilos
    //Crear formulario HTML y agregarlo a la ventana modal con innerHTML, un poco mas lento que el scripting pero se usa menos código.
    modal.innerHTML = `
            <form class="formulario nueva-tarea">
                <legend>${
                  editarNombre ? "Editar Tarea" : "Añade una nueva tarea"
                }</legend> 
                <div class="campo">
                    <label>Tarea</label>
                    <input 
                        type="text"
                        name="tarea"
                        placeholder="${
                          tarea.nombre
                            ? "Edita la Tarea"
                            : "Añadir Tarea al Proyecto Actual"
                        }"
                        id="tarea"
                        value="${tarea.nombre ? tarea.nombre : ""}"
                    />
                </div>
                <div class="opciones">
                    <input 
                        type="submit" 
                        class="submit-nueva-tarea" 
                        value="${
                          tarea.nombre ? "Guardar Cambios" : "Añadir Tarea"
                        }"
                    />
                    <button type="button" class="cerrar-modal">Cancelar</button>
                </div>
            </form>
        `;
    //El contenido de los setTimeout es agregado a la cola, por lo que se ejecuta una vez que el stack este vacio (el stack ejecuta todas las funciones) entonces el HTML ya se habrá generado y podremos seleccionar el formulario y sus elementos.
    setTimeout(() => {
      const formulario = document.querySelector(".formulario");
      formulario.classList.add("animarMostrar"); //Mostramos el formulario
    }, 0);
    //DELEGATION: No utilizamos setTimeout pero de esta manera esperamos por el evento, que ocurre solo cuando el html este creado.
    modal.addEventListener("click", function (e) { //Si damos click en la ventana modal
      e.preventDefault(); //evitamos que se envie el form.
      if (e.target.classList.contains("cerrar-modal")) {  //Si se da click en el elemento que contiene la clase 'cerrar-modal'
        const formulario = document.querySelector(".formulario");
        formulario.classList.add("animarOcultar"); //Ocultamos el formulario
        setTimeout(() => {
          modal.remove(); //Removemos la ventana modal
        }, 500);
      }
      if (e.target.classList.contains("submit-nueva-tarea")) {  //si se da click en el elemento que contiene la clase 'submit-nueva-tarea'
        const nombreTarea = document.querySelector("#tarea").value.trim(); //Obtenemos el texto del input y eliminamos los espacios en blanco al inicio y al final con trim.

        if (nombreTarea === "" || nombreTarea.length > 60) {  //Mostrar una alerta de error
          mostrarAlerta(
            "El nombre es obligatorio, 60 caracteres como máximo",
            "error",
            document.querySelector(".formulario legend")
          );
          return; //Detenemos la ejecución del codigo
        }
        if (editarNombre) {  // Editar nombre de tarea
          tarea.nombre = nombreTarea; //Reescribimos el nombre de la tarea
          actualizarTarea(tarea);
        } else {  // crear tarea
          agregarTarea(nombreTarea);
        }
      }
    });

    document.querySelector(".dashboard").appendChild(modal); //Agrega el modal al dashboard
  } // End mostrarFormulario

  // Muestra un mensaje en la interfaz
  function mostrarAlerta(mensaje, tipo, referencia) {
    // Colocaremos la alerta despúes del elemento especificado en la referencia.

    // Previene la creación de multiples alertas
    const alertaPrevia = document.querySelector(".alerta");
    if (alertaPrevia) {
      alertaPrevia.remove();
    }
    //Crea la alerta
    const alerta = document.createElement("DIV");
    alerta.classList.add("alerta", tipo);
    alerta.textContent = mensaje;

    referencia.parentElement.insertBefore(
      alerta,
      referencia.nextElementSibling
    );
    //referencia.parentElement. (es el padre del elemento) //insertBefore(alerta, referencia.nextElementSibling); (inserta la alerta antes del hermano siguiente del elemento).

    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
      alerta.remove();
    }, 5000);
  } //End mostrarAlerta

  // Consulta la api para añadir una nueva tarea al proyecto actual.
  async function agregarTarea(nombreTarea) {
    // Construir la petición
    const datos = new FormData();
    datos.append("nombre", nombreTarea); //Enviamos el nombre de la tarea
    datos.append("proyectoURL", obtenerProyecto()); //Enviamos la url del proyecto

    try {
      const url = "http://localhost:3000/api/tarea";
      const respuesta = await fetch(url, {
        //await detiene la ejecución del codigo hasta que tenga una respuesta del servidor
        method: "POST",
        body: datos,
      });

      const resultado = await respuesta.json(); //Obtenemos la respuesta en json. JS la interpreta como un objeto
      //console.log(resultado);
      mostrarAlerta(
        resultado.mensaje,
        resultado.tipo,
        document.querySelector(".formulario legend")
      );

      if (resultado.tipo === "exito") {
        const modal = document.querySelector(".modal");
        setTimeout(() => {
          modal.remove();
        }, 1500);

        /*  Vamos a estar sincronizando lo que hay en el servidor con lo que hay
             en el cliente (VIRTUAL DOM). Creamos un objeto cada vez que se cree 
             una tarea y lo agregamos al arreglo global de tareas en memoria. */

        const tareaObj = {
          id: String(resultado.id), // Obtenemos el id de la cita generada y lo convertimos a string ya que los objetos de tarea que obtenemos de la BD en Json vienen como string y este debe ser exactamente igual.
          nombre: nombreTarea, // Obtenemos el nombre de la tarea
          estado: "0", // Asignamos estado pendiente
          proyectoId: resultado.proyectoId, // Obtenemos el id del proyecto
        };

        //Actualizamos el arreglo de tareas en memoria.
        arrayTareas = [...arrayTareas, tareaObj]; //Tomamos una copia del mismo arreglo de tareas y le agregamos la nueva tarea
        mostrarTareas(); // Como hemos agregado una nueva tarea, volvemos a mostrarlas. De este modo evitamos tener que recargar la pagina y volver a consultar el servidor para mostrar las nuevas tareas.
      }
    } catch (error) {
      console.log(error);
    }
  } // End agregarTarea

  // Recibe una copia de una tarea y cambia su estado
  function cambiarEstadoTarea(tarea) {
    const nuevoEstado = tarea.estado === "1" ? "0" : "1"; //Si esta como 1 cambia a cero. si esta en cero cambia a uno.
    tarea.estado = nuevoEstado;
    actualizarTarea(tarea);
  } // End cambiarEstadoTarea

  // Recibe la tarea con el nuevo estado, consulta el servidor y actualiza el estado de la tarea
  async function actualizarTarea(tarea) {
    const { estado, id, nombre } = tarea; //Obtenemos los datos de la tarea actualizada

    const datos = new FormData();
    datos.append("id", id);
    datos.append("nombre", nombre);
    datos.append("estado", estado);
    datos.append("proyectoURL", obtenerProyecto());

    try {
      const url = "http://localhost:3000/api/tarea/actualizar";

      const respuesta = await fetch(url, {
        method: "POST",
        body: datos,
      });
      const resultado = await respuesta.json();

      if (resultado.tipo === "exito") { // Si se actualizo correctamente
        Swal.fire("Exito!", resultado.mensaje, "success");

        const modal = document.querySelector(".modal");
        if (modal) { //Si se esta editando el nombre de una tarea existira un modal, lo cerramos.
          modal.remove();
        }
        //Actualizamos el arreglo con todas tareas
        arrayTareas = arrayTareas.map((tareaMemoria) => { //Con map creamos una copia del arreglo en memoria. (No modificamos el original)
          if (tareaMemoria.id === id) { // identificamos la tarea actualizada
            tareaMemoria.estado = estado; //Asignamos el nuevo estado
            tareaMemoria.nombre = nombre; //Asignamos el nuevo nombre
          }
          return tareaMemoria; //Todas las tareas en memoria seran asignadas de nuevo a arrayTareas. Pero cambiando el estado de la tarea que estamos actualizando.
        });
       
        mostrarTareas(); //Como hemos modificado arrayTareas volvemos a mostrar las tareas para construir de nuevo el html.
      
      } else {
        Swal.fire("Error!", resultado.mensaje, "error");
      }
    } catch (error) {
      console.log(error);
    }
  } // End actualizarTarea

  // Muestra un mensaje para confirmar la eliminación de una tarea
  function confirmarEliminarTarea(tarea) {
    Swal.fire({
      title: "Eliminar Tarea?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) { // Si damos click en Si
        eliminarTarea(tarea); //Eliminamos la tarea
      }
    });
  }
  // Recibe la tarea a eliminar, consulta el servidor y elimina la tarea
  async function eliminarTarea(tarea) {
    const { estado, id, nombre } = tarea; //Obtenemos los datos de la tarea a eliminada

    const datos = new FormData();
    datos.append("id", id);
    datos.append("nombre", nombre);
    datos.append("estado", estado);
    datos.append("proyectoURL", obtenerProyecto());

    try {
      const url = "http://localhost:3000/api/tarea/eliminar";
      const respuesta = await fetch(url, {
        method: "POST",
        body: datos,
      });

      const resultado = await respuesta.json();

      if (resultado.tipo === "exito") {// Si se elimino correctamente
        
        Swal.fire('Exito!', resultado.mensaje, 'success'); //Mostramos alerta de exito de sweetAlert
       
        // Actualizamos el arreglo de todas las tareas quitandole la tarea eliminada
        arrayTareas = arrayTareas.filter( tareaMemoria => tareaMemoria.id !== tarea.id); // Asignamos un array nuevo con las tareas que tengan un id diferente al de la tarea eliminada
        
       // Actualizamos el arreglo de tareas Filtradas quitando la tarea eliminada
       filtradas = filtradas.filter(tareaMemoria => tareaMemoria.id !== id);
       
        mostrarTareas(); //Como hemos modificado los arreglos, regeneramos el html.

      } else {
        Swal.fire("Error!", resultado.mensaje, "error");
      }
      
    } catch (error) {
      console.log(error);
    }
  } // End eliminarTarea

  function confirmarEliminarProyecto() {
    Swal.fire({
      title: "¿Eliminar Proyecto?",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) { // Si damos click en Eliminar
        eliminarProyecto(); //Eliminamos el proyecto
      }
    });
  }
  // consulta el servidor y elimina el proyecto
  async function eliminarProyecto() {

    const datos = new FormData();
    datos.append("proyectoURL", obtenerProyecto());

    try {
      const url = "http://localhost:3000/api/proyecto/eliminar";
      const respuesta = await fetch(url, {
        method: "POST",
        body: datos,
      });

      const resultado = await respuesta.json();

      if (resultado.tipo === "exito") {// Si se elimino correctamente
        // Mostramos una alerta de exito
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: resultado.mensaje,
          showConfirmButton: false,
          timer: 1500
        })
       
        setTimeout(() => { //Redirigimos al dashboard cuando la alerta termine
          
          window.location.href = "/dashboard";
          
        }, 1500);

      } else {
        Swal.fire("Error!", resultado.mensaje, "error");
      }
      
    } catch (error) {
      console.log(error);
    }
  } // End eliminarProyecto

  // Obtiene la url del proyecto
  function obtenerProyecto() {
    //Creamos un objeto URLSearchParams que define métodos para trabajar con los parámetros de busqueda de una URL.
    const proyectoParams = new URLSearchParams(window.location.search); //Recibe un Query String. //window.location brinda informacion de la pagina actual y en 'search' se encuentra el query string de la URL actual
    const proyecto = Object.fromEntries(proyectoParams.entries()); //Obtenemos un objeto con las variables encontradas en el Query String.
    return proyecto.url; //Retornamos el url del proyecto donde crearemos la tarea
  } // End obtenerProyecto

  // Limpia la lista de tareas
  function limpiarTareas() {
    const listadoTareas = document.querySelector("#listado-tareas"); //ul
    //Mientras tenga elementos, los elimina uno a uno.
    while (listadoTareas.firstChild) {
      listadoTareas.removeChild(listadoTareas.firstChild);
    }
    // listadoTareas.innerHTML = ''; //También limpia el ul pero mas lento
  } // End limpiarTareas

})(); //End funcion anónima.'()' ejecuta la función inmediatamente. Si no colocamos los '()' no se ejecuta

/*  NOTA
Problema común: Si tenemos una variable en este archivo ( const hola = 'hola mundo';)
 y la mandamos a imprimir en otro archivo (app.js). entonces el archivo que incluye 
ambos scripts va a mostrar en consola el resultado aunque la variable y el console.log
esten en scrips distintos.
Solución: Podemos tener diferentes archivos de js y proteger las variables o 
las funciones para que no se mezclen con otras de otros archivos las 
colocamos dentro de una funcion IIFE:

(function(){
    const hola = 'hola mundo';
});

De este modo las variables o funciones solo son accesibles dentro del archivo 
al que pertenecen.


NOTA 2:

MOSTRAR EN CONSOLA LOS DATOS DE FORMDATA

for ( let valor of datos.value()) {
  console.log(valor)
}
*/

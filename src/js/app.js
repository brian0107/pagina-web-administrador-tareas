const mobileMenuBtn = document.querySelector("#mobile-menu"); //Muestra el menu
const cerrarMenuBtn = document.querySelector("#cerrar-menu"); //Cierra el menu
const sidebar = document.querySelector(".sidebar");

if (mobileMenuBtn) {  //Si existe el elemento
  mobileMenuBtn.addEventListener("click", function () {
    sidebar.classList.add("mostrar"); // Muestra el menu con transicion
  });
}

if (cerrarMenuBtn) {//Si existe el elemento
  cerrarMenuBtn.addEventListener("click", function () {
    sidebar.classList.add("ocultar"); // Oculta el menu con transicion

    setTimeout(() => { //Despues de ocultar, remueve las clases
      sidebar.classList.remove("mostrar");
      sidebar.classList.remove("ocultar");
    }, 500);
  });
}

// Eliminar la clase de mostrar, en un tamaño de tablet y mayores

window.addEventListener("resize", function () { //resize escucha cada vez que el usuario amplifica o encoge su pantalla
  //Evaluamos el ancho de la pantalla cada que hacemos resize
  const anchoPantalla = document.body.clientWidth;
  if (anchoPantalla >= 768) {
    sidebar.classList.remove("mostrar");
  }
});

//LOOP DE EVENTOS EN JS

/*JS primero ejecuta el Stack (funciones), despues el Heap (monticulo) 
y por ultimo revisa mensajes de la cola (setTimeout) y los pasa al stack para ejecutar

Es por eso que los setTimeout no se ejecutan inmediatamente, primero se ejecuta
el stack y hasta que este vacio el stack ejecuta la cola.*/

<?php

namespace Controllers;

use Model\Proyecto;
use Model\Tarea;

// No requerismos Router ya que no requerimos mostrar vistas por que es una Api
class TareaController
{
    public static function index()
    {
        $proyectoId = $_GET['url'];

        if (!$proyectoId) header('Location: /dashboard');

        $proyecto = Proyecto::where('url', $proyectoId);
        
        session_start();

        if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) header('Location: /404');
        
        $tareas = Tarea::belongsTo('proyectoId', $proyecto->id);
        
        echo json_encode(['tareas' => $tareas]); //Imprime las tareas en json en la pagina /api/tareas?id="id recibida". Si la api (esta pagina mencionada) No imprime resultados, no se mostraran las tareas en el proyecto, aparece 
    }

    public static function crear()
    {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            //Buscamos el proyecto
            $proyecto = Proyecto::where('url', $_POST['proyectoURL']);
            session_start();
            //Validamos que exista el proyecto con el URL recibido y que la persona que inicio sesion sea la propietaria del proyecto
            if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) {
                $respuesta = [
                    'mensaje' => 'Hubo un error al agregar la tarea',
                    'tipo' => 'error'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de error
                return;
            }
            // PASO LA VALIDACIÓN, INSTANCIAR Y CREAR LA TAREA
            $tarea = new Tarea($_POST); //  El objeto creado de tarea solo toma los valores de POST que coinciden con su estructura (nombre).
            $tarea->proyectoId = $proyecto->id; // Pasamos el id del proyecto
            $resultado = $tarea->guardar(); //  Creamos la tarea 

            if ($resultado) {

                $respuesta = [
                    'mensaje' => 'Tarea Creada Correctamente',
                    'tipo' => 'exito',
                    'id' => $resultado['id'], // Incluimos el id generado al insertar la tarea
                    'proyectoId' => $proyecto->id // Incluimos el id del proyecto
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de exito

            }
        }
    }

    public static function actualizar()
    {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Validar que el proyecto exista
            $proyecto = Proyecto::where('url', $_POST['proyectoURL']);

            session_start();

            if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) {
                $respuesta = [
                    'mensaje' => 'Hubo un Error al Actualizar la tarea',
                    'tipo' => 'error'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de error
                return;
            }
            // PASO LA VALIDACIÓN, INSTANCIAR Y ACTUALIZAR LA TAREA
            $tarea = new Tarea($_POST); // Creamos un objeto con los datos de POST (id, nombre y el nuevo estado)
            $tarea->proyectoId = $proyecto->id; // Pasamos el id del proyecto
            $resultado = $tarea->guardar(); //  Actualiza la tarea ya que contiene id.

            if ($resultado) {
                $respuesta = [
                    'mensaje' => 'Tarea Actualizada Correctamente',
                    'tipo' => 'exito'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de exito
            }
        }
    }

    public static function eliminar()
    {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            // Validar que el proyecto exista
            $proyecto = Proyecto::where('url', $_POST['proyectoURL']);

            session_start();

            if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) {
                $respuesta = [
                    'mensaje' => 'Hubo un Error al Eliminar la tarea',
                    'tipo' => 'error'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de error
                return;
            }

            $tarea = new Tarea($_POST);
            $resultado = $tarea->eliminar();

            if ($resultado) {
                $respuesta = [
                    'mensaje' => 'Tarea Eliminada Correctamente',
                    'tipo' => 'exito'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de exito
            }
        }
    }
}

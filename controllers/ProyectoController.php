<?php

namespace Controllers;

use Model\Proyecto;

class ProyectoController
{
    public static function index(){
        session_start();
        $usuarioId = $_SESSION['id'];
        if (!$usuarioId) header('Location: /404');
        $proyectos = Proyecto::belongsTo('propietarioId', $usuarioId);
        echo json_encode(['proyectos' => $proyectos]);

    }

    public static function eliminar()
    {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            // Validar que el proyecto exista
            $proyecto = Proyecto::where('url', $_POST['proyectoURL']);

            session_start();

            if (!$proyecto || $proyecto->propietarioId !== $_SESSION['id']) {
                $respuesta = [
                    'mensaje' => 'Hubo un Error al Eliminar el Proyecto',
                    'tipo' => 'error'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de error
                return;
            }

            
            $resultado = $proyecto->eliminar();

            if ($resultado) {
                $respuesta = [
                    'mensaje' => 'Proyecto Eliminado Correctamente',
                    'tipo' => 'exito'
                ];
                echo json_encode($respuesta); //Enviamos una respuesta de exito
            }
        }
    }
    
}

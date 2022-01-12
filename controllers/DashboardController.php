<?php

namespace Controllers;

use MVC\Router;
use Model\Proyecto;
use Model\Usuario;

class dashboardController
{

    public static function index(Router $router)
    { //Mostrar los Proyectos
        if (!isset($_SESSION)) {
            session_start();
        }
        isAuth(); //Protegemos la ruta dashboard

        $router->render('dashboard/index', [
            'nombre' => $_SESSION['nombre'],
            'titulo' => 'Proyectos'
        ]);
    }

    public static function crear_proyecto(Router $router)
    {
        //Creamos los proyectos
        if (!isset($_SESSION)) {
            session_start();
        }

        isAuth(); //Protegemos la ruta dashboard


        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $proyecto = new Proyecto($_POST);

            //Validación
            $alertas = $proyecto->validarProyecto();

            if (empty($alertas)) {
                // Generar una URL única 
                $hash = md5(uniqid());
                $proyecto->url = $hash;
                // Almacenar el creador del proyecto
                $proyecto->propietarioId = $_SESSION['id'];
                // Guardar el Proyecto
                $resultado = $proyecto->guardar();

                if ($resultado['resultado']) {
                    // Redireccionar al proyecto creado
                    header('Location: /proyecto?url=' . $proyecto->url);
                } else {
                    Proyecto::setAlerta('error', 'Error al crear el proyecto');
                }
            }
        }
        $alertas = Proyecto::getAlertas();
        $router->render('dashboard/crear-proyecto', [
            'nombre' => $_SESSION['nombre'],
            'titulo' => 'Crear Proyecto',
            'alertas' => $alertas
        ]);
    }

    public static function proyecto(Router $router)
    {

        if (!isset($_SESSION)) {
            session_start();
        }
        isAuth();

        $URL = $_GET['url']; //Obtenemos la url del proyecto

        if (!$URL) header('Location: /dashboard'); //Si no hay URL redirigimos a los proyectos

        // Revisar que la persona que visita el proyecto, es quien lo creo
         $proyecto = Proyecto::where('url', $URL);
         
        if ($proyecto->propietarioId !== $_SESSION['id']) {
            header('Location: /dashboard');
        }

        $router->render('dashboard/proyecto', [
            'nombre' => $_SESSION['nombre'],
            'titulo' => $proyecto->proyecto
        ]);
    }

    public static function perfil(Router $router)
    {

        if (!isset($_SESSION)) {
            session_start();
        }
        isAuth(); //Protegemos la ruta dashboard
        $alertas = [];
        //Obtenemos el usuario que inicio sesion
        $usuario = Usuario::find($_SESSION['id']);

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            //Sincronizamos el objeto en memoria
            $usuario->sincronizar($_POST);

            //Validamos que el objeto este lleno
            $alertas = $usuario->validar_perfil();

            if (empty($alertas)) {

                $existeUsuario = Usuario::where('email', $usuario->email);
                //Si el email ingresado ya existe y no nos pertenece. 
                if ($existeUsuario && $existeUsuario->id !== $usuario->id) {
                    //Mensaje de error
                    Usuario::setAlerta('error', 'Email no válido, ya pertenece a otra cuenta');
                } else {
                    //Actualizar el usuario
                    $resultado = $usuario->guardar();
                    if ($resultado) {
                        //Mensaje de exito
                        Usuario::setAlerta('exito', 'Actualizado Correctamente');
                        //Reescribir el nombre en la sesión para mostrar el nuevo nombre inmediatamente
                        $_SESSION['nombre'] = $usuario->nombre;
                    }
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('dashboard/perfil', [
            'nombre' => $_SESSION['nombre'],
            'titulo' => 'Perfil',
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);
    }

    public static function cambiar_password(Router $router)
    {
        session_start();
        isAuth();
        $alertas = [];


        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            //Obtenemos el usuario que inicio sesion
            $usuario = Usuario::find($_SESSION['id']);

            $usuario->sincronizar($_POST);

            $alertas = $usuario->validarNuevo_password();

            if (empty($alertas)) {
                $resultado = $usuario->comprobar_password();

                if ($resultado) {
                    // Asignar el nuevo password
                    $usuario->password = $usuario->password_nuevo;

                    // Eliminar propiedades innecesarias
                    unset($usuario->password_actual);
                    unset($usuario->password_nuevo);

                    // Hashear el nuevo password
                    $usuario->hashPassword();

                    // Actualizar el password
                    $resultado = $usuario->guardar();
                    if ($resultado) {
                        Usuario::setAlerta('exito', 'Password Guardado Correctamente');
                    }
                } else {
                    Usuario::setAlerta('error', 'Password Incorrecto');
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('dashboard/cambiar-password', [
            'nombre' => $_SESSION['nombre'],
            'titulo' => 'Cambiar Password',
            'alertas' => $alertas

        ]);
    }
}

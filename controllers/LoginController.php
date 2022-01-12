<?php

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController
{
    public static function login(Router $router)
    {
      

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            $usuario = new Usuario($_POST);

            $alertas = $usuario->validarLogin();

            if(empty($alertas)) {

                $existeUsuario = Usuario::where('email', $usuario->email);

                //Verificamos que el usuario exista y este confirmado
                if(!$existeUsuario || !$existeUsuario->confirmado ) {
                    Usuario::setAlerta('error', 'El Usuario No Existe o no esta confirmado');
                } else {
                    // El Usuario existe, verificar la contraseña
                    if( password_verify($usuario->password, $existeUsuario->password) ) {
        
                        // Iniciar la sesión
                        if(!isset($_SESSION)){
                            session_start(); 
                        }
                
                        $_SESSION['id'] = $existeUsuario->id;
                        $_SESSION['nombre'] = $existeUsuario->nombre;
                        $_SESSION['email'] = $existeUsuario->email;
                        $_SESSION['login'] = true;

                        // Redireccionar
                        header('Location: /dashboard');
                    } else {
                        Usuario::setAlerta('error', 'Password Incorrecto');
                    }
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
            'titulo' => 'Iniciar Sesión',
            'alertas' => $alertas

        ]);
    }

    public static function logout()
    {
         // Iniciar la sesión
         if(!isset($_SESSION)) session_start(); 

        $_SESSION = [];
        
        header('Location: /');
    }

    public static function crear(Router $router)
    {

        $usuario = new Usuario;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            $usuario->sincronizar($_POST);
            $alertas = $usuario->validarNuevaCuenta();

            if (empty($alertas)) {
                $existeUsuario = Usuario::where('email', $usuario->email);
                if ($existeUsuario) {
                    Usuario::setAlerta('error', 'El usuario ya esta registrado');
                } else {
                    // Hashear el password
                    $usuario->hashPassword();

                    // Eliminar password2 (opcional)
                    unset($usuario->password2); //unset() destruye las variables especificadas.
                   
                    // Generar el Token
                    $usuario->crearToken();
                    
                    // Crear un nuevo usuario
                    $resultado = $usuario->guardar();

                    // Enviar email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarConfirmacion();

                    //Mostrar el mensaje
                    if($resultado) {
                        header('Location: /mensaje');
                    }
                }
            }
        }
        $alertas = Usuario::getAlertas();
        $router->render('auth/crear', [
            'titulo' => 'Crear tu cuenta en Uptask',
            'usuario' => $usuario,
            'alertas' => $alertas

        ]);
    }

    public static function mensaje(Router $router)
    {

        $router->render('auth/mensaje', [
            'titulo' => 'Cuenta Creada Exitosamente'
        ]);
    }

    public static function confirmar(Router $router)
    {
        $token = s($_GET['token']); //Leemos el token del url

        if(!$token) header('Location: /'); //Si no hay token enviamos a login

        // Encontrar al usuario con este token
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)) {
            // No se encontró un usuario con ese token
            Usuario::setAlerta('error', 'Token No Válido');
        } else {
            // Confirmar la cuenta
            $usuario->confirmado = 1;

           // Eliminar el Token (Token de un solo uso)
            $usuario->token = null;

            // Guardar en la BD
            $usuario->guardar();

            Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente');
        }

        $alertas = Usuario::getAlertas();
        $router->render('auth/confirmar', [
            'titulo' => 'Confirma tu cuenta UpTask',
            'alertas' => $alertas
        ]);
    }

    public static function olvide(Router $router)
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $usuario = new Usuario($_POST);
            
            $alertas = $usuario->validarEmail(); //Validar la estructura del Email para evitar realizar una busqueda en la BD de un Email que claramente no existe

            if(empty($alertas)) {
                // Buscar el usuario
                $existeUsuario  = Usuario::where('email', $usuario->email);

                if($existeUsuario  && $existeUsuario->confirmado) {

                    // Generar un nuevo token
                    $existeUsuario->crearToken();

                    // Eliminar password2 (opcional)
                    unset($existeUsuario->password2); //unset() destruye las variables especificadas.

                    // Actualizar el usuario
                    $existeUsuario->guardar();

                    // Enviar el email
                    $email = new Email( $existeUsuario->email, $existeUsuario->nombre, $existeUsuario->token );
                    $email->enviarInstrucciones();

                    // Imprimir la alerta
                    Usuario::setAlerta('exito', 'Hemos enviado las instrucciones a tu email');
                } else {
                    Usuario::setAlerta('error', 'El Usuario no existe o no esta confirmado');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide', [
            'titulo' => 'Olvide mi Password',
            'alertas' => $alertas

        ]);
    }

    public static function reestablecer(Router $router)
    {
        $token = s($_GET['token']);
        $mostrar = true; //Variable para mostrar el formulario en caso de que el token sea válido

        if(!$token) header('Location: /');

        // Identificar el usuario con este token
        $usuario = Usuario::where('token', $token);

        if(empty($usuario)) {
            Usuario::setAlerta('error', 'Token No Válido');
            $mostrar = false; //Ocultamos el formulario
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

             // Añadir el nuevo password
             $usuario->sincronizar($_POST);

             // Validar el password
             $alertas = $usuario->validarPassword();
 
             if(empty($alertas)) { 
        
                 // Hashear el nuevo password
                 $usuario->hashPassword();
 
                 // Eliminar el Token (Token de un solo uso)
                 $usuario->token = null;
 
                 // Guardar el usuario en la BD
                 $resultado = $usuario->guardar();
 
                 // Redireccionar
                 if($resultado) {
                     header('Location: /');
                 }
             }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/reestablecer', [
            'titulo' => 'Reestablecer Password',
            'alertas' => $alertas,
            'mostrar' => $mostrar
        ]);
    }
}


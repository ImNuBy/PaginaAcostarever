<?php
// auth.php - Sistema de verificación de autenticación y roles
session_start();

function verificarAutenticacion($roles_permitidos = []) {
    // Datos de conexión
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "login";
    
    $usuario_autenticado = false;
    $usuario_info = null;
    
    // Verificar si hay sesión activa
    if (isset($_SESSION['user_id']) && isset($_SESSION['rol'])) {
        $usuario_autenticado = true;
        $usuario_info = [
            'id' => $_SESSION['user_id'],
            'usuario' => $_SESSION['Usuario'],
            'rol' => $_SESSION['rol']
        ];
    } 
    // Verificar cookie de "recordarme"
    elseif (isset($_COOKIE['session_token'])) {
        $conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
        
        if (!$conn->connect_error) {
            $token = $_COOKIE['session_token'];
            $stmt = $conn->prepare("SELECT id, Usuario, rol FROM usuarios WHERE session_token = ? AND activo = TRUE");
            $stmt->bind_param("s", $token);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();
                
                // Restaurar sesión
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['Usuario'] = $user['Usuario'];
                $_SESSION['rol'] = $user['rol'];
                
                $usuario_autenticado = true;
                $usuario_info = [
                    'id' => $user['id'],
                    'usuario' => $user['Usuario'],
                    'rol' => $user['rol']
                ];
                
                // Actualizar último acceso
                $update = $conn->prepare("UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?");
                $update->bind_param("i", $user['id']);
                $update->execute();
                $update->close();
            }
            $stmt->close();
        }
        $conn->close();
    }
    
    // Si no está autenticado, redirigir al login
    if (!$usuario_autenticado) {
        header("Location: Login.html");
        exit();
    }
    
    // Si se especificaron roles permitidos, verificar que el usuario tenga uno de esos roles
    if (!empty($roles_permitidos) && !in_array($usuario_info['rol'], $roles_permitidos)) {
        // Redirigir según el rol del usuario
        switch($usuario_info['rol']) {
            case 'admin':
                header("Location: menuad.html");
                break;
            case 'profesor':
                header("Location: menupr.html");
                break;
            case 'alumno':
                header("Location: menual.html");
                break;
            default:
                header("Location: Login.html");
                break;
        }
        exit();
    }
    
    return $usuario_info;
}

function cerrarSesion() {
    session_start();
    
    // Si hay token de cookie, eliminarlo de la base de datos
    if (isset($_COOKIE['session_token'])) {
        $dbhost = "localhost";
        $dbuser = "root";
        $dbpass = "";
        $dbname = "login";
        
        $conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
        if (!$conn->connect_error) {
            $token = $_COOKIE['session_token'];
            $stmt = $conn->prepare("UPDATE usuarios SET session_token = NULL WHERE session_token = ?");
            $stmt->bind_param("s", $token);
            $stmt->execute();
            $stmt->close();
        }
        $conn->close();
        
        // Eliminar cookie
        setcookie('session_token', '', time() - 3600, '/');
    }
    
    // Limpiar sesión
    session_unset();
    session_destroy();
    
    // Redirigir al login
    header("Location: Login.html");
    exit();
}

// Si se llama directamente para cerrar sesión
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    cerrarSesion();
}
?>
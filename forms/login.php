<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Datos de conexión
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "login";

    // Conexión a la base de datos
    $conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

    // Verificar conexión
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Error de conexión con la base de datos.']);
        exit();
    }

    // Obtener y limpiar datos del formulario
    $Usuario = trim($_POST["txtusuario"] ?? '');
    $Contraseña = trim($_POST["txtpassword"] ?? '');
    $Rol = trim($_POST["eleccion"] ?? '');

    if (empty($Usuario) || empty($Contraseña) || empty($Rol)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit();
    }

    // Consulta segura para buscar al usuario
    $stmt = $conn->prepare("SELECT id, Usuario, Contraseña, rol FROM usuarios WHERE Usuario = ? LIMIT 1");
    $stmt->bind_param("s", $Usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    // Verificar si se encontró el usuario
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $user_id = $user['id'];
        $user_role = $user['rol'];
        $hashed_password = $user['Contraseña'];

        // Verificar la contraseña
        if (password_verify($Contraseña, $hashed_password)) {
            // Verificar si el rol coincide
            if ($Rol === $user_role) {
                // "Recordarme" activado
                if (isset($_POST['rememberMe'])) {
                    $token = bin2hex(random_bytes(16));
                    
                    // Guardar el token en la base de datos
                    $update = $conn->prepare("UPDATE usuarios SET session_token = ? WHERE id = ?");
                    $update->bind_param("si", $token, $user_id);
                    $update->execute();

                    // Guardar cookie válida por 30 días
                    setcookie('session_token', $token, time() + (30 * 24 * 60 * 60), "/");
                }

                // Actualizar último acceso
                $update_access = $conn->prepare("UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?");
                $update_access->bind_param("i", $user_id);
                $update_access->execute();

                // Guardar sesión
                $_SESSION['user_id'] = $user_id;
                $_SESSION['Usuario'] = $Usuario;
                $_SESSION['rol'] = $user_role;

                // Determinar la página de redirección según el rol
                $redirect_page = '';
                switch($user_role) {
                    case 'admin':
                        $redirect_page = 'menuad.html';
                        break;
                    case 'profesor':
                        $redirect_page = 'menupr.html';
                        break;
                    case 'alumno':
                        $redirect_page = 'menual.html';
                        break;
                    default:
                        $redirect_page = 'index.html';
                        break;
                }

                echo json_encode([
                    'success' => true, 
                    'rol' => $user_role,
                    'redirect' => $redirect_page,
                    'message' => 'Login exitoso'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'El rol seleccionado no coincide con tu cuenta.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
    }

    // Cerrar conexión
    $stmt->close();
    $conn->close();
} else {
    // Si no es POST, redirigir al login
    header("Location: Login.html");
    exit();
}
?>
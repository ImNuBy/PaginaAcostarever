<?php
// Verificar si se ha enviado el formulario
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Información de conexión a la base de datos
    $dbhost = "localhost";
    $dbuser = "root";
    $dbpass = "";
    $dbname = "login";
    
    // Conexión a la base de datos
    $conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
    
    // Verificación de la conexión
    if (!$conn) {
        die("No se pudo establecer la conexión: " . mysqli_connect_error());
    }
    
    // Obtener datos del formulario y limpiarlos
    $NUsuario = mysqli_real_escape_string($conn, $_POST["txtNewusuario"]);
    $NContraseña = mysqli_real_escape_string($conn, $_POST["txtNewpassword"]);
    $Rol = mysqli_real_escape_string($conn, $_POST["eleccion"]);
// Obtener el rol seleccionado
    
    // Validar la contraseña
    if (!validatePassword($NContraseña)) {
        echo "La contraseña no es segura. Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.";
    } else {
        // Hashear la contraseña antes de guardarla
        $hashed_password = password_hash($NContraseña, PASSWORD_DEFAULT);
        
        // Consulta SQL para insertar los datos en la tabla de usuarios
        $sql = "INSERT INTO usuarios (Usuario, Contraseña, rol) VALUES ('$NUsuario', '$hashed_password', '$Rol')";
        
        if ($conn->query($sql) === TRUE) {
            // Redirigir a la página de inicio con un mensaje de éxito
            header("Location: ../Login.html?mensaje=Usuario creado exitosamente");
            exit();
        } else {
            echo "Error al registrar el usuario: " . $conn->error;
        }
    }
}

// Función para validar la contraseña
function validatePassword($NContraseña) {
    // Expresión regular para verificar la contraseña
    $passwordRegex = '/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/'; // Ajustado el rango de longitud de la contraseña
    return preg_match($passwordRegex, $NContraseña);
}
?>

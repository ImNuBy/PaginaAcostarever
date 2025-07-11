<?php
session_start();

if (isset($_SESSION['username'])) {
    // Usuario autenticado
} elseif (isset($_COOKIE['session_token'])) {
    // Verificar si la cookie es válida
    $token = $_COOKIE['session_token'];

    // Aquí deberías verificar el token en la base de datos
    // Ejemplo de verificación:
    // $stmt = $pdo->prepare("SELECT username FROM users WHERE session_token = ?");
    // $stmt->execute([$token]);
    // $user = $stmt->fetch();

    if ($user) {
        // Si el token es válido, iniciar sesión
        $_SESSION['username'] = $user['username'];
    } else {
        // Token inválido, redirigir al login
        header("Location: login.html");
        exit();
    }
} else {
    // No hay sesión ni cookie, redirigir al login
    header("Location: login.html");
    exit();
}
?>

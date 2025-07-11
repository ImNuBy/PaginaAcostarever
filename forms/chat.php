<?php
// chat.php - Backend para el sistema de chat escolar
session_start();
header('Content-Type: application/json');

// Incluir verificación de autenticación
require_once 'auth.php';

// Datos de conexión
$dbhost = "localhost";
$dbuser = "root";
$dbpass = "";
$dbname = "login";

$conn = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión con la base de datos']);
    exit();
}

// Verificar que el usuario esté autenticado
$usuario_info = verificarAutenticacion();
if (!$usuario_info) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit();
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch($action) {
    case 'get_rooms':
        getRooms($conn, $usuario_info);
        break;
    case 'get_messages':
        getMessages($conn, $_GET['room_id'] ?? '');
        break;
    case 'send_message':
        sendMessage($conn, $usuario_info, $_POST);
        break;
    case 'get_online_users':
        getOnlineUsers($conn);
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Acción no válida']);
}

function getRooms($conn, $usuario_info) {
    $user_role = $usuario_info['rol'];
    
    // Definir salas según el rol del usuario
    $rooms = [
        [
            'id' => 'general',
            'name' => '🏫 General',
            'description' => 'Chat general de la escuela',
            'allowed_roles' => ['admin', 'profesor', 'alumno'],
            'type' => 'public'
        ],
        [
            'id' => 'profesores',
            'name' => '👨‍🏫 Personal Docente',
            'description' => 'Conversaciones del personal',
            'allowed_roles' => ['admin', 'profesor'],
            'type' => 'restricted'
        ],
        [
            'id' => 'estudiantes',
            'name' => '👨‍🎓 Estudiantes',
            'description' => 'Chat de estudiantes',
            'allowed_roles' => ['alumno'],
            'type' => 'restricted'
        ],
        [
            'id' => 'electronica',
            'name' => '🔌 Electrónica',
            'description' => 'Orientación Electrónica',
            'allowed_roles' => ['admin', 'profesor', 'alumno'],
            'type' => 'subject'
        ],
        [
            'id' => 'programacion',
            'name' => '💻 Programación',
            'description' => 'Orientación Programación',
            'allowed_roles' => ['admin', 'profesor', 'alumno'],
            'type' => 'subject'
        ],
        [
            'id' => 'anuncios',
            'name' => '📢 Anuncios',
            'description' => 'Anuncios oficiales',
            'allowed_roles' => ['admin'],
            'type' => 'announcements'
        ]
    ];
    
    // Filtrar salas según el rol del usuario
    $available_rooms = array_filter($rooms, function($room) use ($user_role) {
        return in_array($user_role, $room['allowed_roles']);
    });
    
    // Obtener último mensaje y conteo de cada sala
    foreach ($available_rooms as &$room) {
        $stmt = $conn->prepare("
            SELECT cm.mensaje, cm.fecha_envio, u.Usuario as autor_nombre, u.rol
            FROM chat_mensajes cm 
            JOIN usuarios u ON cm.usuario_id = u.id 
            WHERE cm.sala_id = ? 
            ORDER BY cm.fecha_envio DESC 
            LIMIT 1
        ");
        $stmt->bind_param("s", $room['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $last_message = $result->fetch_assoc();
            $room['last_message'] = $last_message['mensaje'];
            $room['last_message_time'] = $last_message['fecha_envio'];
        } else {
            $room['last_message'] = 'No hay mensajes aún';
            $room['last_message_time'] = null;
        }
        
        // Contar usuarios online en esta sala (simulado)
        $room['online_count'] = rand(2, 25);
        $stmt->close();
    }
    
    echo json_encode(['rooms' => array_values($available_rooms)]);
}

function getMessages($conn, $room_id) {
    if (empty($room_id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de sala requerido']);
        return;
    }
    
    $stmt = $conn->prepare("
        SELECT 
            cm.id,
            cm.mensaje,
            cm.fecha_envio,
            u.Usuario as autor_nombre,
            u.rol as autor_rol,
            u.id as autor_id
        FROM chat_mensajes cm 
        JOIN usuarios u ON cm.usuario_id = u.id 
        WHERE cm.sala_id = ? 
        ORDER BY cm.fecha_envio ASC
        LIMIT 100
    ");
    
    $stmt->bind_param("s", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = [
            'id' => $row['id'],
            'text' => $row['mensaje'],
            'author' => $row['autor_nombre'],
            'authorName' => $row['autor_nombre'],
            'role' => $row['autor_rol'],
            'timestamp' => $row['fecha_envio'],
            'author_id' => $row['autor_id']
        ];
    }
    
    $stmt->close();
    echo json_encode(['messages' => $messages]);
}

function sendMessage($conn, $usuario_info, $data) {
    $room_id = $data['room_id'] ?? '';
    $message = trim($data['message'] ?? '');
    
    if (empty($room_id) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Sala y mensaje son requeridos']);
        return;
    }
    
    // Validar que el usuario tenga acceso a esta sala
    if (!canAccessRoom($usuario_info['rol'], $room_id)) {
        http_response_code(403);
        echo json_encode(['error' => 'No tienes acceso a esta sala']);
        return;
    }
    
    // Insertar mensaje en la base de datos
    $stmt = $conn->prepare("
        INSERT INTO chat_mensajes (sala_id, usuario_id, mensaje, fecha_envio) 
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->bind_param("sis", $room_id, $usuario_info['id'], $message);
    
    if ($stmt->execute()) {
        $message_id = $conn->insert_id;
        
        // Devolver el mensaje creado
        $response = [
            'success' => true,
            'message' => [
                'id' => $message_id,
                'text' => $message,
                'author' => $usuario_info['usuario'],
                'authorName' => $usuario_info['usuario'],
                'role' => $usuario_info['rol'],
                'timestamp' => date('Y-m-d H:i:s'),
                'author_id' => $usuario_info['id']
            ]
        ];
        
        echo json_encode($response);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error al enviar mensaje']);
    }
    
    $stmt->close();
}

function getOnlineUsers($conn) {
    // Actualizar último acceso del usuario actual
    if (isset($_SESSION['user_id'])) {
        $stmt = $conn->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
        $stmt->bind_param("i", $_SESSION['user_id']);
        $stmt->execute();
        $stmt->close();
    }
    
    // Obtener usuarios activos en los últimos 5 minutos
    $stmt = $conn->prepare("
        SELECT 
            Usuario, 
            rol, 
            ultimo_acceso 
        FROM usuarios 
        WHERE ultimo_acceso > DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
        AND activo = TRUE
        ORDER BY ultimo_acceso DESC
    ");
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $online_users = [];
    while ($row = $result->fetch_assoc()) {
        $online_users[] = [
            'name' => $row['Usuario'],
            'role' => $row['rol'],
            'last_seen' => $row['ultimo_acceso']
        ];
    }
    
    $stmt->close();
    
    echo json_encode([
        'online_users' => $online_users,
        'total_count' => count($online_users)
    ]);
}

function canAccessRoom($user_role, $room_id) {
    $room_permissions = [
        'general' => ['admin', 'profesor', 'alumno'],
        'profesores' => ['admin', 'profesor'],
        'estudiantes' => ['alumno'],
        'electronica' => ['admin', 'profesor', 'alumno'],
        'programacion' => ['admin', 'profesor', 'alumno'],
        'anuncios' => ['admin']
    ];
    
    return isset($room_permissions[$room_id]) && 
           in_array($user_role, $room_permissions[$room_id]);
}

$conn->close();
?>
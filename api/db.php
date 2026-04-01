<?php
// Securely load environment variables from outside the public directory
$envPath = __DIR__ . '/../../.env';

if (!file_exists($envPath)) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Environment file missing']));
}

$envVariables = parse_ini_file($envPath);

$host = $envVariables['DB_HOST'] ?? 'localhost';
$dbname = $envVariables['DB_NAME'] ?? 'particle_mogul_db';
$user = $envVariables['DB_USER'] ?? 'root';
$pass = $envVariables['DB_PASS'] ?? ''; // Default XAMPP

try {
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_EMULATE_PREPARES => false, // Better for modern MySQL
    ];
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, $options);
} catch (PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}
?>

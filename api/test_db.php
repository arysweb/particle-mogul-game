<?php
$envPath = __DIR__ . '/../../.env';
echo "Env path: $envPath\n";
echo "File exists? " . (file_exists($envPath) ? 'Yes' : 'No') . "\n";
if (file_exists($envPath)) {
    $envVariables = parse_ini_file($envPath);
    echo "Host: " . $envVariables['DB_HOST'] . "\n";
    echo "DB: " . $envVariables['DB_NAME'] . "\n";
    echo "User: " . $envVariables['DB_USER'] . "\n";
    echo "Pass: '" . $envVariables['DB_PASS'] . "'\n";
    
    try {
        $pdo = new PDO("mysql:host=" . $envVariables['DB_HOST'] . ";dbname=" . $envVariables['DB_NAME'], $envVariables['DB_USER'], $envVariables['DB_PASS']);
        echo "Connected successfully!\n";
    } catch (PDOException $e) {
        echo "PDOException: " . $e->getMessage() . "\n";
    }
}
?>

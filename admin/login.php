<?php
session_start();
$env_path = dirname(__DIR__, 2) . '/.env';
$env = parse_ini_file($env_path);
$correct_password = $env['ADMIN_PASSWORD'] ?? 'particle_mogul_creator_2026';

if (isset($_POST['password'])) {
    if ($_POST['password'] === $correct_password) {
        $_SESSION['admin_logged_in'] = true;
        session_regenerate_id(true);
        $_SESSION['last_regen'] = time();
        header('Location: index.php');
        exit;
    } else {
        $error = "Invalid password!";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Particle Mogul - Admin Login</title>
    <style>
        body { background: #1a1a1a; color: #fff; font-family: 'Courier New', Courier, monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .login-box { background: #2a2a2a; padding: 40px; border-radius: 12px; border: 1px solid #444; width: 320px; text-align: center; }
        input { width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 6px; border: 1px solid #555; background: #333; color: #fff; box-sizing: border-box; }
        button { width: 100%; padding: 12px; border-radius: 6px; border: none; background: #ffd700; color: #000; font-weight: bold; cursor: pointer; }
        .error { color: #ff5555; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>ADMIN LOGIN</h2>
        <?php if (isset($error)): ?><div class="error"><?php echo $error; ?></div><?php endif; ?>
        <form method="POST">
            <input type="password" name="password" placeholder="Enter Admin Password" required autofocus>
            <button type="submit">LOGIN</button>
        </form>
    </div>
</body>
</html>

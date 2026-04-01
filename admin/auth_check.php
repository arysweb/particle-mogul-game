<?php
session_start();

function checkAdmin() {
    // Regenerate session ID to prevent fixation
    if (!isset($_SESSION['last_regen'])) {
        session_regenerate_id(true);
        $_SESSION['last_regen'] = time();
    } elseif (time() - $_SESSION['last_regen'] > 300) {
        session_regenerate_id(true);
        $_SESSION['last_regen'] = time();
    }

    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: login.php');
        exit;
    }
}
?>

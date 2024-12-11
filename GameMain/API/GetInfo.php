<?php

function GetInfo($email){
    // Dynamically determine the relative path for autoload
    $autoloadPath = 'API/config.php';
    // Check if the file exists in the determined path
    if (file_exists($autoloadPath)) {
        require_once $autoloadPath;
    } else {
        require_once '../API/config.php';
    }
    //session_start();
    $conn = Connect2Database();
    //$name = $_SESSION['Login_Name'];
    $sql = "SELECT full_name, email, id from users WHERE email = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    $userinfo = ['email' => $row['email'],
                'full_name' => $row['full_name'],
                'PlayerID' => $row['id']];   

    $sql = "SELECT * FROM userrecord WHERE PlayerID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $userinfo['PlayerID']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);

    $userinfo = array_merge($userinfo, [
        'MaxScore' => $row['MaxScore'],
        'MaxHitRate' => $row['MaxHitRate'],
        'havePlayed' => $row['havePlayed']
    ]);
    return $userinfo;
}

?>
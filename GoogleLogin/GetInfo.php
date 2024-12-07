<?php

function GetInfo(){
    require_once 'config.php';
    session_start();

    $sql = "SELECT full_name, email from users WHERE full_name = '{$_SESSION['Login_Name']}'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    $userinfo = ['email' => $row['email'],
                'full_name' => $row['full_name'],];
    
    
                
    return $userinfo;
}

?>
<?php
  session_start();
  if($_SESSION['Login_Method'] == 'Google'){
    require_once 'GoogleLogin.php';
    $userinfo = GoogleLoginEvent(); 
  }else{
    require_once 'GetInfo.php';
    $userinfo = GetInfo();
  }
  
  
  
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>

<body>
  <ul>
    <li>Full Name: <?= $userinfo['full_name'] ?></li>
    <li>Email Address: <?= $userinfo['email'] ?></li>
    <li>Gender: <?= $userinfo['gender'] ?></li>
    <li><a href="logout.php">Logout</a></li>
  </ul>
  <button id="log">Log</button>

  <script src="game.js"></script>
</body>

</html>
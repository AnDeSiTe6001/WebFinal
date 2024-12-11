<?php
  session_start();
  if($_SESSION['Login_Method'] == 'Google'){
    require_once 'GoogleLogin.php';
    $userinfo = @GoogleLoginEvent(); 
  }else{
    require_once 'API/GetInfo.php';
    $userinfo = @GetInfo($_SESSION['Login_Name']);
  }
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
<!-- <meta http-equiv="X-UA-Compatible" content="IE=edge"> -->
  
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>

<body>
  <ul>
    <li>Full Name: <?php echo htmlspecialchars($userinfo['full_name']) ?></li>
    <li>Email Address: <?php echo  htmlspecialchars($userinfo['email']) ?></li>
    <li>MaxScore: <?php echo  htmlspecialchars($userinfo['MaxScore']) ?></li>
    <li>MaxHitRate: <?php echo  htmlspecialchars($userinfo['MaxHitRate']) ?></li>
    <li>havePlayed: <?php echo  htmlspecialchars($userinfo['havePlayed']) ?></li>
    <li id="PlayerID">ID: <?php echo  htmlspecialchars($userinfo['PlayerID']) ?></li>
    
    <li><a href="logout.php">Logout</a></li>
  </ul>
  <button id="log">Log</button>

  <script type="module" src="game.js"></script>
</body>

</html>

<?php
  session_start();
  if($_SESSION['Login_Method'] == 'Google'){
    require_once '../GoogleLogin.php';
    $userinfo = @GoogleLoginEvent(); 
  }else{
    require_once '../API/GetInfo.php';
    $userinfo = @GetInfo($_SESSION['Login_Name']);
  }
?>

<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <title>怪物射擊遊戲</title>
    <!-- 引入 Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- 引入 Google Fonts (可選) -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap">
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
    <!-- 引入 CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- 三維渲染區域由 JavaScript 動態添加 -->

    <!-- UI 覆蓋層將由 JavaScript 動態添加 -->
    <p id="PlayerID"> ID: <?php echo htmlspecialchars($userinfo['PlayerID']) ?> </p>
    
<!-- <a style="cursor: pointer; color: white;z-index: 1;" href="../logout.php">Logout</a> -->
    
    <script type="module" src="../game.js"></script>
    <script type="module" src="js/main.js"></script>
</body>
</html>

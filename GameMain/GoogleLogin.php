<?php

function GoogleLoginEvent(){
  $autoloadPath = 'API/config.php';
  if (file_exists($autoloadPath)) {
      require_once $autoloadPath;
      require_once 'API/GetInfo.php';
  } else {
      require_once '../API/config.php';
      require_once '../API/GetInfo.php';
  }
  // authenticate code from Google OAuth Flow
  if (isset($_GET['code'])) {
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
    //$client->setAccessToken($token['access_token']);

    // get profile info
    $google_oauth = new Google\Service\Oauth2($client);
    $google_account_info = $google_oauth->userinfo->get();
    $userinfo = [
      'email' => $google_account_info['email'],
      'gender' => $google_account_info['gender'],
      'full_name' => $google_account_info['name'],
      'verifiedEmail' => $google_account_info['verifiedEmail'],
      'token' => $google_account_info['id'],
    ];

    $conn = Connect2Database();
    // checking if user is already exists in database
    $sql = "SELECT * FROM users WHERE email ='{$userinfo['email']}'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // user is exists
      $userinfo = mysqli_fetch_assoc($result);
      $token = $userinfo['token'];
    } else {
      // user is not exists
      $sql = "INSERT INTO users (email, full_name, verifiedEmail, token) VALUES ('{$userinfo['email']}', '{$userinfo['full_name']}','{$userinfo['verifiedEmail']}', '{$userinfo['token']}')";
      $result = mysqli_query($conn, $sql);
      if ($result) {
        $token = $userinfo['token'];

        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $userinfo['email']);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);

        $id = $row['id'];

        $sql = "INSERT INTO userrecord (full_name, PlayerID) VALUES (?,?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "si",$userinfo['full_name'],$id);
        mysqli_stmt_execute($stmt);

        if(!$result){
          echo "User is not created";
          die();
        }
      } else {
        echo "User is not created";
        die();
      }
    }
    $returnUserInfo = GetInfo($userinfo['email']);

    // save user data into session
    $_SESSION['user_token'] = $token;
    $_SESSION['Login_Name'] = $userinfo['email'];
    //$_SESSION['Login_Method'] = 'Google';
  } else {
    if (!isset($_SESSION['user_token'])) {
      header("Location: index.php");
      die();
    }
    $conn = Connect2Database();
    // checking if user is already exists in database
    $sql = "SELECT * FROM users WHERE token ='{$_SESSION['user_token']}'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // user is exists
      $userinfo = mysqli_fetch_assoc($result);
      $returnUserInfo = GetInfo($userinfo['email']);
      $_SESSION['Login_Name'] = $userinfo['email'];
    }
  }  

  return $returnUserInfo;
}

/*if ($_SERVER['REQUEST_METHOD'] === 'GET'){
  return CreateGoogleConnect();
}*/

?>
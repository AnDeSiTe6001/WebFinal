<?php
function GoogleLoginEvent(){
  require_once 'config.php';
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

    
    // checking if user is already exists in database
    $sql = "SELECT * FROM users WHERE email ='{$userinfo['email']}'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // user is exists
      $userinfo = mysqli_fetch_assoc($result);
      $token = $userinfo['token'];
    } else {
      // user is not exists
      $sql = "INSERT INTO users (email, gender, full_name, verifiedEmail, token) VALUES ('{$userinfo['email']}', '{$userinfo['gender']}', '{$userinfo['full_name']}','{$userinfo['verifiedEmail']}', '{$userinfo['token']}')";
      $result = mysqli_query($conn, $sql);
      if ($result) {
        $token = $userinfo['token'];
      } else {
        echo "User is not created";
        die();
      }
    }

    // save user data into session
    $_SESSION['user_token'] = $token;
  } else {
    if (!isset($_SESSION['user_token'])) {
      header("Location: index.php");
      die();
    }

    // checking if user is already exists in database
    $sql = "SELECT * FROM users WHERE token ='{$_SESSION['user_token']}'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // user is exists
      $userinfo = mysqli_fetch_assoc($result);
    }
  }  

  return $userinfo;
}

?>
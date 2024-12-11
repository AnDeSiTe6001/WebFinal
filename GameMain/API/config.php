<?php
// Dynamically determine the relative path for autoload
$autoloadPath = 'vendor/autoload.php';
// Check if the file exists in the determined path
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    require_once '../vendor/autoload.php';
}

session_start();
// init configuration
$clientID = '363359951467-pc2dc1vh8bgleb1grkeo1u5td2kcfupi.apps.googleusercontent.com'; // your client id
$clientSecret = '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'; // your client secret
$redirectUri = 'http://localhost/GameMain/mergegame3/index.php'; // 

// create Client Request to access Google API
$client = new Google_Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);
$client->addScope("email");
$client->addScope("profile");

function Connect2Database(){
    // Connect to database
    $hostname = "localhost";
    $username = "yuan";
    $password = "hw5_DW";
    $database = "dw_final";

    return mysqli_connect($hostname, $username, $password, $database);    
}

/*function CreateGoogleConnect(){
    $client->createAuthUrl();
}*/ 
?>
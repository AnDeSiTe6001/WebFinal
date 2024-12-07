<?php
require_once 'vendor/autoload.php';
session_start();
// init configuration
$clientID = '363359951467-pc2dc1vh8bgleb1grkeo1u5td2kcfupi.apps.googleusercontent.com'; // your client id
$clientSecret = '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'; // your client secret
$redirectUri = 'http://localhost/GoogleLogin/game.php'; // 

// create Client Request to access Google API
$client = new Google_Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);
$client->addScope("email");
$client->addScope("profile");

// Connect to database
$hostname = "localhost";
$username = "yuan";
$password = "hw5_DW";
$database = "test";

$conn = mysqli_connect($hostname, $username, $password, $database);
?>
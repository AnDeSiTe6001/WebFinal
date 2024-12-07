<?php

require_once 'config.php';

// Determine Request Method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') { // create account 
    if (isset($_POST['action'])) {
        // check if player name has already exist.

        switch($_POST['action']){
            case 'CreateAccount':
                $sql = "SELECT * FROM users WHERE full_name = '{$_POST['name']}'";
                $result = mysqli_query($conn, $sql);

                if (mysqli_num_rows($result) > 0) {
                    // warn user that the name is being used.
                    header("Content-Type: application/json");
                    $msg = ['message' => 'User name used.'];
                    echo json_encode($msg);
                    exit;
                }else{
                    $sql = "SELECT * FROM users WHERE email = '{$_POST['email']}'";
                    $result = mysqli_query($conn, $sql);

                    if(mysqli_num_rows($result) > 0){
                        header("Content-Type: application/json");
                        $msg = ['message' => 'Email used.'];
                        echo json_encode($msg);
                        exit;
                    }else{
                        // user is not exists
                    
                        $sql = "INSERT INTO users (email, full_name, Password) VALUES ('{$_POST['email']}', '{$_POST['name']}', '{$_POST['password']}')";
                        $result = mysqli_query($conn, $sql);
                        if ($result) {
                            header("Content-Type: application/json");
                            $msg = ['message' => "Success.", 'redirect' => "game.php"];
                            echo json_encode($msg);
                            $_SESSION['Login_Method'] = 'General';
                            $_SESSION['Login_Name'] = $_POST['name'];
                            exit;
                        } else {
                            header("Content-Type: application/json");
                            $msg = ['message' => "User is not created"];
                            echo json_encode($msg);
                            die();
                        }
                    }
                }

                break;
            default:
                break;
        }

    }
}else if($method === 'GET'){ // login
    if(isset($_GET['action'])){
        switch($_GET['action']){
            case 'Login':
                $email = $_GET['email'];
                // Check if user name exist
                $sql = "SELECT * FROM users WHERE email = ?";
                $stmt = mysqli_prepare($conn, $sql);
                mysqli_stmt_bind_param($stmt, "s", $email);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
                //$result = mysqli_query($conn, $sql);

                if(mysqli_num_rows($result) > 0){
                    $sql = "SELECT Password FROM users WHERE email = ?";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "s", $email);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);

                    $row = mysqli_fetch_assoc($result);

                    if($_GET['password'] === $row['Password']){
                        $_SESSION['Login_Method'] = 'General';

                        $sql = "SELECT full_name FROM users WHERE email = ?";
                        $stmt = mysqli_prepare($conn, $sql);
                        mysqli_stmt_bind_param($stmt, "s", $email);
                        mysqli_stmt_execute($stmt);
                        $result = mysqli_stmt_get_result($stmt);
                        
                        $row = mysqli_fetch_assoc($result);

                        $_SESSION['Login_Name'] = $row['full_name'];

                        header("Content-Type: application/json");
                        $msg = ['message' => "Success.", 'redirect' => "game.php"];
                        echo json_encode($msg);
                        
                        
                    }else{
                        header("Content-Type: application/json");
                        $msg = ['message' => "Password incorrect."];
                        echo json_encode($msg);
                        die();
                    }
                }else{
                    $msg = ['message' => "User does not exist."];
                    echo json_encode($msg);
                    die();
                }
                // Check if password is correct


                break;
            default:
                break;
        }
    }
}

?>
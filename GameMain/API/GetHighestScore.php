<?php
    require_once 'config.php';
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if(isset($_GET['action'])){
            switch($_GET['action']){
                case 'GetHighestScore':
                    $conn = Connect2Database();
                    $sql = "SELECT MaxScore FROM userrecord WHERE PlayerID=?";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "i", $_GET['id']);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    $row = mysqli_fetch_assoc($result);

                    $MaxScore = $row['MaxScore'];
                    if(!isset($MaxScore)){
                        $msg = ['message' => "Fail read MaxScore.", 'MaxScore' => "-1"]; //
                        echo json_encode($msg); 
                    }else{
                        $msg = ['message' => "Success.", 'MaxScore' => $MaxScore]; //
                        echo json_encode($msg); 
                    }
                    exit;
            }
        }
    }
?>
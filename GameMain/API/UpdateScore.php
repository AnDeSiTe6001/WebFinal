<?php
    require_once 'config.php';
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        if(isset($_POST['action'])){
            switch($_POST['action']){
                case 'ScoreUpdate':
                    $conn = Connect2Database();
                    $sql = "SELECT MaxScore FROM userrecord WHERE PlayerID=?";
                    $stmt = mysqli_prepare($conn, $sql);
                    mysqli_stmt_bind_param($stmt, "i", $_POST['id']);
                    mysqli_stmt_execute($stmt);
                    $result = mysqli_stmt_get_result($stmt);
                    $row = mysqli_fetch_assoc($result);

                    $MaxScore = $row['MaxScore'];
                    if(!isset($MaxScore)){
                        echo "Fail read MaxScore.";
                        exit;
                    }else{
                        if($MaxScore < $_POST['curScore']){
                            $sql = "UPDATE userrecord SET MaxScore=? WHERE PlayerID=?";
                            $stmt = mysqli_prepare($conn, $sql);
                            mysqli_stmt_bind_param($stmt, "ii",$_POST['curScore'], $_POST['id']);
                            mysqli_stmt_execute($stmt);    
                        }    
                    }
                    
                    
                    echo "Success Update.";
                    break;
            }
        }
    }
?>
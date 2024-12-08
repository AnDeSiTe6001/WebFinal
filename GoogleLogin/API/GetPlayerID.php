<?php
    require_once 'config.php';
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if(isset($_GET['action'])){
            switch($_GET['action']){
                case 'GetPlayerID':
                    
                    break;
            }
        }
    }
?>
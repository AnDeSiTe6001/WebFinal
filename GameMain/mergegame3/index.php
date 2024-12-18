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
    <!-- 三維渲染區域由 JavaScript 動態添加 -->

    <!-- UI 覆蓋層將由 JavaScript 動態添加 -->
    <!-- <div id="sniper-scope"></div> -->
    <link type="text/css" rel="stylesheet" href="css/parallax.css">
    <style>
        body {
            color: #444;
        }
        a {
            color: #08f;
        }
        #webcam {
            position: absolute;
            top: 10px;
            left: 10px;
            width: 320px;
            height: 240px;
            /* border: 2px solid #444; */
        }
        .switch {
            position: absolute;
            top: 10px;
            right: 10px;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        input:checked + .slider {
            background-color: #2196F3;
        }
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        .slider.round {
            border-radius: 34px;
        }
        .slider.round:before {
            border-radius: 50%;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <div id="damage-overlay"></div>
    <!-- <div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - portal</div> -->
    <span style="position: absolute; top: 18px; right: 80px;">Debug Mode</span>
    <!-- <div style="position: absolute; top: 50px; right: 10px;">
        <input type="range" id="ParallaxCoefSlider" min="0.0001" max="0.008" step="0.0001" value="0.004">
        <span>Parallax Coefficient</span>
    </div>
    <div style="position: absolute; top: 90px; right: 10px;">
        <input type="range" id="KalmanRSlider" min="0.001" max="0.1" step="0.001" value="0.06">
        <span>Kalman R</span>
    </div>
    <div style="position: absolute; top: 130px; right: 10px;">
        <input type="range" id="KalmanQSlider" min="0.01" max="1.0" step="0.01" value="0.3">
        <span>Kalman Q</span>
    </div> -->
    <div style="position: absolute; top: 170px; right: 10px;">
        <label class="switch">
            <input type="checkbox" id="flipHorizontalSwitch">
            <span class="slider round"></span>
        </label>
        <span style="position: relative; right: 80px; top: 10px">Flip Horizontal</span>
    </div>

    <p id="PlayerID"><?php echo htmlspecialchars($userinfo['PlayerID']) ?> </p>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.150.1/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.150.1/examples/jsm/"
            }
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet"></script>
    <script type="module" src="js/parallax.js"></script>

    <script type="module" src="js/main.js"></script>
    <script type="module" src="../gameControl.js"></script>
</body>
</html>

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2024-12-12 01:25:27
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `dw_final`
--

-- --------------------------------------------------------

--
-- 資料表結構 `userrecord`
--

CREATE TABLE `userrecord` (
  `full_name` varchar(255) NOT NULL,
  `MaxScore` int(11) NOT NULL DEFAULT 0,
  `MaxHitRate` double NOT NULL DEFAULT 0,
  `havePlayed` int(11) NOT NULL DEFAULT 0,
  `PlayerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `userrecord`
--

INSERT INTO `userrecord` (`full_name`, `MaxScore`, `MaxHitRate`, `havePlayed`, `PlayerID`) VALUES
('李湧安', 0, 0, 0, 1),
('淤安', 20, 0, 0, 2),
('yuan', 150, 0, 0, 3);

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `full_name` varchar(100) NOT NULL DEFAULT '',
  `verifiedEmail` int(11) NOT NULL DEFAULT 0,
  `token` varchar(255) NOT NULL DEFAULT '',
  `Password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`id`, `email`, `full_name`, `verifiedEmail`, `token`, `Password`) VALUES
(1, 'josephlee921006@gmail.com', '李湧安', 1, '117889835915368537615', ''),
(2, 'yuanlee030g2@gmail.com', '淤安', 1, '104236611084456837438', ''),
(3, '123@gmail.com', 'yuan', 0, '', '123');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

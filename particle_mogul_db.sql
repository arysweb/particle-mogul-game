-- phpMyAdmin SQL Dump
-- version 5.2.2deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2026 at 08:11 PM
-- Server version: 8.4.7-0ubuntu0.25.04.2
-- PHP Version: 8.4.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `particle_mogul_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `game_saves`
--

CREATE TABLE `game_saves` (
  `save_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `save_slot` int DEFAULT '1',
  `save_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaderboard`
--

CREATE TABLE `leaderboard` (
  `leaderboard_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `score_type` enum('total_money','total_particles','highest_balance','playtime') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score_value` bigint DEFAULT NULL,
  `achieved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `market_trades`
--

CREATE TABLE `market_trades` (
  `trade_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `from_particle_type` enum('sand','iron','copper','silver','gold','emerald','ruby') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_particle_type` enum('sand','iron','copper','silver','gold','emerald','ruby') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_amount` int DEFAULT NULL,
  `to_amount` int DEFAULT NULL,
  `trade_rate` decimal(10,4) DEFAULT NULL,
  `traded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `particle_inventory_history`
--

CREATE TABLE `particle_inventory_history` (
  `history_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `particle_type` enum('sand','iron','copper','silver','gold','emerald','ruby') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `count` int DEFAULT '0',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `players`
--

CREATE TABLE `players` (
  `player_id` int NOT NULL,
  `player_uid` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `player_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_playtime_seconds` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `player_statistics`
--

CREATE TABLE `player_statistics` (
  `stat_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `total_particles_dropped` bigint DEFAULT '0',
  `total_money_earned` bigint DEFAULT '0',
  `total_money_spent` bigint DEFAULT '0',
  `highest_wallet_balance` bigint DEFAULT '0',
  `total_research_completed` int DEFAULT '0',
  `extractor_level_reached` int DEFAULT '1',
  `trader_level_reached` int DEFAULT '1',
  `rare_particles_unlocked` tinyint(1) DEFAULT '0',
  `total_gold_drops` int DEFAULT '0',
  `total_play_sessions` int DEFAULT '0',
  `longest_session_seconds` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `play_sessions`
--

CREATE TABLE `play_sessions` (
  `session_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `session_start` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `session_end` timestamp NULL DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `particles_dropped` int DEFAULT '0',
  `money_earned` int DEFAULT '0',
  `money_spent` int DEFAULT '0',
  `research_completed` int DEFAULT '0',
  `extractor_upgrades` int DEFAULT '0',
  `trader_upgrades` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `research_progress`
--

CREATE TABLE `research_progress` (
  `progress_id` int NOT NULL,
  `player_id` int DEFAULT NULL,
  `research_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `research_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_time_ms` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `game_saves`
--
ALTER TABLE `game_saves`
  ADD PRIMARY KEY (`save_id`),
  ADD UNIQUE KEY `unique_player_slot` (`player_id`,`save_slot`);

--
-- Indexes for table `leaderboard`
--
ALTER TABLE `leaderboard`
  ADD PRIMARY KEY (`leaderboard_id`),
  ADD KEY `player_id` (`player_id`),
  ADD KEY `idx_score_type` (`score_type`,`score_value` DESC);

--
-- Indexes for table `market_trades`
--
ALTER TABLE `market_trades`
  ADD PRIMARY KEY (`trade_id`),
  ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `particle_inventory_history`
--
ALTER TABLE `particle_inventory_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_player_particle_time` (`player_id`,`particle_type`,`recorded_at`);

--
-- Indexes for table `players`
--
ALTER TABLE `players`
  ADD PRIMARY KEY (`player_id`),
  ADD UNIQUE KEY `player_uid` (`player_uid`),
  ADD KEY `idx_player_name` (`player_name`);

--
-- Indexes for table `player_statistics`
--
ALTER TABLE `player_statistics`
  ADD PRIMARY KEY (`stat_id`),
  ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `play_sessions`
--
ALTER TABLE `play_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `player_id` (`player_id`);

--
-- Indexes for table `research_progress`
--
ALTER TABLE `research_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `idx_player_research` (`player_id`,`research_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `game_saves`
--
ALTER TABLE `game_saves`
  MODIFY `save_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=243;

--
-- AUTO_INCREMENT for table `leaderboard`
--
ALTER TABLE `leaderboard`
  MODIFY `leaderboard_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `market_trades`
--
ALTER TABLE `market_trades`
  MODIFY `trade_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `particle_inventory_history`
--
ALTER TABLE `particle_inventory_history`
  MODIFY `history_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `player_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `player_statistics`
--
ALTER TABLE `player_statistics`
  MODIFY `stat_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `play_sessions`
--
ALTER TABLE `play_sessions`
  MODIFY `session_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `research_progress`
--
ALTER TABLE `research_progress`
  MODIFY `progress_id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_saves`
--
ALTER TABLE `game_saves`
  ADD CONSTRAINT `game_saves_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `leaderboard`
--
ALTER TABLE `leaderboard`
  ADD CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `market_trades`
--
ALTER TABLE `market_trades`
  ADD CONSTRAINT `market_trades_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `particle_inventory_history`
--
ALTER TABLE `particle_inventory_history`
  ADD CONSTRAINT `particle_inventory_history_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `player_statistics`
--
ALTER TABLE `player_statistics`
  ADD CONSTRAINT `player_statistics_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `play_sessions`
--
ALTER TABLE `play_sessions`
  ADD CONSTRAINT `play_sessions_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;

--
-- Constraints for table `research_progress`
--
ALTER TABLE `research_progress`
  ADD CONSTRAINT `research_progress_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

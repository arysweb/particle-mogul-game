-- phpMyAdmin SQL Dump
-- version 5.2.2deb1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2026 at 10:23 PM
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

--
-- Dumping data for table `game_saves`
--

INSERT INTO `game_saves` (`save_id`, `player_id`, `save_slot`, `save_data`, `created_at`, `updated_at`) VALUES
(243, 2, 1, '{\"state\": {\"sellCap\": 10, \"goldDrops\": 2, \"inventory\": {\"gold\": 2, \"iron\": 13, \"ruby\": 0, \"sand\": 5, \"copper\": 6, \"silver\": 2, \"emerald\": 0}, \"walletBalance\": 1730, \"rareParticlesUnlocked\": false}, \"savedAt\": 1775082167590, \"traderState\": {\"level\": 1, \"enabled\": true, \"intervalMs\": 4000, \"lastSellAt\": 1775082163596, \"sellAmount\": 15, \"upgradeCost\": 250, \"selectedParticle\": \"sand\"}, \"researchState\": {\"activeResearchId\": null, \"activeResearchEndsAt\": null, \"completedResearchIds\": [\"unlock-trader\"], \"researchSpeedMultiplier\": 1}, \"extractorLevel\": 1, \"currentDropInterval\": 1000, \"extractorUpgradeCost\": 500, \"totalParticlesDropped\": 2196}', '2026-04-01 21:43:15', '2026-04-01 22:22:48');

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

--
-- Dumping data for table `leaderboard`
--

INSERT INTO `leaderboard` (`leaderboard_id`, `player_id`, `score_type`, `score_value`, `achieved_at`) VALUES
(1, 2, 'total_money', 1730, '2026-04-01 22:22:48'),
(2, 2, 'total_particles', 2196, '2026-04-01 22:22:48'),
(3, 2, 'highest_balance', 1730, '2026-04-01 22:22:48');

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

--
-- Dumping data for table `market_trades`
--

INSERT INTO `market_trades` (`trade_id`, `player_id`, `from_particle_type`, `to_particle_type`, `from_amount`, `to_amount`, `trade_rate`, `traded_at`) VALUES
(1, 2, 'sand', 'iron', 120, 1, 120.0000, '2026-04-01 21:58:30'),
(2, 2, 'sand', 'iron', 120, 1, 120.0000, '2026-04-01 21:58:33');

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

--
-- Dumping data for table `players`
--

INSERT INTO `players` (`player_id`, `player_uid`, `player_name`, `created_at`, `last_login_at`, `total_playtime_seconds`, `is_active`) VALUES
(2, 'player_3001ab05', 'Sebas', '2026-04-01 21:43:15', '2026-04-01 22:22:48', 0, 1);

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

--
-- Dumping data for table `player_statistics`
--

INSERT INTO `player_statistics` (`stat_id`, `player_id`, `total_particles_dropped`, `total_money_earned`, `total_money_spent`, `highest_wallet_balance`, `total_research_completed`, `extractor_level_reached`, `trader_level_reached`, `rare_particles_unlocked`, `total_gold_drops`, `total_play_sessions`, `longest_session_seconds`, `created_at`, `updated_at`) VALUES
(1, 2, 2196, 0, 0, 1730, 0, 1, 1, 0, 2, 0, 0, '2026-04-01 21:43:15', '2026-04-01 22:22:48');

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

--
-- Dumping data for table `play_sessions`
--

INSERT INTO `play_sessions` (`session_id`, `player_id`, `session_start`, `session_end`, `duration_seconds`, `particles_dropped`, `money_earned`, `money_spent`, `research_completed`, `extractor_upgrades`, `trader_upgrades`) VALUES
(1, 2, '2026-04-01 21:53:50', '2026-04-01 21:56:33', 163, 1432, 615, 0, 0, 0, 0),
(2, 2, '2026-04-01 21:56:33', '2026-04-01 22:05:38', 545, 1687, 1228, 0, 0, 0, 0),
(3, 2, '2026-04-01 22:05:39', '2026-04-01 22:07:42', 123, 1795, 1336, 0, 0, 0, 0),
(4, 2, '2026-04-01 22:07:42', '2026-04-01 22:08:57', 75, 1869, 1407, 0, 0, 0, 0),
(5, 2, '2026-04-01 22:08:57', '2026-04-01 22:14:58', 361, 2033, 1571, 0, 0, 0, 0),
(6, 2, '2026-04-01 22:14:58', '2026-04-01 22:15:25', 27, 2060, 1598, 0, 0, 0, 0),
(7, 2, '2026-04-01 22:20:26', '2026-04-01 22:21:37', 71, 2126, 1663, 0, 0, 0, 0),
(8, 2, '2026-04-01 22:21:37', '2026-04-01 22:22:48', 71, 2196, 1730, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `research_items`
--

CREATE TABLE `research_items` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grid_x` int DEFAULT '0',
  `grid_y` int DEFAULT '0',
  `cost_json` json DEFAULT NULL,
  `duration_ms` int DEFAULT '5000',
  `effect_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `research_items`
--

INSERT INTO `research_items` (`id`, `name`, `description`, `image_url`, `grid_x`, `grid_y`, `cost_json`, `duration_ms`, `effect_json`, `created_at`, `updated_at`) VALUES
('extractor-output-boost-1', 'Extractor', 'Boosts extractor output by 5%.', 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/extractor.png', 2, 0, '{\"coins\": 250, \"particles\": {\"iron\": 10, \"sand\": 250}}', 7000, '{\"type\": \"extractor_output_multiplier\", \"value\": 1.05}', '2026-04-01 22:13:08', '2026-04-01 22:13:08'),
('unlock-trader', 'Trader', 'Auto-sells particles.', 'https://pub-136c85f7b0db4549ba25bf23723988bf.r2.dev/assets/image/research-item.png', 0, 0, '{\"coins\": 100, \"particles\": {\"sand\": 100}}', 5000, '{\"type\": \"unlock_trader\"}', '2026-04-01 22:13:08', '2026-04-01 22:13:08');

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
-- Dumping data for table `research_progress`
--

INSERT INTO `research_progress` (`progress_id`, `player_id`, `research_id`, `research_name`, `completed_at`, `completion_time_ms`) VALUES
(1, 2, 'unlock-trader', 'Research #unlock-trader', '2026-04-01 21:51:47', NULL);

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
-- Indexes for table `research_items`
--
ALTER TABLE `research_items`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `save_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=244;

--
-- AUTO_INCREMENT for table `leaderboard`
--
ALTER TABLE `leaderboard`
  MODIFY `leaderboard_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `market_trades`
--
ALTER TABLE `market_trades`
  MODIFY `trade_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `players`
--
ALTER TABLE `players`
  MODIFY `player_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `player_statistics`
--
ALTER TABLE `player_statistics`
  MODIFY `stat_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `play_sessions`
--
ALTER TABLE `play_sessions`
  MODIFY `session_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `research_progress`
--
ALTER TABLE `research_progress`
  MODIFY `progress_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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

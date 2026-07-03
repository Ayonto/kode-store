/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;
DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Admin_username_key` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES
(1,'admin','$2b$10$1BLQYzcXtD22v.OI6b/tZe.iBgHqh8dNHRDb8EPGoY.j1s7llgFZK','2026-06-14 05:46:12.657');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `imageUrl` text DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES
(6,'Drop Shoulders','drop-shoulders',NULL,0,'2026-06-14 05:59:52.284');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(191) NOT NULL,
  `customerName` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(191) DEFAULT NULL,
  `deliveryZone` varchar(191) NOT NULL,
  `notes` text DEFAULT NULL,
  `subtotal` int(11) NOT NULL,
  `deliveryCharge` int(11) NOT NULL,
  `total` int(11) NOT NULL,
  `status` enum('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_orderNumber_key` (`orderNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES
(1,'KODE-D46NP52V','Test Customer','01712345678','House 1, Road 2, Banani, Dhaka','Dhaka','inside_dhaka',NULL,2194,60,2254,'PENDING','2026-06-14 05:47:21.398','2026-06-14 05:47:21.398'),
(2,'KODE-D46PB6VU','Free Ship','01812345678','Test address outside dhaka long',NULL,'outside_dhaka',NULL,950,0,950,'PENDING','2026-06-14 05:47:21.456','2026-06-14 05:47:21.456'),
(3,'KODE-DFBE4X0Y','Tanvir Ahmed','01234567898','House 1, Road 1, Dhaka','Dhaka','inside_dhaka',NULL,2312,60,2372,'PENDING','2026-06-14 05:56:00.750','2026-06-14 05:56:00.750'),
(4,'KODE-DR5ZLQVA','Test','01734567890','70/1 Dhanmondi','CTG','inside_dhaka',NULL,7980,0,7980,'PENDING','2026-06-14 06:05:13.618','2026-06-14 06:05:13.618');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `productName` varchar(191) NOT NULL,
  `size` varchar(191) DEFAULT NULL,
  `unitPrice` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `lineTotal` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_idx` (`orderId`),
  KEY `OrderItem_productId_idx` (`productId`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
INSERT INTO `orderitem` VALUES
(1,1,1,'Essential Oversized Tee','M',1097,2,2194),
(2,2,2,'Core Crew Tee','L',950,1,950),
(3,3,5,'Tapered Chino','32',2312,1,2312),
(4,4,7,'Overshirt Jacket','L',3990,2,7980);
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) NOT NULL,
  `discountPercent` int(11) NOT NULL DEFAULT 0,
  `freeDelivery` tinyint(1) NOT NULL DEFAULT 0,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizes`)),
  `sizeChart` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sizeChart`)),
  `categoryId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_slug_key` (`slug`),
  KEY `Product_categoryId_idx` (`categoryId`),
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES
(1,'Essential Oversized Tee','essential-oversized-tee','A heavyweight 240 GSM cotton tee with a relaxed, boxy fit. Pre-shrunk and built to keep its shape wash after wash.',1290,15,0,1,1,'[\"https://picsum.photos/seed/kode-essential-oversized-tee-1/800/1000\",\"https://picsum.photos/seed/kode-essential-oversized-tee-2/800/1000\"]','[\"S\",\"M\",\"L\",\"XL\"]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\",\"Sleeve (in)\"],\"rows\":[[\"S\",\"38\",\"27\",\"8\"],[\"M\",\"40\",\"28\",\"8.5\"],[\"L\",\"42\",\"29\",\"9\"],[\"XL\",\"44\",\"30\",\"9.5\"]]}',NULL,'2026-06-14 05:46:12.705','2026-06-14 05:46:12.705'),
(2,'Core Crew Tee','core-crew-tee','The everyday crew neck in soft combed cotton. Clean lines, no logos, just a perfect basic.',950,0,1,1,1,'[\"https://picsum.photos/seed/kode-core-crew-tee-1/800/1000\",\"https://picsum.photos/seed/kode-core-crew-tee-2/800/1000\"]','[\"S\",\"M\",\"L\",\"XL\"]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\",\"Sleeve (in)\"],\"rows\":[[\"S\",\"38\",\"27\",\"8\"],[\"M\",\"40\",\"28\",\"8.5\"],[\"L\",\"42\",\"29\",\"9\"],[\"XL\",\"44\",\"30\",\"9.5\"]]}',NULL,'2026-06-14 05:46:12.709','2026-06-14 05:46:12.709'),
(3,'Linen-Blend Shirt','linen-blend-shirt','Breathable linen-cotton shirt with a soft collar and mother-of-pearl buttons. Made for Dhaka summers.',2190,10,0,1,1,'[\"https://picsum.photos/seed/kode-linen-blend-shirt-1/800/1000\",\"https://picsum.photos/seed/kode-linen-blend-shirt-2/800/1000\"]','[\"M\",\"L\",\"XL\"]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\",\"Sleeve (in)\"],\"rows\":[[\"S\",\"38\",\"27\",\"8\"],[\"M\",\"40\",\"28\",\"8.5\"],[\"L\",\"42\",\"29\",\"9\"],[\"XL\",\"44\",\"30\",\"9.5\"]]}',NULL,'2026-06-14 05:46:12.712','2026-06-14 05:46:12.712'),
(4,'Oxford Button-Down','oxford-button-down','A timeless oxford shirt in mid-weight cotton. Smart enough for work, easy enough for weekends.',2490,0,0,0,1,'[\"https://picsum.photos/seed/kode-oxford-button-down-1/800/1000\",\"https://picsum.photos/seed/kode-oxford-button-down-2/800/1000\"]','[\"M\",\"L\",\"XL\"]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\",\"Sleeve (in)\"],\"rows\":[[\"S\",\"38\",\"27\",\"8\"],[\"M\",\"40\",\"28\",\"8.5\"],[\"L\",\"42\",\"29\",\"9\"],[\"XL\",\"44\",\"30\",\"9.5\"]]}',NULL,'2026-06-14 05:46:12.716','2026-06-14 05:46:12.716'),
(5,'Tapered Chino','tapered-chino','Stretch-cotton chinos with a modern tapered leg. Comfortable all-day with a clean finish.',2890,20,0,1,1,'[\"https://picsum.photos/seed/kode-tapered-chino-1/800/1000\",\"https://picsum.photos/seed/kode-tapered-chino-2/800/1000\"]','[\"30\",\"32\",\"34\",\"36\"]','{\"columns\":[\"Size\",\"Waist (in)\",\"Length (in)\",\"Hip (in)\"],\"rows\":[[\"30\",\"30\",\"40\",\"38\"],[\"32\",\"32\",\"41\",\"40\"],[\"34\",\"34\",\"41.5\",\"42\"],[\"36\",\"36\",\"42\",\"44\"]]}',NULL,'2026-06-14 05:46:12.719','2026-06-14 05:46:12.719'),
(6,'Relaxed Cargo Pant','relaxed-cargo-pant','Utility-inspired cargo with a relaxed fit and reinforced pockets. Durable ripstop cotton.',3190,0,0,0,1,'[\"https://picsum.photos/seed/kode-relaxed-cargo-pant-1/800/1000\",\"https://picsum.photos/seed/kode-relaxed-cargo-pant-2/800/1000\"]','[\"30\",\"32\",\"34\",\"36\"]','{\"columns\":[\"Size\",\"Waist (in)\",\"Length (in)\",\"Hip (in)\"],\"rows\":[[\"30\",\"30\",\"40\",\"38\"],[\"32\",\"32\",\"41\",\"40\"],[\"34\",\"34\",\"41.5\",\"42\"],[\"36\",\"36\",\"42\",\"44\"]]}',NULL,'2026-06-14 05:46:12.722','2026-06-14 05:46:12.722'),
(7,'Overshirt Jacket','overshirt-jacket','A structured cotton-twill overshirt that layers over a tee or under a coat. Year-round versatility.',3990,0,1,1,1,'[\"https://picsum.photos/seed/kode-overshirt-jacket-1/800/1000\",\"https://picsum.photos/seed/kode-overshirt-jacket-2/800/1000\"]','[\"M\",\"L\",\"XL\"]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\",\"Sleeve (in)\"],\"rows\":[[\"S\",\"38\",\"27\",\"8\"],[\"M\",\"40\",\"28\",\"8.5\"],[\"L\",\"42\",\"29\",\"9\"],[\"XL\",\"44\",\"30\",\"9.5\"]]}',NULL,'2026-06-14 05:46:12.725','2026-06-14 05:46:12.725'),
(8,'Ribbed Beanie','ribbed-beanie','A soft, snug ribbed beanie in a fine acrylic-wool blend. One size, easy fit.',690,10,0,0,1,'[\"https://picsum.photos/seed/kode-ribbed-beanie-1/800/1000\",\"https://picsum.photos/seed/kode-ribbed-beanie-2/800/1000\"]','[]','{\"columns\":[\"Size\",\"Chest (in)\",\"Length (in)\"],\"rows\":[[\"S\",\"12\",\"2\"],[\"M\",\"12\",\"2\"],[\"L\",\"12\",\"2\"],[\"XL\",\"12\",\"3\"]]}',NULL,'2026-06-14 05:46:12.727','2026-06-14 05:59:32.654');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `storeName` varchar(191) NOT NULL DEFAULT 'KODE',
  `deliveryInsideDhaka` int(11) NOT NULL DEFAULT 60,
  `deliveryOutsideDhaka` int(11) NOT NULL DEFAULT 120,
  `freeDeliveryThreshold` int(11) DEFAULT NULL,
  `currency` varchar(191) NOT NULL DEFAULT '৳',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES
(1,'KODE',80,150,2000,'৳','2026-06-14 06:00:16.632');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;


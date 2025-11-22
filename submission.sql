-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 22, 2025 at 08:56 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tvri_form`
--

-- --------------------------------------------------------

--
-- Table structure for table `submission`
--

CREATE TABLE `submission` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formTemplateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `submittedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `deletedAt` datetime(3) DEFAULT NULL,
  `signatureData` text COLLATE utf8mb4_unicode_ci,
  `snapshotSignatureBoxes` text COLLATE utf8mb4_unicode_ci,
  `snapshotTemplate` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submission`
--

INSERT INTO `submission` (`id`, `formTemplateId`, `status`, `submittedAt`, `updatedAt`, `rejectionReason`, `deletedAt`, `signatureData`, `snapshotSignatureBoxes`, `snapshotTemplate`) VALUES
('cmi0hytl3000a7ktodefmzse1', 'cmi0hu1lj00007kto7z4kwvzl', 'pending', '2025-11-15 16:24:30.277', '2025-11-15 19:03:18.182', NULL, NULL, NULL, NULL, NULL),
('cmi0opyuy001h7kng051p18xv', 'cmi0hu1lj00007kto7z4kwvzl', 'rejected', '2025-11-15 19:33:34.482', '2025-11-15 20:08:49.301', 'Dokumen pendukung tidak lengkap. Harap lampirkan dokumen pendukung dari Ketua Tim yang bisa diverifikasi.', NULL, NULL, NULL, NULL),
('cmi0qb5o8000e7kw8recemyjt', 'cmi0gqrbc00017k3klazzslvh', 'pending', '2025-11-15 20:18:02.743', '2025-11-16 07:49:04.804', NULL, '2025-11-16 07:49:04.801', NULL, NULL, NULL),
('cmi1bbd0w000b7k3g6plpiujj', 'cmi0hu1lj00007kto7z4kwvzl', 'approved', '2025-11-16 06:06:04.208', '2025-11-19 11:05:18.141', NULL, NULL, NULL, NULL, NULL),
('cmi1betpu000u7k3g54g9as3j', 'cmi1bdr3p000m7k3g163hj6kj', 'rejected', '2025-11-16 06:08:45.807', '2025-11-16 06:13:50.355', 'Dokumen pendukung tidak lengkap', NULL, NULL, NULL, NULL),
('cmi1f4e1f000e7kj0xuv1l3z8', 'cmi1f2w7v00067kj0uchqozt6', 'approved', '2025-11-16 07:52:37.395', '2025-11-16 07:59:05.673', NULL, NULL, NULL, NULL, NULL),
('cmi1f83bk000n7kj0xf48qblw', 'cmi1bdr3p000m7k3g163hj6kj', 'approved', '2025-11-16 07:55:30.128', '2025-11-19 11:28:37.406', NULL, NULL, NULL, NULL, NULL),
('cmi1ng49j00017khga9b44185', 'cmi0hu1lj00007kto7z4kwvzl', 'pendng', '2025-11-16 11:45:41.526', '2025-11-16 11:46:20.284', NULL, NULL, NULL, NULL, NULL),
('cmi1njtgu00017kwkm9dnoid6', 'cmi1bdr3p000m7k3g163hj6kj', 'approved', '2025-11-16 11:48:34.158', '2025-11-22 08:16:54.349', NULL, NULL, NULL, NULL, NULL),
('cmi305l36000d7k381tlykhwq', 'cmi2zzsuf00007k38q9ivxjpg', 'pending', '2025-11-17 10:29:11.298', '2025-11-17 10:29:11.298', NULL, NULL, NULL, NULL, NULL),
('cmi32ozs700057ki0zoon71fx', 'cmi0hu1lj00007kto7z4kwvzl', 'pending', '2025-11-17 11:40:16.039', '2025-11-17 11:40:16.039', NULL, NULL, NULL, NULL, NULL),
('cmi40x1lr000a7krg2fzl9m26', 'cmi40vf6x00007krgjinchj9m', 'approved', '2025-11-18 03:38:18.591', '2025-11-22 08:14:29.398', NULL, NULL, NULL, NULL, NULL),
('cmi68ppam00017kb4zr5z0yqd', 'cmi0hu1lj00007kto7z4kwvzl', 'pending', '2025-11-19 16:52:05.323', '2025-11-19 16:52:05.323', NULL, NULL, NULL, '[{\"id\":\"vkkxzl\",\"label\":\"Yang Mengetahui\",\"type\":\"pejabat_placeholder\",\"x\":81,\"y\":750,\"width\":200,\"height\":80,\"pejabatId\":\"KETUA_TIM\",\"pejabatNama\":\"Ketua Tim\",\"pejabatNip\":\"(Dari data tim)\",\"referenceWidth\":794,\"referenceHeight\":1123},{\"id\":\"vw8c9\",\"label\":\"Tanda Tangan Baru\",\"type\":\"pemohon_digital\",\"x\":508,\"y\":750,\"width\":200,\"height\":80,\"referenceWidth\":794,\"referenceHeight\":1123}]', '<p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Kepada Yth<br>Kepala Sub Bagian Tata Usaha<br>TVRI Kalimantan Barat<br>Di-<br>Tempat</span></p><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Dengan Hormat<br>Yang bertandatangan di bawah ini:</span></p><table class=\"borderless-table\" style=\"min-width: 372px;\"><colgroup><col style=\"min-width: 25px;\"><col style=\"width: 25px;\"><col style=\"width: 322px;\"></colgroup><tbody><tr><td colspan=\"1\" rowspan=\"1\" style=\"height: 14px;\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Nama&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"25\" style=\"height: 14px;\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">:</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"322\" style=\"height: 14px;\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">{{nama_lengkap}}</span></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">NIP</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"25\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">:</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"322\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">{{nip_nipppk}}</span></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Jabatan</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"25\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">:</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"322\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">{{jabatan}}</span></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Unit Kerja</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"25\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">:</span></p></td><td colspan=\"1\" rowspan=\"1\" colwidth=\"322\"><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">{{tim_nama}}</span></p></td></tr></tbody></table><p style=\"text-align: justify;\"></p><p style=\"text-align: justify;\"><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Dengan surat ini saya bermaksud mengajukan <strong>{{jenis_cuti}}</strong> selama <strong>{{lama_cuti}}</strong> hari kerja pada tanggal <strong>{{mulai_tanggal}}</strong> s.d. <strong>{{berakhir_tanggal}}</strong>. Cuti yang saya ajukan akan saya gunakan untuk <strong>{{alasan_cuti}}</strong>. Dalam masa cuti saya akan tetap berkoordinasi dengan kantor melalui telepon yang dapat dihubungi dengan nomor : <strong>{{nomor_whatsapp}}</strong></span><br></p><p><span style=\"font-family: &quot;Gotham Light&quot;, sans-serif;\">Demikian surat cuti ini saya ajukan. Atas perhatian Bapak saya ucapkan terima kasih.</span></p><p></p><p></p>'),
('cmia1f15i00017k1sqxg070gv', 'cmi1bdr3p000m7k3g163hj6kj', 'rejected', '2025-11-22 08:38:54.868', '2025-11-22 08:40:35.982', 'dokumen pendukung tidak sesuai', NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `submission`
--
ALTER TABLE `submission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Submission_formTemplateId_idx` (`formTemplateId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `submission`
--
ALTER TABLE `submission`
  ADD CONSTRAINT `Submission_formTemplateId_fkey` FOREIGN KEY (`formTemplateId`) REFERENCES `formtemplate` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

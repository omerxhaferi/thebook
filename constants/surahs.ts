// Standard 604-page Mushaf Madinah Surah data
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  albanianName: string;
  turkishName: string;
  startPage: number;
  verses: number;
  revelation: 'Meccan' | 'Medinan';
}

// Note: Physical page 1 is blank cover, so all Quran pages are shifted by +1
export const SURAHS: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', albanianName: 'Fatiha', turkishName: 'Fâtiha', startPage: 2, verses: 7, revelation: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', albanianName: 'Bekare', turkishName: 'Bakara', startPage: 3, verses: 286, revelation: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-E-Imran', albanianName: 'Ali Imran', turkishName: 'Âl-i İmrân', startPage: 51, verses: 200, revelation: 'Medinan' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', albanianName: 'Nisa', turkishName: 'Nisâ', startPage: 78, verses: 176, revelation: 'Medinan' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah', albanianName: 'Maide', turkishName: 'Mâide', startPage: 107, verses: 120, revelation: 'Medinan' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', albanianName: 'En\'am', turkishName: 'En\'âm', startPage: 129, verses: 165, revelation: 'Meccan' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', albanianName: 'Araf', turkishName: 'A\'râf', startPage: 152, verses: 206, revelation: 'Meccan' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', albanianName: 'Enfal', turkishName: 'Enfâl', startPage: 178, verses: 75, revelation: 'Medinan' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', albanianName: 'Teube', turkishName: 'Tevbe', startPage: 188, verses: 129, revelation: 'Medinan' },
  { number: 10, name: 'يونس', englishName: 'Yunus', albanianName: 'Junus', turkishName: 'Yûnus', startPage: 209, verses: 109, revelation: 'Meccan' },
  { number: 11, name: 'هود', englishName: 'Hud', albanianName: 'Hud', turkishName: 'Hûd', startPage: 222, verses: 123, revelation: 'Meccan' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', albanianName: 'Jusuf', turkishName: 'Yûsuf', startPage: 236, verses: 111, revelation: 'Meccan' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad', albanianName: 'Rra\'d', turkishName: 'Ra\'d', startPage: 250, verses: 43, revelation: 'Medinan' },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', albanianName: 'Ibrahim', turkishName: 'İbrahim', startPage: 256, verses: 52, revelation: 'Meccan' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', albanianName: 'Hixhr', turkishName: 'Hicr', startPage: 263, verses: 99, revelation: 'Meccan' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', albanianName: 'Nahl', turkishName: 'Nahl', startPage: 268, verses: 128, revelation: 'Meccan' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', albanianName: 'Isra', turkishName: 'İsrâ', startPage: 283, verses: 111, revelation: 'Meccan' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', albanianName: 'Kehf', turkishName: 'Kehf', startPage: 294, verses: 110, revelation: 'Meccan' },
  { number: 19, name: 'مريم', englishName: 'Maryam', albanianName: 'Merjem', turkishName: 'Meryem', startPage: 306, verses: 98, revelation: 'Meccan' },
  { number: 20, name: 'طه', englishName: 'Ta-Ha', albanianName: 'Ta-Ha', turkishName: 'Tâhâ', startPage: 313, verses: 135, revelation: 'Meccan' },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', albanianName: 'Enbija', turkishName: 'Enbiyâ', startPage: 323, verses: 112, revelation: 'Meccan' },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', albanianName: 'Haxh', turkishName: 'Hac', startPage: 333, verses: 78, revelation: 'Medinan' },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminun', albanianName: 'Muminun', turkishName: 'Mü\'minûn', startPage: 343, verses: 118, revelation: 'Meccan' },
  { number: 24, name: 'النور', englishName: 'An-Nur', albanianName: 'Nur', turkishName: 'Nûr', startPage: 351, verses: 64, revelation: 'Medinan' },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', albanianName: 'Furkan', turkishName: 'Furkân', startPage: 360, verses: 77, revelation: 'Meccan' },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shuara', albanianName: 'Shuara', turkishName: 'Şuarâ', startPage: 368, verses: 227, revelation: 'Meccan' },
  { number: 27, name: 'النمل', englishName: 'An-Naml', albanianName: 'Neml', turkishName: 'Neml', startPage: 378, verses: 93, revelation: 'Meccan' },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', albanianName: 'Kasas', turkishName: 'Kasas', startPage: 386, verses: 88, revelation: 'Meccan' },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankabut', albanianName: 'Ankebut', turkishName: 'Ankebût', startPage: 396, verses: 69, revelation: 'Meccan' },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', albanianName: 'Rum', turkishName: 'Rûm', startPage: 405, verses: 60, revelation: 'Meccan' },
  { number: 31, name: 'لقمان', englishName: 'Luqman', albanianName: 'Lukman', turkishName: 'Lokmân', startPage: 412, verses: 34, revelation: 'Meccan' },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', albanianName: 'Sexhde', turkishName: 'Secde', startPage: 416, verses: 30, revelation: 'Meccan' },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', albanianName: 'Ahzab', turkishName: 'Ahzâb', startPage: 419, verses: 73, revelation: 'Medinan' },
  { number: 34, name: 'سبأ', englishName: 'Saba', albanianName: 'Sebe', turkishName: 'Sebe\'', startPage: 429, verses: 54, revelation: 'Meccan' },
  { number: 35, name: 'فاطر', englishName: 'Fatir', albanianName: 'Fatir', turkishName: 'Fâtır', startPage: 435, verses: 45, revelation: 'Meccan' },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', albanianName: 'Ja-Sin', turkishName: 'Yâsîn', startPage: 441, verses: 83, revelation: 'Meccan' },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', albanianName: 'Saffat', turkishName: 'Sâffât', startPage: 447, verses: 182, revelation: 'Meccan' },
  { number: 38, name: 'ص', englishName: 'Sad', albanianName: 'Sad', turkishName: 'Sâd', startPage: 454, verses: 88, revelation: 'Meccan' },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', albanianName: 'Zumer', turkishName: 'Zümer', startPage: 459, verses: 75, revelation: 'Meccan' },
  { number: 40, name: 'غافر', englishName: 'Ghafir', albanianName: 'Gafir', turkishName: 'Mü\'min', startPage: 468, verses: 85, revelation: 'Meccan' },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', albanianName: 'Fusilet', turkishName: 'Fussilet', startPage: 478, verses: 54, revelation: 'Meccan' },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', albanianName: 'Shura', turkishName: 'Şûrâ', startPage: 484, verses: 53, revelation: 'Meccan' },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', albanianName: 'Zuhruf', turkishName: 'Zuhruf', startPage: 490, verses: 89, revelation: 'Meccan' },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', albanianName: 'Duhan', turkishName: 'Duhân', startPage: 497, verses: 59, revelation: 'Meccan' },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', albanianName: 'Xhathije', turkishName: 'Câsiye', startPage: 500, verses: 37, revelation: 'Meccan' },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', albanianName: 'Ahkaf', turkishName: 'Ahkâf', startPage: 503, verses: 35, revelation: 'Meccan' },
  { number: 47, name: 'محمد', englishName: 'Muhammad', albanianName: 'Muhamed', turkishName: 'Muhammed', startPage: 508, verses: 38, revelation: 'Medinan' },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', albanianName: 'Feth', turkishName: 'Fetih', startPage: 512, verses: 29, revelation: 'Medinan' },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', albanianName: 'Huxhurat', turkishName: 'Hucurât', startPage: 516, verses: 18, revelation: 'Medinan' },
  { number: 50, name: 'ق', englishName: 'Qaf', albanianName: 'Kaf', turkishName: 'Kâf', startPage: 519, verses: 45, revelation: 'Meccan' },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', albanianName: 'Dharijat', turkishName: 'Zâriyât', startPage: 521, verses: 60, revelation: 'Meccan' },
  { number: 52, name: 'الطور', englishName: 'At-Tur', albanianName: 'Tur', turkishName: 'Tûr', startPage: 524, verses: 49, revelation: 'Meccan' },
  { number: 53, name: 'النجم', englishName: 'An-Najm', albanianName: 'Nexhm', turkishName: 'Necm', startPage: 527, verses: 62, revelation: 'Meccan' },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', albanianName: 'Kamer', turkishName: 'Kamer', startPage: 529, verses: 55, revelation: 'Meccan' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', albanianName: 'Rrahman', turkishName: 'Rahmân', startPage: 532, verses: 78, revelation: 'Medinan' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqiah', albanianName: 'Vakia', turkishName: 'Vâkıa', startPage: 535, verses: 96, revelation: 'Meccan' },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', albanianName: 'Hadid', turkishName: 'Hadîd', startPage: 538, verses: 29, revelation: 'Medinan' },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadilah', albanianName: 'Muxhadile', turkishName: 'Mücâdele', startPage: 543, verses: 22, revelation: 'Medinan' },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', albanianName: 'Hashr', turkishName: 'Haşr', startPage: 546, verses: 24, revelation: 'Medinan' },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', albanianName: 'Mumtehine', turkishName: 'Mümtehine', startPage: 550, verses: 13, revelation: 'Medinan' },
  { number: 61, name: 'الصف', englishName: 'As-Saf', albanianName: 'Saff', turkishName: 'Saff', startPage: 552, verses: 14, revelation: 'Medinan' },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumuah', albanianName: 'Xhuma', turkishName: 'Cum\'a', startPage: 554, verses: 11, revelation: 'Medinan' },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', albanianName: 'Munafikun', turkishName: 'Münâfikûn', startPage: 555, verses: 11, revelation: 'Medinan' },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', albanianName: 'Tegabun', turkishName: 'Tegâbün', startPage: 557, verses: 18, revelation: 'Medinan' },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', albanianName: 'Talak', turkishName: 'Talâk', startPage: 559, verses: 12, revelation: 'Medinan' },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', albanianName: 'Tahrim', turkishName: 'Tahrîm', startPage: 561, verses: 12, revelation: 'Medinan' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', albanianName: 'Mulk', turkishName: 'Mülk', startPage: 563, verses: 30, revelation: 'Meccan' },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', albanianName: 'Kalem', turkishName: 'Kalem', startPage: 565, verses: 52, revelation: 'Meccan' },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', albanianName: 'Hakka', turkishName: 'Hâkka', startPage: 567, verses: 52, revelation: 'Meccan' },
  { number: 70, name: 'المعارج', englishName: 'Al-Maarij', albanianName: 'Mearixh', turkishName: 'Meâric', startPage: 569, verses: 44, revelation: 'Meccan' },
  { number: 71, name: 'نوح', englishName: 'Nuh', albanianName: 'Nuh', turkishName: 'Nûh', startPage: 571, verses: 28, revelation: 'Meccan' },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', albanianName: 'Xhinn', turkishName: 'Cin', startPage: 573, verses: 28, revelation: 'Meccan' },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', albanianName: 'Muzemil', turkishName: 'Müzzemmil', startPage: 575, verses: 20, revelation: 'Meccan' },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', albanianName: 'Mudethir', turkishName: 'Müddessir', startPage: 576, verses: 56, revelation: 'Meccan' },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', albanianName: 'Kijame', turkishName: 'Kıyâme', startPage: 578, verses: 40, revelation: 'Meccan' },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', albanianName: 'Insan', turkishName: 'İnsân', startPage: 579, verses: 31, revelation: 'Medinan' },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', albanianName: 'Murselat', turkishName: 'Mürselât', startPage: 581, verses: 50, revelation: 'Meccan' },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', albanianName: 'Nebe', turkishName: 'Nebe', startPage: 583, verses: 40, revelation: 'Meccan' },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat', albanianName: 'Naziat', turkishName: 'Nâziât', startPage: 584, verses: 46, revelation: 'Meccan' },
  { number: 80, name: 'عبس', englishName: 'Abasa', albanianName: 'Abese', turkishName: 'Abese', startPage: 586, verses: 42, revelation: 'Meccan' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', albanianName: 'Tekvir', turkishName: 'Tekvîr', startPage: 587, verses: 29, revelation: 'Meccan' },
  { number: 82, name: 'الإنفطار', englishName: 'Al-Infitar', albanianName: 'Infitar', turkishName: 'İnfitâr', startPage: 588, verses: 19, revelation: 'Meccan' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', albanianName: 'Mutaffifin', turkishName: 'Mutaffifîn', startPage: 588, verses: 36, revelation: 'Meccan' },
  { number: 84, name: 'الإنشقاق', englishName: 'Al-Inshiqaq', albanianName: 'Inshikak', turkishName: 'İnşikâk', startPage: 590, verses: 25, revelation: 'Meccan' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', albanianName: 'Buruxh', turkishName: 'Burûc', startPage: 591, verses: 22, revelation: 'Meccan' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', albanianName: 'Tarik', turkishName: 'Târık', startPage: 592, verses: 17, revelation: 'Meccan' },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala', albanianName: 'A\'la', turkishName: 'A\'lâ', startPage: 592, verses: 19, revelation: 'Meccan' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', albanianName: 'Gashije', turkishName: 'Gâşiye', startPage: 593, verses: 26, revelation: 'Meccan' },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', albanianName: 'Fexhr', turkishName: 'Fecr', startPage: 594, verses: 30, revelation: 'Meccan' },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', albanianName: 'Beled', turkishName: 'Beled', startPage: 595, verses: 20, revelation: 'Meccan' },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', albanianName: 'Shems', turkishName: 'Şems', startPage: 596, verses: 15, revelation: 'Meccan' },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', albanianName: 'Lejl', turkishName: 'Leyl', startPage: 597, verses: 21, revelation: 'Meccan' },
  { number: 93, name: 'الضحى', englishName: 'Ad-Dhuha', albanianName: 'Duha', turkishName: 'Duhâ', startPage: 597, verses: 11, revelation: 'Meccan' },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', albanianName: 'Sharh', turkishName: 'İnşirâh', startPage: 598, verses: 8, revelation: 'Meccan' },
  { number: 95, name: 'التين', englishName: 'At-Tin', albanianName: 'Tin', turkishName: 'Tîn', startPage: 598, verses: 8, revelation: 'Meccan' },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', albanianName: 'Alak', turkishName: 'Alak', startPage: 599, verses: 19, revelation: 'Meccan' },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', albanianName: 'Kadr', turkishName: 'Kadir', startPage: 600, verses: 5, revelation: 'Meccan' },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', albanianName: 'Bejjine', turkishName: 'Beyyine', startPage: 600, verses: 8, revelation: 'Medinan' },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', albanianName: 'Zelzele', turkishName: 'Zilzâl', startPage: 601, verses: 8, revelation: 'Medinan' },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', albanianName: 'Adijat', turkishName: 'Âdiyât', startPage: 601, verses: 11, revelation: 'Meccan' },
  { number: 101, name: 'القارعة', englishName: 'Al-Qariah', albanianName: 'Karia', turkishName: 'Kâria', startPage: 602, verses: 11, revelation: 'Meccan' },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', albanianName: 'Tekathur', turkishName: 'Tekâsür', startPage: 602, verses: 8, revelation: 'Meccan' },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', albanianName: 'Asr', turkishName: 'Asr', startPage: 603, verses: 3, revelation: 'Meccan' },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', albanianName: 'Humeze', turkishName: 'Hümeze', startPage: 603, verses: 9, revelation: 'Meccan' },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', albanianName: 'Fil', turkishName: 'Fîl', startPage: 603, verses: 5, revelation: 'Meccan' },
  { number: 106, name: 'قريش', englishName: 'Quraysh', albanianName: 'Kurejsh', turkishName: 'Kureyş', startPage: 604, verses: 4, revelation: 'Meccan' },
  { number: 107, name: 'الماعون', englishName: 'Al-Maun', albanianName: 'Maun', turkishName: 'Mâûn', startPage: 604, verses: 7, revelation: 'Meccan' },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', albanianName: 'Keuther', turkishName: 'Kevser', startPage: 604, verses: 3, revelation: 'Meccan' },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', albanianName: 'Kafirun', turkishName: 'Kâfirûn', startPage: 605, verses: 6, revelation: 'Meccan' },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', albanianName: 'Nasr', turkishName: 'Nasr', startPage: 605, verses: 3, revelation: 'Medinan' },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', albanianName: 'Mesed', turkishName: 'Tebbet', startPage: 605, verses: 5, revelation: 'Meccan' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', albanianName: 'Ihlas', turkishName: 'İhlâs', startPage: 606, verses: 4, revelation: 'Meccan' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', albanianName: 'Felek', turkishName: 'Felâk', startPage: 606, verses: 5, revelation: 'Meccan' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', albanianName: 'Nas', turkishName: 'Nâs', startPage: 606, verses: 6, revelation: 'Meccan' },
];

// Helper function to get all Surahs that appear on a specific page
export function getSurahsOnPage(pageNumber: number): Surah[] {
  const surahsOnPage: Surah[] = [];

  for (let i = 0; i < SURAHS.length; i++) {
    const currentSurah = SURAHS[i];
    const nextSurah = SURAHS[i + 1];

    // Check if this surah starts on or before this page
    // and ends on or after this page
    if (currentSurah.startPage <= pageNumber) {
      if (nextSurah) {
        // If next surah starts after this page, current surah is on this page
        if (nextSurah.startPage > pageNumber) {
          surahsOnPage.push(currentSurah);
        }
      } else {
        // Last surah in the Quran
        surahsOnPage.push(currentSurah);
      }
    }

    // Check if this surah starts on this exact page
    if (currentSurah.startPage === pageNumber && !surahsOnPage.includes(currentSurah)) {
      surahsOnPage.push(currentSurah);
    }
  }

  return surahsOnPage;
}


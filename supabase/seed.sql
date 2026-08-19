-- ============================================================
-- BIBLE SEED DATA (66 Books + Key Sample Verses in EN & TA)
-- ============================================================

-- 1. Insert 66 Canonical Bible Books
INSERT INTO public.bible_books (id, book_number, testament, name_en, name_ta, code, total_chapters) VALUES
-- Old Testament (39 Books)
(1, 1, 'OT', 'Genesis', 'ஆதியாகமம்', 'GEN', 50),
(2, 2, 'OT', 'Exodus', 'யாத்திராகமம்', 'EXO', 40),
(3, 3, 'OT', 'Leviticus', 'லேவியராகமம்', 'LEV', 27),
(4, 4, 'OT', 'Numbers', 'எண்ணாகமம்', 'NUM', 36),
(5, 5, 'OT', 'Deuteronomy', 'உபாகமம்', 'DEU', 34),
(6, 6, 'OT', 'Joshua', 'யோசுவா', 'JOSH', 24),
(7, 7, 'OT', 'Judges', 'நியாயாதிபதிகள்', 'JUDG', 21),
(8, 8, 'OT', 'Ruth', 'ரூத்', 'RUTH', 4),
(9, 9, 'OT', '1 Samuel', '1 சாமுவேல்', '1SAM', 31),
(10, 10, 'OT', '2 Samuel', '2 சாமுவேல்', '2SAM', 24),
(11, 11, 'OT', '1 Kings', '1 இராஜாக்கள்', '1KNG', 22),
(12, 12, 'OT', '2 Kings', '2 இராஜாக்கள்', '2KNG', 25),
(13, 13, 'OT', '1 Chronicles', '1 நாளாகமம்', '1CHR', 29),
(14, 14, 'OT', '2 Chronicles', '2 நாளாகமம்', '2CHR', 36),
(15, 15, 'OT', 'Ezra', 'எஸ்றா', 'EZRA', 10),
(16, 16, 'OT', 'Nehemiah', 'நெகேமியா', 'NEH', 13),
(17, 17, 'OT', 'Esther', 'எஸ்தர்', 'ESTH', 10),
(18, 18, 'OT', 'Job', 'யோபு', 'JOB', 42),
(19, 19, 'OT', 'Psalms', 'சங்கீதம்', 'PSA', 150),
(20, 20, 'OT', 'Proverbs', 'நீதிமொழிகள்', 'PROV', 31),
(21, 21, 'OT', 'Ecclesiastes', 'பிரசங்கி', 'ECCL', 12),
(22, 22, 'OT', 'Song of Solomon', 'உன்னதப்பாட்டு', 'SONG', 8),
(23, 23, 'OT', 'Isaiah', 'ஏசாயா', 'ISA', 66),
(24, 24, 'OT', 'Jeremiah', 'எரேமியா', 'JER', 52),
(25, 25, 'OT', 'Lamentations', 'புலம்பல்', 'LAM', 5),
(26, 26, 'OT', 'Ezekiel', 'எசேக்கியேல்', 'EZEK', 48),
(27, 27, 'OT', 'Daniel', 'தானியேல்', 'DAN', 12),
(28, 28, 'OT', 'Hosea', 'ஓசியா', 'HOS', 14),
(29, 29, 'OT', 'Joel', 'யோவேல்', 'JOEL', 3),
(30, 30, 'OT', 'Amos', 'ஆமோஸ்', 'AMOS', 9),
(31, 31, 'OT', 'Obadiah', 'ஒபதியா', 'OBAD', 1),
(32, 32, 'OT', 'Jonah', 'யோனா', 'JONAH', 4),
(33, 33, 'OT', 'Micah', 'மீகா', 'MIC', 7),
(34, 34, 'OT', 'Nahum', 'நாகூம்', 'NAH', 3),
(35, 35, 'OT', 'Habakkuk', 'அபகூக்', 'HAB', 3),
(36, 36, 'OT', 'Zephaniah', 'செப்பனியா', 'ZEPH', 3),
(37, 37, 'OT', 'Haggai', 'ஆகாய்', 'HAG', 2),
(38, 38, 'OT', 'Zechariah', 'சகரியா', 'ZECH', 14),
(39, 39, 'OT', 'Malachi', 'மல்கியா', 'MAL', 4),

-- New Testament (27 Books)
(40, 40, 'NT', 'Matthew', 'மத்தேயு', 'MATT', 28),
(41, 41, 'NT', 'Mark', 'மாற்கு', 'MARK', 16),
(42, 42, 'NT', 'Luke', 'லூக்கா', 'LUKE', 24),
(43, 43, 'NT', 'John', 'யோவான்', 'JOHN', 21),
(44, 44, 'NT', 'Acts', 'அப்போஸ்தலர்', 'ACTS', 28),
(45, 45, 'NT', 'Romans', 'ரோமர்', 'ROM', 16),
(46, 46, 'NT', '1 Corinthians', '1 கொரிந்தியர்', '1COR', 16),
(47, 47, 'NT', '2 Corinthians', '2 கொரிந்தியர்', '2COR', 13),
(48, 48, 'NT', 'Galatians', 'கலாத்தியர்', 'GAL', 6),
(49, 49, 'NT', 'Ephesians', 'எபேசியர்', 'EPH', 6),
(50, 50, 'NT', 'Philippians', 'பிலிப்பியர்', 'PHIL', 4),
(51, 51, 'NT', 'Colossians', 'கொலோசெயர்', 'COL', 4),
(52, 52, 'NT', '1 Thessalonians', '1 தெசலோனிக்கேயர்', '1THES', 5),
(53, 53, 'NT', '2 Thessalonians', '2 தெசலோனிக்கேயர்', '2THES', 3),
(54, 54, 'NT', '1 Timothy', '1 தீமோத்தேவு', '1TIM', 6),
(55, 55, 'NT', '2 Timothy', '2 தீமோத்தேவு', '2TIM', 4),
(56, 56, 'NT', 'Titus', 'தீத்து', 'TITUS', 3),
(57, 57, 'NT', 'Philemon', 'பிலேமோன்', 'PHILEM', 1),
(58, 58, 'NT', 'Hebrews', 'எபிரெயர்', 'HEB', 13),
(59, 59, 'NT', 'James', 'யாக்கோபு', 'JAS', 5),
(60, 60, 'NT', '1 Peter', '1 பேதுரு', '1PET', 5),
(61, 61, 'NT', '2 Peter', '2 பேதுரு', '2PET', 3),
(62, 62, 'NT', '1 John', '1 யோவான்', '1JOHN', 5),
(63, 63, 'NT', '2 John', '2 யோவான்', '2JOHN', 1),
(64, 64, 'NT', '3 John', '3 யோவான்', '3JOHN', 1),
(65, 65, 'NT', 'Jude', 'யூதா', 'JUDE', 1),
(66, 66, 'NT', 'Revelation', 'வெளிப்படுத்தின விசேஷம்', 'REV', 22)
ON CONFLICT (id) DO UPDATE SET 
  name_en = EXCLUDED.name_en,
  name_ta = EXCLUDED.name_ta,
  total_chapters = EXCLUDED.total_chapters;

-- 2. Insert Sample Verses (Genesis 1, Psalm 23, John 3)
INSERT INTO public.bible_verses (book_id, chapter, verse, text_en, text_ta) VALUES
-- Genesis 1:1-5
(1, 1, 1, 'In the beginning God created the heaven and the earth.', 'ஆதியிலே தேவன் வானத்தையும் பூமியையும் சிருஷ்டித்தார்.'),
(1, 1, 2, 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.', 'பூமியானது ஒழுங்கின்மையும் வெற்றுமையுமாய் இருந்தது; ஆழத்தின்மேல் இருள் இருந்தது; தேவ ஆவியானவர் தண்ணீர்களின்மேல் அசைவாடிக்கொண்டிருந்தார்.'),
(1, 1, 3, 'And God said, Let there be light: and there was light.', 'தேவன்: வெளிச்சம் உண்டாகக்கடவது என்றார், வெளிச்சம் உண்டாயிற்று.'),
(1, 1, 4, 'And God saw the light, that it was good: and God divided the light from the darkness.', 'வெளிச்சம் நல்லது என்று தேவன் கண்டார்; வெளிச்சத்தையும் இருளையும் தேவன் வெவ்வேறாகப் பிரித்தார்.'),
(1, 1, 5, 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.', 'தேவன் வெளிச்சத்துக்குப் பகல் என்று பேரிட்டார், இருளுக்கு இரவென்று பேரிட்டார்; சாயங்காலமும் விடியற்காலமுமாகி முதலாம் நாள் ஆயிற்று.'),

-- Psalm 23:1-6
(19, 23, 1, 'The LORD is my shepherd; I shall not want.', 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.'),
(19, 23, 2, 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.', 'அவர் என்னைப் புல்லுள்ள இடங்களில் மேய்த்து, அமர்ந்த தண்ணீர்கள் அண்டையில் என்னைக் கொண்டுபோய் விடுகிறார்.'),
(19, 23, 3, 'He restoreth my soul: he leadeth me in the paths of righteousness for his name''s sake.', 'அவர் என் ஆத்துமாவைத் தேற்றி, தம்முடைய நாமத்தினிமித்தம் என்னை நீதியின் பாதைகளில் நடத்துகிறார்.'),
(19, 23, 4, 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', 'நான் மரண இருளின் பள்ளத்தாக்கிலே நடந்தாலும் பொல்லாப்புக்குப் பயப்படேன்; தேவரீர் என்னோடு கூட இருக்கிறீர்; உமது கோலும் உமது தடியும் என்னைத் தேற்றும்.'),
(19, 23, 5, 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.', 'என் சத்துருக்களுக்கு முன்பாக நீர் எனக்கு ஒரு பந்தியை ஆயத்தப்படுத்தி, என் தலையை எண்ணெயால் அபிஷேகம் பண்ணுகிறீர்; என் பாத்திரம் நிரம்பி வழிகிறது.'),
(19, 23, 6, 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.', 'என் ஆயுளுள்ள நாளெல்லாம் நன்மையும் கிருபையும் என்னைத் தொடரும்; நான் கர்த்தருடைய வீட்டிலே நீடித்த நாட்களாய் நிலைத்திருப்பேன்.'),

-- John 3:16-18
(43, 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.'),
(43, 3, 17, 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.', 'உலகத்தை ஆக்கினைக்குள்ளாகத் தீர்க்கும்படி தேவன் தம்முடைய குமாரனை உலகத்தில் அனுப்பாமல், அவராலே உலகம் இரட்சிக்கப்படுவதற்காகவே அவரை அனுப்பினார்.'),
(43, 3, 18, 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.', 'அவரை விசுவாசிக்கிறவன் ஆக்கினைக்குள்ளாகத் தீர்க்கப்படான்; விசுவாசியாதவனோ தேவனுடைய ஒரேபேறான குமாரனுடைய நாமத்தில் விசுவாசமுள்ளவனாயிராதபடியினால், அவன் ஆக்கினைத்தீர்ப்புக்குட்பட்டாயிற்று.')
ON CONFLICT (book_id, chapter, verse) DO UPDATE SET 
  text_en = EXCLUDED.text_en,
  text_ta = EXCLUDED.text_ta;

import React from 'react';
import { useReading } from '../../context/ReadingContext';
import { BibleVerseCreativeStudio } from '../studio/BibleVerseCreativeStudio';

/**
 * VerseCardModal
 * Upgraded from the basic settings-panel "Verse Card Creator Studio"
 * to the professional "Bible Verse Creative Studio".
 */
export const VerseCardModal: React.FC = () => {
  const { isVerseCardOpen, verseCardData, closeVerseCard, language } = useReading();

  if (!isVerseCardOpen) return null;

  const isTa = language === 'ta';

  const verseTa = verseCardData
    ? verseCardData.verse.text_ta
    : 'கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமானவர்; யாருக்கு அஞ்சுவேன்?';

  const verseEn = verseCardData
    ? verseCardData.verse.text_en
    : 'The Lord is my light and my salvation; whom shall I fear?';

  const refText = verseCardData
    ? `${isTa ? verseCardData.book.name_ta : verseCardData.book.name_en} ${verseCardData.chapter}:${verseCardData.verse.verse}`
    : isTa ? 'சங்கீதம் 27:1' : 'Psalms 27:1';

  return (
    <BibleVerseCreativeStudio
      initialVerseTa={verseTa}
      initialVerseEn={verseEn}
      initialReference={refText}
      onClose={closeVerseCard}
      isTa={isTa}
    />
  );
};
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read current version from package.json
const pkgJsonPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
const version = pkg.version || '1.1.0';
const versionTag = `v${version}`;

console.log(`\n========================================`);
console.log(`📦 Bible With Me - Building Release ${versionTag}`);
console.log(`========================================\n`);

// 2. Build Web Assets
console.log('⚡ Step 1: Building web distribution (tsc && vite build)...');
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

// 3. Sync with Capacitor Android
console.log('\n📲 Step 2: Syncing Capacitor Android assets...');
execSync('npx cap sync android', { cwd: rootDir, stdio: 'inherit' });

// 4. Build Android APK via Gradle
console.log('\n🔨 Step 3: Compiling Android APK with Gradle...');
const androidDir = path.join(rootDir, 'android');
const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat assembleDebug' : './gradlew assembleDebug';
execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

// 5. Destination Release Directory
const releasesDir = path.join(rootDir, 'releases', versionTag);
if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

// 6. Copy Output APK
const apkSrc = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const apkDest = path.join(releasesDir, `Bible_With_Me_${versionTag}.apk`);

if (fs.existsSync(apkSrc)) {
  fs.copyFileSync(apkSrc, apkDest);
  const stats = fs.statSync(apkDest);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ APK Copied Successfully:`);
  console.log(`   📁 Destination: releases/${versionTag}/Bible_With_Me_${versionTag}.apk`);
  console.log(`   📊 Size: ${sizeMb} MB`);
} else {
  console.error(`\n❌ Error: Output APK not found at ${apkSrc}`);
  process.exit(1);
}

// 7. Generate or Update Release Notes
const releaseNotesPath = path.join(releasesDir, 'RELEASE_NOTES.md');
if (!fs.existsSync(releaseNotesPath)) {
  const dateStr = new Date().toISOString().split('T')[0];
  const notesContent = `# Bible With Me — Release ${versionTag} (${dateStr})

## 📱 பதிப்பு விவரங்கள் (Version Details)
- **App Name**: Bible With Me (வேதாகம வரம்)
- **Version Name**: ${version}
- **Version Code**: 2
- **Release Date**: ${dateStr}
- **Package File**: \`Bible_With_Me_${versionTag}.apk\`

---

## 🌟 புதிய அம்சங்கள் & மாற்றங்கள் (What's New in this Release)

### 1. Daily Verse கீழே உள்ள Genesis 1 அதிகாரத் தேர்வு (Chapter Selector on Title Click)
- Daily Verse (இன்றைய எழுப்புதல் வார்த்தை) கீழே இருக்கும் **Genesis 1** என்ற தலைப்பை நேரடியாக கிளிக் செய்து அதிகாரங்களையும் புத்தகங்களையும் மாற்றிக்கொள்ளலாம்.
- தலைப்பில் தெளிவான கீழ்நோக்கிய அம்பு (Chevron indicator) மற்றும் அழகிய hover விளைவு சேர்க்கப்பட்டுள்ளது.
- மேலே உள்ள Top bar மற்றும் கீழே உள்ள Bottom bar போன்று இதையும் கிளிக் செய்து உடனடியாக அத்தியாயத்தைத் தேர்வு செய்யலாம்.

### 2. மொபைல் ஆப்பில் Search நிலை மேம்பாடு (Elevated Mobile Search UI)
- மொபைல் செயலியில் Search பொத்தானை அழுத்தியவுடன், தேடல் பகுதி மிகவும் கீழே வராமல் நேர்த்தியாக திரையின் மேற்பகுதியில் (Top-aligned under status bar) திறக்கும்படி மாற்றப்பட்டுள்ளது.
- Safe-area double padding சரிசெய்யப்பட்டு தேடல் பார் உடனடியாகப் பயன்படுத்த வசதியாக உயர்த்தப்பட்டுள்ளது.

### 3. வசன கார்டு ஸ்டுடியோவின் மாபெரும் மேம்பாடு (Supercharged Verse Card Creator Studio)
- **Ultra-lightweight 60 FPS Direct Rendering**: கார்டு எடிட்டரின் வேகம் பலமடங்கு அதிகரிக்கப்பட்டு, sliders நகர்த்தும் போது எந்தவொரு lag-ம் இல்லாமல் மென்மையாக வேலை செய்யும்.
- **சொந்த வால்பேப்பர் / புகைப்படம் பதிவேற்றம் (Custom Photo Wallpaper)**: உங்கள் கேலரியில் இருந்து எந்தவொரு படத்தையும் பின்னணியாக வைக்கலாம்; அதன் வெளிச்சத்தை (Dimness opacity) கட்டுப்படுத்தலாம்.
- **நேரடி பட நகல் (Copy Image to Clipboard)**: Download செய்யாமல் நேரடியாக படத்தை நகலெடுத்து (Copy) WhatsApp, Telegram அல்லது Instagram-ல் பேஸ்ட் செய்யலாம்.
- **கண்ணாடி அட்டை விளைவு (Frosted Glassmorphism Card)**: வசனத்தின் பின்னணியில் நவீன கண்ணாடி அட்டை விளைவை (Glass Card) சேர்க்கும் வசதி.
- **அதிசய பாணி (🎲 Surprise Me / Randomize)**: ஒரே கிளிக்கில் அழகிய வண்ணங்கள், எழுத்துருக்கள் மற்றும் எல்லைகளை உருவாக்கும் புதிய அம்சம்.
- **தனிப்பயன் வாட்டர்மார்க் (Custom Watermark Editor)**: கார்டின் கீழே வரும் தாரக மந்திரத்தை நீங்கள் விரும்பும் பெயராக மாற்றலாம் அல்லது மறைக்கலாம்.
- **13 பிரத்யேக எழுத்து வடிவங்கள் (13 Tamil & Universal Scripture Fonts)**: Cinzel, Playfair Display, Lora, Poppins, Caveat மற்றும் தமிழ் பாரம்பரிய எழுத்துருக்கள்.
- **சமூக வலைத்தள அளவுகள் (Social Media Presets)**: 1:1 Post, 9:16 Story/Status, 4:5 Feed Portrait, 16:9 Banner.

---

## 🛠️ நிறுவுதல் முறை (How to Install)
1. \`Bible_With_Me_${versionTag}.apk\` கோப்பை உங்கள் ஆண்ட்ராய்டு மொபைலுக்கு அனுப்பவும்.
2. கோப்பைத் திறந்து **Install** கொடுக்கவும்.
`;

  fs.writeFileSync(releaseNotesPath, notesContent, 'utf8');
  console.log(`📝 Release Notes generated at: releases/${versionTag}/RELEASE_NOTES.md`);
}

console.log(`\n🎉 Release ${versionTag} build complete!\n`);

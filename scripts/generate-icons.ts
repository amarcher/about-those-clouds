// Script to generate static PNG icons for all cloud types
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ICON_SIZE = 16;

// Map cloud types to visual designs
const CLOUD_DESIGNS: Record<string, { bg: string; content: string }> = {
  clear: {
    bg: '#87CEEB',
    content: `
      <!-- Sun with rays -->
      <circle cx="64" cy="64" r="28" fill="#FFD700"/>
      <circle cx="64" cy="64" r="24" fill="#FFA500"/>
      <!-- Sun rays -->
      <line x1="64" y1="20" x2="64" y2="32" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="64" y1="96" x2="64" y2="108" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="64" x2="32" y2="64" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="96" y1="64" x2="108" y2="64" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="33" y1="33" x2="42" y2="42" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="86" y1="86" x2="95" y2="95" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="95" y1="33" x2="86" y2="42" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <line x1="42" y1="86" x2="33" y2="95" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
    `
  },
  cumulus: {
    bg: '#87CEEB',
    content: `
      <!-- Fluffy white cumulus cloud -->
      <ellipse cx="35" cy="70" rx="20" ry="18" fill="#FFFFFF"/>
      <ellipse cx="55" cy="65" rx="24" ry="22" fill="#FFFFFF"/>
      <ellipse cx="75" cy="68" rx="22" ry="20" fill="#FFFFFF"/>
      <ellipse cx="93" cy="72" rx="18" ry="16" fill="#FFFFFF"/>
      <ellipse cx="45" cy="55" rx="18" ry="16" fill="#FFFFFF"/>
      <ellipse cx="68" cy="52" rx="20" ry="18" fill="#FFFFFF"/>
      <ellipse cx="85" cy="58" rx="16" ry="14" fill="#FFFFFF"/>
      <!-- Shadow -->
      <ellipse cx="55" cy="75" rx="24" ry="8" fill="#E8E8E8" opacity="0.5"/>
      <ellipse cx="75" cy="78" rx="22" ry="8" fill="#E8E8E8" opacity="0.5"/>
    `
  },
  stratus: {
    bg: '#87CEEB',
    content: `
      <!-- Flat gray stratus cloud -->
      <rect x="10" y="55" width="108" height="22" rx="3" fill="#C0C0C0"/>
      <rect x="15" y="58" width="98" height="8" rx="2" fill="#D3D3D3"/>
      <rect x="8" y="48" width="112" height="12" rx="2" fill="#B8B8B8" opacity="0.6"/>
    `
  },
  stratocumulus: {
    bg: '#87CEEB',
    content: `
      <!-- Lumpy stratocumulus -->
      <ellipse cx="30" cy="65" rx="18" ry="14" fill="#D0D0D0"/>
      <ellipse cx="50" cy="62" rx="20" ry="16" fill="#D3D3D3"/>
      <ellipse cx="70" cy="64" rx="22" ry="15" fill="#D0D0D0"/>
      <ellipse cx="90" cy="67" rx="18" ry="14" fill="#C8C8C8"/>
      <rect x="15" y="70" width="98" height="15" rx="2" fill="#B8B8B8" opacity="0.7"/>
    `
  },
  nimbostratus: {
    bg: '#6B7280',
    content: `
      <!-- Dark rain cloud -->
      <rect x="8" y="40" width="112" height="35" rx="4" fill="#505050"/>
      <rect x="12" y="45" width="104" height="28" rx="3" fill="#606060"/>
      <!-- Rain drops -->
      <line x1="25" y1="78" x2="22" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
      <line x1="40" y1="78" x2="37" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
      <line x1="55" y1="78" x2="52" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
      <line x1="70" y1="78" x2="67" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
      <line x1="85" y1="78" x2="82" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
      <line x1="100" y1="78" x2="97" y2="95" stroke="#4A5568" stroke-width="2" opacity="0.7"/>
    `
  },
  cumulonimbus: {
    bg: '#4B5563',
    content: `
      <!-- Towering storm cloud with anvil top -->
      <ellipse cx="45" cy="75" rx="22" ry="20" fill="#2D3748"/>
      <ellipse cx="65" cy="72" rx="24" ry="22" fill="#374151"/>
      <ellipse cx="85" cy="76" rx="20" ry="18" fill="#2D3748"/>
      <ellipse cx="55" cy="58" rx="20" ry="18" fill="#4A5568"/>
      <ellipse cx="75" cy="55" rx="22" ry="20" fill="#4A5568"/>
      <!-- Anvil top -->
      <rect x="25" y="35" width="78" height="15" rx="3" fill="#606060"/>
      <!-- Lightning -->
      <path d="M 64 65 L 58 80 L 63 80 L 57 100" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
    `
  },
  cirrus: {
    bg: '#E0F2FE',
    content: `
      <!-- Wispy cirrus strands -->
      <path d="M 15 45 Q 35 40, 55 45 T 95 50" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.9"/>
      <path d="M 20 55 Q 40 48, 60 55 T 100 62" stroke="#F0F0F0" stroke-width="3" fill="none" opacity="0.8"/>
      <path d="M 10 65 Q 30 58, 50 65 T 90 72" stroke="#FFFFFF" stroke-width="2.5" fill="none" opacity="0.85"/>
      <path d="M 25 75 Q 45 68, 65 75 T 105 82" stroke="#F5F5F5" stroke-width="2" fill="none" opacity="0.75"/>
    `
  },
  cirrocumulus: {
    bg: '#E0F2FE',
    content: `
      <!-- Small puffy high clouds -->
      <ellipse cx="25" cy="50" rx="8" ry="6" fill="#FFFFFF" opacity="0.9"/>
      <ellipse cx="45" cy="48" rx="7" ry="5" fill="#F8F8F8" opacity="0.85"/>
      <ellipse cx="65" cy="52" rx="8" ry="6" fill="#FFFFFF" opacity="0.9"/>
      <ellipse cx="85" cy="50" rx="7" ry="5" fill="#F8F8F8" opacity="0.85"/>
      <ellipse cx="35" cy="65" rx="7" ry="5" fill="#F8F8F8" opacity="0.85"/>
      <ellipse cx="55" cy="67" rx="8" ry="6" fill="#FFFFFF" opacity="0.9"/>
      <ellipse cx="75" cy="65" rx="7" ry="5" fill="#F8F8F8" opacity="0.85"/>
      <ellipse cx="95" cy="68" rx="8" ry="6" fill="#FFFFFF" opacity="0.9"/>
    `
  },
  cirrostratus: {
    bg: '#E0F2FE',
    content: `
      <!-- Thin veil with halo effect -->
      <rect x="5" y="45" width="118" height="38" rx="4" fill="#FFFFFF" opacity="0.4"/>
      <rect x="8" y="50" width="112" height="28" rx="3" fill="#F5F5F5" opacity="0.35"/>
      <!-- Halo circle -->
      <circle cx="64" cy="64" r="22" stroke="#FFFFFF" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="64" cy="64" r="26" stroke="#F0F0F0" stroke-width="1.5" fill="none" opacity="0.4"/>
    `
  },
  altocumulus: {
    bg: '#BAE6FD',
    content: `
      <!-- Medium-height puffy patches -->
      <ellipse cx="30" cy="55" rx="14" ry="11" fill="#E0E0E0"/>
      <ellipse cx="52" cy="53" rx="16" ry="13" fill="#ECECEC"/>
      <ellipse cx="75" cy="56" rx="15" ry="12" fill="#E0E0E0"/>
      <ellipse cx="98" cy="58" rx="13" ry="10" fill="#DADADA"/>
      <ellipse cx="40" cy="70" rx="13" ry="10" fill="#DADADA"/>
      <ellipse cx="63" cy="72" rx="15" ry="12" fill="#E0E0E0"/>
      <ellipse cx="86" cy="71" rx="14" ry="11" fill="#ECECEC"/>
    `
  },
  altostratus: {
    bg: '#94A3B8',
    content: `
      <!-- Gray veil -->
      <rect x="5" y="42" width="118" height="44" rx="3" fill="#A0A0A0" opacity="0.7"/>
      <rect x="8" y="48" width="112" height="32" rx="2" fill="#AFAFAF" opacity="0.6"/>
      <rect x="12" y="54" width="104" height="20" rx="2" fill="#B8B8B8" opacity="0.5"/>
    `
  },
};

// Generate complete SVG for cloud type
function generateSVG(cloudType: string): string {
  const design = CLOUD_DESIGNS[cloudType];
  return `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${ICON_SIZE}" height="${ICON_SIZE}" fill="${design.bg}"/>
  ${design.content}
</svg>`;
}

async function generateIcons() {
  const outputDir = path.join(process.cwd(), 'public', 'icons');

  // Create icons directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });

  console.log('Generating cloud type icons...');

  for (const cloudType of Object.keys(CLOUD_DESIGNS)) {
    const svg = generateSVG(cloudType);
    const outputPath = path.join(outputDir, `${cloudType}.png`);

    await sharp(Buffer.from(svg))
      .resize(ICON_SIZE, ICON_SIZE)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${cloudType}.png`);
  }

  console.log(`\n✨ Successfully generated ${Object.keys(CLOUD_DESIGNS).length} cloud icons in ${outputDir}`);
}

generateIcons().catch(console.error);

// Script to download Yoto emoji icons and save them locally
// Run with: YOTO_ACCESS_TOKEN=your_token npx tsx scripts/download-yoto-icons.ts

import fs from 'fs/promises';
import path from 'path';
import { CLOUD_ICON_MAP } from '../app/cloud-icons';

const accessToken = process.env.YOTO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('❌ Please set YOTO_ACCESS_TOKEN environment variable');
  console.error('Get token from: http://localhost:3000/yoto/setup (check browser console)');
  console.error('Then run: YOTO_ACCESS_TOKEN=your_token npx tsx scripts/download-yoto-icons.ts');
  process.exit(1);
}

interface YotoIcon {
  displayIconId: string;
  url: string;
  title: string;
}

async function fetchYotoIcons(): Promise<YotoIcon[]> {
  console.log('Fetching Yoto icon library...');

  const response = await fetch('https://api.yotoplay.com/media/displayIcons/user/yoto', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch icons: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✓ Found ${data.displayIcons.length} public icons\n`);

  return data.displayIcons;
}

async function downloadIcon(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));
}

async function main() {
  // Create output directory
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  await fs.mkdir(iconsDir, { recursive: true });

  // Fetch all Yoto icons
  const yotoIcons = await fetchYotoIcons();
  const iconMap = new Map(yotoIcons.map(icon => [icon.displayIconId, icon]));

  console.log('Downloading cloud type icons...\n');

  for (const [cloudType, yotoId] of Object.entries(CLOUD_ICON_MAP)) {
    // Extract hash from 'yoto:#HASH' format
    const hash = yotoId.replace('yoto:#', '');
    const icon = iconMap.get(hash);

    if (!icon) {
      console.warn(`⚠️  Icon not found for ${cloudType}: ${hash}`);
      continue;
    }

    const outputPath = path.join(iconsDir, `${cloudType}.png`);

    try {
      await downloadIcon(icon.url, outputPath);
      console.log(`✓ ${cloudType}.png - ${icon.title}`);
    } catch (error) {
      console.error(`✗ Failed to download ${cloudType}:`, error);
    }
  }

  console.log('\n✨ Successfully downloaded all cloud icons!');
  console.log(`📁 Icons saved to: ${iconsDir}`);
  console.log('\nYou can now remove YOTO_ACCESS_TOKEN from your environment variables.');
}

main().catch(console.error);

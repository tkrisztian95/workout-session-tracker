/**
 * Generates DALL-E 3 prompts for every achievement badge.
 * Usage: npx tsx tools/generate-achievement-prompts.ts
 *        npx tsx tools/generate-achievement-prompts.ts --json
 */

const STYLE_BLOCK = `Create a single achievement badge icon for a fitness tracking app.

STYLE: 3D rendered, game-achievement badge style. Dark background (#1F2937), centered glowing icon element. Primary accent color orange (#F97316) with subtle warm glow/bloom. Metallic sheen on the badge shape. Cinematic lighting from above. Sharp and clean.

SHAPE: Rounded square badge silhouette, slight emboss/depth. Dark charcoal interior with orange rim glow.

FORMAT: Square 1:1, icon centered with padding, no text, no letters, no numbers. Isolated composition. Photorealistic 3D render.`;

const SUBJECTS: Record<string, string> = {
  session_first: 'A single dumbbell, glowing orange',
  session_10: 'A flame, intense orange fire',
  session_25: 'A lightning bolt, electric orange',
  session_50: 'A glowing star, golden-orange',
  session_100: 'A trophy, gold and orange',
  session_250: 'A crown, regal gold with orange gems',
  plan_first_created: 'A clipboard with a checklist',
  plan_first_completed: 'A glowing checkmark inside a circle',
  plan_3_completed: 'Three stacked checkmarks',
  plan_5_completed: 'A laurel wreath award',
  plan_10_completed: 'A gold trophy with flame',
  plan_5_created: 'An open book, orange pages',
  plan_10_created: 'A library bookshelf, glowing spines',
  plan_first_edited: 'A pencil with spark',
  session_first_edited: 'A pencil striking a line',
  session_first_imported: 'A file with arrow/spark entering it',
  weekly_2: 'A calendar with 2 highlighted days',
  weekly_3: 'A calendar with 3 highlighted days',
  weekly_4: 'A calendar with 4 highlighted days',
  weekly_5: 'A calendar with 5 highlighted days, fire',
  tenure_1month: 'A clock face, soft glow',
  tenure_3months: 'A clock, stronger orange glow',
  tenure_6months: 'A clock face with orbit ring',
  tenure_1year: 'A gold medal with ribbon',
  tenure_2years: 'A diamond medal, orange and white glow',
  volume_1k: 'A weight plate, glowing edge',
  volume_10k: 'A barbell loaded with plates',
  volume_100k: 'A massive barbell, epic orange glow',
};

type Output = { id: string; prompt: string };

function buildPrompt(id: string): string {
  const subject = SUBJECTS[id];
  if (!subject) throw new Error(`No subject defined for achievement: ${id}`);
  return `${STYLE_BLOCK}\n\nSUBJECT: ${subject}`;
}

function run() {
  const isJson = process.argv.includes('--json');
  const ids = Object.keys(SUBJECTS);

  if (isJson) {
    const out: Output[] = ids.map((id) => ({ id, prompt: buildPrompt(id) }));
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  const separator = '─'.repeat(60);

  ids.forEach((id, i) => {
    console.log(`\n${separator}`);
    console.log(`[${i + 1}/${ids.length}] ${id}`);
    console.log(separator);
    console.log(buildPrompt(id));
  });

  console.log(`\n${separator}`);
  console.log(`✓ ${ids.length} prompts generated`);
  console.log(
    'Tip: after the first image, tell ChatGPT "Keep identical style, lighting, and badge shape"',
  );
}

run();

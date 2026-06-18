/**
 * Generates DALL-E 3 prompts for every achievement badge.
 * Usage: npx tsx tools/generate-achievement-prompts.ts
 *        npx tsx tools/generate-achievement-prompts.ts --json
 */

const STYLE_BASE = `Create a single achievement badge icon for a dark athletic fitness tracking app.

STYLE: Bold geometric 3D render. Game-achievement badge aesthetic — energetic, high contrast, duotone. Background is deep charcoal #1F2937. Primary glow color orange #F97316, secondary warm orange #FB923C. No gradients except orange bloom. Stadium spotlight from directly above — hard light, sharp shadows. Metallic surface with subtle orange sheen.

SHAPE: Bold hexagonal badge silhouette. Thick raised rim with orange #F97316 edge glow and inner shadow. Dark charcoal #1F2937 interior panel, slightly recessed. Geometric, block-based, athletic — not soft or decorative.

SUBJECT_ELEMENT: Centered 3D icon, large scale, bold and simple geometry. Orange #F97316 as primary material or light source. Strong contrast against dark interior.

FORMAT: Square 1:1 canvas, subject centered with 20% padding on each side. No background outside the badge shape. Isolated on white or transparent. Photorealistic 3D render, sharp details, 160x160px equivalent quality.`;

const TEXT_RULE_NONE = 'No text, no letters, no numbers anywhere on the badge.';
const TEXT_RULE_NUMBER = (n: string) =>
  `The number "${n}" must appear as a bold 3D embossed numeral on the badge — large, centered or prominently placed, orange #F97316 with bright white highlight on raised edges. No other text or letters.`;

type AchievementDef = {
  subject: string;
  /** Milestone number to emboss on the badge, if any. */
  number?: string;
};

const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // Sessions track — intensity escalates with count
  session_first: {
    subject: 'A single chrome dumbbell with a warm orange glow at the center, bold and simple',
  },
  session_10: {
    subject:
      'A bold geometric flame made of solid orange #F97316 fire, aggressive and sharp, with the number embossed on its face',
    number: '10',
  },
  session_25: {
    subject:
      'A thick electric lightning bolt, orange #F97316 core with white-hot edges, striking downward, number embossed on the bolt face',
    number: '25',
  },
  session_50: {
    subject:
      'A bold 6-pointed star with glowing orange #F97316 facets, metallic gold center, sharp geometry, number embossed at center',
    number: '50',
  },
  session_100: {
    subject:
      'A champion trophy, gold body with orange #F97316 glowing interior light, athletic and bold, number embossed on the base plate',
    number: '100',
  },
  session_250: {
    subject:
      'A geometric crown with sharp angular points, orange #F97316 gemstones, dark gold metal body, number embossed on the front panel',
    number: '250',
  },
  session_500: {
    subject:
      'A bold geometric rocket blasting upward with an intense orange #F97316 flame trail, sharp angular fins, epic and energetic, number embossed on the hull',
    number: '500',
  },

  // Plans track — achievement and creation
  plan_first_created: {
    subject: 'A bold clipboard with thick orange #F97316 checklist lines, geometric and clean',
  },
  plan_first_completed: {
    subject: 'A thick checkmark inside a bold circle ring, orange #F97316 with bright orange bloom',
  },
  plan_3_completed: {
    subject:
      'Three bold stacked checkmarks, orange #F97316, descending in size, high contrast, number embossed above them',
    number: '3',
  },
  plan_5_completed: {
    subject:
      'A bold symmetrical laurel wreath, orange #F97316 leaves, geometric angular style, number embossed at center',
    number: '5',
  },
  plan_10_completed: {
    subject:
      'A gold trophy with a bright orange #F97316 flame erupting from the top, bold and energetic, number embossed on the base',
    number: '10',
  },
  plan_5_created: {
    subject:
      'An open book with thick bold pages, orange #F97316 light emanating from the spine, number embossed on the cover',
    number: '5',
  },
  plan_10_created: {
    subject:
      'A row of bold upright books on a shelf, glowing orange #F97316 spines, geometric, number embossed on the front book',
    number: '10',
  },
  plan_first_edited: {
    subject: 'A bold pencil with a sharp orange #F97316 spark bursting from the tip, angular',
  },
  session_first_edited: {
    subject: 'A pencil striking a bold horizontal line, orange #F97316 strike mark, dynamic angle',
  },
  session_first_imported: {
    subject: 'A bold document with a thick orange #F97316 arrow entering from the right, glowing',
  },

  // Weekly track — calendar days light up progressively, count is visual
  weekly_2: {
    subject: 'A square calendar grid, 2 bold orange #F97316 glowing blocks, dark inactive blocks',
    number: '2',
  },
  weekly_3: {
    subject:
      'A square calendar grid, 3 bold orange #F97316 glowing blocks in a row, dark inactive blocks',
    number: '3',
  },
  weekly_4: {
    subject:
      'A square calendar grid, 4 bold orange #F97316 glowing blocks, one dark block remaining',
    number: '4',
  },
  weekly_5: {
    subject:
      'A square calendar grid, 5 bold orange #F97316 glowing blocks fully lit, small flame above',
    number: '5',
  },
  weekly_6: {
    subject:
      'A square calendar grid, 6 bold orange #F97316 glowing blocks, one dark block remaining, flame above',
    number: '6',
  },
  weekly_7: {
    subject:
      'A square calendar grid fully lit with 7 bold orange #F97316 glowing blocks, a large bold flame erupting above, perfect week energy',
    number: '7',
  },

  // Tenure track — time and dedication
  tenure_1month: {
    subject:
      'A bold clock face, thick hour and minute hands pointing up, orange #F97316 glow on dial, number embossed below the hands',
    number: '1M',
  },
  tenure_3months: {
    subject:
      'A bold clock face with thick hands, strong orange #F97316 rim glow, amber dial light, number embossed on the dial',
    number: '3M',
  },
  tenure_6months: {
    subject:
      'A bold clock face with a glowing orange #F97316 orbit ring circling the exterior, number embossed on the dial face',
    number: '6M',
  },
  tenure_1year: {
    subject:
      'A bold circular gold medal with thick orange #F97316 ribbon loops, athletic and geometric, number embossed on the medal face',
    number: '1Y',
  },
  tenure_2years: {
    subject:
      'A bold diamond-shaped medal, faceted surfaces, orange #F97316 and bright white-gold glow, number embossed on the front facet',
    number: '2Y',
  },

  // Volume track — weight and power escalates
  volume_1k: {
    subject:
      'A single bold round weight plate, thick orange #F97316 glowing edge, chrome face, number embossed at center',
    number: '1K',
  },
  volume_5k: {
    subject:
      'Two bold round weight plates leaning together, thick orange #F97316 glowing edges, chrome faces, number embossed on the front plate',
    number: '5K',
  },
  volume_10k: {
    subject:
      'A straight barbell with two large weight plates, orange #F97316 glowing bar, powerful, number embossed on the plates',
    number: '10K',
  },
  volume_25k: {
    subject:
      'A loaded barbell with stacked plates on each side, orange #F97316 glowing bar, solid and heavy, number embossed on the outer plate',
    number: '25K',
  },
  volume_50k: {
    subject:
      'A heavily loaded barbell bending slightly under thick stacked plates, intense orange #F97316 glow, number embossed on the largest plate',
    number: '50K',
  },
  volume_100k: {
    subject:
      'A massive loaded barbell with multiple stacked plates, intense orange #F97316 bloom, epic scale, number embossed on the largest plate',
    number: '100K',
  },
  volume_250k: {
    subject:
      'A colossal barbell stacked with rows of plates, the bar glowing white-hot orange #F97316, dramatic bloom, number embossed on the front plate',
    number: '250K',
  },
  volume_500k: {
    subject:
      'A towering mountain peak forged from stacked weight plates, orange #F97316 light radiating from the summit, monumental, number embossed at the base',
    number: '500K',
  },
  volume_1m: {
    subject:
      'A radiant faceted gemstone shaped like a weight plate, brilliant orange #F97316 and white-gold light bursting from every facet, ultimate prestige, number embossed at the core',
    number: '1M',
  },
};

type Output = { id: string; prompt: string };

function buildPrompt(id: string): string {
  const def = ACHIEVEMENTS[id];
  if (!def) throw new Error(`No subject defined for achievement: ${id}`);
  const textRule = def.number ? TEXT_RULE_NUMBER(def.number) : TEXT_RULE_NONE;
  return `${STYLE_BASE}\n\nTEXT: ${textRule}\n\nSUBJECT: ${def.subject}`;
}

function run() {
  const isJson = process.argv.includes('--json');
  const ids = Object.keys(ACHIEVEMENTS);

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
    'Tip: after the first image, start each follow-up with:\n' +
      '  "Keep identical style: bold hexagonal badge, dark #1F2937 background, orange #F97316 rim glow, stadium spotlight from above. Only change the SUBJECT."',
  );
}

run();

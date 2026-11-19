// Authored scenario data for the one-day MVP.
//
// Values come from the GDD decision catalog (section 7) and the Waste values
// from Revision 1.1. Omitted effects follow the Default-Zero Rule: they mean
// "not modeled", not "physically zero impact".
//
// Feedback copy: lines commented "Copy from GDD section 9" come from the GDD.
// Every other line is DRAFT copy written for the prototype and still needs
// content/research review (with a source attached) before it is final. No line
// states a measured quantity. Review status is tracked for the team only and is
// not shown to players.
// Researched, cited facts for each option live in
// docs/research/decision-evidence.json, keyed by option id (see evidence.ts).
import type { Option, Scenario, ScenarioId } from './types.ts'

export const time = (hours: number, minutes = 0) => hours * 60 + minutes

export const DAY_END_MIN = time(22)

/** Fixed order of scheduled (non-follow-up) events. */
export const DAY_ORDER: ScenarioId[] = [
  'shower',
  'teeth',
  'breakfast',
  'commute',
  'lunch',
  'cleanup',
  'bathroom',
  'drink',
  'mall',
  'travelHome',
  'dinner',
  'chore',
  'laundry',
  'bed',
]

const scenarioList: Scenario[] = [
  {
    id: 'shower',
    timeMin: time(7),
    scene: 'morning',
    title: 'Morning shower',
    speaker: 'student',
    sprite: 'shower',
    ambience: 'steam',
    prompt: 'Your alarm went off at 7:00. The test starts at 8:00 sharp. How do you start the day?',
    options: [
      {
        id: 'shower-long',
        label: 'Long hot shower',
        sprite: 'shower',
        effects: { durationMin: 20, energy: 15, water: 6, carbon: 2, morningDelayMin: 15 },
        feedback: {
          outcome: 'You feel refreshed, but the morning is now running about 15 minutes behind.',
          why: 'Longer showers use more water, and heating that water takes energy.',
        },
      },
      {
        id: 'shower-quick',
        label: 'Quick 5-minute shower',
        sprite: 'shower',
        effects: { durationMin: 5, energy: 5, water: 2, carbon: 1, morningDelayMin: 0 },
        feedback: {
          outcome: 'A quick rinse keeps you on your usual schedule.',
          why: 'Shorter showers use less hot water than longer ones.',
        },
      },
      {
        id: 'shower-skip',
        label: 'Skip the shower',
        sprite: 'clock',
        effects: { energy: -10, morningDelayMin: -5 },
        feedback: {
          outcome: 'You save a few minutes, though you feel a bit sluggish.',
          why: 'Skipping saves time and water today; the trade-off here is personal comfort.',
        },
      },
    ],
  },
  {
    id: 'teeth',
    timeMin: time(7, 25),
    scene: 'morning',
    title: 'Brush teeth',
    speaker: 'student',
    sprite: 'toothbrush',
    prompt: 'Time to brush your teeth. What about the tap?',
    options: [
      {
        id: 'teeth-running',
        label: 'Leave the tap running',
        sprite: 'sink',
        effects: { water: 1 },
        feedback: {
          outcome: 'Teeth brushed, with the water running the whole time.',
          why: 'Water left running while brushing goes straight down the drain unused.',
        },
      },
      {
        id: 'teeth-off',
        label: 'Turn the tap off while brushing',
        sprite: 'toothbrush',
        effects: { water: 0 },
        feedback: {
          outcome: 'Teeth brushed, and the tap was only on when you needed it.',
          why: 'Turning the tap off is a small habit that avoids wasted water.',
        },
      },
    ],
  },
  {
    id: 'breakfast',
    timeMin: time(7, 30),
    scene: 'morning',
    title: 'Breakfast',
    speaker: 'student',
    sprite: 'breakfast',
    prompt: 'Your stomach is rumbling. What about breakfast?',
    options: [
      {
        id: 'breakfast-buy',
        label: 'Buy a snack + bottled drink',
        sprite: 'coins',
        effects: { moneyCents: -400, energy: 10, carbon: 2, waste: 1 },
        followUp: 'bag',
        feedback: {
          outcome: 'You grab a snack and a bottled drink at the corner store.',
          why: 'Single-use drink packaging takes materials to make and becomes waste afterwards.',
        },
      },
      {
        id: 'breakfast-pack',
        label: 'Pack breakfast + reusable bottle',
        sprite: 'lunchbox',
        effects: { durationMin: 10, energy: 10, morningDelayMin: 10, setFlags: ['hasReusableBottle'] },
        feedback: {
          // Copy from GDD section 9.
          outcome:
            'You spent extra preparation time but avoided the store purchase and brought a refillable bottle for later.',
          why: 'Reusing a bottle you already own avoids buying a new single-use container.',
        },
      },
      {
        id: 'breakfast-skip',
        label: 'Skip breakfast',
        sprite: 'clock',
        effects: { energy: -15 },
        feedback: {
          outcome: 'No time lost and no money spent, but you will feel it later.',
          why: 'Skipping a meal is not an environmental choice so much as a personal energy trade-off.',
        },
      },
    ],
  },
  {
    id: 'bag',
    timeMin: time(7, 35),
    scene: 'store',
    title: 'Checkout bag',
    speaker: 'student',
    sprite: 'bag-paper',
    isFollowUp: true,
    prompt: 'At the register, the cashier asks: “Do you need a bag?”',
    options: [
      {
        id: 'bag-plastic',
        label: 'Plastic bag',
        sprite: 'bag-plastic',
        effects: { carbon: 1, waste: 2 },
        feedback: {
          outcome: 'Your snack goes into a thin plastic bag.',
          why: 'A single-use bag needs new material and is often thrown away after one trip.',
        },
      },
      {
        id: 'bag-paper',
        label: 'Paper bag',
        sprite: 'bag-paper',
        effects: { carbon: 2, waste: 2 },
        feedback: {
          outcome: 'Your snack goes into a paper bag.',
          why: 'Paper bags also have a production footprint; they are recyclable only if clean and locally accepted.',
        },
      },
      {
        id: 'bag-tote',
        label: 'Buy a reusable tote',
        sprite: 'tote',
        effects: { moneyCents: -200, carbon: 3, waste: 2 },
        feedback: {
          outcome: 'You buy a new canvas tote for your snack.',
          why: 'Your new tote was made today, so its production impact counts now. How much it helps later depends on how often you reuse it.',
        },
      },
      {
        id: 'bag-backpack',
        label: 'Use your backpack',
        sprite: 'backpack',
        effects: { carbon: 0, waste: 0 },
        feedback: {
          outcome: 'The snack fits in your backpack. No bag needed.',
          why: 'Using something you already own avoids manufacturing another bag.',
        },
      },
    ],
  },
  {
    id: 'commute',
    timeMin: time(7, 40),
    scene: 'street',
    title: 'Commute to school',
    speaker: 'student',
    sprite: 'backpack',
    prompt: 'You need to be at school by 8:00 for the test. Dad is driving the same way to work and offers a lift. How do you get there?',
    options: [
      {
        id: 'commute-rideshare',
        label: 'Ride-share',
        sprite: 'car-red',
        effects: { moneyCents: -800, carbon: 8, baseArrivalMin: time(7, 45) },
        feedback: {
          outcome: 'A ride-share takes you straight to the school gate.',
          why: 'A car trip arranged just for you burns fuel for one passenger.',
        },
      },
      {
        id: 'commute-bus',
        label: 'Bus',
        sprite: 'bus',
        effects: { moneyCents: -300, carbon: 2, baseArrivalMin: time(7, 58) },
        feedback: {
          // Copy from GDD section 9.
          outcome:
            'You saved money compared with a ride-share. Check whether the morning delay still gets you to the test on time.',
          why: 'Bus emissions are shared among many passengers.',
        },
      },
      {
        id: 'commute-bike',
        label: 'Bike',
        sprite: 'bike',
        effects: { energy: -20, carbon: 0, baseArrivalMin: time(7, 55) },
        feedback: {
          outcome: 'You pedal to school. It takes effort, but it is free.',
          why: 'Biking has very low direct emissions; the cost here is your energy.',
        },
      },
      {
        id: 'commute-dad',
        label: 'Ride with Dad (already going that way)',
        sprite: 'car-blue',
        effects: { carbon: 1, baseArrivalMin: time(7, 50) },
        feedback: {
          outcome: 'Dad drops you off on his way to work.',
          why: 'Joining a car trip that was happening anyway adds less than arranging a new trip.',
        },
      },
    ],
  },
  {
    id: 'lunch',
    timeMin: time(12),
    scene: 'afternoon',
    title: 'School lunch',
    speaker: 'student',
    sprite: 'tray',
    prompt: 'Lunch is free at school today. What do you pick from the counter?',
    options: [
      {
        id: 'lunch-beef',
        label: 'Local beef burger',
        sprite: 'tray',
        effects: { carbon: 10 },
        feedback: {
          outcome: 'A filling burger, made with beef from a nearby farm.',
          why: 'Beef often has a higher climate impact than other foods, even when produced locally.',
        },
      },
      {
        id: 'lunch-chicken',
        label: 'Chicken sandwich',
        sprite: 'tray',
        effects: { carbon: 2 },
        feedback: {
          outcome: 'A chicken sandwich hits the spot.',
          why: 'Poultry usually has a much lower climate impact than beef.',
        },
      },
      {
        id: 'lunch-burrito',
        label: 'Bean burrito (imported ingredients)',
        sprite: 'tray',
        effects: { carbon: 1 },
        feedback: {
          outcome: 'A bean burrito, made with ingredients shipped from abroad.',
          // Adapted from GDD section 9.
          why: 'What a food is and how it is produced usually matter more than how far it travelled.',
        },
      },
    ],
  },
  {
    id: 'cleanup',
    timeMin: time(12, 20),
    scene: 'afternoon',
    title: 'Lunch cleanup',
    speaker: 'student',
    sprite: 'bins',
    prompt: 'Your tray has food scraps, a plastic wrapper, and a paper napkin. Where does it all go?',
    options: [
      {
        id: 'cleanup-recycling',
        label: 'Put everything in recycling',
        sprite: 'recycle',
        effects: { waste: 3 },
        unmodeled: 'Carbon not assigned pending research (GDD section 7).',
        feedback: {
          outcome: 'Everything goes into the recycling bin, food scraps included.',
          why: 'Food and unaccepted plastics can contaminate a recycling batch.',
        },
      },
      {
        id: 'cleanup-trash',
        label: 'Throw everything in the trash',
        sprite: 'trash',
        effects: { waste: 2 },
        unmodeled: 'Carbon not assigned pending research (GDD section 7).',
        feedback: {
          outcome: 'It all goes in the trash. Quick and easy.',
          why: 'Recoverable materials end up discarded instead of recycled.',
        },
      },
      {
        id: 'cleanup-sort',
        label: 'Sort it correctly',
        sprite: 'bins',
        effects: { durationMin: 5, waste: 0 },
        unmodeled: 'Carbon not assigned pending research (GDD section 7).',
        feedback: {
          outcome: 'You take a few minutes to sort each item into the right bin.',
          // Copy from GDD section 9.
          why: 'Separating materials avoids contaminating recycling; local disposal rules vary.',
        },
      },
    ],
  },
  {
    id: 'bathroom',
    timeMin: time(13),
    scene: 'afternoon',
    title: 'Washroom break',
    speaker: 'student',
    sprite: 'sink',
    prompt: 'You wash your hands after class. How do you dry them?',
    options: [
      {
        id: 'bathroom-towels',
        label: 'Paper towels',
        sprite: 'towel',
        effects: { carbon: 2, waste: 1 },
        feedback: {
          outcome: 'You pull a couple of paper towels and toss them.',
          why: 'Paper towels have manufacturing and disposal impacts.',
        },
      },
      {
        id: 'bathroom-old-dryer',
        label: 'Older warm-air dryer',
        sprite: 'dryer',
        effects: { carbon: 2 },
        feedback: {
          outcome: 'The old dryer blows warm air for a while.',
          why: 'Dryers use electricity; how much depends on the model and how long it runs.',
        },
      },
      {
        id: 'bathroom-fast-dryer',
        label: 'High-speed dryer',
        sprite: 'dryer',
        effects: { carbon: 1 },
        feedback: {
          outcome: 'The high-speed dryer finishes the job quickly.',
          why: 'The ranking between drying methods depends on the electricity source and dryer type.',
        },
      },
    ],
  },
  {
    id: 'drink',
    timeMin: time(14),
    scene: 'afternoon',
    title: 'Afternoon drink',
    speaker: 'student',
    sprite: 'bottle',
    prompt: 'You are thirsty before practice. What do you drink?',
    options: [
      {
        id: 'drink-plastic',
        label: 'Buy a plastic water bottle',
        sprite: 'water',
        effects: { moneyCents: -200, carbon: 1, waste: 1 },
        feedback: {
          outcome: 'You buy a bottle of water from the machine.',
          why: 'A new single-use bottle takes material and energy to make and ship.',
        },
      },
      {
        id: 'drink-juice',
        label: 'Buy juice in a glass bottle',
        sprite: 'smoothie',
        effects: { moneyCents: -350, energy: 5, carbon: 2, waste: 1 },
        feedback: {
          outcome: 'The juice gives you a small boost.',
          why: 'Glass is heavy to transport, and how the bottle is disposed of matters.',
        },
      },
      {
        id: 'drink-refill',
        label: 'Refill your reusable bottle',
        sprite: 'bottle',
        effects: { carbon: 0, waste: 0 },
        requires: ['hasReusableBottle'],
        requiresReason: 'You did not pack your reusable bottle this morning.',
        feedback: {
          outcome: 'You top up the bottle you packed this morning at the fountain.',
          why: 'Refilling a bottle you already own avoids a new container.',
        },
      },
    ],
  },
  {
    id: 'mall',
    timeMin: time(17),
    scene: 'mall',
    title: 'Mall with friends',
    speaker: 'friend',
    sprite: 'hoodie',
    prompt: '“Look at these hoodies! You should totally get one.” Your friends are all shopping.',
    options: [
      {
        id: 'mall-new',
        label: 'Buy a new hoodie',
        sprite: 'hoodie',
        effects: { moneyCents: -1000, energy: 15, carbon: 6, waste: 3 },
        followUp: 'cup',
        feedback: {
          outcome: 'You leave with a brand-new hoodie and a good mood.',
          why: 'New clothing involves fiber production, dyeing, sewing, and shipping.',
        },
      },
      {
        id: 'mall-thrift',
        label: 'Buy a thrifted hoodie',
        sprite: 'hoodie',
        effects: { moneyCents: -1200, energy: 10, carbon: 1, waste: 1 },
        followUp: 'cup',
        feedback: {
          outcome: 'You find a cozy second-hand hoodie at the thrift store.',
          why: 'Buying second-hand usually avoids producing a new garment, though handling and transport still have impacts.',
        },
      },
      {
        id: 'mall-nothing',
        label: 'Buy nothing',
        sprite: 'check',
        effects: { energy: -5, carbon: 0, waste: 0 },
        followUp: 'cup',
        feedback: {
          outcome: 'You keep your money, though you feel a little left out.',
          why: 'Not buying avoids this purchase’s impact. Saying no while friends shop can still feel draining.',
        },
      },
    ],
  },
  {
    id: 'cup',
    timeMin: time(17, 30),
    scene: 'mall',
    title: 'Smoothie cup',
    speaker: 'friend',
    sprite: 'smoothie',
    isFollowUp: true,
    prompt: 'You finish the smoothie your friend shared with you. The cup says “compostable”. There is no compost bin here.',
    options: [
      {
        id: 'cup-recycling',
        label: 'Put it in the recycling bin',
        sprite: 'recycle',
        effects: { waste: 2 },
        unmodeled: 'Carbon not assigned (GDD section 7).',
        feedback: {
          outcome: 'The cup goes into recycling.',
          why: 'Compostable cups are typically not accepted in conventional recycling; rules vary by area.',
        },
      },
      {
        id: 'cup-trash',
        label: 'Put it in the trash',
        sprite: 'trash',
        effects: { waste: 1 },
        unmodeled: 'Carbon not assigned (GDD section 7).',
        feedback: {
          outcome: 'The cup goes into the trash.',
          why: 'Without composting available, the trash is a reasonable fallback that avoids contaminating recycling.',
        },
      },
    ],
  },
  {
    id: 'travelHome',
    timeMin: time(18),
    scene: 'rain',
    title: 'Travel home in the rain',
    speaker: 'friend',
    sprite: 'bus',
    ambience: 'rain',
    prompt: 'It is pouring outside. “Want to split a ride-share? There are four of us.”',
    options: [
      {
        id: 'home-rideshare',
        label: 'Ride-share alone',
        sprite: 'car-red',
        effects: { moneyCents: -800, carbon: 8 },
        feedback: {
          outcome: 'You get home dry, on your own.',
          why: 'A car trip for a single passenger has the highest emissions per person here.',
        },
      },
      {
        id: 'home-split',
        label: 'Split a ride-share with 3 friends',
        sprite: 'car-red',
        effects: { moneyCents: -200, carbon: 2 },
        feedback: {
          outcome: 'Four of you squeeze in and split the fare.',
          why: 'Sharing one car trip spreads its emissions across several people.',
        },
      },
      {
        id: 'home-bus',
        label: 'Take the bus',
        sprite: 'bus',
        effects: { moneyCents: -300, durationMin: 25, carbon: 2 },
        feedback: {
          outcome: 'The bus takes about 25 minutes longer, but you get home.',
          why: 'Public transit shares emissions among many riders.',
        },
      },
      {
        id: 'home-walk',
        label: 'Walk home in the rain',
        sprite: 'sneaker',
        effects: { energy: -20, carbon: 0 },
        feedback: {
          outcome: 'You arrive home soaked and tired.',
          why: 'Walking has no direct emissions; the cost here is your energy.',
        },
      },
      {
        id: 'home-mom',
        label: 'Ask Mom for a ride',
        sprite: 'car-blue',
        effects: { carbon: 8, setFlags: ['momPickup'] },
        followUp: 'idling',
        feedback: {
          outcome: 'Mom comes to pick you up.',
          why: 'A trip made just to pick you up adds fuel use.',
        },
      },
    ],
  },
  {
    id: 'idling',
    timeMin: time(18, 5),
    scene: 'rain',
    title: 'Waiting in the car',
    speaker: 'mom',
    sprite: 'car-blue',
    ambience: 'rain',
    isFollowUp: true,
    prompt: '“I need to run into the pharmacy for a few minutes. Should I leave the engine running?”',
    options: [
      {
        id: 'idling-on',
        label: 'Leave the engine running',
        sprite: 'car-blue',
        effects: { carbon: 1 },
        feedback: {
          outcome: 'The engine hums while you wait.',
          why: 'An idling engine burns fuel without moving.',
        },
      },
      {
        id: 'idling-off',
        label: 'Ask Mom to turn the engine off',
        sprite: 'check',
        effects: { carbon: 0 },
        feedback: {
          outcome: 'Mom switches the engine off until she is back.',
          why: 'Turning the engine off avoids burning fuel while parked.',
        },
      },
    ],
  },
  {
    id: 'dinner',
    timeMin: time(19),
    scene: 'evening',
    title: 'Family dinner',
    speaker: 'mom',
    sprite: 'plate',
    prompt: '“Dinner time! What should we make tonight?”',
    options: [
      {
        id: 'dinner-beef',
        label: 'Beef tacos',
        sprite: 'plate',
        effects: { carbon: 10 },
        feedback: {
          outcome: 'Everyone enjoys beef tacos.',
          why: 'Beef often has a higher climate impact than other proteins.',
        },
      },
      {
        id: 'dinner-chicken',
        label: 'Chicken stir-fry',
        sprite: 'plate',
        effects: { carbon: 2 },
        feedback: {
          outcome: 'A quick chicken stir-fry for the family.',
          why: 'Chicken usually has a much lower climate impact than beef.',
        },
      },
      {
        id: 'dinner-veggie',
        label: 'Veggie pasta',
        sprite: 'plate',
        effects: { carbon: 1 },
        feedback: {
          outcome: 'A big pot of veggie pasta.',
          why: 'Plant-based meals usually have a lower climate impact than meat dishes.',
        },
      },
    ],
  },
  {
    id: 'chore',
    timeMin: time(19, 45),
    scene: 'evening',
    title: 'Optional chore',
    speaker: 'mom',
    sprite: 'dishes',
    prompt: '“If you do the dishes tonight, I will give you $5.”',
    options: [
      {
        id: 'chore-decline',
        label: 'Decline the chore',
        sprite: 'check',
        effects: {},
        feedback: {
          // Copy from GDD section 9.
          outcome: 'You kept your evening free but did not earn the optional $5.',
          why: 'Choosing how to spend your time is a personal trade-off with no environmental effect here.',
        },
      },
      {
        id: 'chore-accept',
        label: 'Accept the chore (+$5 when done)',
        sprite: 'dishes',
        effects: { setFlags: ['choreAccepted'] },
        followUp: 'dishes',
        feedback: {
          outcome: 'You roll up your sleeves. You will be paid once the dishes are done.',
          why: 'How you wash the dishes will decide the water used.',
        },
      },
    ],
  },
  {
    id: 'dishes',
    timeMin: time(19, 50),
    scene: 'evening',
    title: 'Washing the dishes',
    speaker: 'student',
    sprite: 'dishes',
    isFollowUp: true,
    prompt: 'The sink is full. How do you wash up?',
    options: [
      {
        id: 'dishes-hand',
        label: 'Hand wash with the tap running',
        sprite: 'sink',
        effects: { durationMin: 20, water: 6, carbon: 2 },
        payoutOnCommitCents: 500,
        feedback: {
          outcome: 'Twenty minutes later the dishes are clean. You earned $5.',
          why: 'A continuously running hot tap uses a lot of water and heating energy.',
        },
      },
      {
        id: 'dishes-rinse',
        label: 'Rinse plates, then dishwasher',
        sprite: 'dishes',
        effects: { durationMin: 10, water: 4 },
        payoutOnCommitCents: 500,
        unmodeled: 'Carbon not defined in the GDD; temporarily 0 pending research.',
        feedback: {
          outcome: 'Plates rinsed and loaded. You earned $5.',
          why: 'Pre-rinsing under the tap adds water use before the dishwasher even starts.',
        },
      },
      {
        id: 'dishes-half',
        label: 'Run a half-full dishwasher',
        sprite: 'dishes',
        effects: { durationMin: 5, water: 2 },
        payoutOnCommitCents: 500,
        unmodeled: 'Carbon not defined in the GDD; temporarily 0 pending research.',
        feedback: {
          outcome: 'The dishwasher runs with half a load. You earned $5.',
          why: 'A half-empty dishwasher uses water for fewer dishes per cycle.',
        },
      },
      {
        id: 'dishes-full',
        label: 'Load it and wait until it is full',
        sprite: 'dishes',
        effects: { durationMin: 5, water: 1 },
        payoutOnCommitCents: 500,
        unmodeled: 'Carbon not defined in the GDD; temporarily 0 pending research.',
        feedback: {
          outcome: 'Dishes scraped and loaded for the next full cycle. That counts as done: you earned $5.',
          why: 'Running only full loads gets the most dishes out of each cycle.',
        },
      },
    ],
  },
  {
    id: 'laundry',
    timeMin: time(20, 30),
    scene: 'evening',
    title: 'Laundry',
    speaker: 'student',
    sprite: 'laundry',
    prompt: 'Your gym clothes need washing. Which setting?',
    options: [
      {
        id: 'laundry-hot',
        label: 'Hot wash',
        sprite: 'washer',
        effects: { carbon: 4 },
        feedback: {
          outcome: 'The washer heats up for a hot cycle.',
          why: 'Heating wash water is a large part of a washing machine’s energy use.',
        },
      },
      {
        id: 'laundry-cold',
        label: 'Cold wash',
        sprite: 'washer',
        effects: { carbon: 1 },
        feedback: {
          outcome: 'A cold cycle gets the everyday dirt out.',
          why: 'Washing in cold water avoids most of the heating energy.',
        },
      },
    ],
  },
  {
    id: 'bed',
    timeMin: time(21, 30),
    scene: 'evening',
    title: 'Before bed',
    speaker: 'student',
    sprite: 'thermostat',
    prompt: 'You are getting ready for bed. Which habit do you go with tonight?',
    options: [
      {
        id: 'bed-unplug',
        label: 'Unplug the charger, keep the heat up',
        sprite: 'charger',
        effects: { carbon: 4 },
        feedback: {
          outcome: 'Charger unplugged, room nice and warm.',
          why: 'Heating a room overnight usually uses far more energy than an idle charger.',
        },
      },
      {
        id: 'bed-heat',
        label: 'Lower the heat a few degrees',
        sprite: 'thermostat',
        effects: { energy: -5, carbon: 0 },
        feedback: {
          outcome: 'You pull on an extra blanket. It is a little chilly.',
          why: 'Turning the heat down saves more than unplugging one charger. A plugged-in charger still uses a little power, and many add up.',
        },
      },
    ],
  },
]

export const SCENARIOS: Record<ScenarioId, Scenario> = Object.fromEntries(
  scenarioList.map((scenario) => [scenario.id, scenario]),
) as Record<ScenarioId, Scenario>

export function getOption(scenarioId: ScenarioId, optionId: string): Option | undefined {
  return SCENARIOS[scenarioId].options.find((option) => option.id === optionId)
}

/* ==========================================================================
   Healthy Plate Coach — content data
   All food items and meals are realistic but fictional. No learner data
   beyond locally-stored practice progress is collected.
   ========================================================================== */

const FOOD_GROUPS = [
  {
    id: 'grains',
    name: 'Grains',
    color: '#C98A22',
    tagline: 'Energy to fuel your day',
    detail: "Grains such as bread, rice, and oats give your body carbohydrates — the main fuel your brain and muscles use to get through class, practice, and everything in between. Choosing whole grains adds fiber that keeps digestion running smoothly.",
    portionTip: 'Aim for about a quarter of your plate.'
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    color: '#2F8F72',
    tagline: 'Vitamins, minerals, and fiber',
    detail: "Vegetables are packed with vitamins, minerals, and fiber that support your immune system, eyesight, and digestion. Eating a mix of colors usually means a mix of nutrients too.",
    portionTip: 'Aim for the biggest section of your plate — about a third or more.'
  },
  {
    id: 'fruits',
    name: 'Fruits',
    color: '#D9503F',
    tagline: 'Natural energy and vitamin C',
    detail: "Fruits provide natural sugars for quick energy, plus vitamin C and antioxidants that help your body recover and stay well.",
    portionTip: 'A smaller section works well — pair it with vegetables for balance.'
  },
  {
    id: 'protein',
    name: 'Protein',
    color: '#8B5E3C',
    tagline: 'Builds and repairs muscle',
    detail: "Protein foods like chicken, beans, eggs, and fish help build and repair muscle — especially useful while you're still growing or if you play sports.",
    portionTip: 'Aim for about a quarter of your plate.'
  },
  {
    id: 'dairy',
    name: 'Dairy',
    color: '#3E7EA6',
    tagline: 'Calcium for strong bones',
    detail: "Dairy foods (or fortified alternatives like soy milk) provide calcium and vitamin D, nutrients your bones need while they're still growing stronger.",
    portionTip: 'A small side serving, like a glass or cup, rounds out the meal.'
  }
];

function getGroup(id) {
  return FOOD_GROUPS.find(g => g.id === id);
}

const FOOD_ITEMS = [
  // Grains
  { id: 'bread', name: 'Whole wheat bread', group: 'grains', note: 'A fiber-rich slice for sandwiches.' },
  { id: 'rice', name: 'Brown rice', group: 'grains', note: 'A hearty side that pairs with almost anything.' },
  { id: 'oatmeal', name: 'Oatmeal', group: 'grains', note: 'A warm bowl that keeps you full till lunch.' },
  { id: 'pasta', name: 'Whole wheat pasta', group: 'grains', note: 'A filling base for sauces and veggies.' },
  { id: 'tortilla', name: 'Corn tortilla', group: 'grains', note: 'Great for wraps and tacos.' },
  // Vegetables
  { id: 'broccoli', name: 'Broccoli', group: 'vegetables', note: 'Steamed or roasted, it is loaded with vitamin C.' },
  { id: 'carrots', name: 'Carrots', group: 'vegetables', note: 'Crunchy and rich in vitamin A.' },
  { id: 'spinach', name: 'Spinach salad', group: 'vegetables', note: 'A leafy source of iron and folate.' },
  { id: 'peppers', name: 'Bell peppers', group: 'vegetables', note: 'Sweet, crunchy, and full of vitamin C.' },
  { id: 'sweetpotato', name: 'Sweet potato', group: 'vegetables', note: 'A starchy veggie rich in vitamin A.' },
  // Fruits
  { id: 'apple', name: 'Apple', group: 'fruits', note: 'A crunchy source of fiber you can grab and go.' },
  { id: 'banana', name: 'Banana', group: 'fruits', note: 'A quick source of potassium and energy.' },
  { id: 'orange', name: 'Orange', group: 'fruits', note: 'Juicy and high in vitamin C.' },
  { id: 'strawberries', name: 'Strawberries', group: 'fruits', note: 'Sweet, colorful, and rich in antioxidants.' },
  { id: 'melon', name: 'Mixed melon', group: 'fruits', note: 'Refreshing and hydrating.' },
  // Protein
  { id: 'chicken', name: 'Grilled chicken', group: 'protein', note: 'A lean protein that keeps you full.' },
  { id: 'beans', name: 'Black beans', group: 'protein', note: 'A plant-based protein with fiber too.' },
  { id: 'eggs', name: 'Scrambled eggs', group: 'protein', note: 'A quick, versatile protein for any meal.' },
  { id: 'salmon', name: 'Baked salmon', group: 'protein', note: 'Protein plus healthy omega-3 fats.' },
  { id: 'peanutbutter', name: 'Peanut butter', group: 'protein', note: 'A spreadable protein with healthy fats.' },
  // Dairy
  { id: 'milk', name: 'Milk', group: 'dairy', note: 'A classic source of calcium and vitamin D.' },
  { id: 'yogurt', name: 'Yogurt', group: 'dairy', note: 'Creamy, with calcium and gut-friendly cultures.' },
  { id: 'cheese', name: 'Cheese slice', group: 'dairy', note: 'A tasty way to add calcium to a meal.' },
  { id: 'stringcheese', name: 'String cheese', group: 'dairy', note: 'A portable calcium-rich snack.' },
  { id: 'soymilk', name: 'Fortified soy milk', group: 'dairy', note: 'A plant-based option with added calcium.' },
];

function getFoodItem(id) {
  return FOOD_ITEMS.find(f => f.id === id);
}

const MEAL_CHALLENGES = [
  {
    id: 'soccer-lunch',
    name: "Jordan's Soccer Lunch",
    audience: 'Jordan, age 12',
    scenario: "Jordan has soccer practice right after school and needs a lunch that gives lasting energy — not a sugar rush that fades fast.",
    goal: 'Build a lunch that includes energy-lasting grains, muscle-supporting protein, and enough vegetables and fruit to round it out.'
  },
  {
    id: 'family-dinner',
    name: "Maya's Family Dinner",
    audience: 'Maya, age 13',
    scenario: "Maya is helping plan tonight's family dinner. Everyone has different tastes, so she wants a plate that feels satisfying and balanced for the whole table.",
    goal: 'Build a dinner plate that balances grains, vegetables, protein, and a dairy side.'
  },
  {
    id: 'quick-breakfast',
    name: "Sam's Quick Breakfast",
    audience: 'Sam, age 11',
    scenario: "Sam has about ten minutes before the bus arrives and a math test first period. Sam needs fuel that will help with focus, not an empty-calorie snack.",
    goal: 'Build a fast breakfast that still covers as many food groups as possible.'
  }
];

function getChallenge(id) {
  return MEAL_CHALLENGES.find(c => c.id === id);
}

/* Learn screen: short lesson content beyond the food-group basics */
const LEARN_TIPS = [
  {
    title: 'Fill half your plate with produce',
    body: "Vegetables and fruits together should usually take up about half of your plate. Vegetables can take the larger share, since they tend to be lower in natural sugar."
  },
  {
    title: 'Balance, don\u2019t eliminate',
    body: "A balanced meal isn't about cutting out entire food groups — it's about proportion. Even energy-dense foods like grains and proteins belong on the plate in the right amount."
  },
  {
    title: 'Pair for lasting energy',
    body: "Pairing a carbohydrate (like fruit or grains) with a protein or healthy fat helps energy last longer, instead of spiking and crashing."
  },
  {
    title: 'Color is a clue',
    body: "Different colors in vegetables and fruits usually mean different vitamins and minerals. A colorful plate is often a well-rounded one."
  }
];

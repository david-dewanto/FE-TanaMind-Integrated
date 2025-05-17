export interface ArticleCategory {
  id: string;
  title: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  excerpt: string;
  content: string;
  publishedDate: string;
  imageUrl?: string;
  readTimeMinutes: number;
}

export const categories: ArticleCategory[] = [
  {
    id: 'indoor-plants',
    title: 'Indoor Plants',
    slug: 'indoor-plants'
  },
  {
    id: 'plant-care',
    title: 'Plant Care',
    slug: 'plant-care'
  },
  {
    id: 'seasonal-tips',
    title: 'Seasonal Tips',
    slug: 'seasonal-tips'
  }
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'Top 10 Low-Maintenance Indoor Plants',
    slug: 'top-10-low-maintenance-indoor-plants',
    categoryId: 'indoor-plants',
    excerpt: 'Discover the best plants for busy plant owners that thrive with minimal care.',
    content: `
# Top 10 Low-Maintenance Indoor Plants

Not everyone has a natural green thumb or the time to devote to high-maintenance houseplants. Luckily, there are plenty of beautiful indoor plants that can thrive with minimal attention. Here are ten of the best low-maintenance indoor plants for busy plant owners.

## 1. Snake Plant (Sansevieria)

The snake plant is practically indestructible. It can survive in low light, doesn't need frequent watering, and can go weeks without attention.

**Care tips:**
- Water only when the soil is completely dry
- Tolerates low to bright indirect light
- Rarely needs repotting
- Purifies air by removing toxins

## 2. ZZ Plant (Zamioculcas zamiifolia)

With its glossy leaves and forgiving nature, the ZZ plant is perfect for beginners or forgetful plant owners.

**Care tips:**
- Allow soil to dry completely between waterings
- Tolerates low light conditions
- Slow-growing, so rarely needs repotting
- Toxic if ingested, so keep away from pets

## 3. Pothos (Epipremnum aureum)

Pothos is a trailing vine with heart-shaped leaves that's incredibly adaptable to different environments.

**Care tips:**
- Water when the top inch of soil feels dry
- Grows in low to bright indirect light
- Easy to propagate from cuttings
- Available in various variegations

## 4. Spider Plant (Chlorophytum comosum)

Known for its arching leaves and little "spiderettes," this plant is both decorative and easy to care for.

**Care tips:**
- Keep soil lightly moist but not soggy
- Prefers bright indirect light but tolerates lower light
- Produces babies that can be propagated
- Safe for pets

## 5. Rubber Plant (Ficus elastica)

With its large, glossy leaves, the rubber plant makes a bold statement while being relatively low-maintenance.

**Care tips:**
- Allow top soil to dry between waterings
- Thrives in medium to bright indirect light
- Wipe leaves occasionally to keep them dust-free
- Can grow quite tall if not pruned

## 6. Peace Lily (Spathiphyllum)

One of the few low-maintenance plants that flower indoors, peace lilies are elegant and forgiving.

**Care tips:**
- Water when leaves start to droop slightly
- Grows in low to medium light
- Produces white "flowers" (actually modified leaves)
- Toxic to cats and dogs

## 7. Aloe Vera

Not only is aloe vera easy to care for, but it's also medicinal - the gel inside its leaves can soothe minor burns and skin irritations.

**Care tips:**
- Water deeply but infrequently
- Needs bright indirect light
- Use well-draining soil
- Can go weeks without water

## 8. Chinese Evergreen (Aglaonema)

Chinese evergreens are known for their beautiful patterned leaves and adaptability to indoor conditions.

**Care tips:**
- Keep soil lightly moist
- Tolerates low light conditions
- Available in various colors and patterns
- Prefers higher humidity but adapts to normal home conditions

## 9. Cast Iron Plant (Aspidistra elatior)

True to its name, this plant is tough as iron and can survive in conditions that would kill most other houseplants.

**Care tips:**
- Water sparingly
- Survives in very low light
- Slow-growing and long-lived
- Resistant to pests and diseases

## 10. Jade Plant (Crassula ovata)

This succulent is known for its thick, woody stems and oval-shaped leaves, symbolizing good luck in many cultures.

**Care tips:**
- Allow soil to dry completely between waterings
- Needs bright indirect light
- Can live for decades with proper care
- Propagates easily from stem or leaf cuttings

## Conclusion

Even if you've struggled to keep plants alive in the past, these ten varieties offer beautiful greenery without demanding too much of your time or attention. Start with one or two from this list, and you'll soon gain confidence in your plant-keeping abilities.

Remember: it's better to underwater than overwater most of these plants. When in doubt, wait another day before watering!
    `,
    publishedDate: '2023-11-15',
    readTimeMinutes: 5
  },
  {
    id: '2',
    title: 'The Science of Watering: How to Water Your Plants Correctly',
    slug: 'science-of-watering-plants-correctly',
    categoryId: 'plant-care',
    excerpt: 'Learn the proper techniques and timing for watering different types of plants to help them thrive.',
    content: `
# The Science of Watering: How to Water Your Plants Correctly

One of the most common reasons houseplants die is improper watering. Many plant owners either underwater or overwater their plants, not understanding the specific needs of different species. This guide will help you develop a better understanding of when and how to water your plants for optimal health.

## Understanding Plant Water Needs

Different plants have different water requirements based on their natural habitats. Desert cacti need much less water than tropical ferns, for example. However, there are some general principles that apply to most plants:

### Signs of Overwatering

Overwatering is often more harmful than underwatering. Signs include:
- Yellowing leaves throughout the plant
- Soft, mushy stems or leaves
- Wilting despite wet soil
- Brown spots with yellow halos on leaves
- Mold on the soil surface
- Root rot (roots appear brown and mushy instead of white and firm)

When roots are constantly sitting in water, they can't get oxygen and begin to rot. This prevents the plant from absorbing nutrients properly.

### Signs of Underwatering

Underwatered plants typically show:
- Dry, crispy leaf edges (especially older leaves)
- Drooping, limp stems and leaves
- Slow or stopped growth
- Leaves that fall off easily
- Soil pulling away from the sides of the pot
- Soil feeling completely dry several inches down

## The Finger Test

A simple way to check if your plant needs water is to insert your finger about an inch into the soil. If it feels dry at that depth, it's likely time to water. If it feels moist, wait a few more days before checking again.

For larger pots, you may want to use a moisture meter, which can check moisture levels deeper in the soil where your finger can't reach.

## Watering Techniques

### Bottom Watering

This technique involves placing your potted plant in a tray of water and allowing the soil to absorb moisture from the bottom up through the drainage holes. This encourages deeper root growth and can prevent overwatering.

1. Fill a tray or saucer with water
2. Place your potted plant in the water
3. Let it sit for 15-30 minutes
4. Remove the plant once the top of the soil feels moist
5. Allow excess water to drain before returning the plant to its spot

### Top Watering

When watering from the top:
1. Water slowly and evenly around the soil surface
2. Continue until water flows from the drainage holes
3. Empty the drainage tray so the plant isn't sitting in water
4. Water again only when the soil has dried appropriately for that plant type

### Deep Watering vs. Light Watering

Deep watering (watering thoroughly but less frequently) is generally better than frequent light watering. Deep watering encourages roots to grow downward in search of water, creating stronger plants. Light, frequent watering can lead to shallow root systems and more vulnerable plants.

## Seasonal Adjustments

Most plants need less water during fall and winter when growth slows down. During spring and summer, when plants are actively growing, they'll typically need more water.

## Water Quality Matters

Some plants are sensitive to chemicals commonly found in tap water:
- Chlorine
- Fluoride
- Salts and minerals that build up over time

Solutions include:
- Letting tap water sit out overnight to allow chlorine to dissipate
- Using filtered water, rainwater, or distilled water for sensitive plants
- Flushing the soil thoroughly every few months to remove mineral buildup

## Special Cases

### Succulents and Cacti

These plants store water in their leaves or stems and need very little water, especially during winter. Water only when the soil is completely dry, and reduce watering in the dormant season.

### Tropical Plants

Plants from tropical environments often prefer consistently moist (but not soggy) soil and higher humidity. Consider grouping these plants together or using a humidifier.

### Air Plants (Tillandsia)

These don't grow in soil and should be watered by soaking in water for 20-30 minutes every 1-2 weeks, then allowed to dry completely.

## Conclusion

Remember that watering schedules should be flexible and responsive to your plant's needs, not based on a strict calendar. By paying attention to your plants and their specific requirements, you'll develop an intuition for when they need water.

The best plant parents are observant ones - check your plants regularly for any signs of distress, adjust your watering habits accordingly, and you'll be rewarded with healthy, thriving plants.
    `,
    publishedDate: '2023-10-22',
    readTimeMinutes: 7
  },
  {
    id: '3',
    title: 'How to Keep Your Indoor Plants Thriving',
    slug: 'keep-indoor-plants-thriving',
    categoryId: 'indoor-plants',
    excerpt: 'Expert tips for maintaining healthy, vibrant houseplants in any living space.',
    content: `
# How to Keep Your Indoor Plants Thriving

Indoor plants bring life, color, and improved air quality to our homes. Yet many people struggle to keep their houseplants healthy over the long term. With the right knowledge and a bit of consistent care, you can transform your home into a thriving indoor garden. Here's how to keep your indoor plants looking their best.

## Understand Your Plant's Natural Habitat

Every plant has evolved to thrive in specific conditions. Understanding where your plant comes from in nature provides valuable clues about how to care for it indoors:

- **Tropical understory plants** (like peace lilies, calatheas) prefer indirect light, higher humidity, and consistent moisture
- **Desert plants** (like cacti, succulents) need bright light, excellent drainage, and infrequent watering
- **Rainforest canopy plants** (like many orchids, some philodendrons) often want bright indirect light, good air circulation, and cycles of drying out between waterings

## Master the Basics

### Light Requirements

Light is plant food. Without adequate light, plants cannot produce the energy they need to grow.

- **Low light plants** can survive in north-facing windows or interior spaces (snake plants, ZZ plants, pothos)
- **Medium light plants** do well in east or west-facing windows (peace lilies, philodendrons, dracaenas)
- **High light plants** need south-facing windows or supplemental grow lights (cacti, succulents, citrus trees)

Remember: "low light tolerant" doesn't mean "prefers low light" - most plants will do better with more light than less.

### Watering Wisdom

More houseplants die from overwatering than any other cause. For most plants:

1. Water thoroughly when the top 1-2 inches of soil feels dry
2. Ensure pots have drainage holes
3. Empty drainage trays after watering
4. Water less in winter when plants grow more slowly
5. Increase watering during active growth periods

### Humidity Matters

Many popular houseplants come from tropical regions with higher humidity than our homes provide. Increase humidity by:

- Grouping plants together
- Using a humidifier
- Setting pots on trays filled with pebbles and water (keeping the pot above the water line)
- Misting humidity-loving plants (though this is only a temporary solution)

## Soil and Nutrition

Different plants require different soil mixes:

- **Standard houseplants**: General potting mix with extra perlite for drainage
- **Succulents/cacti**: Specialized fast-draining cactus mix
- **Orchids**: Bark-based orchid mix, not soil
- **African violets**: Special African violet mix

Fertilize during the growing season (typically spring and summer) using:
- Liquid fertilizer diluted to half the recommended strength
- Slow-release granules
- Organic options like worm castings or compost tea

## Maintaining Plant Health

### Regular Inspection

Make it a habit to check your plants weekly for:
- Pests (look under leaves and along stems)
- Discolored or damaged leaves
- Soil moisture
- New growth

### Pruning and Cleaning

- Remove yellow or brown leaves
- Wipe dust from leaves with a damp cloth
- Trim leggy growth to encourage bushiness
- Remove spent flowers

### Repotting

Most houseplants benefit from repotting every 1-2 years:
1. Choose a pot 1-2 inches larger in diameter
2. Use fresh potting mix
3. Best done in spring or early summer
4. Water thoroughly after repotting

Signs a plant needs repotting:
- Roots growing out of drainage holes
- Water runs straight through without being absorbed
- Plant is top-heavy and tips over
- Growth has slowed despite good care

## Troubleshooting Common Issues

### Yellowing Leaves
- **Lower leaves only**: Often normal aging
- **Throughout plant**: Usually overwatering
- **With brown tips**: Could be fertilizer burn or low humidity

### Brown Leaf Tips
- Usually indicates low humidity
- Can also be caused by chlorine/fluoride in tap water
- Excess fertilizer can cause this too

### Leggy, Stretched Growth
- Almost always a sign of insufficient light
- Move to a brighter location or add grow lights

### Leaf Drop
- Sudden changes in environment
- Overwatering or underwatering
- Cold drafts
- Seasonal adjustment (some plants naturally drop leaves in fall/winter)

## Conclusion

Successful plant care is about consistency and observation rather than having a "green thumb." By understanding your plants' needs and creating a regular care routine, anyone can enjoy a home filled with thriving houseplants.

Remember that even experienced plant owners lose plants sometimes. If a plant isn't doing well, try to identify what it needs, make adjustments, and apply what you learn to future plant care. Each challenge is an opportunity to become a better plant parent!
    `,
    publishedDate: '2023-09-18',
    readTimeMinutes: 6
  },
  {
    id: '4',
    title: 'Winter Plant Care: Keeping Plants Alive',
    slug: 'winter-plant-care',
    categoryId: 'seasonal-tips',
    excerpt: 'Essential tips for maintaining healthy houseplants during the cold winter months.',
    content: `
# Winter Plant Care: Keeping Plants Alive

As temperatures drop and daylight hours shorten, indoor plants face several challenges. Many houseplants are tropical species that struggle with the cold, dry conditions of winter homes. However, with some adjustments to your care routine, you can help your plants not just survive but continue to thrive through the winter months.

## Understanding Winter Plant Needs

Most houseplants enter a dormant or semi-dormant state during winter. This means:
- Slower growth or no growth at all
- Reduced need for water and nutrients
- Greater sensitivity to environmental stress
- Need for consistent care

## Light Considerations

### Decreased Natural Light

The biggest challenge for indoor plants in winter is reduced light. Days are shorter, and the sun's angle is lower, resulting in less intense sunlight.

**Solutions:**
- Move plants closer to windows
- Clean your windows to maximize light transmission
- Rotate plants regularly so all sides receive light
- Rearrange plants so that light-loving species get priority window positions

### Supplemental Lighting

For many plants, natural winter light isn't enough to maintain health.

**Options for supplemental lighting:**
- Full-spectrum LED grow lights
- Fluorescent lights (place plants within 12 inches)
- Smart grow bulbs in regular lamps
- Light timers to provide consistent day length (12-14 hours is ideal for most plants)

## Temperature Management

### Avoid Cold Drafts

Most houseplants are damaged by temperatures below 50°F (10°C) and can be killed by even brief exposure to freezing temperatures.

**Watch out for:**
- Plants touching cold windows
- Drafts from doors, windows, or air vents
- Sudden temperature fluctuations

**Protection methods:**
- Move plants away from cold windows at night
- Use bubble wrap as insulation between plants and cold surfaces
- Add thermal curtains to windows
- Consider temporary plant sleeves for extreme cold snaps

### Beware of Heat Sources

While cold can damage plants, placing them too close to heating vents, radiators, or fireplaces can be equally harmful.

**Problems caused by heating systems:**
- Excessive drying of soil and foliage
- Leaf burn or scorching
- Accelerated water loss

Maintain an ideal temperature range of 65-75°F (18-24°C) during the day and no lower than 55°F (13°C) at night for most tropical houseplants.

## Watering Adjustments

### Reduced Watering

The #1 winter houseplant killer is overwatering. Plants use less water in winter due to:
- Slower growth rates
- Reduced evaporation
- Shorter daylight hours

**Winter watering best practices:**
- Wait until the top 2 inches of soil are completely dry for most plants
- Water thoroughly but less frequently
- Use room temperature water to avoid shocking roots
- Water in the morning to allow excess moisture to evaporate during the day

### Checking Soil Moisture

Be especially vigilant about checking soil moisture before watering:
- Use a moisture meter for accuracy
- Insert your finger at least 2 inches into the soil
- Lift pots to feel their weight (dry pots are lighter)
- For larger pots, use a wooden chopstick - if it comes out clean, the soil is dry

## Humidity Solutions

Winter heating systems create desert-like conditions inside many homes, with humidity levels dropping below 30%. Most tropical plants prefer 40-60% humidity.

**Signs of low humidity:**
- Brown leaf tips and edges
- Curling leaves
- Crispy foliage
- Flower buds dropping

**Solutions for increasing humidity:**
- Group plants together to create a microclimate
- Use humidity trays (pebble trays with water)
- Run a humidifier near your plants
- Move plants to naturally humid rooms (bathrooms, kitchens)
- Create humidity tents for extremely sensitive plants

## Other Winter Care Tips

### Dust Removal
Dust blocks light and can harbor pests. Clean leaves monthly with a soft, damp cloth or give plants a gentle shower.

### Hold off on Fertilizing
Most plants don't need fertilizer during winter dormancy. Resume feeding in early spring when you notice new growth.

### Pest Vigilance
Winter stress can make plants more susceptible to pests. Inspect regularly for spider mites, scale, and mealybugs, which thrive in dry indoor conditions.

### Avoid Repotting
Wait until spring to repot plants, as they're more vulnerable to shock during dormancy.

## Special Winter Care for Specific Plant Types

### Succulents and Cacti
- Need the brightest possible location
- Water even less than usual (once every 4-6 weeks)
- Keep in cooler rooms if possible (55-60°F ideal)

### Tropical Foliage Plants
- May need supplemental lighting
- Benefit greatly from added humidity
- Keep away from cold drafts and heat sources

### Flowering Plants
- Require more light than foliage plants to bloom
- May not flower during winter regardless of care
- Some (like poinsettias, Christmas cacti) are winter bloomers with specific light/temperature needs

## Conclusion

Winter plant care requires attention and adjustments, but the effort is worthwhile. With proper care, your plants will survive the winter months and be ready to resume vibrant growth when spring returns. Remember that some leaf drop or slowed growth is normal during this time - focus on maintaining stable conditions and resist the urge to overwater or overfertilize in an attempt to force growth.
    `,
    publishedDate: '2023-12-05',
    readTimeMinutes: 8
  },
  {
    id: '5',
    title: 'Understanding Plant Nutrition',
    slug: 'understanding-plant-nutrition',
    categoryId: 'plant-care',
    excerpt: 'A comprehensive guide to understanding plant nutrients and proper fertilization techniques.',
    content: `
# Understanding Plant Nutrition

Just like humans, plants need a balanced diet to thrive. Understanding plant nutrition can dramatically improve your plants' health, growth, and resistance to pests and diseases. This guide breaks down the essential nutrients plants need and how to provide them effectively.

## The Essential Nutrients

Plants require 17 essential nutrients to complete their life cycle. These are divided into three categories:

### Primary Macronutrients
Plants need these in large quantities:

**Nitrogen (N)**
- Promotes leafy, vegetative growth
- Key component of chlorophyll and amino acids
- Deficiency shows as yellowing of older leaves
- Excess causes leggy growth with weak stems

**Phosphorus (P)**
- Essential for root development and flowering
- Important for energy transfer within the plant
- Deficiency shows as purple tinges on leaves and poor flowering
- Supports seed and fruit production

**Potassium (K)**
- Regulates water uptake and transpiration
- Strengthens cell walls and improves disease resistance
- Enhances flower and fruit quality
- Deficiency appears as scorched leaf margins and weak stems

### Secondary Macronutrients
Needed in moderate amounts:

**Calcium (Ca)**
- Essential for cell wall strength
- Helps plants absorb other nutrients
- Deficiency appears in new growth as distorted leaves

**Magnesium (Mg)**
- Central atom in chlorophyll molecules
- Essential for photosynthesis
- Deficiency shows as interveinal yellowing (yellow leaves with green veins)

**Sulfur (S)**
- Component of amino acids and proteins
- Contributes to chlorophyll production
- Deficiency appears as light green younger leaves

### Micronutrients
Needed in tiny amounts but still essential:

**Iron (Fe), Manganese (Mn), Zinc (Zn), Copper (Cu), Boron (B), Molybdenum (Mo), Chlorine (Cl)**
- Act as enzyme cofactors
- Essential for various metabolic processes
- Deficiencies can cause specific patterns of discoloration or malformation

Two non-mineral elements that plants also need:
- **Carbon (C)**: Obtained from air (CO₂)
- **Oxygen (O)**: Obtained from air and water
- **Hydrogen (H)**: Obtained from water

## Understanding Fertilizers

### NPK Ratings

Commercial fertilizers are labeled with three numbers representing the percentage by weight of:
- N (Nitrogen)
- P (Phosphorus)
- K (Potassium)

For example, a 10-5-5 fertilizer contains:
- 10% Nitrogen
- 5% Phosphorus
- 5% Potassium

### Types of Fertilizers

**Organic Fertilizers**
- Derived from plant or animal sources
- Release nutrients slowly as they break down
- Improve soil structure and microbiome
- Examples: compost, worm castings, fish emulsion, bone meal

**Synthetic/Chemical Fertilizers**
- Manufactured from chemical compounds
- Provide nutrients in readily available forms
- Fast-acting but can burn plants if over-applied
- Don't improve soil structure

**Slow-Release Fertilizers**
- Release nutrients gradually over weeks or months
- Reduce the risk of nutrient burn
- Often coated pellets or spikes
- Convenient for busy plant owners

**Liquid Fertilizers**
- Applied when watering
- Quickly available to plants
- Good for precise control of feeding
- Need to be applied more frequently

## When and How to Fertilize

### Timing

**Active Growth Season**
- Most houseplants benefit from fertilization during spring and summer
- Fertilize every 2-4 weeks during active growth
- Reduce or stop fertilizing in fall and winter when growth slows

**Plant Life Stage**
- Young plants need more nitrogen for leafy growth
- Flowering/fruiting plants need more phosphorus and potassium
- Mature plants need balanced nutrition for maintenance

### Application Methods

**For Houseplants**
1. Always apply fertilizer to moist soil (never to dry soil)
2. Dilute liquid fertilizers to half the recommended strength
3. Apply fertilizer to the soil, not the leaves
4. Water thoroughly after applying granular fertilizers
5. Flush the soil occasionally to prevent salt buildup

**For Outdoor Container Plants**
1. Apply slow-release fertilizers at the beginning of the growing season
2. Supplement with liquid fertilizer for heavy feeders
3. Monitor rainfall and adjust fertilization accordingly
4. Consider foliar feeding for quick nutrient uptake

## Common Fertilization Problems

### Nutrient Burn
- Caused by over-fertilization
- Symptoms include brown leaf tips and margins
- Treatment: Flush the soil with water and reduce fertilizer

### Nutrient Lockout
- When certain nutrients become unavailable due to pH issues
- Can occur even when nutrients are present
- Solution: Test and adjust soil pH

### Salt Buildup
- White crust on soil surface or pot edges
- Causes root stress and nutrient uptake issues
- Prevention: Regularly flush soil with water and allow to drain

## Special Considerations

### Plant-Specific Needs
- **Flowering plants** need more phosphorus when budding
- **Leafy plants** benefit from higher nitrogen
- **Succulents** need very little fertilizer overall
- **Acid-loving plants** (like gardenias) need special fertilizers

### Water Quality
- Hard water can raise soil pH over time
- Chlorinated water can affect soil microorganisms
- Consider using rainwater or filtered water for sensitive plants

### Seasonal Adjustments
- Reduce fertilizer strength and frequency by 50% in fall
- Stop fertilizing most plants in winter
- Resume gradually in early spring

## Sustainable Approaches

### Making Your Own Fertilizers
- Compost tea
- Worm castings
- Banana peel water
- Eggshell water (for calcium)

### Recycling Kitchen Waste
- Coffee grounds (acidic, good source of nitrogen)
- Crushed eggshells (calcium)
- Aquarium water (rich in nitrogen and beneficial microbes)

## Conclusion

Proper plant nutrition doesn't need to be complicated. By understanding the basic needs of your plants and providing appropriate fertilization, you'll create the foundation for healthy growth and vibrant plants. Remember that under-fertilizing is generally safer than over-fertilizing, and different plants have different nutritional needs throughout their life cycles.

Listen to your plants - they'll show signs when they need more or less of certain nutrients. With practice, you'll develop an intuition for your plants' feeding needs, resulting in a more beautiful and thriving indoor garden.
    `,
    publishedDate: '2024-01-10',
    readTimeMinutes: 8
  },
  {
    id: '6',
    title: 'Best Indoor Plants for Air Purification',
    slug: 'best-indoor-plants-air-purification',
    categoryId: 'indoor-plants',
    excerpt: 'Discover which houseplants are most effective at cleaning indoor air and improving your home environment.',
    content: `
# Best Indoor Plants for Air Purification

In the 1980s, NASA conducted the Clean Air Study to research ways to purify air in space stations. What they discovered was revolutionary: certain houseplants can remove toxins from the air, including formaldehyde, benzene, and trichloroethylene. Since then, additional research has confirmed the air-purifying benefits of many common houseplants.

## How Plants Clean the Air

Plants improve air quality through several mechanisms:

1. **Photosynthesis** - Plants absorb carbon dioxide and release oxygen
2. **Transpiration** - Plants release water vapor, increasing humidity and reducing airborne dust
3. **Phytoremediation** - Plants absorb toxins through their leaves and roots
4. **Microbiome effects** - Soil microorganisms help break down air pollutants

While no plant can completely purify indoor air on its own, strategic placement of several plants can significantly improve air quality and contribute to a healthier living environment.

## Top Air-Purifying Plants

### 1. Snake Plant (Sansevieria trifasciata)

**Toxins removed:** Formaldehyde, benzene, trichloroethylene, xylene, toluene
**Care level:** Very easy
**Light needs:** Adapts to low or bright indirect light
**Unique property:** One of the few plants that convert CO2 to oxygen at night

Snake plants are nearly indestructible and perfect for beginners. Their tall, architectural leaves make them ideal for corners and narrow spaces.

### 2. Peace Lily (Spathiphyllum)

**Toxins removed:** Formaldehyde, benzene, trichloroethylene, ammonia, xylene, toluene
**Care level:** Easy to moderate
**Light needs:** Low to medium indirect light
**Unique property:** One of the best plants for removing airborne alcohols

Peace lilies produce elegant white flowers and dramatically droop when they need water, making them easy to care for. Note that they are toxic to pets.

### 3. Boston Fern (Nephrolepis exaltata)

**Toxins removed:** Formaldehyde, xylene, toluene
**Care level:** Moderate
**Light needs:** Medium indirect light
**Unique property:** One of the most effective plants for removing formaldehyde

With their feathery fronds, Boston ferns add a lush, tropical feel while excelling at air purification. They prefer higher humidity environments like bathrooms.

### 4. Spider Plant (Chlorophytum comosum)

**Toxins removed:** Formaldehyde, xylene, toluene, carbon monoxide
**Care level:** Very easy
**Light needs:** Bright indirect light
**Unique property:** Safe for pets and produces baby plants that can be propagated

Spider plants are among the easiest plants to grow and maintain. They're especially effective at removing carbon monoxide and are safe for households with pets.

### 5. Rubber Plant (Ficus elastica)

**Toxins removed:** Formaldehyde, bacteria, mold spores
**Care level:** Easy
**Light needs:** Medium to bright indirect light
**Unique property:** Large leaves provide significant air-purifying surface area

Rubber plants have glossy, large leaves that are particularly efficient at air purification. As they grow (potentially up to 8 feet indoors), their air-cleaning capacity increases.

### 6. Dracaena

**Toxins removed:** Formaldehyde, benzene, trichloroethylene, xylene
**Care level:** Easy
**Light needs:** Medium indirect light
**Unique property:** Many varieties with different looks (Dracaena marginata, Dracaena fragrans, etc.)

Dracaenas come in many varieties, all excellent air purifiers. Their strap-like leaves and often colorful foliage make them decorative as well as functional.

### 7. Golden Pothos (Epipremnum aureum)

**Toxins removed:** Formaldehyde, benzene, carbon monoxide
**Care level:** Very easy
**Light needs:** Adapts to low or bright indirect light
**Unique property:** Continues to remove formaldehyde as exposure increases

Pothos is nearly impossible to kill and grows quickly, making it one of the most popular houseplants. It's especially effective against formaldehyde, which is found in many household products.

### 8. Bamboo Palm (Chamaedorea seifrizii)

**Toxins removed:** Formaldehyde, benzene, trichloroethylene
**Care level:** Moderate
**Light needs:** Medium indirect light
**Unique property:** Excellent humidifier

This compact palm thrives indoors and adds a tropical feel while effectively removing multiple toxins from the air. It also helps increase humidity levels.

## Maximizing Air Purification Benefits

### Placement Strategies

For optimal air purification:
- Place plants where you spend the most time (bedroom, living room, office)
- Use 1-2 medium to large plants per 100 square feet
- Position some plants near potential sources of pollutants (near electronics, furniture, etc.)
- Distribute plants throughout your space rather than grouping them all together

### Plant Care for Air Purification

To maximize your plants' air-cleaning abilities:
- Keep leaves dust-free by wiping with a damp cloth monthly
- Ensure adequate light for photosynthesis
- Maintain appropriate watering schedule
- Replace the top layer of soil annually

### Beyond Plants: Comprehensive Air Quality

While plants help, they work best as part of a comprehensive approach:
- Regular ventilation by opening windows
- Air purifiers with HEPA filters
- Reducing use of chemical cleaners
- Controlling humidity levels (40-60% ideal)
- Regular cleaning to remove dust and allergens

## Plants for Specific Concerns

### For Bedrooms
- Snake Plant (produces oxygen at night)
- Peace Lily (removes alcohols and acetone)
- Aloe Vera (emits oxygen at night)

### For High-VOC Areas (Near new furniture or after renovation)
- Rubber Plant
- Boston Fern
- Spider Plant

### For Kitchens
- English Ivy (removes airborne mold)
- Golden Pothos (handles variable conditions)
- Peace Lily (removes alcohols from cleaning products)

### For Offices
- Snake Plant (thrives with neglect)
- ZZ Plant (tolerates artificial light)
- Spider Plant (removes carbon monoxide and other printer/copier emissions)

## Conclusion

Incorporating air-purifying plants into your home is an easy, attractive way to improve indoor air quality. While no plant can completely replace good ventilation and air filtration systems, they provide a natural complement to other air quality measures.

The best approach is to include a variety of plants throughout your living spaces, focusing on those that thrive in your specific light conditions and match your care abilities. With proper placement and care, these green allies can help you breathe easier in your own home.
`,
    publishedDate: '2024-02-20',
    readTimeMinutes: 6
  }
];

/**
 * Get a list of articles by category ID
 */
export const getArticlesByCategory = (categoryId: string): Article[] => {
  return articles.filter(article => article.categoryId === categoryId);
};

/**
 * Get an article by its slug
 */
export const getArticleBySlug = (slug: string): Article | undefined => {
  return articles.find(article => article.slug === slug);
};

/**
 * Get featured articles (could be based on any criteria)
 */
export const getFeaturedArticles = (limit: number = 4): Article[] => {
  return articles.slice(0, limit);
};

/**
 * Get recent articles
 */
export const getRecentArticles = (limit: number = 5): Article[] => {
  // Sort by published date (newest first)
  return [...articles]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, limit);
};

/**
 * Search articles by title or content
 */
export const searchArticles = (query: string): Article[] => {
  const lowerCaseQuery = query.toLowerCase();
  return articles.filter(article => 
    article.title.toLowerCase().includes(lowerCaseQuery) || 
    article.content.toLowerCase().includes(lowerCaseQuery)
  );
};
export interface Area {
  slug: string;
  name: string;
  type: "city" | "county";
  county?: string;
  description: string;
  localNote?: string;
  population?: string;
}

export const areas: Area[] = [
  // Counties
  {
    slug: "atlantic-county",
    name: "Atlantic County",
    type: "county",
    description:
      "Atlantic County is home territory for Island Investors — we grew up here, work here, and understand what life looks like in these communities from the inside.",
    localNote:
      "We're not covering Atlantic County from the outside. This is where Island Investors is based, where the founder grew up, and where we've worked with homeowners through some of the most difficult situations imaginable. When you call us about an Atlantic County property, you're talking to someone who knows this county — the shore towns, the bay communities, the back roads, and everything in between.",
  },
  {
    slug: "cape-may-county",
    name: "Cape May County",
    type: "county",
    description:
      "Buying homes throughout Cape May County including Wildwood, Cape May, and Ocean City.",
  },
  {
    slug: "cumberland-county",
    name: "Cumberland County",
    type: "county",
    description:
      "Purchasing properties across Cumberland County including Vineland and Millville.",
  },
  {
    slug: "salem-county",
    name: "Salem County",
    type: "county",
    description:
      "We buy houses throughout Salem County, NJ with fast, fair cash offers.",
  },
  {
    slug: "gloucester-county",
    name: "Gloucester County",
    type: "county",
    description:
      "Serving Gloucester County homeowners from Glassboro to Woodbury.",
  },
  {
    slug: "camden-county",
    name: "Camden County",
    type: "county",
    description:
      "Buying homes throughout Camden County including Cherry Hill and Pennsauken.",
  },
  // Cities — Atlantic County
  {
    slug: "atlantic-city-nj",
    name: "Atlantic City",
    type: "city",
    county: "Atlantic County",
    description:
      "Atlantic City is where Island Investors is rooted — we know the neighborhoods, the blocks, and the people who've built lives here long past the tourist season.",
    localNote:
      "From Chelsea Heights to the North Inlet, from Ducktown to Bungalow Park — Atlantic City isn't just a location to us, it's where we grew up. It's home. When you call us about an Atlantic City property, you're talking to someone who's driven past it more times than they can count. We understand the market here, the history, and the complexity that comes with some of these properties. We approach every situation with the kind of care that comes from genuinely belonging to a place.",
  },
  {
    slug: "egg-harbor-township-nj",
    name: "Egg Harbor Township",
    type: "city",
    county: "Atlantic County",
    description:
      "EHT has changed a lot over the decades — we've watched it grow, and we've worked with families throughout the township long enough to understand what homes here actually mean to the people who own them.",
    localNote:
      "Egg Harbor Township stretches across a wide range of neighborhoods — from established communities off Fire Road to developments closer to the Expressway, to the quieter corners that still feel like the farmland this area used to be. We've worked with families across all of it. Whether you're dealing with an inherited property, a financial situation that's gotten difficult, or simply a house that's too much to manage right now — we start every conversation by asking what's actually best for you, not what's easiest for us.",
  },
  {
    slug: "galloway-nj",
    name: "Galloway",
    type: "city",
    county: "Atlantic County",
    description:
      "Galloway stretches from the Pinelands edge out toward the shore communities — we know the full range, from the quiet back roads to the neighborhoods along the main corridors.",
    localNote:
      "Galloway is one of those townships where the character changes as you move through it — from the preserved lands near Smithville to the busier corridors along Jimmie Leeds Road, to the neighborhoods that back up against protected wetlands. It's the kind of place where neighbors still know each other's names. When you're working through a property situation here, you deserve to talk with someone who understands what this community actually looks like — not someone reading from a script.",
  },
  {
    slug: "absecon-nj",
    name: "Absecon",
    type: "city",
    county: "Atlantic County",
    description:
      "Absecon sits at the gateway to the islands — a tight-knit community with deep roots. We work with Absecon homeowners the way neighbors do: honestly, and without rushing anyone toward a decision.",
    localNote:
      "Absecon is one of those communities where a lot of families have been around for generations — it's got a small-city character that gets overlooked because of what's right next door. We've helped homeowners in Absecon navigate everything from inherited properties to tax situations to houses that have simply become too much to manage alone. Every time, the conversation starts the same way: what's the right path forward for this person? Not for us.",
  },
  {
    slug: "pleasantville-nj",
    name: "Pleasantville",
    type: "city",
    county: "Atlantic County",
    description:
      "Pleasantville is a real community with a long history — we treat every conversation here with the patience and respect that longtime families deserve.",
    localNote:
      "Pleasantville isn't a suburb or a pass-through town — it's a place with its own identity, its own history, and a lot of families who have been part of it for a long time. We've worked with homeowners here through some genuinely difficult situations, and we've always tried to show up the same way: honest about the options, patient with the process, and clear that there's no pressure to do anything until it's right. If you're dealing with a property in Pleasantville, that's exactly what you'll get from us.",
  },
  {
    slug: "mays-landing-nj",
    name: "Mays Landing",
    type: "city",
    county: "Atlantic County",
    description:
      "Mays Landing has a character of its own — the river, the history, the county seat feel. We understand what makes this community different, and we come to every conversation prepared.",
    localNote:
      "There's something about Mays Landing that's easy to underestimate if you don't spend time here — the Great Egg Harbor River running through it, the old mill district, the quiet pace that comes with being the county seat without being a busy city. A lot of properties here carry real history. When we work with a homeowner in Mays Landing, we come prepared — we've done our homework on the local market, and we treat every conversation as the serious thing it is.",
  },
  {
    slug: "somers-point-nj",
    name: "Somers Point",
    type: "city",
    county: "Atlantic County",
    description:
      "Somers Point sits right where the mainland meets the bay — a year-round community that deserves real attention, not a generic pitch. We know the Point well.",
    localNote:
      "Somers Point has a whole-year identity that doesn't always get recognized alongside the shore towns it borders. From Shore Road along the bay to the neighborhoods north of the Causeway, there's a permanence here — people who live here by choice, not just by proximity to the beach. We've worked with homeowners throughout the Point and understand both the local market and what these properties mean to the families who've kept them.",
  },
  {
    slug: "linwood-nj",
    name: "Linwood",
    type: "city",
    county: "Atlantic County",
    description:
      "Linwood is where people put down serious roots — settled neighborhoods, longtime families. We work here with that kind of care and patience.",
    localNote:
      "Linwood has the feel of a community that people chose deliberately and stayed in. The neighborhoods are established, the families tend to be multigenerational, and properties here often carry a lot of personal history. When a homeowner in Linwood reaches out to us, we understand that's not a casual decision — and we respond accordingly. Careful, honest, no pressure.",
  },
  {
    slug: "northfield-nj",
    name: "Northfield",
    type: "city",
    county: "Atlantic County",
    description:
      "Northfield is a working community with strong roots — we help homeowners here through difficult situations with honesty and no pressure.",
    localNote:
      "Northfield doesn't make a lot of noise, and neither do we. It's a city where people have built genuine lives — working families, established neighborhoods, properties that have been in the same hands for a long time. We've helped homeowners here work through situations that weren't easy, and we always start with the same question: what actually makes sense for this person? If the answer isn't selling, we'll say so.",
  },
  {
    slug: "ventnor-nj",
    name: "Ventnor",
    type: "city",
    county: "Atlantic County",
    description:
      "Ventnor has its own year-round identity — surf culture, local businesses, families who stay through every season. We understand what homes here mean to the people who've built lives in them.",
    localNote:
      "Ventnor City sits between Margate and Atlantic City but has always had its own character — a more grounded shore-town feel, a local business community, and a population that's genuinely year-round. People here belong to Ventnor; they didn't just end up here. When we work with a homeowner in Ventnor, that's the kind of relationship we're thinking about — not a transaction, but a conversation between people who understand what this community actually means.",
  },
  {
    slug: "margate-nj",
    name: "Margate City",
    type: "city",
    county: "Atlantic County",
    description:
      "Margate is a shore town people belong to — from Lucy the Elephant to the quiet streets back from the water. We approach every conversation here with the respect that deserves.",
    localNote:
      "Margate City is one of those places that gets into people. It's not just a summer destination — it's a community with a century of character behind it, from the Victorian architecture to the families that have owned the same properties for three generations. When a homeowner here reaches out to us, we understand the weight of that. We don't show up trying to move fast. We show up trying to understand the situation and help figure out what's actually right.",
  },
  {
    slug: "brigantine-nj",
    name: "Brigantine",
    type: "city",
    county: "Atlantic County",
    description:
      "Brigantine has its own quiet character — a mix of year-rounders and families who've held properties here for generations. We understand the island rhythms and treat every homeowner accordingly.",
    localNote:
      "Just across the inlet from Atlantic City, Brigantine has always maintained its own distinct identity — quieter, more residential, a community of people who've chosen this island for the long term. A lot of properties here have been in families for decades. When that kind of history is involved, the conversation about what to do with a property deserves real care. We bring that care every time.",
  },
  {
    slug: "longport-nj",
    name: "Longport",
    type: "city",
    county: "Atlantic County",
    description:
      "Longport sits at the southern tip of Absecon Island — a small, close-knit borough where many families have held properties for generations. We know this community and treat every conversation with the care that history deserves.",
    localNote:
      "Longport is the quietest end of the island — a borough where people know each other, properties stay in families for decades, and the community moves at its own pace. When a homeowner here reaches out to us, we understand that's a significant decision. We come in calm, honest, and ready to listen — not ready to pitch.",
  },
  {
    slug: "hammonton-nj",
    name: "Hammonton",
    type: "city",
    county: "Atlantic County",
    description:
      "Hammonton has a proud identity — agricultural roots, a strong community, a town that knows itself. We come to every conversation here prepared, honest, and without shortcuts.",
    localNote:
      "Hammonton is the blueberry capital of the world, but anyone who's spent real time here knows it's got an identity that runs a lot deeper than that. The Italian-American community has strong roots and strong values — and they can tell the difference between someone genuine and someone just running through the motions. When we sit down with a homeowner in Hammonton, we come prepared, we come honest, and we come ready to have a real conversation about what's best for them.",
  },
  // Cities — Cape May County
  {
    slug: "wildwood-nj",
    name: "Wildwood",
    type: "city",
    county: "Cape May County",
    description:
      "Sell your Wildwood NJ home fast for cash — shore properties welcome.",
  },
  {
    slug: "cape-may-nj",
    name: "Cape May",
    type: "city",
    county: "Cape May County",
    description:
      "We buy historic Cape May homes for cash, any condition or situation.",
  },
  {
    slug: "ocean-city-nj",
    name: "Ocean City",
    type: "city",
    county: "Cape May County",
    description:
      "Cash home buyers in Ocean City NJ. Sell without repairs or hassle.",
  },
  // Cities — Cumberland County
  {
    slug: "vineland-nj",
    name: "Vineland",
    type: "city",
    county: "Cumberland County",
    description:
      "We buy Vineland NJ homes for cash — fast, fair, and stress-free.",
  },
  {
    slug: "millville-nj",
    name: "Millville",
    type: "city",
    county: "Cumberland County",
    description:
      "Sell your Millville NJ home quickly for cash. No fees, no repairs.",
  },
  {
    slug: "bridgeton-nj",
    name: "Bridgeton",
    type: "city",
    county: "Cumberland County",
    description:
      "Island Investors buys homes in Bridgeton NJ — any condition welcome.",
  },
  // Cities — Camden County
  {
    slug: "cherry-hill-nj",
    name: "Cherry Hill",
    type: "city",
    county: "Camden County",
    description:
      "Sell your Cherry Hill NJ home for cash — quick closing, fair offer.",
  },
  {
    slug: "haddonfield-nj",
    name: "Haddonfield",
    type: "city",
    county: "Camden County",
    description:
      "We buy Haddonfield NJ homes for cash, no matter the situation.",
  },
  // Cities — Gloucester County
  {
    slug: "glassboro-nj",
    name: "Glassboro",
    type: "city",
    county: "Gloucester County",
    description:
      "Fast cash home sales in Glassboro NJ. Get your offer in 24 hours.",
  },
  {
    slug: "woodbury-nj",
    name: "Woodbury",
    type: "city",
    county: "Gloucester County",
    description:
      "We buy houses in Woodbury NJ fast — inherited, vacant, or distressed.",
  },
  // Burlington County
  {
    slug: "mount-holly-nj",
    name: "Mount Holly",
    type: "city",
    county: "Burlington County",
    description:
      "Cash buyers for Mount Holly NJ homes — close in as few as 7 days.",
  },
  {
    slug: "manahawkin-nj",
    name: "Manahawkin",
    type: "city",
    county: "Burlington County",
    description:
      "Sell your Manahawkin NJ home for cash. Island Investors makes it simple.",
  },
  {
    slug: "toms-river-nj",
    name: "Toms River",
    type: "city",
    county: "Ocean County",
    description:
      "We buy houses in Toms River NJ — any size, any condition, fast close.",
  },
];

export function getAreaBySlug(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}

export function getCounties(): Area[] {
  return areas.filter((a) => a.type === "county");
}

export function getCities(): Area[] {
  return areas.filter((a) => a.type === "city");
}

export function getCitiesByCounty(county: string): Area[] {
  return areas.filter((a) => a.type === "city" && a.county === county);
}

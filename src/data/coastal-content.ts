/*
 * Editorial records for the South Pelion expansion keep geometry in explicit
 * merge slots so measured route artifacts can be attached at the content boundary.
 */

const image = (alt: { el: string; en: string }) => ({
  src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pelion%2C_Pagassitikos_Gulf_and_coastline._Photo_taken_from_Lafkos_village.jpg',
  alt: alt.el,
  credit: 'Ioannis Fakis via Wikimedia Commons',
  license: 'CC BY-SA 4.0',
});

const osm = (lng: number, lat: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
const placeSource = (lng: number, lat: number) => [
  { label: 'OpenStreetMap map reference', url: osm(lng, lat) },
  {
    label: 'Lafkos Guide editorial field brief',
    url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/',
  },
];
const mergeGeometry = (_key: string) => undefined;
const mergeMetrics = (_key: string) => ({});

export const coastalEditorialContent = {
  generatedFor: 'lafkos-route-expansion-agent-c',
  isSeed: true,
  places: [
    {
      kind: 'place',
      entityKey: 'argalasti',
      category: 'community',
      isSeed: true,
      slug: { el: 'argalasti', en: 'argalasti' },
      title: { el: 'Αργαλαστή', en: 'Argalasti' },
      eyebrow: { el: 'Έδρα του Νοτίου Πηλίου', en: 'Seat of South Pelion' },
      summary: {
        el: 'Κεντρικός οικισμός και συγκοινωνιακός κόμβος για τις διαδρομές του Νοτίου Πηλίου.',
        en: 'The administrative and road hub for South Pelion routes.',
      },
      body: {
        el: [
          'Η Αργαλαστή λειτουργεί ως βασικός κόμβος για τις διαδρομές προς τον Παγασητικό και το Αιγαίο. Η εκκλησία των Αγίων Αποστόλων, του 1886, αποτελεί χαρακτηριστικό σημείο του οικισμού.',
        ],
        en: [
          'Argalasti is the main hub for routes toward both the Pagasetic Gulf and the Aegean. The Church of the Holy Apostles, dated 1886, is one of the settlement’s landmarks.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.219448, 39.22599] },
      mapAnchor: [23.219448, 39.22599],
      images: [
        image({
          el: 'Οικισμός και τοπίο της Αργαλαστής στο Νότιο Πήλιο',
          en: 'Argalasti settlement and landscape in South Pelion',
        }),
      ],
      practical: {
        el: ['Χρήσιμος κόμβος ανεφοδιασμού πριν από τις παράκτιες διαδρομές.'],
        en: ['A useful resupply stop before coastal routes.'],
      },
      sources: placeSource(23.219448, 39.22599),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'promyri',
      category: 'community',
      isSeed: true,
      slug: { el: 'promyri', en: 'promyri' },
      title: { el: 'Προμύρι', en: 'Promyri' },
      eyebrow: { el: 'Ιστορικός ορεινός οικισμός', en: 'Historic mountain village' },
      summary: {
        el: 'Παλιό χωριό του Νοτίου Πηλίου και αφετηρία για τις διαδρομές προς Λύρη και Κατηγιώργη.',
        en: 'An old South Pelion village and trailhead for routes toward Lyri and Katigiorgis.',
      },
      body: {
        el: [
          'Το Προμύρι διατηρεί τον χαρακτήρα παλιού χωριού και συνδέεται με τη διαδρομή προς τη Λύρη και τον Κατηγιώργη. Ο ναός της Κοίμησης της Θεοτόκου χρονολογείται στο 1760.',
        ],
        en: [
          'Promyri retains the character of an old village and is linked to the walk toward Lyri and Katigiorgis. Its Church of the Dormition is dated to 1760.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.286432, 39.190309] },
      mapAnchor: [23.286432, 39.190309],
      images: [
        image({ el: 'Πέτρινη αρχιτεκτονική στο Προμύρι', en: 'Stone architecture in Promyri' }),
      ],
      practical: {
        el: ['Σημείο στάσης πριν από την ανατολική ακτή.'],
        en: ['A useful stop before the eastern coast.'],
      },
      sources: placeSource(23.286432, 39.190309),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'chorto',
      category: 'community',
      isSeed: true,
      slug: { el: 'chorto', en: 'chorto' },
      title: { el: 'Χόρτο', en: 'Chorto' },
      eyebrow: { el: 'Παραθαλάσσιος οικισμός', en: 'Coastal village' },
      summary: {
        el: 'Ήσυχος οικισμός με ελαιώνες, ακτή και θερινό υπαίθριο θέατρο.',
        en: 'A quiet coastal settlement with olive groves, shore access, and a summer open-air theatre.',
      },
      body: {
        el: [
          'Το Χόρτο απλώνεται ανάμεσα στους ελαιώνες και τον Παγασητικό. Το υπαίθριο θέατρο φιλοξενεί καλοκαιρινές παραστάσεις και δίνει στον οικισμό ιδιαίτερο πολιτιστικό ρυθμό.',
        ],
        en: [
          'Chorto lies between olive groves and the Pagasetic Gulf. Its open-air theatre hosts summer performances and gives the settlement a distinct cultural rhythm.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.217915, 39.190758] },
      mapAnchor: [23.217915, 39.190758],
      images: [
        image({ el: 'Η ακτή και οι ελαιώνες του Χόρτου', en: 'Chorto shore and olive groves' }),
      ],
      practical: {
        el: ['Συνδυάζεται με στάσεις στην ακτή Χόρτου και τη Μηλίνα.'],
        en: ['Combine with stops along the Chorto and Milina coast.'],
      },
      sources: placeSource(23.217915, 39.190758),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'xynovrysi',
      category: 'community',
      isSeed: true,
      slug: { el: 'xinovrysi', en: 'xynovrysi' },
      title: { el: 'Ξινόβρυση', en: 'Xynovrysi' },
      eyebrow: { el: 'Ορεινό χωριό πάνω από την ακτή', en: 'Hill village above the coast' },
      summary: {
        el: 'Χωριό σε υψόμετρο περίπου 232 μ., γνωστό για την όξινη πηγή από την οποία πήρε το όνομά του.',
        en: 'A village at about 232 m, named for its sour spring.',
      },
      body: {
        el: [
          'Η Ξινόβρυση βρίσκεται πάνω από τον δρόμο προς τα Ποτιστικά και αποτελεί φυσικό ενδιάμεσο σημείο της παράκτιας εξόρμησης.',
        ],
        en: [
          'Xynovrysi sits above the road to Potistika and is a natural intermediate stop on a coastal outing.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.260532, 39.249229] },
      mapAnchor: [23.260532, 39.249229],
      images: [image({ el: 'Τοπίο γύρω από την Ξινόβρυση', en: 'Landscape around Xynovrysi' })],
      practical: {
        el: ['Πέρασμα προς Ποτιστικά και Πάλτση.'],
        en: ['A route junction for Potistika and Paltsi.'],
      },
      sources: [
        ...placeSource(23.260532, 39.249229),
        {
          label: 'Topoguide: Ξινόβρυση–Ποτιστικά',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/Pelion_Xynovrysi_Potistika.php',
        },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'kallithea',
      category: 'community',
      isSeed: true,
      verification: {
        coordinates: 'needs-verification',
        note: 'Plan marks this coordinate as unverified.',
      },
      slug: { el: 'kallithea', en: 'kallithea' },
      title: { el: 'Καλλιθέα', en: 'Kallithea' },
      eyebrow: {
        el: 'Ενδιάμεσος οικισμός στον δρόμο της ακτής',
        en: 'Intermediate hamlet on the coastal road',
      },
      summary: {
        el: 'Μικρός οικισμός περίπου στα 326 μ. πάνω στον δρόμο προς Ποτιστικά και Πάλτση.',
        en: 'A small hamlet at about 326 m on the road to Potistika and Paltsi.',
      },
      body: {
        el: [
          'Η Καλλιθέα λειτουργεί ως ενδιάμεσο πέρασμα στις οδικές διαδρομές προς τις βόρειες παραλίες. Οι συντεταγμένες της χρειάζονται επιτόπια ή χαρτογραφική επαλήθευση πριν από τη δημοσίευση.',
        ],
        en: [
          'Kallithea is an intermediate stop on drives to the northern beaches. Its coordinates require field or map verification before publication.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.2498, 39.2392] },
      mapAnchor: [23.2498, 39.2392],
      images: [
        image({
          el: 'Τοπίο στον δρόμο προς την Καλλιθέα',
          en: 'Landscape on the road to Kallithea',
        }),
      ],
      practical: {
        el: ['Να επιβεβαιωθεί η θέση πριν χρησιμοποιηθεί ως οδηγός στροφής.'],
        en: ['Verify the position before using it as a turn-by-turn landmark.'],
      },
      sources: placeSource(23.2498, 39.2392),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'metochi',
      category: 'community',
      isSeed: true,
      slug: { el: 'metochi', en: 'metochi' },
      title: { el: 'Μέτοχι', en: 'Metochi' },
      eyebrow: { el: 'Ενδιάμεσο πέρασμα', en: 'Intermediate stop' },
      summary: {
        el: 'Σημείο του δρόμου ανάμεσα στην Αργαλαστή, το Χόρτο και τη Μηλίνα.',
        en: 'A road stop between Argalasti, Chorto, and Milina.',
      },
      body: {
        el: [
          'Το Μέτοχι εμφανίζεται ως ενδιάμεσο σημείο στις διαδρομές προς την ακτή του Παγασητικού και βοηθά στην ανάγνωση της μετάβασης από το ορεινό τοπίο προς τη θάλασσα.',
        ],
        en: [
          'Metochi is an intermediate point on routes toward the Pagasetic coast, marking the transition from mountain landscape to shore.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.221458, 39.207669] },
      mapAnchor: [23.221458, 39.207669],
      images: [
        image({ el: 'Πηλιορείτικο τοπίο κοντά στο Μέτοχι', en: 'Pelion landscape near Metochi' }),
      ],
      practical: {
        el: ['Χρησιμοποιείται ως κοινό waypoint στις οδικές διαδρομές.'],
        en: ['Used as a shared waypoint on the drive routes.'],
      },
      sources: placeSource(23.221458, 39.207669),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'platanias',
      category: 'community',
      isSeed: true,
      slug: { el: 'platanias', en: 'platanias' },
      title: { el: 'Πλατανιάς', en: 'Platanias' },
      eyebrow: { el: 'Ψαρολίμανο στο Αιγαίο', en: 'Aegean fishing harbour' },
      summary: {
        el: 'Παραθαλάσσιος οικισμός και αφετηρία του τεκμηριωμένου παράκτιου πεζόδρομου προς το Μικρό.',
        en: 'A coastal settlement and the trailhead for the documented boardwalk to Mikro.',
      },
      body: {
        el: [
          'Ο Πλατανιάς είναι το σημείο όπου η σύντομη παράκτια διαδρομή προς το Μικρό ξεκινά από τον λιμένα. Το μονοπάτι ακολουθεί την ακτή και φτάνει στην παραλία σε περίπου 10–15 λεπτά.',
        ],
        en: [
          'Platanias is the harbour-side start of the short coastal walk to Mikro. The path follows the shore and reaches the beach in about 10–15 minutes.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.27441, 39.141015] },
      mapAnchor: [23.27441, 39.141015],
      images: [image({ el: 'Το λιμανάκι του Πλατανιά', en: 'Platanias fishing harbour' })],
      practical: {
        el: ['Αφετηρία για τον παράκτιο πεζόδρομο προς Μικρό.'],
        en: ['Trailhead for the coastal boardwalk to Mikro.'],
      },
      sources: [
        ...placeSource(23.27441, 39.141015),
        {
          label: 'ilovepelion — Μικρό',
          url: 'https://ilovepelion.gr/el/destinations/aegeanbeach/mikro',
        },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'katigiorgis',
      category: 'community',
      isSeed: true,
      slug: { el: 'katigiorgis', en: 'katigiorgis' },
      title: { el: 'Κατηγιώργης', en: 'Katigiorgis' },
      eyebrow: { el: 'Ψαροχώρι απέναντι από τη Σκιάθο', en: 'Fishing hamlet facing Skiathos' },
      summary: {
        el: 'Μικρός αλιευτικός οικισμός στο ανατολικό άκρο του Πηλίου.',
        en: 'A small fishing hamlet at Pelion’s eastern edge.',
      },
      body: {
        el: [
          'Ο Κατηγιώργης είναι ο προορισμός της σηματοδοτημένης πεζοπορίας από τη Λύρη, με θέα προς τη Σκιάθο.',
        ],
        en: [
          'Katigiorgis is the endpoint of the waymarked walk from Lyri, with views toward Skiathos.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.342562, 39.172868] },
      mapAnchor: [23.342562, 39.172868],
      images: [image({ el: 'Η ακτή του Κατηγιώργη', en: 'Katigiorgis coast' })],
      practical: {
        el: ['Τελικό σημείο της διαδρομής Λύρη–Κατηγιώργης.'],
        en: ['Endpoint of the Lyri–Katigiorgis walk.'],
      },
      sources: [
        ...placeSource(23.342562, 39.172868),
        {
          label: 'Topoguide South Pelion routes',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/',
        },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'milina',
      category: 'community',
      isSeed: true,
      slug: { el: 'milina', en: 'milina' },
      title: { el: 'Μηλίνα', en: 'Milina' },
      eyebrow: { el: 'Ψαροχώρι στον Παγασητικό', en: 'Pagasetic fishing village' },
      summary: {
        el: 'Παραθαλάσσιος οικισμός γνωστός για το ήρεμο μέτωπο και τα ηλιοβασιλέματα.',
        en: 'A coastal village known for its calm waterfront and sunsets.',
      },
      body: {
        el: [
          'Η Μηλίνα αποτελεί κοινό σημείο στις διαδρομές της δυτικής ακτής. Η άγκυρα του χάρτη βρίσκεται στο παραλιακό μέτωπο, στο ίδιο σημείο με τον καθιερωμένο τερματισμό του καλντεριμιού Λαύκος–Μηλίνα.',
        ],
        en: [
          'Milina is a shared stop on the western-coast routes. Its map anchor is on the waterfront, at the established finish of the Lafkos–Milina kalderimi.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.22064, 39.17136] },
      mapAnchor: [23.22064, 39.17136],
      images: [image({ el: 'Το παραθαλάσσιο μέτωπο της Μηλίνας', en: 'Milina waterfront' })],
      practical: {
        el: ['Το ιστορικό καλντερίμι από τον Λαύκο τερματίζει στο ίδιο παραλιακό σημείο.'],
        en: ['The historic kalderimi from Lafkos finishes at this same waterfront point.'],
      },
      sources: placeSource(23.22064, 39.17136),
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'chondri-ammos',
      category: 'nature',
      isSeed: true,
      slug: { el: 'xondri-ammos', en: 'chondri-ammos' },
      title: { el: 'Χονδρή Άμμος', en: 'Chondri Ammos' },
      eyebrow: { el: 'Άγρια παραλία του Αιγαίου', en: 'Wild Aegean beach' },
      summary: {
        el: 'Απόμερη παραλία κοντά στη θέση της αρχαίας Ολιζώνας, προσβάσιμη από δρόμο και σύντομο περπάτημα.',
        en: 'A secluded beach near ancient Olizon, reached by road and a short walk.',
      },
      body: {
        el: [
          'Η Χονδρή Άμμος βρίσκεται στην ανατολική ακτή και συνδέεται με την αρχαία Ολιζώνα και τον Φιλοκτήτη. Ο δρόμος σταματά περίπου 158 μ. πριν από την ακτή, οπότε η τελευταία προσέγγιση γίνεται με τα πόδια. Η υπάρχουσα πεζοπορία από τον Λαύκο είναι σηματοδοτημένη με κόκκινες ενδείξεις και δεν έχει νερό στη διαδρομή.',
        ],
        en: [
          'Chondri Ammos lies on the east coast near ancient Olizon and the Philoctetes tradition. The road ends about 158 m from the shore, so the final approach is on foot. The existing hike from Lafkos uses red markings and has no water en route.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.222307, 39.131886] },
      mapAnchor: [23.222307, 39.131886],
      images: [image({ el: 'Η ακτή της Χονδρής Άμμου', en: 'Chondri Ammos shore' })],
      practical: {
        el: [
          'Υπολογίστε σύντομο περπάτημα από το τέλος του δρόμου.',
          'Πάρτε νερό· δεν υπάρχει ανεφοδιασμός στη διαδρομή.',
        ],
        en: [
          'Allow for a short walk from the road end.',
          'Carry water; there is no resupply on the route.',
        ],
      },
      sources: [
        {
          label: 'Topoguide: Λαύκος–Χονδρή Άμμος',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/Pelion_Lafkos_Chondri_Ammos.php',
        },
        ...placeSource(23.222307, 39.131886),
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'vathia-spilia',
      category: 'nature',
      isSeed: true,
      slug: { el: 'vathia-spilia', en: 'vathia-spilia' },
      title: { el: 'Βαθιά Σπηλιά', en: 'Vathia Spilia' },
      eyebrow: { el: 'Προφυλαγμένος όρμος', en: 'Sheltered cove' },
      summary: {
        el: 'Προφυλαγμένος όρμος στον δρόμο Χόρτο–Μηλίνα, κάτω από σπηλιά που δίνει το όνομά του στον τόπο.',
        en: 'A sheltered cove on the Chorto–Milina road, named for the cave above it.',
      },
      body: {
        el: [
          'Η Βαθιά Σπηλιά είναι ήρεμος, προστατευμένος όρμος. Η τοπική παράδοση συνδέει τη σπηλιά με τον Κένταυρο Χείρωνα και με αφήγηση άφιξης των Αργοναυτών· παρουσιάζονται ως παραδόσεις, όχι ως αρχαιολογικά τεκμήρια.',
        ],
        en: [
          'Vathia Spilia is a calm, sheltered cove. Local tradition associates the cave with the centaur Chiron and an Argonaut landfall; these are presented as traditions, not archaeological evidence.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.222669, 39.180778] },
      mapAnchor: [23.222669, 39.180778],
      images: [
        image({
          el: 'Ο προφυλαγμένος όρμος της Βαθιάς Σπηλιάς',
          en: 'Sheltered Vathia Spilia cove',
        }),
      ],
      practical: {
        el: ['Η τελευταία πρόσβαση περιλαμβάνει περίπου 184 μ. πεζοπορίας.'],
        en: ['The final approach includes about 184 m on foot.'],
      },
      sources: [
        { label: 'OpenStreetMap map reference', url: osm(23.222669, 39.180778) },
        { label: 'ilovepelion destinations', url: 'https://ilovepelion.gr/el/destinations' },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'olive-bay-chorto',
      category: 'nature',
      isSeed: true,
      slug: { el: 'olive-bay-chorto', en: 'olive-bay-chorto' },
      title: { el: 'Olive Bay (Χόρτο)', en: 'Olive Bay (Χόρτο)' },
      eyebrow: { el: 'Άτυπη αγγλική ονομασία στον χάρτη', en: 'Informal English map name' },
      summary: {
        el: 'Μικρός παράκτιος προορισμός κοντά στο Χόρτο, γνωστός εδώ με την άτυπη αγγλική ονομασία Olive Bay.',
        en: 'A small coastal destination near Chorto, referred to here by the informal English name Olive Bay.',
      },
      body: {
        el: [
          'Το Olive Bay είναι άτυπη αγγλική ονομασία που εμφανίζεται σε χάρτες και δεν έχει επιβεβαιωμένο ελληνικό τοπωνύμιο στις πηγές μας. Δεν επινοούμε ελληνική απόδοση· χρησιμοποιούμε το “Olive Bay (Χόρτο)” ως πρακτική ετικέτα χάρτη.',
        ],
        en: [
          'Olive Bay is an informal English/map name and no Greek toponym is confirmed in our sources. We do not invent a Greek name; “Olive Bay (Chorto)” is used as a practical map label.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.219404, 39.185741] },
      mapAnchor: [23.219404, 39.185741],
      images: [
        image({ el: 'Ακτή με ελαιώνες κοντά στο Χόρτο', en: 'Olive-fringed shore near Chorto' }),
      ],
      practical: {
        el: ['Η θέση απέχει περίπου 48 μ. από τον ασφαλτόδρομο.'],
        en: ['The position is about 48 m from the paved road.'],
      },
      sources: [
        {
          label: 'OpenStreetMap way 299012994',
          url: 'https://www.openstreetmap.org/way/299012994',
        },
        ...placeSource(23.219404, 39.185741),
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'marathias',
      category: 'nature',
      isSeed: true,
      slug: { el: 'marathias', en: 'marathias' },
      title: { el: 'Μαραθιάς', en: 'Marathias' },
      eyebrow: { el: 'Παραλία στον όρμο Λιμνιώνα', en: 'Beach in Limniona Bay' },
      summary: {
        el: 'Περίπου 200 μ. βοτσαλωτή παραλία σε βορειοδυτικό όρμο, με μία ταβέρνα και μικρό μόνιμο οικισμό.',
        en: 'A roughly 200 m pebble beach in a northwest-facing bay, with one taverna and a small permanent settlement.',
      },
      body: {
        el: [
          'Ο Μαραθιάς είναι ήσυχος προορισμός στον όρμο Λιμνιώνα. Ο οικισμός καταγράφηκε ως ξεχωριστός το 1981 και συνδέεται ιστορικά με τον παλιό δήμο Λαύκου.',
        ],
        en: [
          'Marathias is a quiet destination in Limniona Bay. The settlement was registered separately in 1981 and has a historical link to the former municipality of Lafkos.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.17855, 39.128184] },
      mapAnchor: [23.17855, 39.128184],
      images: [
        image({
          el: 'Η παραλία του Μαραθιά στον όρμο Λιμνιώνα',
          en: 'Marathias beach in Limniona Bay',
        }),
      ],
      practical: {
        el: ['Η σηματοδοτημένη στροφή μπορεί να περάσει απαρατήρητη.'],
        en: ['The signed turn-off can be easy to miss.'],
      },
      sources: [
        { label: 'OpenStreetMap map reference', url: osm(23.17855, 39.128184) },
        {
          label: 'Topoguide South Pelion routes',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/',
        },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'lyri',
      category: 'nature',
      isSeed: true,
      slug: { el: 'lyri', en: 'lyri' },
      title: { el: 'Λύρη', en: 'Lyri' },
      eyebrow: { el: 'Ανατολικό άκρο του Πηλίου', en: 'Pelion’s eastern tip' },
      summary: {
        el: 'Απόμερη ακτή με θέα προς τη Σκιάθο και αφετηρία της σηματοδοτημένης πορείας προς Κατηγιώργη.',
        en: 'A remote coast with views to Skiathos and a trail connection to Katigiorgis.',
      },
      body: {
        el: [
          'Η Λύρη είναι το ανατολικότερο άκρο του Πηλίου. Η σηματοδοτημένη πορεία Προμύρι–Λύρη–Κατηγιώργης περνά από την αποκατεστημένη πέτρινη πηγή Σαρδέλη. Δεν επαναλαμβάνεται ο μη τεκμηριωμένος ισχυρισμός για ναό της Ήρας.',
        ],
        en: [
          'Lyri is Pelion’s easternmost tip. The waymarked Promyri–Lyri–Katigiorgis walk passes the restored Sardeli stone spring. The unsupported Temple of Hera claim is deliberately omitted.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.337493, 39.202139] },
      mapAnchor: [23.337493, 39.202139],
      images: [image({ el: 'Η ανατολική ακτή στη Λύρη', en: 'Eastern coast at Lyri' })],
      practical: {
        el: [
          'Η πρόσβαση περιλαμβάνει χωμάτινο service track· η τελική προσέγγιση απέχει περίπου 78 μ.',
        ],
        en: ['Access includes a gravel service track; the final approach is about 78 m away.'],
      },
      sources: [
        { label: 'OpenStreetMap map reference', url: osm(23.337493, 39.202139) },
        {
          label: 'Topoguide South Pelion routes',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/',
        },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'mourtiass',
      category: 'nature',
      isSeed: true,
      verification: {
        accessSurface: 'needs-verification',
        note: 'Final approach surface is unconfirmed in the plan.',
      },
      slug: { el: 'mourtiass', en: 'mourtiass' },
      title: { el: 'Μουρτιάς', en: 'Mourtias' },
      eyebrow: { el: 'Άγρια ακτή και θαλάσσιες σπηλιές', en: 'Wild coast and sea caves' },
      summary: {
        el: 'Απόμερη ακτή με κοκκινωπούς κατακόρυφους βράχους και μικρές θαλάσσιες σπηλιές.',
        en: 'A remote coast with reddish vertical rocks and small sea caves.',
      },
      body: {
        el: [
          'Ο Μουρτιάς, γνωστός και ως Λούμπαρδα σε τοπικές αναφορές, είναι ανοργάνωτος και προσφέρεται για κολύμβηση με μάσκα όταν οι συνθήκες είναι ήρεμες. Η επιφάνεια της τελικής προσέγγισης δεν έχει επιβεβαιωθεί.',
        ],
        en: [
          'Mourtias, also referred to as Loumbarda in local descriptions, is unorganised and can suit snorkelling in calm conditions. The final approach surface has not been verified.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.333222, 39.209917] },
      mapAnchor: [23.333222, 39.209917],
      images: [image({ el: 'Οι κοκκινωποί βράχοι στον Μουρτιά', en: 'Reddish rocks at Mourtias' })],
      practical: {
        el: [
          'Επιβεβαιώστε την κατάσταση του τελικού δρόμου πριν οδηγήσετε.',
          'Δεν υπάρχει οργανωμένη υποδομή.',
        ],
        en: ['Verify the final road surface before driving.', 'There are no organised facilities.'],
      },
      sources: [
        { label: 'OpenStreetMap map reference', url: osm(23.333222, 39.209917) },
        { label: 'South Pelion destination index', url: 'https://ilovepelion.gr/el/destinations' },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'paltsi',
      category: 'nature',
      isSeed: true,
      slug: { el: 'paltsi', en: 'paltsi' },
      title: { el: 'Πάλτση', en: 'Paltsi' },
      eyebrow: {
        el: 'Αμμώδεις όρμοι προστατευμένοι από βόρειους ανέμους',
        en: 'Sandy coves sheltered from northerly winds',
      },
      summary: {
        el: 'Δύο χρυσαφένιοι όρμοι που χωρίζονται από βραχώδη έξαρση, με σπάνια προστασία από βόρειους και βορειοανατολικούς ανέμους.',
        en: 'Two golden coves divided by a rocky outcrop, unusually sheltered from north and northeast winds.',
      },
      body: {
        el: [
          'Η Πάλτση ξεχωρίζει για την πρακτική της προστασία από Ν και ΒΑ ανέμους, χρήσιμη εξαίρεση στην ανατολική ακτή. Η θέση του OSM χρησιμοποιείται ως tie-breaker, επειδή οι πηγές διαφέρουν περίπου 650 μ.',
        ],
        en: [
          'Paltsi stands out for its practical shelter from N and NE winds, a useful exception on the east coast. The OSM beach node is used as the tie-breaker because sources differ by about 650 m.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.31563, 39.237145] },
      mapAnchor: [23.31563, 39.237145],
      images: [image({ el: 'Οι αμμώδεις όρμοι της Πάλτσης', en: 'Paltsi sandy coves' })],
      practical: {
        el: ['Αναζητήστε την προστατευμένη πλευρά όταν φυσούν βόρειοι άνεμοι.'],
        en: ['Use the sheltered side when northerly winds are blowing.'],
      },
      sources: [
        { label: 'OpenStreetMap beach reference', url: osm(23.31563, 39.237145) },
        { label: 'ilovepelion destinations', url: 'https://ilovepelion.gr/el/destinations' },
      ],
      featured: false,
    },
    {
      kind: 'place',
      entityKey: 'potistika',
      category: 'nature',
      isSeed: true,
      slug: { el: 'potistika', en: 'potistika' },
      title: { el: 'Ποτιστικά', en: 'Potistika' },
      eyebrow: {
        el: 'Μεγάλη αμμώδης παραλία του Αιγαίου',
        en: 'Large Aegean sand-and-pebble beach',
      },
      summary: {
        el: 'Πάνω από ένα χιλιόμετρο άμμου και βότσαλου, με οργανωμένο τμήμα και απότομη βαθιά είσοδο.',
        en: 'More than a kilometre of sand and pebble, partly organised, with a steep drop-off.',
      },
      body: {
        el: [
          'Τα Ποτιστικά έχουν οργανωμένο τμήμα με το Climax bar και άγρια πλευρά δίπλα στη Μελανή. Η απότομη βαθιά είσοδος, οι δυνατοί αυγουστιάτικοι άνεμοι και τα μεγάλα κύματα χρειάζονται ιδιαίτερη προσοχή.',
        ],
        en: [
          'Potistika has an organised section by the Climax bar and a wilder side beside Melani. The abrupt depth, strong August winds, and large waves require particular care.',
        ],
      },
      geometry: { type: 'Point', coordinates: [23.291562, 39.265154] },
      mapAnchor: [23.291562, 39.265154],
      images: [image({ el: 'Η μεγάλη παραλία στα Ποτιστικά', en: 'The broad Potistika beach' })],
      practical: {
        el: [
          'Η πεζοπορική σύνδεση Ξινόβρυση–Ποτιστικά είναι περίπου 4,6 χλμ. και ενδέχεται να είναι κατά τόπους χορταριασμένη.',
        ],
        en: ['The Xynovrysi–Potistika walk is about 4.6 km and can be overgrown in places.'],
      },
      sources: [
        {
          label: 'Topoguide: Ξινόβρυση–Ποτιστικά',
          url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/Pelion_Xynovrysi_Potistika.php',
        },
        ...placeSource(23.291562, 39.265154),
      ],
      featured: false,
    },
  ],
  trails: [
    {
      kind: 'trail',
      entityKey: 'platanias-mikro-boardwalk',
      routeType: 'hiking',
      isSeed: true,
      slug: { el: 'platanias-mikro-paraktios-diadromos', en: 'platanias-mikro-coastal-boardwalk' },
      title: {
        el: 'Παράκτιος πεζόδρομος Πλατανιάς – Μικρό',
        en: 'Platanias – Mikro Coastal Boardwalk',
      },
      eyebrow: {
        el: 'Τεκμηριωμένος σύντομος περίπατος στην ακτή',
        en: 'Documented short coastal walk',
      },
      summary: {
        el: 'Εύκολος παράκτιος περίπατος περίπου 1,13 χλμ. από το λιμανάκι του Πλατανιά προς την παραλία Μικρό· ορισμένες περιγραφές αναφέρουν 894 μ.',
        en: 'An easy coastal walk of about 1.13 km from Platanias harbour to Mikro Beach; some descriptions give 894 m.',
      },
      body: {
        el: [
          'Το μονοπάτι ακολουθεί την ακτή πάνω από τα βράχια και συνδέει απευθείας τον Πλατανιά με το Μικρό.',
          'Η σύνθεση των δύο τμημάτων OpenStreetMap μετρά περίπου 1,13 χλμ., ενώ ορισμένες περιγραφές αναφέρουν 894 μ.· επιβεβαιώστε την απόσταση επιτόπου.',
          'Η διαδρομή είναι η παράκτια σύνδεση που τεκμηριώνεται από τις πηγές· δεν πρέπει να συγχέεται με την πολύ μεγαλύτερη, μη σηματοδοτημένη σύνθεση από τον Λαύκο.',
        ],
        en: [
          'The path follows the shore above the rocks and directly links Platanias with Mikro.',
          'The combined OpenStreetMap segments measure about 1.13 km, while some descriptions give 894 m; confirm the distance on site.',
          'This is the coastal connection documented by the sources; it should not be confused with the much longer, unmarked composite route from Lafkos.',
        ],
      },
      geometry: mergeGeometry('platanias-mikro-boardwalk'),
      ...mergeMetrics('platanias-mikro-boardwalk'),
      images: [
        image({
          el: 'Ο παράκτιος πεζόδρομος Πλατανιάς–Μικρό',
          en: 'The Platanias–Mikro coastal boardwalk',
        }),
      ],
      difficulty: 'easy',
      surface: {
        el: 'Παράκτιο μονοπάτι με ξύλινα προστατευτικά κιγκλιδώματα',
        en: 'Coastal path with wooden safety railings',
      },
      practical: {
        el: ['Περίπου 10–15 λεπτά μονή διαδρομή.'],
        en: ['About 10–15 minutes one way.'],
      },
      safety: {
        el: ['Προσέξτε στην άκρη των βράχων και σε κύμα ή βροχή.'],
        en: ['Take care near the cliff edge and in waves or rain.'],
      },
      waypoints: [
        {
          title: { el: 'Πλατανιάς', en: 'Platanias' },
          coordinate: [23.27441, 39.141015],
          placeKey: 'platanias',
        },
        {
          title: { el: 'Παραλία Μικρό', en: 'Mikro Beach' },
          coordinate: [23.263635, 39.136438],
          placeKey: 'mikro-beach',
        },
      ],
      sources: [
        { label: 'OSM way 440285198', url: 'https://www.openstreetmap.org/way/440285198' },
        { label: 'OSM way 1424388029', url: 'https://www.openstreetmap.org/way/1424388029' },
        {
          label: 'ilovepelion — Μικρό',
          url: 'https://ilovepelion.gr/el/destinations/aegeanbeach/mikro',
        },
      ],
      featured: false,
    },
    {
      kind: 'trail',
      entityKey: 'lafkos-mikro-drive-route',
      routeType: 'drive',
      isSeed: true,
      slug: { el: 'odiki-diadromi-lafkos-mikro', en: 'lafkos-mikro-drive-route' },
      title: { el: 'Οδική διαδρομή Λαύκος – Μικρό', en: 'Lafkos – Mikro Drive Route' },
      eyebrow: { el: 'Ασφαλτοστρωμένη κάθοδος προς το Αιγαίο', en: 'Paved descent to the Aegean' },
      summary: {
        el: 'Οδική πρόσβαση από την πλατεία του Λαύκου προς το Μικρό, περίπου 9,49 χλμ. και 22 λεπτά.',
        en: 'A drive from Lafkos square to Mikro, about 9.49 km and 22 minutes.',
      },
      body: {
        el: [
          'Η σωστή οδική περιγραφή είναι η απευθείας ασφαλτοστρωμένη κάθοδος προς το Μικρό, μετά τη σύνδεση με τους δρόμους Αργαλαστή–Λαύκος και Λαύκος–Προμύρι. Δεν διέρχεται από τον Πλατανιά ούτε από το Προμύρι.',
          'Η πεζοπορική γραμμή Λαύκος–Μικρό είναι διαφορετική σύνθεση και δεν είναι σηματοδοτημένη.',
        ],
        en: [
          'The correct driving description is the direct paved descent to Mikro after joining the Argalasti–Lafkos and Lafkos–Promyri roads. It does not pass through Platanias or Promyri.',
          'The Lafkos–Mikro hiking line is a different composite and is not waymarked.',
        ],
      },
      geometry: mergeGeometry('lafkos-mikro-drive-route'),
      ...mergeMetrics('lafkos-mikro-drive-route'),
      images: [
        image({ el: 'Ο δρόμος από τον Λαύκο προς το Μικρό', en: 'The road from Lafkos to Mikro' }),
      ],
      difficulty: 'easy',
      surface: {
        el: 'Ασφαλτόδρομος· οδική διαδρομή, όχι πεζοπορική αξιολόγηση',
        en: 'Paved road; a driving route, not a hiking assessment',
      },
      practical: {
        el: ['Περίπου 9,49 χλμ. / 22 λεπτά από την πλατεία Λαύκου.'],
        en: ['About 9.49 km / 22 minutes from Lafkos square.'],
      },
      safety: {
        el: [
          'Η επιστροφή προς τον Λαύκο είναι ανηφορική.',
          'Οδηγείτε προσεκτικά στις στροφές και μην αντιμετωπίζετε τη γραμμή ως πεζοπορικό μονοπάτι.',
        ],
        en: [
          'The return to Lafkos is uphill.',
          'Drive carefully on bends and do not treat the line as a hiking trail.',
        ],
      },
      waypoints: [
        { title: { el: 'Πλατεία Λαύκου', en: 'Lafkos Square' }, coordinate: [23.24646, 39.17751] },
        {
          title: { el: 'Παραλία Μικρό', en: 'Mikro Beach' },
          coordinate: [23.263635, 39.136438],
          placeKey: 'mikro-beach',
        },
      ],
      sources: [
        { label: 'OSM way 305720347', url: 'https://www.openstreetmap.org/way/305720347' },
        { label: 'OSM way 516840261', url: 'https://www.openstreetmap.org/way/516840261' },
        { label: 'OpenStreetMap route map', url: osm(23.263635, 39.136438) },
      ],
      featured: false,
    },
  ],
};

/* The eight destination route records share one bilingual editorial shape; the
 * measured geometry and metrics are attached in src/data/content.ts. */
const destinations = [
  [
    'chondri-ammos-drive',
    'Χονδρή Άμμος',
    'Chondri Ammos',
    'mixed',
    'chondri-ammos',
    [23.222307, 39.131886],
    '13.5 km / 29 min; 158 m walk-in',
  ],
  [
    'vathia-spilia-drive',
    'Βαθιά Σπηλιά',
    'Vathia Spilia',
    'mixed',
    'vathia-spilia',
    [23.222669, 39.180778],
    '7.7 km / 11 min; 184 m footway',
  ],
  [
    'olive-bay-chorto-drive',
    'Olive Bay (Χόρτο)',
    'Olive Bay (Chorto)',
    'drive',
    'olive-bay-chorto',
    [23.219404, 39.185741],
    '8.5 km / 13 min',
  ],
  [
    'marathias-drive',
    'Μαραθιάς',
    'Marathias',
    'drive',
    'marathias',
    [23.17855, 39.128184],
    '16.2 km / 32 min',
  ],
  [
    'lyri-drive',
    'Λύρη',
    'Lyri',
    'mixed',
    'lyri',
    [23.337493, 39.202139],
    '14.4 km / 22 min; 78 m gravel approach',
  ],
  [
    'mourtiass-drive',
    'Μουρτιάς',
    'Mourtias',
    'mixed',
    'mourtiass',
    [23.333222, 39.209917],
    '14.5 km / 22 min; final surface verify',
  ],
  [
    'paltsi-drive',
    'Πάλτση',
    'Paltsi',
    'drive',
    'paltsi',
    [23.31563, 39.237145],
    '22.1 km / 34 min',
  ],
  [
    'potistika-drive',
    'Ποτιστικά',
    'Potistika',
    'drive',
    'potistika',
    [23.291562, 39.265154],
    '19.8 km / 32 min',
  ],
] as const;

const sharedWaypoints: Record<
  string,
  Array<{ title: { el: string; en: string }; coordinate: [number, number]; placeKey: string }>
> = {
  'chondri-ammos-drive': [
    {
      title: { el: 'Αργαλαστή', en: 'Argalasti' },
      coordinate: [23.219448, 39.22599],
      placeKey: 'argalasti',
    },
  ],
  'vathia-spilia-drive': [
    {
      title: { el: 'Χόρτο', en: 'Chorto' },
      coordinate: [23.217915, 39.190758],
      placeKey: 'chorto',
    },
    {
      title: { el: 'Μέτοχι', en: 'Metochi' },
      coordinate: [23.221458, 39.207669],
      placeKey: 'metochi',
    },
  ],
  'olive-bay-chorto-drive': [
    {
      title: { el: 'Χόρτο', en: 'Chorto' },
      coordinate: [23.217915, 39.190758],
      placeKey: 'chorto',
    },
  ],
  'marathias-drive': [
    {
      title: { el: 'Αργαλαστή', en: 'Argalasti' },
      coordinate: [23.219448, 39.22599],
      placeKey: 'argalasti',
    },
  ],
  /* Both corrected beach drives share the validated Metochi–Argalasti corridor
   * before continuing through their destination-specific coastal stops. */
  'paltsi-drive': [
    {
      title: { el: 'Μέτοχι', en: 'Metochi' },
      coordinate: [23.221458, 39.207669],
      placeKey: 'metochi',
    },
    {
      title: { el: 'Αργαλαστή', en: 'Argalasti' },
      coordinate: [23.219448, 39.22599],
      placeKey: 'argalasti',
    },
  ],
  'potistika-drive': [
    {
      title: { el: 'Μέτοχι', en: 'Metochi' },
      coordinate: [23.221458, 39.207669],
      placeKey: 'metochi',
    },
    {
      title: { el: 'Αργαλαστή', en: 'Argalasti' },
      coordinate: [23.219448, 39.22599],
      placeKey: 'argalasti',
    },
    {
      title: { el: 'Καλλιθέα', en: 'Kallithea' },
      coordinate: [23.2498, 39.2392],
      placeKey: 'kallithea',
    },
    {
      title: { el: 'Ξινόβρυση', en: 'Xynovrysi' },
      coordinate: [23.260532, 39.249229],
      placeKey: 'xynovrysi',
    },
  ],
};

/*
 * Chondri Ammos needs route-specific access language because its mixed route
 * ends at a mapped road handover, while the Mikro-side connection is not
 * confirmed as an ordinary-car route.
 */
const destinationSafetyOverrides: Record<string, { el: string[]; en: string[] }> = {
  'chondri-ammos-drive': {
    el: [
      'Οδηγείτε μόνο μέχρι το χαρτογραφημένο τέλος του δρόμου/σημείο στάθμευσης.',
      'Τα τελευταία περίπου 158 μ. μέχρι την ακτή γίνονται με τα πόδια, σε χωμάτινο ή ανώμαλο έδαφος.',
      'Μην θεωρείτε τη σύνδεση από την πλευρά του Μικρού μέσω ανώνυμων δρόμων επιβεβαιωμένη διαδρομή για συνηθισμένο επιβατικό αυτοκίνητο· επαληθεύστε την τοπική πρόσβαση και την κατάσταση του οδοστρώματος πριν αναχωρήσετε.',
    ],
    en: [
      'Drive only to the mapped road-end/parking handover.',
      'The final approximately 158 m to the shore are on foot over unpaved or rough ground.',
      'Do not treat the Mikro-side connection via unnamed roads as a confirmed ordinary-car route; verify local access and surface conditions before departing.',
    ],
  },
};

/* The two eastern drives use the regional branch north of Promyri, keeping
 * their itinerary and map line out of the settlement's local street network. */
const destinationBodyOverrides: Record<string, { el: string[]; en: string[] }> = {
  'lyri-drive': {
    el: [
      'Η διαδρομή ακολουθεί τον βόρειο επαρχιακό κλάδο γύρω από το Προμύρι και δεν εισέρχεται στα τοπικά δρομάκια του οικισμού.',
      'Μετά την παράκαμψη συνεχίζει στο οδικό δίκτυο του Νοτίου Πηλίου προς τη Λύρη. Το τελευταίο τμήμα απαιτεί σύντομη πεζή προσέγγιση από το σημείο στάθμευσης.',
    ],
    en: [
      'The route uses the northern regional road around Promyri and does not enter the settlement’s local streets.',
      'After the bypass it continues on the South Pelion road network to Lyri. A short walk follows from the parking handover to the shore.',
    ],
  },
  'mourtiass-drive': {
    el: [
      'Η διαδρομή ακολουθεί τον βόρειο επαρχιακό κλάδο γύρω από το Προμύρι και δεν εισέρχεται στα τοπικά δρομάκια του οικισμού.',
      'Μετά την παράκαμψη συνεχίζει στο οδικό δίκτυο του Νοτίου Πηλίου προς τη Μουρτιά. Το τελευταίο τμήμα απαιτεί σύντομη πεζή προσέγγιση από το σημείο στάθμευσης.',
    ],
    en: [
      'The route uses the northern regional road around Promyri and does not enter the settlement’s local streets.',
      'After the bypass it continues on the South Pelion road network to Mourtias. A short walk follows from the parking handover to the shore.',
    ],
  },
};

for (const [
  entityKey,
  el,
  en,
  routeType,
  destinationKey,
  destinationCoordinate,
  access,
] of destinations) {
  coastalEditorialContent.trails.push({
    kind: 'trail',
    entityKey,
    routeType,
    isSeed: true,
    slug: { el: entityKey, en: entityKey },
    title: { el: `Οδική διαδρομή Λαύκος – ${el}`, en: `Lafkos – ${en} Drive Route` },
    eyebrow: {
      el: routeType === 'drive' ? 'Οδική πρόσβαση στην ακτή' : 'Οδήγηση και σύντομο περπάτημα',
      en: routeType === 'drive' ? 'Drive to the coast' : 'Drive and short walk-in',
    },
    summary: {
      el: `Μετρημένη πρόσβαση από τον Λαύκο προς ${el}: ${access}.`,
      en: `Measured access from Lafkos to ${en}: ${access}.`,
    },
    body:
      destinationBodyOverrides[entityKey] ?? {
        el: [
          `Η διαδρομή ακολουθεί το οδικό δίκτυο του Νοτίου Πηλίου προς ${el}. Η μετρημένη απόσταση και διάρκεια είναι ${access}.`,
          routeType === 'drive'
            ? 'Το τελευταίο τμήμα παραμένει οδική πρόσβαση μέχρι τον προορισμό.'
            : 'Στο τέλος της οδήγησης ακολουθεί σύντομο περπάτημα μέχρι την ακτή από το σημείο στάθμευσης.',
        ],
        en: [
          `This route follows the South Pelion road network to ${en}. The measured distance and duration are ${access}.`,
          routeType === 'drive'
            ? 'The final section remains a drive to the destination.'
            : 'A short walk follows the drive from the parking handover to the shore.',
        ],
      },
    geometry: mergeGeometry(entityKey),
    ...mergeMetrics(entityKey),
    images: [image({ el: `Τοπίο στη διαδρομή προς ${el}`, en: `Landscape on the route to ${en}` })],
    difficulty: 'easy',
    surface: {
      el: routeType === 'drive' ? 'Ασφαλτόδρομος' : 'Ασφαλτόδρομος και σύντομη πεζή προσέγγιση',
      en: routeType === 'drive' ? 'Paved road' : 'Paved road and short walk-in',
    },
    practical: { el: [access, `Προορισμός: ${el}.`], en: [access, `Destination: ${en}.`] },
    safety:
      destinationSafetyOverrides[entityKey] ?? {
        el: [
          'Ελέγξτε την κατάσταση του τελικού τμήματος πριν αναχωρήσετε.',
          'Η ακτή είναι ανοργάνωτη ή με περιορισμένες υποδομές, εκτός αν αναφέρεται διαφορετικά στην κάρτα του προορισμού.',
        ],
        en: [
          'Check the final approach before setting out.',
          'The shore is unorganised or has limited facilities unless the destination card states otherwise.',
        ],
      },
    waypoints: [
      { title: { el: 'Πλατεία Λαύκου', en: 'Lafkos Square' }, coordinate: [23.24646, 39.17751] },
      ...(sharedWaypoints[entityKey] ?? []),
      { title: { el, en }, coordinate: destinationCoordinate, placeKey: destinationKey },
    ],
    sources: [
      {
        label: 'OpenStreetMap route map',
        url: osm(destinationCoordinate[0], destinationCoordinate[1]),
      },
      {
        label: 'Lafkos Guide South Pelion route brief',
        url: 'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/',
      },
    ],
    featured: false,
  } as any);
}

export const contentCorrections = {
  'lafkos-mikro-trail': {
    title: { el: 'Διαδρομή Λαύκος – Μικρό', en: 'Lafkos – Mikro Trail' },
    bodyFix: {
      el: 'Αφαιρέστε τον ισχυρισμό ότι η πορεία περνά από τον Πλατανιά. Περιγράψτε τη σύνθεση από το εσωτερικό μονοπάτι που συναντά τον παράκτιο πεζόδρομο δυτικά από την αφετηρία του Πλατανιά.',
      en: 'Remove the Platanias claim. Describe the inland path meeting the coastal boardwalk west of the Platanias trailhead.',
    },
    safetyFix: {
      el: 'Δηλώστε ότι πρόκειται για μη σηματοδοτημένη σύνθεση από μονοπάτια, αγροτικούς δρόμους και σύντομα οδικά τμήματα. Η κάθοδος έχει περίπου 190 μ. ανάβαση και 490 μ. κατάβαση· η επιστροφή είναι σημαντικά ανηφορική.',
      en: 'State that this is an unmarked composite of footpaths, farm tracks, and short road sections. The downhill leg has about 190 m ascent and 490 m descent; the return is a substantial climb.',
    },
    sourceFix: [
      'https://www.openstreetmap.org/way/440285198',
      'https://www.openstreetmap.org/way/1424388029',
      'https://www.openstreetmap.org/way/1551015008',
      'https://www.openstreetmap.org/way/1424391081',
      'https://www.topoguide.gr/mountains/thessaly/advs_pelion/pelion_southern/Pelion_Lafkos_Mousges.php',
      'https://ilovepelion.gr/el/destinations/aegeanbeach/mikro',
    ],
  },
  'mikro-beach': {
    sourceFix: [
      'https://ilovepelion.gr/el/destinations/aegeanbeach/mikro',
      'https://www.openstreetmap.org/way/1424388029',
    ],
  },
  'mikro-settlement': {
    sourceFix: [
      'https://ilovepelion.gr/el/destinations/aegeanbeach/mikro',
      'https://www.openstreetmap.org/way/440285198',
    ],
  },
};

export default coastalEditorialContent;

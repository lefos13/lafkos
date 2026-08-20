/*
 * Lafkos Guide dataset: Curated cultural, historical, architectural,
 * and trail archive for Lafkos and South Pelion.
 */

import type { Category, Place, Story, Trail } from '../lib/content';

const osmSource = { label: 'OpenStreetMap Contributors', url: 'https://www.openstreetmap.org/' };
const pelionRoutesSource = { label: 'Pelion Routes & Topoguide South Pelion', url: 'https://pelionroutes.com/' };
const localHeritageSource = { label: 'Πολιτιστικός Σύλλογος Λαυκιωτών «Η Δράση»', url: 'https://lafkos.gr/' };
const ministryCultureSource = { label: 'Υπουργείο Πολιτισμού — Μνημεία Νοτίου Πηλίου', url: 'http://listedmonuments.culture.gr/' };

const squareImage = {
  src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=82',
  alt: 'Stone village lanes and historic plane trees in South Pelion',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const seaImage = {
  src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1400&q=82',
  alt: 'Deep blue waters of the Pagasetic Gulf seen from the heights of Pelion',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const stoneLaneImage = {
  src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=82',
  alt: 'Cobbled stone kalderimi path lined with olive trees and stone walls',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const bakeryImage = {
  src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=82',
  alt: 'Traditional wood-fired stone oven artisan bread',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const museumImage = {
  src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1400&q=82',
  alt: 'Art museum sculpture and classical stone exhibition',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const churchImage = {
  src: 'https://images.unsplash.com/photo-1548625361-16ef717eb486?auto=format&fit=crop&w=1400&q=82',
  alt: 'Traditional stone church bell tower under mountain light',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const cafeImage = {
  src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=82',
  alt: 'Historic traditional Greek café interior with vintage wooden chairs and coffee cups',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const natureSpringImage = {
  src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=82',
  alt: 'Mountain spring shaded by monumental forest trees',
  credit: 'Unsplash Editorial photography',
  license: 'Editorial License',
};

const squareCoord = [23.24646, 39.17751] as [number, number];

export const categories: Category[] = [
  {
    id: 'heritage',
    label: { el: 'Ιστορία', en: 'Heritage' },
    description: { el: 'Μουσεία, ιστορικά καφενεία και ζωντανές μνήμες αιώνων.', en: 'Museums, historic cafes, and living memories through the centuries.' },
    color: '#b66c45',
    icon: '✦',
  },
  {
    id: 'architecture',
    label: { el: 'Αρχιτεκτονική', en: 'Architecture' },
    description: { el: 'Πηλιορείτικη πέτρα, καλντερίμια, κρήνες και αρχοντικά.', en: 'Pelion stone masonry, cobbled lanes, springs, and mansions.' },
    color: '#8a6b51',
    icon: '⌂',
  },
  {
    id: 'sacred',
    label: { el: 'Ιεροί τόποι', en: 'Sacred places' },
    description: { el: 'Ιστορικές βασιλικές, φρουριακά μοναστήρια και ξωκλήσια.', en: 'Historic basilicas, fortified monasteries, and chapels.' },
    color: '#71845c',
    icon: '✚',
  },
  {
    id: 'nature',
    label: { el: 'Φύση & Κρήνες', en: 'Nature & Springs' },
    description: { el: 'Ιστορικές πετρόχτιστες πηγές, αιωνόβιοι πλάτανοι και ελαιώνες.', en: 'Historic stone springs, centuries-old plane trees, and olive groves.' },
    color: '#3e7a73',
    icon: '↟',
  },
  {
    id: 'viewpoint',
    label: { el: 'Θέα & Ορίζοντας', en: 'Viewpoints & Horizons' },
    description: { el: 'Κορυφές και μπαλκόνια με πανοραμική θέα στον Παγασητικό.', en: 'Peaks and balconies with panoramic views across the Pagasetic Gulf.' },
    color: '#c2964b',
    icon: '◌',
  },
  {
    id: 'community',
    label: { el: 'Καθημερινή ζωή', en: 'Community life' },
    description: { el: 'Η μεγάλη πλατεία, παραδοσιακοί ξυλόφουρνοι και τοπική γαστρονομία.', en: 'The central square, artisan wood-fired bakeries, and local rhythms.' },
    color: '#a95d58',
    icon: '◍',
  },
  {
    id: 'trail',
    label: { el: 'Διαδρομές & Καλντερίμια', en: 'Trails & Kalderimia' },
    description: { el: 'Σηματοδοτημένες πεζοπορίες που συνδέουν το βουνό με τη θάλασσα.', en: 'Waymarked footpaths connecting mountain ridges to coastal bays.' },
    color: '#4f7868',
    icon: '⌁',
  },
];

export const places: Place[] = [
  {
    kind: 'place',
    entityKey: 'lafkos-square',
    slug: { el: 'plateia-lafkou', en: 'lafkos-square' },
    title: { el: 'Η πλατεία του Λαύκου', en: 'Lafkos square' },
    eyebrow: { el: 'Η καρδιά του οικισμού', en: 'The village heart' },
    summary: { el: 'Μία από τις πιο εντυπωσιακές πλατείες του Πηλίου, στρωμένη με πλάκες και σκεπασμένη από γιγάντιους υπεραιωνόβιους πλατάνους.', en: 'One of the grandest squares in Pelion, paved with local stone and sheltered under massive centuries-old plane trees.' },
    body: {
      el: [
        'Η πλατεία του Λαύκου αποτελεί τον κεντρικό πυρήνα της κοινωνικής, εμπορικής και πολιτιστικής ζωής του χωριού εδώ και αιώνες. Η έκτασή της και η σκιά των γιγάντιων πλατάνων δημιουργούν ένα δροσερό μικροκλίμα ακόμα και στις πιο θερμές μέρες του καλοκαιριού.',
        'Γύρω από την πλατεία συγκεντρώνονται τα ιστορικά καφενεία, οι παραδοσιακές ταβέρνες, ο επιβλητικός ναός της Γεννήσεως της Θεοτόκου, το Φάμπειο Μουσείο και η μαρμάρινη κρήνη. Εδώ ξεκινούν και καταλήγουν τα περισσότερα καλντερίμια του χωριού.',
      ],
      en: [
        'Lafkos central square has stood as the heart of social, commercial, and cultural life in South Pelion for centuries. Its generous scale and the deep canopy of monumental plane trees provide a cool refuge even during the hottest summer afternoons.',
        'Surrounding the square are historic coffee houses, traditional tavernas, the grand Church of the Nativity of the Theotokos, the Fampas Art Museum, and a carved marble fountain. It serves as the natural crossroads for all the village stone lanes.',
      ],
    },
    category: 'community',
    geometry: { type: 'Point', coordinates: squareCoord },
    mapAnchor: squareCoord,
    images: [squareImage],
    practical: {
      el: [
        'Ιδανικό σημείο εκκίνησης για κάθε περιήγηση στον οικισμό.',
        'Πλήρως πλακοστρωμένη και επίπεδη επιφάνεια με άφθονο ίσκιο και καθίσματα.',
        'Χώροι στάθμευσης βρίσκονται στην ανατολική και δυτική είσοδο του χωριού (2-3 λεπτά με τα πόδια).',
      ],
      en: [
        'The ideal starting point for exploring the village on foot.',
        'Completely paved and level surface with abundant natural shade and seating.',
        'Designated parking lots are located at the eastern and western entries to the village (2-3 minutes walk).',
      ],
    },
    sources: [osmSource, localHeritageSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'forlidas-cafe',
    slug: { el: 'kafeneio-forlida', en: 'forlidas-historic-cafe' },
    title: { el: 'Ιστορικό Καφενείο Φορλίδα (1785)', en: 'Historic Café Forlidas (1785)' },
    eyebrow: { el: 'Το παλαιότερο καφενείο της Ελλάδας', en: 'The oldest café in Greece' },
    summary: { el: 'Σε αδιάλειπτη λειτουργία από το 1785 από την ίδια οικογένεια εδώ και επτά γενιές — το αγαπημένο στέκι του Παπαδιαμάντη και του Βάρναλη.', en: 'Operating continuously since 1785 across seven generations of the same family — a historic meeting place for Papadiamantis and Varnalis.' },
    body: {
      el: [
        'Το Καφενείο του Φορλίδα, στην άκρη της κεντρικής πλατείας, αποτελεί το παλαιότερο εν λειτουργία καφενείο στην Ελλάδα, με τεκμηριωμένη ιστορία από το 1785. Για πάνω από 240 χρόνια παραμένει στα χέρια της ίδιας οικογένειας, διατηρώντας αναλλοίωτη την ατμόσφαιρα του 18ου και 19ου αιώνα.',
        'Στον επάνω όροφο λειτουργούσε άλλοτε χάνι, όπου διανυκτέρευαν ταξιδιώτες και έμποροι που κατευθύνονταν από τις Βόρειες Σποράδες προς τον Βόλο. Μεταξύ των τακτικών θαμώνων υπήρξαν ο Αλέξανδρος Παπαδιαμάντης, ο Κώστας Βάρναλης (όταν δίδασκε στην Αργαλαστή), ο Αλέξανδρος Δελμούζος και ο Γιώργος Σεφέρης.',
        'Στο εσωτερικό του σώζονται η παραδοσιακή ξυλόσομπα, οι αυθεντικές ξύλινες καρέκλες, τα μαρμάρινα τραπεζάκια και ιστορικές φωτογραφίες που εξιστορούν δύο αιώνες ζωής.',
      ],
      en: [
        'Located on the central square, Café Forlidas is the oldest continuously operating coffee house in Greece, documented since 1785. For over 240 years and seven generations of the Forlidas family, it has preserved an untouched 18th-century atmosphere.',
        'Its upper floor once served as an inn (hani) where sea travelers and merchants from the Sporades islands (Skiathos, Skopelos, Alonnisos) stayed before boarding caïques to Volos. Notable patrons include the celebrated novelist Alexandros Papadiamantis, poet Kostas Varnalis, progressive educator Alexandros Delmouzos, and Nobel laureate Giorgos Seferis.',
        'Inside, an antique cast-iron woodstove, classic thonet wooden chairs, marble tables, and sepia photographs preserve a rare window into authentic Greek social history.',
      ],
    },
    category: 'heritage',
    geometry: { type: 'Point', coordinates: [23.24646, 39.17737] },
    mapAnchor: [23.24646, 39.17737],
    images: [cafeImage],
    practical: {
      el: [
        'Δοκιμάστε ελληνικό καφέ ψημένο στη χόβολη και παραδοσιακά γλυκά του κουταλιού.',
        'Ανοιχτό καθημερινά καθ’ όλη τη διάρκεια του έτους.',
        'Ιστορικά κειμήλια και φωτογραφίες εκτίθενται στους εσωτερικούς τοίχους.',
      ],
      en: [
        'Try traditional Greek coffee brewed slowly over charcoal embers and local spoon sweets.',
        'Open daily year-round.',
        'Historic artifacts and century-old photographs are displayed throughout the interior.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'fampas-museum',
    slug: { el: 'mouseio-fampa', en: 'fampas-museum' },
    title: { el: 'Μουσείο Φάμπα', en: 'Fampas Museum' },
    eyebrow: { el: 'Γλυπτική σε λευκό πηλιορείτικο μάρμαρο', en: 'Sculpture in white Pelion marble' },
    summary: { el: 'Μουσείο τέχνης αφιερωμένο στον διεθνούς φήμης Λαυκιώτη γλύπτη και ζωγράφο Θανάση Φάμπα, στεγασμένο στο παλαιό σχολείο.', en: 'Art museum honoring internationally acclaimed Lafkos-born sculptor and painter Thanasis Fampas, housed in the historic school building.' },
    body: {
      el: [
        'Το Φάμπειο Μουσείο στεγάζεται στο επιβλητικό νεοκλασικό κτίριο του παλαιού Δημοτικού Σχολείου, στη βόρεια πλευρά της πλατείας. Είναι αφιερωμένο στο έργο του σπουδαίου Λαυκιώτη γλύπτη και ζωγράφου Θανάση Φάμπα (1922–2011), μαθητή του Henry Moore και του Ossip Zadkine.',
        'Η μόνιμη συλλογή περιλαμβάνει πρωτότυπα γλυπτά σμιλεμένα σε λευκό πηλιορείτικο μάρμαρο, σχέδια, ελαιογραφίες και ανάγλυφα που αναδεικνύουν τη βαθιά σχέση του καλλιτέχνη με το πηλιορείτικο φως, την ανθρώπινη μορφή και τον μόχθο των απλών ανθρώπων.',
        'Στον προαύλιο χώρο εκτίθενται επίσης υπαίθρια γλυπτά που συνομιλούν αρμονικά με την πέτρινη αρχιτεκτονική του χωριού.',
      ],
      en: [
        'The Fampas Museum occupies the monumental neoclassical stone building of the old primary school overlooking the village square. It is dedicated to the life and oeuvre of celebrated Lafkos-born artist and sculptor Thanasis Fampas (1922–2011), who studied under Henry Moore and Ossip Zadkine.',
        'The permanent exhibition features masterfully sculpted figures in fine white Pelion marble, original oil paintings, drawings, and relief compositions reflecting the human condition and the enduring relationship between stone and light.',
        'An open-air sculpture garden in the courtyard integrates classical sculptural forms with the historic stone backdrop of the settlement.',
      ],
    },
    category: 'heritage',
    geometry: { type: 'Point', coordinates: [23.24604, 39.17800] },
    mapAnchor: [23.24604, 39.17800],
    images: [museumImage],
    practical: {
      el: [
        'Στεγάζεται στον 1ο όροφο του παλαιού πέτρινου σχολείου στην πλατεία.',
        'Η λειτουργία υποστηρίζεται από τον Πολιτιστικό Σύλλογο Λαυκιωτών «Η Δράση».',
        'Επικοινωνήστε τοπικά για ώρες επίσκεψης και ξεναγήσεις.',
      ],
      en: [
        'Located on the upper floor of the historic stone school building on the square.',
        'Maintained in partnership with the local Cultural Association "I Drasi".',
        'Check locally for visiting hours and guided viewing arrangements.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'radio-museum',
    slug: { el: 'mouseio-radiofonou', en: 'radio-museum' },
    title: { el: 'Μουσείο Ραδιοφώνου «Αντώνης Ταβάνης»', en: 'Antonis Tavanis Radio Museum' },
    eyebrow: { el: 'Ένα από τα τρία μουσεία ραδιοφώνου στην Ελλάδα', en: 'One of only three radio museums in Greece' },
    summary: { el: 'Σπάνια συλλογή ιστορικών ραδιοφωνικών δεκτών (1917–1960), δωρεά του Γερμανού φιλέλληνα καθηγητή Wilfried Schoeps.', en: 'A rare collection of vintage radio receivers from 1917–1960, donated by German philhellene professor Wilfried Schoeps.' },
    body: {
      el: [
        'Εγκαινιασμένο το 2008, το Μουσείο Ραδιοφώνου του Λαύκου αποτελεί ένα από τα ελάχιστα εξειδικευμένα μουσεία του είδους στην Ευρώπη και το πρώτο στην Ελλάδα που σχεδιάστηκε με σύγχρονες μουσειολογικές προδιαγραφές.',
        'Φιλοξενεί πάνω από 130 σπάνιους, λειτουργικούς ραδιοφωνικούς δέκτες που καλύπτουν την περίοδο 1917–1960: λυχνιακά ραδιόφωνα, κρυστάλλινους δέκτες, στρατιωτικές συσκευές επικοινωνίας και περίτεχνα ξύλινα έπιπλα-ραδιόφωνα της περιόδου του μεσοπολέμου.',
        'Η συλλογή αποτελεί ευγενική δωρεά του Γερμανού καθηγητή Wilfried Schoeps προς τιμήν του αείμνηστου Λαυκιώτη γλύπτη Αντώνη Ταβάνη και του εθελοντή ξεναγού Στάθη Σφονδυλιά.',
      ],
      en: [
        'Inaugurated in 2008, the Lafkos Radio Museum is one of only three dedicated radio museums in Greece and a rare gem of 20th-century technological heritage in the Mediterranean.',
        'The museum houses over 130 rare, operable historic radio receivers dating from 1917 to 1960: tube radios, crystal sets, wartime communication units, and mastercrafted art-deco timber floor models.',
        'The collection was donated by German professor and philhellene Wilfried Schoeps in memory of the artist Antonis Tavanis and longtime cultural advocate Stathis Sfondylias.',
      ],
    },
    category: 'heritage',
    geometry: { type: 'Point', coordinates: [23.24715, 39.17765] },
    mapAnchor: [23.24715, 39.17765],
    images: [museumImage],
    practical: {
      el: [
        'Βρίσκεται κοντά στην ανατολική είσοδο του οικισμού, σε απόσταση 1 λεπτού από την πλατεία.',
        'Διαθέτει επεξηγηματικές πινακίδες για την ιστορία των ραδιοκυμάτων και της τεχνολογίας.',
      ],
      en: [
        'Located near the eastern entrance of the village, a one-minute walk from the square.',
        'Features explanatory documentation on the history of radio technology and broadcasting.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'folklore-museum',
    slug: { el: 'laografiko-mouseio', en: 'folklore-museum' },
    title: { el: 'Λαογραφικό Μουσείο Λαύκου', en: 'Lafkos Folklore Museum' },
    eyebrow: { el: 'Η παραδοσιακή ζωή του Νοτίου Πηλίου', en: 'Traditional South Pelion life' },
    summary: { el: 'Πλούσια συλλογή εργαλείων, αργαλειών, υφαντών, τοπικών ενδυμασιών και οικιακών σκευών της πηλιορείτικης αγροτικής παράδοσης.', en: 'A rich archive of agrarian tools, looms, hand-woven textiles, folk costumes, and everyday household artifacts.' },
    body: {
      el: [
        'Το Λαογραφικό Μουσείο Λαύκου προσφέρει ένα συναρπαστικό ταξίδι στην καθημερινότητα των προγόνων του χωριού κατά τον 19ο και 20ό αιώνα. Στεγάζεται στο κτιριακό συγκρότημα του παλαιού σχολείου.',
        'Τα εκθέματα περιλαμβάνουν παραδοσιακούς ξύλινους αργαλειούς, περίτεχνα υφαντά και κεντήματα, αυθεντικές παραδοσιακές φορεσιές, εργαλεία ελαιοκομίας, γεωργίας και κτηνοτροφίας, καθώς και χάλκινα σκεύη και πήλινα πιθάρια αποθήκευσης λαδιού και κρασιού.',
      ],
      en: [
        'The Lafkos Folklore Museum offers an evocative window into rural domestic life and village crafts throughout the 19th and early 20th centuries, housed within the old school cultural complex.',
        'Exhibits include traditional wooden looms, intricately embroidered textiles, authentic South Pelion festive costumes, olive harvesting gear, cooperage and farming implements, and antique copper cookware and ceramic storage pithoi.',
      ],
    },
    category: 'heritage',
    geometry: { type: 'Point', coordinates: [23.24610, 39.17805] },
    mapAnchor: [23.24610, 39.17805],
    images: [museumImage],
    practical: {
      el: [
        'Εξαιρετική εκπαιδευτική στάση για οικογένειες και επισκέπτες που θέλουν να κατανοήσουν την τοπική ιστορία.',
        'Συνδυάζεται άμεσα με την επίσκεψη στο Φάμπειο Μουσείο.',
      ],
      en: [
        'A rewarding educational stop for understanding traditional Pelion culture and craftsmanship.',
        'Conveniently visited alongside the Fampas Museum in the same cultural building.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'theotokos-church',
    slug: { el: 'ierow-naos-genniseos-theotokou', en: 'church-nativity-theotokos' },
    title: { el: 'Ιερός Ναός Γεννήσεως της Θεοτόκου (1888)', en: 'Church of the Nativity of the Theotokos' },
    eyebrow: { el: 'Μνημειακή βασιλική', en: 'Monumental basilica' },
    summary: { el: 'Επιβλητική τρίκλιτη πηλιορείτικη βασιλική με περίτεχνο πέτρινο καμπαναριό και ξυλόγλυπτο τέμπλο δεσπόζει στην πλατεία.', en: 'An imposing three-aisled Pelion basilica with a stone bell tower and carved iconostasis overlooking the central square.' },
    body: {
      el: [
        'Ο μητροπολιτικός ναός της Γεννήσεως της Θεοτόκου θεμελιώθηκε στη σημερινή του μορφή το 1888 πάνω σε παλαιότερα βυζαντινά ίχνη, δεσπόζοντας με την επιβλητική του πέτρινη παρουσία στη δυτική πλευρά της πλατείας.',
        'Αποτελεί κλασικό δείγμα της πηλιορείτικης εκκλησιαστικής αρχιτεκτονικής του ύστερου 19ου αιώνα. Στο εσωτερικό του ξεχωρίζουν το εξαιρετικό ξυλόγλυπτο τέμπλο, ο δεσποτικός θρόνος και σπάνιες φορητές εικόνες της μεταβυζαντινής περιόδου.',
        'Το περίτεχνο πέτρινο καμπαναριό με τα λαξευτά αγκωνάρια αποτελεί ένα από τα πιο αναγνωρίσιμα ορόσημα του ορίζοντα του Λαύκου.',
      ],
      en: [
        'The parish church of the Nativity of the Theotokos was rebuilt in its present form in 1888 over earlier foundations, commanding the western side of the central square with majestic stone masonry.',
        'It stands as a quintessential exemplar of late 19th-century Pelion ecclesiastical architecture. Inside, it preserves a magnificent hand-carved wooden iconostasis, episcopal throne, and treasured post-Byzantine portable icons.',
        'Its finely dressed stone belfry with sculpted architraves forms one of the most recognizable landmarks on the village skyline.',
      ],
    },
    category: 'sacred',
    geometry: { type: 'Point', coordinates: [23.24634, 39.17784] },
    mapAnchor: [23.24634, 39.17784],
    images: [churchImage],
    practical: {
      el: [
        'Ανοιχτός κατά τις ιερές ακολουθίες και τα πρωινά του σαββατοκύριακου.',
        'Η κύρια είσοδος ανοίγει απευθείας προς το πλακόστρωτο της πλατείας.',
      ],
      en: [
        'Open during religious services and weekend mornings.',
        'The main portal opens directly onto the paved village square.',
      ],
    },
    sources: [ministryCultureSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'drositis-bakery',
    slug: { el: 'fournos-drositi', en: 'drositis-stone-bakery' },
    title: { el: 'Παραδοσιακός Πέτρινος Φούρνος Ιωάννη Δροσίτη', en: 'Drositis Historic Stone Bakery' },
    eyebrow: { el: 'Ξυλόφουρνος από το 1904', en: 'Wood-fired masonry since 1904' },
    summary: { el: 'Ιστορικός πετρόκτιστος φούρνος σχεδιασμένος στις αρχές του 20ού αιώνα, όπου ψήνεται αδιάκοπα χειροποίητο προζυμένιο ψωμί με ξύλα.', en: 'Historic stone bakery designed in the early 1900s, continuously baking authentic sourdough bread in a traditional wood-fired oven.' },
    body: {
      el: [
        'Στον δρόμο που συνδέει την πλατεία με τη νότια γειτονιά βρίσκεται το παραδοσιακό αρτοποιείο της οικογένειας Δροσίτη. Το εμβληματικό πέτρινο κτίριο χτίστηκε το 1904 (με τοπική παράδοση να το συνδέει με τον Ιταλό μηχανικό Evaristo de Chirico) και λειτουργεί αδιάλειπτα ως αρτοποιείο από το 1955.',
        'Ο τεράστιος θολωτός πέτρινος φούρνος καίει αποκλειστικά ξύλα οξιάς και πουρναριού, παράγοντας παραδοσιακό καρβέλι με αργή ζύμωση, τραγανή κόρα, αφράτη ψίχα, καθώς και παραδοσιακές πηλιορείτικες τυρόπιτες, ελιόψωμα και παξιμάδια.',
        'Μια επίσκεψη νωρίς το πρωί, όταν ο καπνός βγαίνει από την καμινάδα και η μυρωδιά του φρεσκοψημένου ψωμιού γεμίζει τα καλντερίμια, αποτελεί αναπόσπαστη εμπειρία του Λαύκου.',
      ],
      en: [
        'On the stone lane leading south from the central square stands the historic Drositis family bakery. The handsome stone edifice was constructed in 1904 (historically attributed to Italian railway engineer Evaristo de Chirico) and has operated as an artisan wood bakery continuously since 1955.',
        'The massive domed stone hearth is fired solely with mountain oak and beech timber, baking sourdough country loaves with golden crusts, alongside traditional cheese pies (tyropites), olive breads, and rusks.',
        'Visiting early in the morning as fragrant woodsmoke rises and warm bread scents the cobblestones is one of the quintessential sensory experiences of Lafkos.',
      ],
    },
    category: 'community',
    geometry: { type: 'Point', coordinates: [23.24666, 39.17654] },
    mapAnchor: [23.24666, 39.17654],
    images: [bakeryImage],
    practical: {
      el: [
        'Επισκεφθείτε τον νωρίς το πρωί (07:30–11:00) για ζεστό προζυμένιο ψωμί και πίτες.',
        'Βρίσκεται σε απόσταση 150 μέτρων νότια της κεντρικής πλατείας.',
      ],
      en: [
        'Visit early in the morning (07:30–11:00) for freshly baked hot sourdough loaves and savory pies.',
        'Located 150 meters south of the central square along the main stone artery.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'chatzi-spring',
    slug: { el: 'krini-chatzi', en: 'chatzi-spring' },
    title: { el: 'Κρήνη Χατζή (1800)', en: 'Chatzi Spring (1800)' },
    eyebrow: { el: 'Ιστορική πετρόχτιστη πηγή', en: 'Historic stone spring' },
    summary: { el: 'Μνημειακή κρήνη του 1800 με λαξευτές πέτρες και δροσερό τρεχούμενο νερό, κάτω από έναν υπεραιωνόβιο πλάτανο.', en: 'A monumental stone spring built around 1800 with carved stone masonry and cool mountain water under a towering plane tree.' },
    body: {
      el: [
        'Η Κρήνη Χατζή (ή Χατζόβρυση) χτίστηκε γύρω στο 1800 σε μια καταπράσινη ρεματιά στη βορειοδυτική είσοδο του οικισμού. Πήρε το όνομά της από ντόπιο ευεργέτη που έφερε τον τιμητικό τίτλο του Χατζή (προσκυνητή στους Αγίους Τόπους).',
        'Το κτίσμα αποτελείται από θολωτή πέτρινη κατασκευή με λαξευτούς γωνιόλιθους και πέτρινες γούρνες για το πότισμα των ζώων. Σκιάζεται από έναν τεράστιο υπεραιωνόβιο πλάτανο που δημιουργεί ένα δροσερό καταφύγιο στη διαδρομή προς τα παλιά μονοπάτια.',
      ],
      en: [
        'The Chatzi Spring (also known as Chatzovrysi) was constructed around 1800 in a lush verdant ravine at the northwestern edge of Lafkos. It was named after a local benefactor who had completed the pilgrimage to the Holy Land (bearing the title Chatzis).',
        'The structure features an arched stone facade with finely dressed quoins and carved stone troughs historically used for watering pack mules. It is shaded by a monumental plane tree, offering a serene rest stop along the historic walking paths.',
      ],
    },
    category: 'nature',
    geometry: { type: 'Point', coordinates: [23.24412, 39.18205] },
    mapAnchor: [23.24412, 39.18205],
    images: [natureSpringImage],
    practical: {
      el: [
        'Πόσιμο, κρυστάλλινο πηγαίο νερό όλο τον χρόνο.',
        'Σημείο συνάντησης των πεζοπορικών διαδρομών προς Μηλίνα και Προφήτη Ηλία.',
      ],
      en: [
        'Fresh, potable mountain spring water flows year-round.',
        'A key landmark where trails to Milina and Prophet Elias intersect.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'touloumba-spring',
    slug: { el: 'krini-touloumba', en: 'touloumba-spring' },
    title: { el: 'Κρήνη Τουλούμπα (1910)', en: 'Touloumba Spring (1910)' },
    eyebrow: { el: 'Η βρύση της γειτονιάς Λειβαδάκια', en: 'The Livadakia neighborhood spring' },
    summary: { el: 'Πέτρινη κρήνη του 1910 με την ιστορική χειροκίνητη αντλία (τουλούμπα) και τον προστατευμένο πλάτανο του 1913.', en: 'Historic 1910 stone spring featuring its original manual suction pump and a protected plane tree planted in 1913.' },
    body: {
      el: [
        'Η Κρήνη Τουλούμπα κατασκευάστηκε το 1910 στη γραφική γειτονιά «Λειβαδάκια» του Λαύκου. Ονομάστηκε έτσι από την ιστορική τουλούμπα (χειροκίνητη αντλία νερού) που τοποθετήθηκε για να αντλείται το νερό που έφτανε με υπόγειο αγωγό από τις ορεινές πηγές Σκούρα και Στάκη.',
        'Ακριβώς δίπλα στην κρήνη φυτεύτηκε το 1913 ένας πλάτανος, ο οποίος σήμερα έχει αναπτυχθεί σε ένα εντυπωσιακό φυσικό μνημείο που σκεπάζει ολόκληρη τη μικρή πέτρινη πλατεία της γειτονιάς.',
      ],
      en: [
        'The Touloumba Spring was built in 1910 in the quiet "Livadakia" quarter of Lafkos. It earned its name from the vintage mechanical pump (touloumba) installed to draw spring water piped underground from the mountain sources of Skoura and Staki.',
        'Adjacent to the fountain, a plane tree planted in 1913 has matured into a majestic natural canopy shading the charming neighborhood stone courtyard.',
      ],
    },
    category: 'nature',
    geometry: { type: 'Point', coordinates: [23.24835, 39.17580] },
    mapAnchor: [23.24835, 39.17580],
    images: [natureSpringImage],
    practical: {
      el: [
        'Ήσυχη τοποθεσία στα ανατολικά του χωριού, ιδανική για ανάπαυλα.',
        'Συνδέεται με το κυκλικό μονοπάτι των κρηνών του Λαύκου.',
      ],
      en: [
        'A peaceful location in the eastern quarter, ideal for a quiet pause.',
        'Connected along the circular heritage springs walk of Lafkos.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'palaiovrysi',
    slug: { el: 'palaiovrysi', en: 'palaiovrysi-old-spring' },
    title: { el: 'Παλαιοβρύση — Η Αρχέγονη Πηγή', en: 'Palaiovrysi — The Old Spring' },
    eyebrow: { el: 'Η πρώτη βρύση του οικισμού', en: 'The ancient founding spring' },
    summary: { el: 'Η παλαιότερη καταγεγραμμένη βρύση του χωριού με το χαρακτηριστικό κόκκινο πέτρινο περίγραμμα και τον πανύψηλο πλάτανο.', en: 'The oldest documented public spring of Lafkos, distinguished by its red stone trim and monumental plane tree.' },
    body: {
      el: [
        'Η Παλαιοβρύση θεωρείται η πρώτη και ιστορικότερη πηγή του Λαύκου. Γύρω από το άφθονο νερό της συγκεντρώθηκαν οι πρώτοι οικιστές του χωριού κατά τον 15ο και 16ο αιώνα, πολύ πριν δημιουργηθεί το δίκτυο των νεότερων κρηνών.',
        'Είναι άμεσα αναγνωρίσιμη από την παραδοσιακή τοιχοποιία της και το χαρακτηριστικό κόκκινο πέτρινο περίγραμμα του τόξου της. Ο αιωνόβιος πλάτανος που την πλαισιώνει αποτελεί ζωντανό μάρτυρα της εξέλιξης του χωριού μέσα στους αιώνες.',
      ],
      en: [
        'Palaiovrysi is revered as the original and most ancient water source of Lafkos. Around its generous flow, the earliest settlers established the village during the 15th and 16th centuries, long before modern piped networks existed.',
        'It is immediately recognizable by its traditional masonry and the distinctive reddish stone arch framing the fountain wall. The ancient plane tree framing the site stands as a living chronicle of village history.',
      ],
    },
    category: 'nature',
    geometry: { type: 'Point', coordinates: [23.24510, 39.17520] },
    mapAnchor: [23.24510, 39.17520],
    images: [natureSpringImage],
    practical: {
      el: [
        'Βρίσκεται στη νότια έξοδο του χωριού προς τα παλιά μονοπάτια.',
        'Προσφέρει δροσερό τρεχούμενο νερό όλο το έτος.',
      ],
      en: [
        'Located in the southern lower quarter toward the historic trails.',
        'Supplies chilled flowing spring water year-round.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'square-fountain',
    slug: { el: 'krini-plateias', en: 'square-marble-fountain' },
    title: { el: 'Μαρμάρινη Κρήνη της Πλατείας', en: 'The Central Square Fountain' },
    eyebrow: { el: 'Δροσιά στην καρδιά του χωριού', en: 'Fresh water in the village square' },
    summary: { el: 'Λαξευτή κρήνη από πηλιορείτικη πέτρα και μάρμαρο, προσφέρει αδιάκοπα δροσερό νερό στους θαμώνες της πλατείας.', en: 'Carved from Pelion stone and white marble, continuously providing cool water to visitors beneath the plane trees.' },
    body: {
      el: [
        'Στο κέντρο της πλατείας, ανάμεσα στα τραπέζια των καφενείων και κάτω από τον παχύ ίσκιο των πλατάνων, βρίσκεται η κεντρική μαρμάρινη κρήνη. Σχεδιασμένη με σεβασμό στην πηλιορείτικη παράδοση της λιθογλυπτικής, αποτελεί αναπόσπαστο σημείο της καθημερινής συνήθειας των κατοίκων.',
        'Εδώ σταματούν οι πεζοπόροι για να γεμίσουν τα παγούρια τους πριν αναχωρήσουν για τα μονοπάτια προς τη Μηλίνα, τον Προφήτη Ηλία ή το Μοναστήρι του Αγίου Αθανασίου.',
      ],
      en: [
        'At the core of the central square, nestled among the café tables beneath the dense plane tree boughs, stands the village square marble fountain. Built following traditional Pelion stonemasonry techniques, it is a focal point of daily life.',
        'Hikers regularly pause here to refill water bottles before embarking on trail routes toward Milina, Prophet Elias summit, or the Monastery of Agios Athanasios.',
      ],
    },
    category: 'architecture',
    geometry: { type: 'Point', coordinates: [23.24630, 39.17745] },
    mapAnchor: [23.24630, 39.17745],
    images: [squareImage],
    practical: {
      el: ['Κεντρικό σημείο ανεφοδιασμού νερού στην πλατεία.', 'Πόσιμο, τρεχούμενο νερό άριστης ποιότητας.'],
      en: ['Central water refill point on the main square.', 'Potable, continuously flowing fresh mountain water.'],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'profitis-ilias-view',
    slug: { el: 'thea-profiti-ilia', en: 'profitis-ilias-viewpoint' },
    title: { el: 'Ξωκλήσι Προφήτη Ηλία & Θέα Παγασιτικού', en: 'Prophet Elias Chapel & Panoramic Viewpoint' },
    eyebrow: { el: 'Το μπαλκόνι του Νοτίου Πηλίου', en: 'The balcony of South Pelion' },
    summary: { el: 'Κορυφή σε υψόμετρο 409 μ. με το γραφικό ξωκλήσι και ασύγκριτη θέα 360° στον Παγασητικό Κόλπο, τη νήσο Αλατάς και το Αιγαίο.', en: 'Hilltop summit at 409m with a whitewashed chapel offering unrivaled 360-degree views of the Pagasetic Gulf, Alatas island, and the Aegean.' },
    body: {
      el: [
        'Στη βόρεια κορυφογραμμή πάνω από τον Λαύκο, σε υψόμετρο 409 μέτρων, δεσπόζει το γραφικό ξωκλήσι του Προφήτη Ηλία. Η τοποθεσία προσφέρει ένα από τα πιο μαγευτικά πανοράματα σε ολόκληρη τη Θεσσαλία.',
        'Από το πλάτωμα του ναού το βλέμμα αγκαλιάζει ολόκληρο τον Παγασητικό Κόλπο, τον όρμο της Μηλίνας, το καταπράσινο νησάκι Αλατάς, τα βουνά της Εύβοιας και της Στερεάς Ελλάδας, καθώς και τις ανατολικές κορυφές του Πηλίου που κατηφορίζουν προς το Αιγαίο.',
        'Η ώρα του ηλιοβασιλέματος εδώ είναι μοναδική, καθώς ο ήλιος βυθίζεται πίσω από τα βουνά της Όθρυος και βάφει τα νερά του κόλπου σε βαθιές χρυσαφένιες και πορφυρές αποχρώσεις.',
      ],
      en: [
        'Perched on the summit ridge north of Lafkos at an altitude of 409 meters stands the whitewashed chapel of Prophet Elias (Profitis Ilias). The site commands one of the most breathtaking panoramic vantage points in all of Thessaly.',
        'From the chapel grounds, sweeping views take in the entire Pagasetic Gulf, the sheltered harbour of Milina, the verdant island of Alatas, the mountain ridges of Evia, and the eastern slopes cascading toward the Aegean Sea.',
        'Sunset from this crest is legendary, as the sun dips behind the distant peaks of Mount Othrys, bathing the gulf in deep amber, gold, and violet hues.',
      ],
    },
    category: 'viewpoint',
    geometry: { type: 'Point', coordinates: [23.24654, 39.19492] },
    mapAnchor: [23.24654, 39.19492],
    images: [seaImage],
    practical: {
      el: [
        'Προσβάσιμο με πεζοπορία 40-45 λεπτών από την πλατεία ή μέσω αγροτικού δρόμου.',
        'Φέρτε νερό και αντιανεμικό, ειδικά τις απογευματινές ώρες.',
        'Κορυφαίο σημείο για φωτογραφία τοπίου και ηλιοβασίλεμα.',
      ],
      en: [
        'Accessible via a 40–45 minute hike from the village square or via unpaved country track.',
        'Carry water and a light windbreaker, especially during late afternoon visits.',
        'Premier photography location for panoramic landscape and sunset viewing.',
      ],
    },
    sources: [osmSource, pelionRoutesSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'monastery-athanasios',
    slug: { el: 'moni-agiou-athanasiou-kotiki', en: 'monastery-agios-athanasios' },
    title: { el: 'Ιστορική Μονή Αγίου Αθανασίου στο Κωτίκι (1795)', en: 'Monastery of Agios Athanasios at Kotiki (1795)' },
    eyebrow: { el: 'Φρουριακό μεταβυζαντινό μνημείο', en: 'Fortified 18th-century monument' },
    summary: { el: 'Ιδρύθηκε το 1795 από τον πρωτομάστορα Δήμο Ζηπανιώτη με χορηγία του Στέργιου Μπασδέκη — φημίζεται για τα μοναδικά ανάγλυφα του λιθογλύπτη Μίλιου.', en: 'Founded in 1795 by master builder Dimos Zipaniotis and chieftain Stergios Basdekis, famous for stone sun reliefs by sculptor Milios.' },
    body: {
      el: [
        'Κρυμμένη σε μια γαλήνια κοιλάδα με ελαιώνες στη θέση «Κωτίκι», 2,5 χιλιόμετρα βόρεια του Λαύκου, βρίσκεται η ιστορική Μονή του Αγίου Αθανασίου. Ιδρύθηκε το 1795 με δαπάνη του περίφημου Πηλιορείτη οπλαρχηγού Στέργιου Μπασδέκη.',
        'Το μοναστηριακό συγκρότημα χτίστηκε από τον σπουδαίο Ηπειρώτη πρωτομάστορα Δήμο Ζηπανιώτη (Ζουπανιώτη). Διαθέτει φρουριακή διάταξη με ψηλό περίβολο, τοξωτές στοές και διώροφα κελιά. Ο κεντρικός ναός είναι τρίκλιτη βασιλική με θαυμάσιες αναλογίες.',
        'Στην εξωτερική τοιχοποιία σώζονται τα φημισμένα λιθόγλυφα του Ηπειρώτη γλύπτη Μίλιου Ζηπανιώτη, ανάμεσα στα οποία ξεχωρίζει ο επιβλητικός ακτινωτός ανάγλυφος ήλιος, που αποτελεί αριστούργημα της λαϊκής νεοελληνικής γλυπτικής.',
      ],
      en: [
        'Nestled in a serene olive valley at "Kotiki", 2.5 km north of Lafkos, lies the historic fortified Monastery of Agios Athanasios. It was founded in 1795 under the patronage of celebrated Pelion revolutionary chieftain Stergios Basdekis.',
        'The complex was constructed by renowned master builder Dimos Zipaniotis from Epirus in defensive monastic fortress architecture, with high perimeter walls, arched porticos, and stone monks’ cells enclosing a fine three-aisled basilica.',
        'Its exterior walls are adorned with celebrated relief carvings by stone sculptor Milios of Zipani, most notably the majestic radiant sun stone medallion, a masterpiece of 18th-century folk stone sculpture.',
      ],
    },
    category: 'sacred',
    geometry: { type: 'Point', coordinates: [23.23622, 39.17658] },
    mapAnchor: [23.23622, 39.17658],
    images: [churchImage],
    practical: {
      el: [
        'Προσβάσιμη μέσω βατού πεζοπορικού μονοπατιού (40 λεπτά) ή χωματόδρομου.',
        'Χώρος απόλυτης ησυχίας και πνευματικής περισυλλογής μέσα στη φύση.',
        'Σεβαστείτε τον ιερό και προστατευόμενο χαρακτήρα του μνημείου.',
      ],
      en: [
        'Accessible via a gentle 40-minute footpath through olive groves or dirt road.',
        'A sanctuary of profound serenity and natural beauty.',
        'Visitors are requested to respect the sacred and protected status of the monument.',
      ],
    },
    sources: [ministryCultureSource, localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'old-school',
    slug: { el: 'palio-dimotiko-scholeio', en: 'old-primary-school' },
    title: { el: 'Παλαιό Δημοτικό Σχολείο & Πολιτιστικό Κέντρο', en: 'Old Primary School & Cultural Center' },
    eyebrow: { el: 'Νεοκλασικό αρχιτεκτονικό μνημείο', en: 'Neoclassical stone landmark' },
    summary: { el: 'Μνημειώδες πέτρινο σχολικό κτίριο του τέλους του 19ου αιώνα που δεσπόζει στην πλατεία, στέγη των μουσείων του χωριού.', en: 'A monumental late 19th-century stone school building commanding the square, now housing the village museums.' },
    body: {
      el: [
        'Το παλαιό Δημοτικό Σχολείο του Λαύκου ορθώνεται επιβλητικό στη βόρεια πλευρά της πλατείας. Χτισμένο στα τέλη του 19ου αιώνα με συμπαγή πελεκητή πέτρα και νεοκλασικές συμμετρίες, υπήρξε το πνευματικό κέντρο του χωριού για πολλές γενιές μαθητών.',
        'Σήμερα έχει αναπαλαιωθεί υποδειγματικά και λειτουργεί ως πολυδύναμο πολιτιστικό κέντρο, φιλοξενώντας το Φάμπειο Μουσείο, το Λαογραφικό Μουσείο και αίθουσες εκθέσεων και εκδηλώσεων.',
      ],
      en: [
        'The historic Old Primary School stands imposingly on the elevated northern terrace of the central square. Built in the late 19th century from local dressed ashlar stone with harmonious neoclassical proportions, it educated generations of Lafkos children.',
        'Lovingly restored, the landmark today functions as a premier cultural hub, housing the Fampas Art Museum, the Folklore Collection, and hosting community cultural exhibitions and lectures.',
      ],
    },
    category: 'architecture',
    geometry: { type: 'Point', coordinates: [23.24610, 39.17800] },
    mapAnchor: [23.24610, 39.17800],
    images: [stoneLaneImage],
    practical: {
      el: ['Άμεσα προσβάσιμο από την κεντρική πλατεία.', 'Περιλαμβάνει προαύλιο με υπαίθρια γλυπτική και πανοραμική θέα στην πλατεία.'],
      en: ['Directly accessible from the central square.', 'Features an open terrace with outdoor sculptures and views over the square.'],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'place',
    entityKey: 'old-lanes',
    slug: { el: 'palia-kalderimia-archontika', en: 'old-stone-lanes-mansions' },
    title: { el: 'Τα Παλιά Καλντερίμια & Αρχοντικά του Λαύκου', en: 'Old Stone Lanes & Pelion Mansions' },
    eyebrow: { el: 'Η αρχιτεκτονική κληρονομιά', en: 'Traditional architectural heritage' },
    summary: { el: 'Λαβύρινθος από καλοδιατηρημένα λιθόστρωτα καλντερίμια ανάμεσα σε τριώροφα αρχοντικά με πλάκες Πηλίου και ανθοστόλιστες αυλές.', en: 'A preserved labyrinth of cobblestone lanes weaving among three-storey slate-roofed mansions and flower-filled courtyards.' },
    body: {
      el: [
        'Ο Λαύκος έχει χαρακτηριστεί παραδοσιακός διατηρητέος οικισμός χάρη στην εξαιρετική συνοχή του αρχιτεκτονικού του ιστού. Τα λιθόστρωτα καλντερίμια ακολουθούν τη φυσική κλίση της πλαγιάς, συνδέοντας τις γειτονιές (μαχαλάδες) με χαμηλές πέτρινες βαθμίδες.',
        'Στις διαδρομές αυτές δεσπόζουν τα τριώροφα πέτρινα αρχοντικά του 18ου και 19ου αιώνα, με χαρακτηριστικά ξύλινα σαχνισιά (προεξοχές), στέγες από πλάκες Πηλίου, τοξωτές εισόδους και ψηλούς μαντρότοιχους από ξερολιθιά.',
        'Το περπάτημα στα στενά αυτά σοκάκια είναι μια εμπειρία αργής περιπλάνησης, όπου ο επισκέπτης ανακαλύπτει κρυφές αυλές, ανθισμένες μπουκαμβίλιες και μυρωδιές από γιασεμί και ξύλο.',
      ],
      en: [
        'Lafkos is designated as a protected traditional settlement due to the remarkable architectural integrity of its historic core. Cobblestoned kalderimia follow the mountain contours, linking distinct village neighborhoods (mahalades) with broad, easy stone risers.',
        'Lining these routes are handsome three-storey stone mansions dating from the 18th and 19th centuries, characterized by timber overhangs (sachnisia), local slate roofs, arched portals, and dry-stone boundary walls.',
        'Strolling these tranquil, vehicle-free lanes is an immersive slow-travel experience filled with stone archways, blooming bougainvillea, and scents of jasmine and woodsmoke.',
      ],
    },
    category: 'architecture',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [23.2435, 39.1786],
          [23.2482, 39.1786],
          [23.2482, 39.1748],
          [23.2435, 39.1748],
          [23.2435, 39.1786],
        ],
      ],
    },
    mapAnchor: [23.2460, 39.1770],
    images: [stoneLaneImage],
    practical: {
      el: [
        'Ο οικισμός είναι κατάλληλος μόνο για περπάτημα — φορέστε αναπαυτικά παπούτσια.',
        'Σεβαστείτε την ησυχία των κατοίκων και τους ιδιωτικούς χώρους.',
      ],
      en: [
        'The historic center is strictly pedestrianized — wear comfortable walking shoes.',
        'Please respect resident privacy and quiet hours in residential quarters.',
      ],
    },
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
];

export const trails: Trail[] = [
  {
    kind: 'trail',
    entityKey: 'lafkos-milina-trail',
    slug: { el: 'kalderimi-lafkos-milina', en: 'historic-kalderimi-lafkos-milina' },
    title: { el: 'Ιστορικό Καλντερίμι Λαύκος – Μηλίνα', en: 'Historic Kalderimi Lafkos to Milina' },
    eyebrow: { el: 'Από το βουνό στον Παγασητικό', en: 'From the mountain to the Pagasetic' },
    summary: { el: 'Το κλασικό, καλοδιατηρημένο λιθόστρωτο μονοπάτι που κατηφορίζει μέσα από αιωνόβιους ελαιώνες προς το παραθαλάσσιο λιμανάκι της Μηλίνας.', en: 'The quintessential stone-paved path descending through ancient olive groves to the seaside fishing harbor of Milina.' },
    body: {
      el: [
        'Πρόκειται για ένα από τα πιο διάσημα και άριστα διατηρημένα καλντερίμια σε ολόκληρο το Πήλιο. Πριν τη διάνοιξη των σύγχρονων ασφαλτοστρωμένων δρόμων, αποτελούσε την κύρια εμπορική αρτηρία που συνέδεε το ορεινό κεφαλοχώρι του Λαύκου με το επίνειό του, τη Μηλίνα.',
        'Η διαδρομή ξεκινά από τη δυτική πλευρά της πλατείας του Λαύκου, περνά από την Κρήνη Χατζή και κατηφορίζει ομαλά πάνω σε φαρδύ, καλοστρωμένο πέτρινο καλντερίμι ανάμεσα σε ελαιώνες με υπέροχη ανοιχτή θέα προς τον κόλπο και το νησάκι Αλατάς.',
        'Η κατάληξη στην παραλία της Μηλίνας επιβραβεύει τον πεζοπόρο με κρυστάλλινα νερά για κολύμπι και παραθαλάσσια ταβερνάκια για φρέσκο ψάρι και τσίπουρο.',
      ],
      en: [
        'This is one of the most celebrated and masterfully preserved kalderimi routes in all of Greece. Before modern road construction, it served as the vital lifeline connecting the mountain trading center of Lafkos with its coastal harbor at Milina.',
        'Starting from the western edge of Lafkos square, the path passes the historic Chatzi Spring before descending gently along wide stone flags flanked by century-old olive groves and sweeping vistas over the Pagasetic Gulf and Alatas island.',
        'Arriving at the coastal esplanade of Milina rewards walkers with calm sea waters for a refreshing swim and seaside tavernas offering fresh seafood and traditional tsipouro.',
      ],
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [23.24646, 39.17751],
        [23.24412, 39.18205],
        [23.23880, 39.18810],
        [23.23520, 39.17010],
        [23.23140, 39.16960],
        [23.22064, 39.17136],
      ],
    },
    distanceMeters: 3400,
    durationMinutes: 55,
    elevationGainMeters: 20,
    difficulty: 'easy',
    surface: { el: 'Πλακόστρωτο καλντερίμι (80%) και βατό χωμάτινο μονοπάτι', en: 'Paved stone kalderimi (80%) and easy earth footpath' },
    safety: {
      el: [
        'Ομαλή συνεχής κατάβαση με υψομετρική διαφορά περίπου 300 μέτρων.',
        'Φορέστε κατάλληλα παπούτσια πεζοπορίας για πρόσφυση στις πέτρες.',
        'Το καλοκαίρι προτιμήστε τις πρωινές ή απογευματινές ώρες για αποφυγή της ζέστης.',
      ],
      en: [
        'Continuous gentle descent with an elevation drop of approximately 300 meters.',
        'Sturdy walking shoes recommended for optimal grip on stone surfaces.',
        'During summer, hike in the morning or late afternoon to avoid peak midday sun.',
      ],
    },
    waypoints: [
      { title: { el: 'Πλατεία Λαύκου (Αφετηρία)', en: 'Lafkos Square (Start)' }, coordinate: squareCoord, image: squareImage },
      { title: { el: 'Κρήνη Χατζή', en: 'Chatzi Spring' }, coordinate: [23.24412, 39.18205], image: natureSpringImage },
      { title: { el: 'Ελαιώνες με θέα Παγασιτικού', en: 'Olive Groves & Gulf Vistas' }, coordinate: [23.23520, 39.17010], image: seaImage },
      { title: { el: 'Παραλία Μηλίνας (Τερματισμός)', en: 'Milina Beachfront (Finish)' }, coordinate: [23.22064, 39.17136], image: seaImage },
    ],
    sources: [pelionRoutesSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'trail',
    entityKey: 'monastery-athanasios-trail',
    slug: { el: 'diadromi-moni-agiou-athanasiou', en: 'lafkos-monastery-agios-athanasios-trail' },
    title: { el: 'Διαδρομή Λαύκος – Μονή Αγίου Αθανασίου', en: 'Lafkos to Agios Athanasios Monastery' },
    eyebrow: { el: 'Πνευματικός και φυσιολατρικός περίπατος', en: 'A spiritual and natural walk' },
    summary: { el: 'Γαλήνια πορεία βόρεια του χωριού μέσα από αιωνόβιους ελαιώνες και αγροτικά τοπία προς το φρουριακό μοναστήρι του 1795.', en: 'A peaceful northbound walk through century-old olive groves and pastoral scenery to the 1795 fortified monastery.' },
    body: {
      el: [
        'Μια από τις πιο όμορφες και ήσυχες διαδρομές του Νοτίου Πηλίου, που συνδέει τον οικισμό του Λαύκου με την απομονωμένη Μονή του Αγίου Αθανασίου στη θέση «Κωτίκι».',
        'Το μονοπάτι κινείται ανάμεσα σε παλιές ξερολιθιές, ανθισμένες πλαγιές και αρχαίους ελαιώνες με θέα προς τον κόλπο, προσφέροντας μια αίσθηση απόλυτης ηρεμίας.',
        'Στο τέλος της διαδρομής, το επιβλητικό καστρομονάστηρο του 1795 με τα πέτρινα ανάγλυφα του γλύπτη Μίλιου υποδέχεται τον επισκέπτη σε ένα μαγευτικό φυσικό σκηνικό.',
      ],
      en: [
        'One of the most serene and evocative footpaths in South Pelion, linking Lafkos with the secluded 18th-century Monastery of Agios Athanasios at "Kotiki".',
        'The trail winds between dry-stone field walls, rolling meadows, and ancient olive orchards with occasional views of the gulf, providing an atmosphere of deep tranquility.',
        'At the destination, the fortified monastic complex with its famous stone relief medallions by sculptor Milios greets walkers in a timeless setting.',
      ],
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [23.24646, 39.17751],
        [23.24680, 39.17840],
        [23.24460, 39.18070],
        [23.23880, 39.18810],
        [23.23622, 39.17658],
      ],
    },
    distanceMeters: 2600,
    durationMinutes: 45,
    elevationGainMeters: 65,
    difficulty: 'easy',
    surface: { el: 'Χωματόδρομος, μονοπάτι και καλντερίμι', en: 'Unpaved track, earth path, and stone lane' },
    safety: {
      el: ['Εύκολη διαδρομή κατάλληλη για όλη την οικογένεια.', 'Φέρτε καπέλο και νερό καθώς τμήματα της διαδρομής είναι εκτεθειμένα στον ήλιο.'],
      en: ['Easy, family-friendly trail with gentle gradients.', 'Bring sun protection and water as portions are open to the sky.'],
    },
    waypoints: [
      { title: { el: 'Πλατεία Λαύκου', en: 'Lafkos Square' }, coordinate: squareCoord, image: squareImage },
      { title: { el: 'Κοιλάδα Κωτίκι', en: 'Kotiki Valley' }, coordinate: [23.23880, 39.18810], image: stoneLaneImage },
      { title: { el: 'Μονή Αγίου Αθανασίου (1795)', en: 'Monastery of Agios Athanasios' }, coordinate: [23.23622, 39.17658], image: churchImage },
    ],
    sources: [pelionRoutesSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'trail',
    entityKey: 'profitis-ilias-trail',
    slug: { el: 'anavasi-profiti-ilia', en: 'prophet-elias-summit-trail' },
    title: { el: 'Ανάβαση στον Προφήτη Ηλία', en: 'Prophet Elias Hilltop Trail' },
    eyebrow: { el: 'Προς την ψηλότερη θέα', en: 'To the highest panorama' },
    summary: { el: 'Ανηφορική διαδρομή από την πλατεία προς την κορυφή του λόφου στα 409 μ. με πανοραμική θέα 360° στον Παγασητικό.', en: 'An uphill ascent from the square to the 409m summit chapel offering 360-degree views across the Pagasetic Gulf.' },
    body: {
      el: [
        'Η ανάβαση στον Προφήτη Ηλία είναι η κατεξοχήν διαδρομή θέας του Λαύκου. Ξεκινώντας από την πλατεία, ανηφορίζει μέσα από τα ψηλά καλντερίμια του χωριού και συνεχίζει σε μονοπάτι ανάμεσα σε πεύκα, πουρνάρια και αγριολούλουδα.',
        'Φτάνοντας στην κορυφή στα 409 μέτρα υψόμετρο, ο ορίζοντας ανοίγει εκπληκτικά: ολόκληρος ο Παγασητικός, τα νησάκια του κόλπου, η Εύβοια και οι κορυφές του Πηλίου απλώνονται μπροστά σας.',
      ],
      en: [
        'The hike to Prophet Elias is Lafkos’ premier viewpoint route. Beginning at the central square, it climbs through the upper stone lanes before ascending a scenic trail lined with wild pines, Mediterranean scrub, and seasonal blooms.',
        'Reaching the 409-meter summit rewards hikers with an extraordinary panorama: the entire Pagasetic basin, gulf islands, Evia, and the rolling heights of Pelion unfold below.',
      ],
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [23.24646, 39.17751],
        [23.24604, 39.17800],
        [23.24792, 39.18038],
        [23.24680, 39.18970],
        [23.24654, 39.19492],
      ],
    },
    distanceMeters: 2300,
    durationMinutes: 45,
    elevationGainMeters: 115,
    difficulty: 'moderate',
    surface: { el: 'Καλντερίμι, χωμάτινο μονοπάτι και πετρώδες έδαφος', en: 'Cobbled lane, dirt trail, and rocky terrain' },
    safety: {
      el: ['Μέτρια ανηφορική κλίση — απαιτούνται παπούτσια πεζοπορίας.', 'Ιδανική ώρα εκκίνησης αργά το απόγευμα για το ηλιοβασίλεμα.'],
      en: ['Moderate uphill gradient — sturdy footwear recommended.', 'Ideal late afternoon departure to catch the sunset from the crest.'],
    },
    waypoints: [
      { title: { el: 'Πλατεία Λαύκου', en: 'Lafkos Square' }, coordinate: squareCoord, image: squareImage },
      { title: { el: 'Άνω Μαχαλάς', en: 'Upper Quarter' }, coordinate: [23.24792, 39.18038], image: stoneLaneImage },
      { title: { el: 'Κορυφή Προφήτη Ηλία (409 μ.)', en: 'Prophet Elias Summit (409m)' }, coordinate: [23.24654, 39.19492], image: seaImage },
    ],
    sources: [pelionRoutesSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'trail',
    entityKey: 'springs-heritage-loop',
    slug: { el: 'gyros-krinon-kalderimion', en: 'heritage-springs-lanes-loop' },
    title: { el: 'Περιπατητικός Γύρος Κρηνών & Καλντεριμιών', en: 'Heritage Springs & Stone Lanes Loop' },
    eyebrow: { el: 'Ανακάλυψη του οικισμού', en: 'Discover the settlement' },
    summary: { el: 'Κυκλική διαδρομή που συνδέει όλες τις ιστορικές κρήνες, τον πέτρινο φούρνο Δροσίτη, τα μουσεία και τις παραδοσιακές γειτονιές.', en: 'A curated loop linking all historic stone fountains, the Drositis stone bakery, museums, and quiet village quarters.' },
    body: {
      el: [
        'Ένας σχεδιασμένος πολιτιστικός περίπατος μέσα στον διατηρητέο οικισμό του Λαύκου. Ξεκινά από την κεντρική πλατεία και την κρήνη της, κατηφορίζει στον παραδοσιακό φούρνο του Δροσίτη και στην Παλαιοβρύση, συνεχίζει στην Κρήνη Τουλούμπα στα Λειβαδάκια, περνά από το Μουσείο Ραδιοφώνου και ολοκληρώνεται στην Κρήνη Χατζή και στο Φάμπειο Μουσείο.',
        'Είναι ο ιδανικός τρόπος για να γνωρίσει ο επισκέπτης την αρχιτεκτονική συνοχή, τα τρεχούμενα νερά και τη ζωντανή καθημερινότητα του χωριού.',
      ],
      en: [
        'A delightful cultural village circuit within the protected core of Lafkos. Starting at the central square and marble fountain, it visits the historic Drositis bakery, the ancient Palaiovrysi spring, Touloumba spring in Livadakia quarter, the Radio Museum, and concludes via Chatzi Spring and the Fampas Museum.',
        'It offers the perfect slow-paced introduction to the architectural texture, flowing waters, and daily life of Lafkos.',
      ],
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [23.24646, 39.17751],
        [23.24666, 39.17654],
        [23.24510, 39.17520],
        [23.24835, 39.17580],
        [23.24715, 39.17765],
        [23.24412, 39.18205],
        [23.24604, 39.17800],
        [23.24646, 39.17751],
      ],
    },
    distanceMeters: 1850,
    durationMinutes: 40,
    elevationGainMeters: 55,
    difficulty: 'easy',
    surface: { el: 'Πλακόστρωτα καλντερίμια και πέτρινες βαθμίδες', en: 'Paved cobblestone lanes and stone steps' },
    safety: {
      el: ['Εύκολη περιήγηση εντός του οικισμού.', 'Προσοχή στα σκαλοπάτια όταν είναι υγρά.'],
      en: ['Easy walking tour within village boundaries.', 'Exercise normal caution on stone steps when damp.'],
    },
    waypoints: [
      { title: { el: 'Πλατεία & Μαρμάρινη Κρήνη', en: 'Square & Marble Fountain' }, coordinate: squareCoord, image: squareImage },
      { title: { el: 'Φούρνος Δροσίτη (1904)', en: 'Drositis Stone Bakery' }, coordinate: [23.24666, 39.17654], image: bakeryImage },
      { title: { el: 'Παλαιοβρύση', en: 'Palaiovrysi Spring' }, coordinate: [23.24510, 39.17520], image: natureSpringImage },
      { title: { el: 'Κρήνη Τουλούμπα (1910)', en: 'Touloumba Spring' }, coordinate: [23.24835, 39.17580], image: natureSpringImage },
      { title: { el: 'Μουσείο Ραδιοφώνου', en: 'Radio Museum' }, coordinate: [23.24715, 39.17765], image: museumImage },
      { title: { el: 'Κρήνη Χατζή (1800)', en: 'Chatzi Spring' }, coordinate: [23.24412, 39.18205], image: natureSpringImage },
    ],
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'trail',
    entityKey: 'lafkos-chondri-ammos-trail',
    slug: { el: 'lafkos-mousges-chondri-ammos', en: 'lafkos-mousges-chondri-ammos-trail' },
    title: { el: 'Διαδρομή Λαύκος – Μούσγες – Χονδρή Άμμος', en: 'Lafkos to Chondri Ammos Aegean Trail' },
    eyebrow: { el: 'Προς την άγρια ακτή του Αιγαίου', en: 'Toward the wild Aegean coast' },
    summary: { el: 'Πεζοπορία που διασχίζει τους ανατολικούς ελαιώνες και κατηφορίζει μέσα από μεσογειακή βλάστηση προς τις απόμερες παραλίες.', en: 'A scenic hike traversing eastern olive slopes and Mediterranean scrub toward secluded coastal coves.' },
    body: {
      el: [
        'Μια συναρπαστική διαδρομή που αναδεικνύει τη διπλή φύση του Λαύκου, ο οποίος αγναντεύει τόσο τον ήρεμο Παγασητικό όσο και το ανοιχτό Αιγαίο Πέλαγος.',
        'Η πορεία ξεκινά από το ανατολικό άκρο του χωριού, περνά από την περιοχή Μούσγες και ακολουθεί παλιά αγροτικά μονοπάτια μέσα από πυκνούς ελαιώνες, σχίνους και κουμαριές, καταλήγοντας στην παρθένα παραλία Χονδρή Άμμος.',
      ],
      en: [
        'A captivating route illustrating the unique geographic position of Lafkos, poised between the sheltered waters of the Pagasetic Gulf and the open horizon of the Aegean Sea.',
        'Beginning at the village’s eastern edge, the path moves past Mousges and follows pastoral paths through olive groves, wild arbutus, and fragrant macchia before descending to the pristine shores of Chondri Ammos.',
      ],
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [23.24646, 39.17751],
        [23.25080, 39.17310],
        [23.25390, 39.16700],
        [23.25560, 39.16560],
        [23.26170, 39.16240],
        [23.26929, 39.16367],
      ],
    },
    distanceMeters: 5200,
    durationMinutes: 105,
    elevationGainMeters: 45,
    difficulty: 'moderate',
    surface: { el: 'Μονοπάτι, καλντερίμι και αγροτικός χωματόδρομος', en: 'Footpath, stone trail, and unpaved track' },
    safety: {
      el: ['Μεγαλύτερη διαδρομή — φροντίστε για επαρκή ποσότητα νερού και σνακ.', 'Στην παραλία δεν υπάρχουν καταστήματα ή ομπρέλες.'],
      en: ['Longer hike — ensure sufficient water supply and snacks.', 'The destination beach is unorganized with no commercial facilities.'],
    },
    waypoints: [
      { title: { el: 'Πλατεία Λαύκου', en: 'Lafkos Square' }, coordinate: squareCoord, image: squareImage },
      { title: { el: 'Περιοχή Μούσγες', en: 'Mousges Area' }, coordinate: [23.25390, 39.16700], image: stoneLaneImage },
      { title: { el: 'Μονή Αγίου Σπυρίδωνα', en: 'Agios Spyridon Monastery' }, coordinate: [23.26929, 39.16367], image: churchImage },
    ],
    sources: [pelionRoutesSource, osmSource],
    featured: false,
    isSeed: true,
  },
];

export const stories: Story[] = [
  {
    kind: 'story',
    entityKey: 'reading-lafkos',
    slug: { el: 'diavazontas-ton-lafko', en: 'reading-lafkos' },
    title: { el: 'Πώς διαβάζεται ένας ορεινός οικισμός', en: 'How to Read a Mountain Village' },
    eyebrow: { el: 'Μικρός οδηγός παρατήρησης', en: 'A field guide to observation' },
    summary: { el: 'Μερικές ιδέες για να κατανοήσεις τη δομή, την πέτρα, τα νερά και τη ζωή του Λαύκου πέρα από έναν κατάλογο αξιοθέατων.', en: 'Ways to understand the structure, stone masonry, springs, and village rhythms beyond a tourist checklist.' },
    body: {
      el: [
        'Ένας τόπος όπως ο Λαύκος δεν αποκαλύπτεται με μια βιαστική βόλτα. Για να τον κατανοήσεις, χρειάζεται να παρατηρήσεις πώς η πέτρα, η κλίση του εδάφους και τα φυσικά περάσματα όρισαν τη ζωή των ανθρώπων για αιώνες.',
        'Ξεκίνα από την πλατεία κάτω από τα πλατάνια. Παρατήρησε πώς όλες οι γειτονιές συνδέονται με καλντερίμια σχεδιασμένα για τα βήματα των ανθρώπων και τα φορτία των μουλαριών. Δες τις πέτρινες κρήνες — καθεμία χτισμένη εκεί όπου ανάβλυζε φυσική πηγή, αποτελώντας σημείο συνάντησης και καθημερινής επιβίωσης.',
        'Ανηφόρισε προς τον Προφήτη Ηλία την ώρα που πέφτει το φως. Από εκεί ψηλά, η σχέση του χωριού με τη θάλασσα και τα απέναντι βουνά γίνεται ξεκάθαρη: ο Λαύκος υπήρξε πάντοτε ένα ασφαλές ορεινό οχυρό με το βλέμμα στραμμένο στον ορίζοντα του εμπορίου και των ταξιδιών.',
      ],
      en: [
        'A place like Lafkos does not reveal its character to rushed sightseeing. Understanding it requires observing how stone, topography, and natural passages shaped centuries of community life.',
        'Begin at the central square under the ancient plane trees. Notice how every neighborhood is joined by cobbled lanes engineered for human footsteps and pack mules. Look closely at the stone fountains — each built over a natural spring, once serving as vital social hubs and freshwater lifelines.',
        'Climb toward Prophet Elias as evening approaches. From that crest, the village’s relationship with both sea and mountain becomes evident: Lafkos was always a secure mountain haven with its eyes cast outward upon maritime trade routes and horizons.',
      ],
    },
    image: stoneLaneImage,
    relatedKeys: ['lafkos-square', 'old-lanes', 'springs-heritage-loop', 'profitis-ilias-view'],
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'story',
    entityKey: 'oldest-cafe-forlidas',
    slug: { el: 'to-palaiotero-kafeneio-forlida', en: 'the-oldest-cafe-in-greece' },
    title: { el: '1785: Το Παλαιότερο Καφενείο της Ελλάδας', en: '1785: The Oldest Café in Greece' },
    eyebrow: { el: 'Επτά γενιές ιστορίας', en: 'Seven generations of living memory' },
    summary: { el: 'Η συναρπαστική ιστορία του Καφενείου Φορλίδα, από χάνι των ταξιδιωτών των Σποράδων σε στέκι του Παπαδιαμάντη και του Βάρναλη.', en: 'The story of Café Forlidas, from an 18th-century islanders’ inn to a cherished haunt of literary greats.' },
    body: {
      el: [
        'Όταν ο προπροπάππους της οικογένειας Φορλίδα άνοιξε το καφενείο το 1785, ο Λαύκος ήταν ένα ακμάζον κεφαλοχώρι υπό οθωμανική κυριαρχία. Στον επάνω όροφο του κτιρίου λειτούργησε χάνι — πανδοχείο όπου κατέλυαν οι ταξιδιώτες από τη Σκιάθο, τη Σκόπελο και την Αλόννησο που ταξίδευαν προς τον Βόλο.',
        'Στο πέρασμα των αιώνων, το καφενείο έγινε μάρτυρας της νεότερης ελληνικής ιστορίας. Στα τραπέζια του κάθισε ο Αλέξανδρος Παπαδιαμάντης πίνοντας το ρακί του, ο Κώστας Βάρναλης έγραψε στίχους κατά τη θητεία του ως σχολάρχης, και ο Γιώργος Σεφέρης απόλαυσε την ηρεμία του πηλιορείτικου τοπίου.',
        'Σήμερα, ο Μανώλης Φορλίδας συνεχίζει να ψήνει ελληνικό καφέ στη χόβολη, διατηρώντας ζωντανή μια αδιάσπαστη αλυσίδα 240 ετών.',
      ],
      en: [
        'When the Forlidas family opened their doors in 1785, Lafkos was a flourishing mountain trading town. The upper floor operated as a traveler’s inn (hani) hosting sea voyagers from Skiathos, Skopelos, and Alonnisos en route to Volos.',
        'Across two centuries, the café bore witness to modern Greek history. Alexandros Papadiamantis lodged here on island crossings, poet Kostas Varnalis wrote verses while serving as schoolmaster in nearby Argalasti, and Nobel laureate Giorgos Seferis found quiet inspiration.',
        'Today, Manolis Forlidas still brews traditional Greek coffee over embers, keeping alive an unbroken 240-year heritage of hospitality.',
      ],
    },
    image: cafeImage,
    relatedKeys: ['forlidas-cafe', 'lafkos-square'],
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'story',
    entityKey: 'water-and-stone',
    slug: { el: 'petra-nero-platanioi', en: 'stone-water-and-plane-trees' },
    title: { el: 'Πέτρα, Νερό και Πλάτανοι: Οι Κρήνες του Λαύκου', en: 'Stone, Water, and Plane Trees: The Springs of Lafkos' },
    eyebrow: { el: 'Ο υδάτινος πολιτισμός', en: 'The culture of mountain water' },
    summary: { el: 'Πώς οι παραδοσιακές κρήνες και οι πλάτανοι καθόρισαν την πολεοδομία, τις γειτονιές και την καθημερινή ζωή του χωριού.', en: 'How historic stone fountains and plane trees shaped the settlement layout, quarters, and daily village life.' },
    body: {
      el: [
        'Στο Πήλιο, όπου υπάρχει πηγή υπάρχει και ένας πλάτανος· και όπου υπάρχει πλάτανος, γεννιέται μια γειτονιά. Ο Λαύκος είναι ένα από τα πιο χαρακτηριστικά παραδείγματα αυτού του υδάτινου πολιτισμού.',
        'Από την αρχαία Παλαιοβρύση όπου πρωτοεγκαταστάθηκαν οι κάτοικοι, στην επιβλητική Κρήνη Χατζή του 1800 και στη μηχανική Κρήνη Τουλούμπα του 1910 στα Λειβαδάκια, κάθε βρύση έχει το δικό της όνομα, τη δική της ιστορία και τον δικό της πλάτανο.',
        'Οι Ηπειρώτες μάστορες που έχτισαν τις κρήνες δεν δημιούργησαν απλώς υδρευτικά έργα, αλλά αρχιτεκτονικά μνημεία λαϊκής τέχνης που προσφέρουν δροσιά και ανακούφιση μέχρι σήμερα.',
      ],
      en: [
        'Throughout Pelion, wherever spring water rises, a plane tree takes root; and wherever a plane tree flourishes, a village quarter gathers. Lafkos stands as an exquisite exemplar of this mountain water culture.',
        'From ancient Palaiovrysi where the earliest settlers built homes, to monumental Chatzi Spring in 1800 and the 1910 Touloumba pump in Livadakia, every fountain carries its own story, name, and dedicated plane tree.',
        'The traveling Epirote stonemasons who built these fountains crafted not merely civic utilities, but enduring works of folk art that provide pure mountain refreshment to this day.',
      ],
    },
    image: natureSpringImage,
    relatedKeys: ['chatzi-spring', 'touloumba-spring', 'palaiovrysi', 'square-fountain', 'springs-heritage-loop'],
    sources: [localHeritageSource, osmSource],
    featured: true,
    isSeed: true,
  },
  {
    kind: 'story',
    entityKey: 'village-of-museums',
    slug: { el: 'to-chorio-ton-mouseion', en: 'the-village-of-museums' },
    title: { el: 'Το Χωριό των Μουσείων: Τέχνη και Ήχος στο Νότιο Πήλιο', en: 'The Village of Museums: Art and Sound in South Pelion' },
    eyebrow: { el: 'Πολιτιστικός θησαυρός', en: 'A cultural treasure' },
    summary: { el: 'Πώς ένα ορεινό χωριό συγκέντρωσε διεθνή γλυπτική, ένα από τα τρία μουσεία ραδιοφώνου της χώρας και πλούσια λαογραφία.', en: 'How a mountain village became home to internationally acclaimed marble sculpture, vintage radios, and rich folklore.' },
    body: {
      el: [
        'Αν και μικρός σε πληθυσμό, ο Λαύκος διαθέτει μια πολιτιστική πυκνότητα που εκπλήσσει κάθε επισκέπτη. Μέσα σε λίγα μέτρα γύρω από την πλατεία συγκεντρώνονται τρία ξεχωριστά μουσεία.',
        'Το Φάμπειο Μουσείο τιμά τον κορυφαίο γλύπτη Θανάση Φάμπα, του οποίου τα έργα σε λευκό πηλιορείτικο μάρμαρο έχουν εκτεθεί σε ευρωπαϊκές μητροπόλεις. Δίπλα του, το Μουσείο Ραδιοφώνου «Αντώνης Ταβάνης» ταξιδεύει τους επισκέπτες στον χρυσό αιώνα των ερτζιανών κυμάτων με δεκάδες ιστορικούς δέκτες, ενώ το Λαογραφικό Μουσείο διασώζει την αυθεντική αγροτική παράδοση του τόπου.',
      ],
      en: [
        'Despite its modest size, Lafkos boasts an extraordinary cultural density that surprises every traveler. Within a short stroll around the main square stand three distinct museums.',
        'The Fampas Museum honors master sculptor Thanasis Fampas, whose white Pelion marble creations have been exhibited across European capitals. Steps away, the Antonis Tavanis Radio Museum celebrates the golden age of wireless broadcasting with over 130 rare vintage receivers, while the Folklore Museum safeguards the authentic rural heritage of the region.',
      ],
    },
    image: museumImage,
    relatedKeys: ['fampas-museum', 'radio-museum', 'folklore-museum', 'old-school'],
    sources: [localHeritageSource, osmSource],
    featured: false,
    isSeed: true,
  },
  {
    kind: 'story',
    entityKey: 'kalderimia-pelion',
    slug: { el: 'ta-kalderimia-tou-piliou', en: 'the-stone-arteries-of-pelion' },
    title: { el: 'Από το Βουνό στη Θάλασσα: Τα Καλντερίμια του Πηλίου', en: 'From Mountain to Sea: The Stone Arteries of Pelion' },
    eyebrow: { el: 'Ιστορικά μονοπάτια', en: 'Historic footpaths' },
    summary: { el: 'Τα καλντερίμια του Λαύκου δεν είναι απλοί δρόμοι· είναι τα πέτρινα κανάλια που συνέδεαν το εμπόριο, τα λιμάνια και τις ζωές των ανθρώπων.', en: 'The kalderimia of Lafkos are stone channels that once linked trade, harbors, and human destinies.' },
    body: {
      el: [
        'Πριν από τη διάνοιξη του σύγχρονου οδικού δικτύου στη δεκαετία του 1960, το Πήλιο κινούνταν αποκλειστικά πάνω σε καλντερίμια. Μαστόροι της πέτρας έχτιζαν με απίστευτη γεωμετρική ακρίβεια μονοπάτια με σταθερή κλίση, πλατιά πατήματα και αυλάκια απορροής των όμβριων υδάτων.',
        'Το καλντερίμι Λαύκος – Μηλίνα αποτελεί την κορωνίδα αυτής της τέχνης: μια κατηφορική διαδρομή 3,5 χιλιομέτρων που επέτρεπε στα μουλάρια φορτωμένα με λάδι, κρασί και μετάξι να φτάνουν με ασφάλεια στο λιμάνι της Μηλίνας, έτοιμα να φορτωθούν σε καΐκια.',
      ],
      en: [
        'Before modern paved roads arrived in the 1960s, South Pelion moved exclusively along stone kalderimia. Traditional masons engineered these paths with remarkable precision, featuring steady gradients, broad stone steps, and integrated storm drainage channels.',
        'The Lafkos – Milina kalderimi represents the crown jewel of this craft: a 3.4 km downhill route that allowed pack mules laden with olive oil, wine, and silk to travel safely to Milina harbour for shipment across the Aegean.',
      ],
    },
    image: seaImage,
    relatedKeys: ['lafkos-milina-trail', 'old-lanes', 'monastery-athanasios-trail'],
    sources: [pelionRoutesSource, osmSource],
    featured: false,
    isSeed: true,
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

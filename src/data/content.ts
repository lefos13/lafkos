/*
 * Seed content is intentionally marked `isSeed`. It demonstrates the complete
 * editorial and map experience while making it impossible to confuse draft
 * material with verified local history or trail guidance at publish time.
 */

import type { Category, Place, Story, Trail } from '../lib/content';

const source = { label: 'OpenStreetMap contributors', url: 'https://www.openstreetmap.org/' };
const stoneImage = {
  src: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=82',
  alt: 'Stone village lanes under warm Pelion light',
  credit: 'Unsplash editorial seed image',
  license: 'Unsplash License — replace with locally licensed photography',
};
const seaImage = {
  src: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1400&q=82',
  alt: 'Blue Aegean water seen from a mountain village',
  credit: 'Unsplash editorial seed image',
  license: 'Unsplash License — replace with locally licensed photography',
};
const square = [23.24565, 39.17727] as [number, number];

export const categories: Category[] = [
  { id: 'heritage', label: { el: 'Ιστορία', en: 'Heritage' }, description: { el: 'Μνήμες και τόποι που αφηγούνται τον Λαύκο.', en: 'Places that carry Lafkos through time.' }, color: '#b66c45', icon: '✦' },
  { id: 'architecture', label: { el: 'Αρχιτεκτονική', en: 'Architecture' }, description: { el: 'Πέτρα, αυλές και καλντερίμια.', en: 'Stone, courtyards, and cobbled lanes.' }, color: '#8a6b51', icon: '⌂' },
  { id: 'sacred', label: { el: 'Ιεροί τόποι', en: 'Sacred places' }, description: { el: 'Εκκλησίες, ξωκλήσια και ήσυχες πλατείες.', en: 'Churches, chapels, and quiet squares.' }, color: '#71845c', icon: '✚' },
  { id: 'nature', label: { el: 'Φύση', en: 'Nature' }, description: { el: 'Σκιές, νερά και θέα στον Παγασητικό.', en: 'Shade, water, and views over the Pagasetic Gulf.' }, color: '#3e7a73', icon: '↟' },
  { id: 'viewpoint', label: { el: 'Θέα', en: 'Viewpoints' }, description: { el: 'Στάσεις για να κοιτάξεις πιο μακριά.', en: 'Places to pause and look farther.' }, color: '#c2964b', icon: '◌' },
  { id: 'community', label: { el: 'Καθημερινή ζωή', en: 'Community life' }, description: { el: 'Η πλατεία, οι άνθρωποι και οι ρυθμοί του χωριού.', en: 'The square, people, and the village rhythm.' }, color: '#a95d58', icon: '◍' },
  { id: 'trail', label: { el: 'Διαδρομές', en: 'Trails' }, description: { el: 'Πεζοπορίες για αργή εξερεύνηση.', en: 'Walks for slower exploration.' }, color: '#4f7868', icon: '⌁' },
];

export const places: Place[] = [
  {
    kind: 'place', entityKey: 'lafkos-square', slug: { el: 'plateia-lafkou', en: 'lafkos-square' },
    title: { el: 'Η πλατεία του Λαύκου', en: 'Lafkos square' }, eyebrow: { el: 'Η καρδιά του χωριού', en: 'The village heart' },
    summary: { el: 'Ένας σκιερός τόπος συνάντησης κάτω από αιωνόβια πλατάνια.', en: 'A shaded meeting place beneath old plane trees.' },
    body: { el: ['Η πλατεία είναι το φυσικό σημείο εκκίνησης για να γνωρίσεις τον Λαύκο. Τα τραπέζια, οι προσόψεις και ο ήχος της καθημερινότητας δημιουργούν ένα τοπίο που αλλάζει αργά μέσα στη μέρα.', 'Κάνε μια μικρή στάση πριν ακολουθήσεις τα καλντερίμια προς τις γειτονιές και τα ψηλότερα σημεία του χωριού.'], en: ['The square is the natural starting point for meeting Lafkos. Tables, façades, and the daily village rhythm make a place that changes slowly through the day.', 'Pause here before following the cobbled lanes toward the neighbourhoods and higher viewpoints.'] },
    category: 'community', geometry: { type: 'Point', coordinates: square }, mapAnchor: square, images: [stoneImage],
    practical: { el: ['Σημείο εκκίνησης για την εξερεύνηση του χωριού.', 'Το έδαφος γύρω από την πλατεία είναι κυρίως επίπεδο.'], en: ['A useful starting point for exploring the village.', 'The square itself is mostly level.'] }, sources: [source], featured: true, isSeed: true,
  },
  {
    kind: 'place', entityKey: 'fampas-museum', slug: { el: 'mouseio-fampa', en: 'fampas-museum' },
    title: { el: 'Μουσείο Φάμπα', en: 'Fampas Museum' }, eyebrow: { el: 'Τέχνη στο χωριό', en: 'Art in the village' },
    summary: { el: 'Ένα σημείο όπου η καλλιτεχνική μνήμη συναντά την καθημερινότητα του Λαύκου.', en: 'A place where artistic memory meets everyday Lafkos.' },
    body: { el: ['Το μουσείο και η συλλογή του αποτελούν ένα από τα πολιτιστικά σημεία που αξίζει να αναζητήσεις μέσα στον οικισμό.', 'Η τελική περιγραφή, οι ώρες λειτουργίας και η φωτογραφία χρειάζονται τοπική επιβεβαίωση πριν τη δημοσίευση.'], en: ['The museum and its collection are among the cultural places worth seeking out in the settlement.', 'The final description, opening hours, and photography require local verification before publication.'] },
    category: 'heritage', geometry: { type: 'Point', coordinates: [23.24523, 39.17798] }, mapAnchor: [23.24523, 39.17798], images: [seaImage],
    practical: { el: ['Ελέγξτε την τρέχουσα λειτουργία πριν την επίσκεψη.'], en: ['Check current opening information before visiting.'] }, sources: [source], featured: true, isSeed: true,
  },
  {
    kind: 'place', entityKey: 'old-lanes', slug: { el: 'palio-kalderimi', en: 'old-stone-lanes' },
    title: { el: 'Τα παλιά καλντερίμια', en: 'The old stone lanes' }, eyebrow: { el: 'Η υφή του Λαύκου', en: 'The texture of Lafkos' },
    summary: { el: 'Μικρές διαδρομές ανάμεσα σε πέτρινες αυλές, σκάλες και ήσυχες γωνιές.', en: 'Short routes between stone courtyards, steps, and quiet corners.' },
    body: { el: ['Η αρχιτεκτονική του Λαύκου δεν αποκαλύπτεται από έναν μόνο δρόμο. Κρύβεται στις αλλαγές της κλίσης, στις πόρτες και στις μικρές αυλές.', 'Περπάτησε χωρίς βιασύνη και άφησε χώρο στους κατοίκους και στην καθημερινή ζωή του χωριού.'], en: ['Lafkos architecture is not revealed by a single street. It lives in changes of level, doorways, and small courtyards.', 'Walk slowly and leave room for residents and the everyday life of the village.'] },
    category: 'architecture', geometry: { type: 'Polygon', coordinates: [[[23.2439, 39.1782], [23.2471, 39.1782], [23.2471, 39.1762], [23.2439, 39.1762], [23.2439, 39.1782]]] }, mapAnchor: [23.2453, 39.1772], images: [stoneImage],
    practical: { el: ['Περιλαμβάνει σκαλοπάτια και ανώμαλες επιφάνειες.', 'Σεβάσου τις ιδιωτικές αυλές και τις εισόδους.'], en: ['Includes steps and uneven surfaces.', 'Respect private courtyards and entrances.'] }, sources: [source], featured: true, isSeed: true,
  },
  {
    kind: 'place', entityKey: 'pagasetic-view', slug: { el: 'thea-pagasitikou', en: 'pagasetic-view' },
    title: { el: 'Το άνοιγμα προς τον Παγασητικό', en: 'The Pagasetic view' }, eyebrow: { el: 'Στάση με ορίζοντα', en: 'A wide horizon' },
    summary: { el: 'Ένα σημείο για να διαβάσεις τη σχέση του χωριού με τη θάλασσα.', en: 'A place to read the village’s relationship with the sea.' },
    body: { el: ['Από τα ψηλότερα σημεία του χωριού το βλέμμα ανοίγει προς τον Παγασητικό. Το τοπίο είναι διαφορετικό κάθε εποχή και ώρα.', 'Η ακριβής θέση είναι ενδεικτική στο seed περιεχόμενο και θα επιβεβαιωθεί στο πεδίο.'], en: ['From the village’s higher points, the view opens toward the Pagasetic Gulf. The landscape changes with every season and hour.', 'The exact position is indicative in the seed content and will be field-verified.'] },
    category: 'viewpoint', geometry: { type: 'Point', coordinates: [23.24792, 39.18038] }, mapAnchor: [23.24792, 39.18038], images: [seaImage],
    practical: { el: ['Η θέα εξαρτάται από τον καιρό και την ορατότητα.', 'Δεν υπάρχει επίσημη προστασία σε όλα τα σημεία του ανοίγματος.'], en: ['Visibility depends on weather and conditions.', 'Not every part of the viewpoint has formal protection.'] }, sources: [source], featured: true, isSeed: true,
  },
];

export const trails: Trail[] = [
  {
    kind: 'trail', entityKey: 'square-to-view', slug: { el: 'apo-tin-plateia-sti-thea', en: 'square-to-the-view' },
    title: { el: 'Από την πλατεία στη θέα', en: 'From the square to the view' }, eyebrow: { el: 'Μικρή εξερεύνηση', en: 'A short exploration' },
    summary: { el: 'Μια σύντομη κυκλική διαδρομή μέσα από τα καλντερίμια του χωριού.', en: 'A short loop through the village’s stone lanes.' },
    body: { el: ['Η διαδρομή συνδέει την πλατεία, τις παλιές γειτονιές και ένα άνοιγμα προς τον κόλπο.', 'Το ίχνος είναι εκδοτικό seed και χρειάζεται επιτόπια καταγραφή πριν χρησιμοποιηθεί ως οδηγός πεζοπορίας.'], en: ['This route connects the square, old neighbourhoods, and an opening toward the gulf.', 'The line is editorial seed data and needs field recording before it is used as a walking guide.'] },
    geometry: { type: 'LineString', coordinates: [square, [23.2468, 39.1784], [23.24792, 39.18038], [23.2458, 39.1792], square] },
    distanceMeters: 1450, durationMinutes: 35, elevationGainMeters: 62, difficulty: 'easy', surface: { el: 'Καλντερίμι και άσφαλτος', en: 'Stone lanes and asphalt' },
    safety: { el: ['Seed route — δεν αποτελεί πλοηγημένη πεζοπορική οδηγία.', 'Φόρεσε παπούτσια με καλή πρόσφυση και έλεγξε τον καιρό.'], en: ['Seed route — not turn-by-turn hiking guidance.', 'Wear shoes with good grip and check the weather.'] },
    waypoints: [{ title: { el: 'Η πλατεία', en: 'The square' }, coordinate: square, image: stoneImage }, { title: { el: 'Η θέα', en: 'The view' }, coordinate: [23.24792, 39.18038], image: seaImage }], sources: [source], featured: true, isSeed: true,
  },
  {
    kind: 'trail', entityKey: 'lanes-and-courtyards', slug: { el: 'ayles-kai-kalderimia', en: 'courtyards-and-lanes' },
    title: { el: 'Αυλές και καλντερίμια', en: 'Courtyards and lanes' }, eyebrow: { el: 'Αρχιτεκτονικός περίπατος', en: 'An architectural walk' },
    summary: { el: 'Ένας αργός περίπατος για να παρατηρήσεις τις λεπτομέρειες του οικισμού.', en: 'A slow walk for noticing the settlement’s details.' },
    body: { el: ['Σχεδιασμένη ως σύντομη διαδρομή παρατήρησης, αυτή η πρόταση περνά από διαφορετικές υφές και κλίσεις.', 'Χρειάζεται τοπικό έλεγχο για την τελική χάραξη και τα σημεία πρόσβασης.'], en: ['Designed as a short observation walk, this route moves through changing textures and slopes.', 'It needs local review for its final line and access points.'] },
    geometry: { type: 'LineString', coordinates: [[23.2452, 39.1773], [23.2444, 39.1766], [23.245, 39.1759], [23.2462, 39.1763], [23.24565, 39.17727]] },
    distanceMeters: 930, durationMinutes: 25, elevationGainMeters: 48, difficulty: 'easy', surface: { el: 'Καλντερίμι και σκαλοπάτια', en: 'Stone lanes and steps' },
    safety: { el: ['Προσοχή στα σκαλοπάτια και στις υγρές πέτρες.', 'Η διαδρομή είναι seed μέχρι την επιτόπια επαλήθευση.'], en: ['Take care on steps and wet stone.', 'This route remains seed data until field verification.'] },
    waypoints: [{ title: { el: 'Πέτρινη γωνιά', en: 'A stone corner' }, coordinate: [23.2444, 39.1766], image: stoneImage }], sources: [source], featured: false, isSeed: true,
  },
];

export const stories: Story[] = [
  {
    kind: 'story', entityKey: 'reading-lafkos', slug: { el: 'diavazontas-ton-lafko', en: 'reading-lafkos' },
    title: { el: 'Πώς διαβάζεται ένας ορεινός οικισμός', en: 'How to read a mountain village' }, eyebrow: { el: 'Μικρός οδηγός παρατήρησης', en: 'A small field guide' },
    summary: { el: 'Μερικές ιδέες για να δεις τον Λαύκο πέρα από τα αξιοθέατα.', en: 'A few ways to see Lafkos beyond a checklist of sights.' },
    body: { el: ['Ένας τόπος δεν είναι μόνο τα σημεία που σημειώνουμε στον χάρτη. Είναι οι αποστάσεις ανάμεσα σε αυτά, οι σκιές, οι ήχοι και οι άνθρωποι που κάνουν τον χώρο κατοικήσιμο.', 'Ξεκίνα από την πλατεία, περπάτησε ψηλότερα, παρατήρησε την πέτρα και άφησε τον χρόνο να γίνει μέρος της διαδρομής.'], en: ['A place is not only the points we put on a map. It is the space between them, the shadows, sounds, and people who make it lived-in.', 'Begin at the square, walk higher, notice the stone, and let time become part of the route.'] },
    image: stoneImage, relatedKeys: ['lafkos-square', 'old-lanes', 'square-to-view'], sources: [source], featured: true, isSeed: true,
  },
  {
    kind: 'story', entityKey: 'sea-and-stone', slug: { el: 'πετρα-και-θαλασσα', en: 'stone-and-sea' },
    title: { el: 'Πέτρα και θάλασσα', en: 'Stone and sea' }, eyebrow: { el: 'Τοπίο', en: 'Landscape' },
    summary: { el: 'Η θέα προς τον κόλπο δεν είναι φόντο· είναι μέρος της ταυτότητας του χωριού.', en: 'The gulf is not a backdrop; it is part of the village identity.' },
    body: { el: ['Στον Λαύκο το ορεινό τοπίο και η θάλασσα συνομιλούν μέσα από τη θέα, τις διαδρομές και την καθημερινή κίνηση.', 'Η ιστορική τεκμηρίωση αυτής της αφήγησης θα εμπλουτιστεί με τοπικές πηγές.'], en: ['In Lafkos, mountain and sea speak through views, routes, and everyday movement.', 'This story will be expanded with locally sourced historical material.'] },
    image: seaImage, relatedKeys: ['pagasetic-view'], sources: [source], featured: false, isSeed: true,
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}


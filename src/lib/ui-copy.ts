import type { Locale } from './locales';

/* Shared interface copy keeps navigation landmarks and assistive labels in the
 * active locale, preventing an otherwise translated page from mixing voices. */
export const copy = {
  el: {
    home: 'Αρχική Lafkos Guide', primaryNav: 'Κύρια πλοήγηση', footerNav: 'Πλοήγηση υποσέλιδου', skipToContent: 'Μετάβαση στο περιεχόμενο',
    navMap: 'Χάρτης', navStories: 'Ιστορίες', navVisit: 'Πριν έρθεις', navAbout: 'Ο οδηγός',
    explore: 'Εξερεύνησε τον Λαύκο', intro: 'Ένας ζωντανός χάρτης για ένα ορεινό χωριό του Νοτίου Πηλίου.',
    introLong: 'Πέτρα, πλατάνια, καλντερίμια και θέα στον Παγασητικό. Βρες τις μικρές ιστορίες που κάνουν τον Λαύκο τόπο.',
    featured: 'Μικρές αφετηρίες', trails: 'Διαδρομές', stories: 'Ιστορίες του τόπου', viewAll: 'Δες τα όλα',
    mapHint: 'Πάτησε ένα σημείο για να το γνωρίσεις', seed: 'Εκδοτικό δείγμα', seedNotice: 'Το περιεχόμενο είναι αρχικό δείγμα και χρειάζεται τοπική επιβεβαίωση.',
    search: 'Αναζήτηση σε μέρη και διαδρομές', categories: 'Φίλτρα', all: 'Όλα', places: 'Μέρη', trailsOnly: 'Διαδρομές', locate: 'Βρες τη θέση μου', locating: 'Εντοπισμός…',
    locateDenied: 'Η θέση δεν είναι διαθέσιμη. Μπορείς να περιηγηθείς χωρίς GPS.', mapFallback: 'Ο χάρτης χρειάζεται σύνδεση. Η λίστα παραμένει διαθέσιμη.',
    fullscreen: 'Πλήρης οθόνη', exitFullscreen: 'Κλείσιμο πλήρους οθόνης', hideList: 'Απόκρυψη λίστας', showList: 'Εμφάνιση λίστας',
    readStory: 'Διάβασε την ιστορία', openMap: 'Άνοιξε στον χάρτη', directions: 'Οδηγίες προς το σημείο', back: 'Πίσω στον χάρτη', practical: 'Χρήσιμα πριν πας', sources: 'Πηγές και τεκμηρίωση', related: 'Σχετικά στον χάρτη',
    duration: 'διάρκεια', distance: 'απόσταση', elevation: 'ανάβαση', difficulty: 'δυσκολία', easy: 'εύκολη', moderate: 'μέτρια', demanding: 'απαιτητική', safety: 'Ασφάλεια διαδρομής',
    visitTitle: 'Πριν έρθεις', visitIntro: 'Ο Λαύκος είναι χωριό για αργή εξερεύνηση. Έλα με χρόνο, σεβάσου τον τόπο και άφησε χώρο στην καθημερινή ζωή.', aboutTitle: 'Ο οδηγός', aboutIntro: 'Το Lafkos Guide είναι ένα κοινοτικό, δίγλωσσο αρχείο τόπων, διαδρομών και ιστοριών.', privacyTitle: 'Ιδιωτικότητα', accessibilityTitle: 'Προσβασιμότητα',
    footer: 'Ένας ανεξάρτητος κοινοτικός οδηγός για τον Λαύκο και το Νότιο Πήλιο.', language: 'English',
  },
  en: {
    home: 'Lafkos Guide home', primaryNav: 'Primary navigation', footerNav: 'Footer navigation', skipToContent: 'Skip to content',
    navMap: 'Map', navStories: 'Stories', navVisit: 'Before you go', navAbout: 'The guide',
    explore: 'Explore Lafkos', intro: 'A living map for a mountain village in South Pelion.',
    introLong: 'Stone, plane trees, cobbled lanes, and views over the Pagasetic Gulf. Find the small stories that make Lafkos a place.',
    featured: 'Small beginnings', trails: 'Walk slowly', stories: 'Stories of place', viewAll: 'See everything',
    mapHint: 'Select a place to begin', seed: 'Editorial seed', seedNotice: 'This is starter content and needs local verification.',
    search: 'Search places and trails', categories: 'Filters', all: 'All', places: 'Places', trailsOnly: 'Trails', locate: 'Find my location', locating: 'Locating…',
    locateDenied: 'Location is unavailable. You can still explore without GPS.', mapFallback: 'The map needs a connection. The list is still available.',
    fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', hideList: 'Hide list', showList: 'Show list',
    readStory: 'Read the story', openMap: 'Open on map', directions: 'Directions to this place', back: 'Back to map', practical: 'Before you go', sources: 'Sources and documentation', related: 'Related on the map',
    duration: 'duration', distance: 'distance', elevation: 'gain', difficulty: 'difficulty', easy: 'easy', moderate: 'moderate', demanding: 'demanding', safety: 'Trail safety',
    visitTitle: 'Before you go', visitIntro: 'Lafkos rewards a slower pace. Bring time, respect the village, and leave room for everyday life.', aboutTitle: 'The guide', aboutIntro: 'Lafkos Guide is a community bilingual archive of places, paths, and stories.', privacyTitle: 'Privacy', accessibilityTitle: 'Accessibility',
    footer: 'An independent community guide to Lafkos and South Pelion.', language: 'Ελληνικά',
  },
} as const;

export function getCopy(locale: Locale) {
  return copy[locale];
}

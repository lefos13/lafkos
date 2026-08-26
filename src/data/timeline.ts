import type { Localized } from '../lib/content';

export interface TimelineEvent {
  year: number | string;
  title: Localized<string>;
  body: Localized<string>;
  kind?: 'milestone' | 'loss';
  stat?: string;
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: '~1500',
    title: {
      el: 'Ο πρώτος πυρήνας',
      en: 'The First Settlement',
    },
    body: {
      el: 'Η πρώτη εγκατάσταση των κατοίκων οργανώνεται στη δυτική, προστατευμένη πλαγιά γύρω από το ναΰδριο της Αγίας Παρασκευής και την Παλιόβρυση. Η επιλογή της θέσης υπαγορεύτηκε από αυστηρά κριτήρια παθητικής άμυνας, καθώς η συγκεκριμένη πτυχή του βουνού παρέμενε αθέατη από τα πειρατικά πλοία του Παγασητικού και του Αιγαίου. Πρόσφυγες και έποικοι από την Ήπειρο, την Πελοπόννησο και τα νησιά έθεσαν τα θεμέλια μιας ασφαλούς ορεινής κοινότητας.',
      en: 'The earliest settlement was established on the hidden western slope around the chapel of Agia Paraskevi and the Palaiovrysi spring. This location was chosen for passive defense, positioned in a fold of the mountain entirely invisible to pirate vessels raiding the Pagasetic Gulf and the Aegean Sea. Migrants from Epirus, the Peloponnese, and the Aegean islands laid the foundations of the mountain community.',
    },
    kind: 'milestone',
  },
  {
    year: 1756,
    title: {
      el: 'Ο ναός της Θεοτόκου',
      en: 'The Church of the Theotokos',
    },
    body: {
      el: 'Ολοκληρώνεται η πρώτη φάση ανέγερσης του ναού της Γεννήσεως της Θεοτόκου στη θέση όπου εκτείνεται η σημερινή κεντρική πλατεία. Η μικρή αρχική βασιλική σηματοδότησε τη σταδιακή μετατόπιση του οικιστικού κέντρου από τις απόμερες πλαγιές προς τη ραχοκοκαλιά της κορυφογραμμής. Για περισσότερο από έναν αιώνα αποτέλεσε τον λατρευτικό και κοινωνικό άξονα του χωριού.',
      en: 'The initial construction phase of the Church of the Nativity of the Theotokos was completed on the grounds of today’s central square. This early basilica marked the decisive shift of village life from the secluded upper ravines toward the crest of the ridge. For over a century, it served as the spiritual and communal anchor of Lafkos.',
    },
    kind: 'milestone',
  },
  {
    year: 1785,
    title: {
      el: 'Το καφενείο που δεν έκλεισε ποτέ',
      en: 'The Café That Never Closed',
    },
    body: {
      el: 'Ανοίγει τις πόρτες του στην πλατεία το ιστορικό καφενείο του Φορλίδα, αποτελώντας ένα από τα παλαιότερα καταστήματα στην Ελλάδα. Λειτουργώντας αδιάκοπα στην ίδια οικογένεια για επτά γενιές, συνδύαζε ιστορικά καφενείο, ταβέρνα, κουρείο, κρεοπωλείο και πανδοχείο στον άνω όροφο. Στα τραπέζια του κάθισαν εμβληματικές προσωπικότητες, ανάμεσά τους ο Αλέξανδρος Παπαδιαμάντης, ο Κώστας Βάρναλης και ο Γιώργος Σεφέρης.',
      en: 'Café Forlidas opens on the village square, establishing what is widely celebrated as the oldest continuously operating café in Greece. Run without pause by the same family across seven generations, the ground floor historically combined a coffeehouse, tavern, barbershop, and butcher shop, with an inn on the upper level. Its tables hosted revered figures of Greek literature, including Alexandros Papadiamantis, Kostas Varnalis, and Nobel laureate Giorgos Seferis.',
    },
    kind: 'milestone',
  },
  {
    year: 1795,
    title: {
      el: 'Η μονή στο Κωτίκι',
      en: 'The Monastery at Kotiki',
    },
    body: {
      el: 'Ιδρύεται η Ιερά Μονή Αγίου Αθανασίου στη θέση Κωτίκι, μέσα στην απόμερη ρεματιά της Αξυλίθρας, με δαπάνη του Ηπειρώτη αρματολού Στέργιου Μπασδέκη. Το μοναστηριακό συγκρότημα χτίστηκε από τον πρωτομάστορα Δήμο Ζουπανιώτη με φρουριακή διάταξη, ψηλό περίβολο, πολεμίστρες και ανάγλυφα του γλύπτη Σπύρου Μήλιου. Παραμένει το επίκεντρο του μεγαλύτερου ετήσιου πανηγυριού της περιοχής την Πρωτομαγιά.',
      en: 'The Monastery of Agios Athanasios was founded in the secluded Kotiki valley along the Axylithra ravine, funded by the Epirote armatolos captain Stergios Basdekis. Master builder Dimos Zoupaniotis erected the complex with fortified perimeter walls, gun loops, and stone reliefs by sculptor Spyros Milios. It remains the home of the region’s premier May Day festival and pilgrimage.',
    },
    kind: 'milestone',
  },
  {
    year: 1815,
    title: {
      el: '500 πέτρινα σπίτια',
      en: '500 Stone Houses',
    },
    body: {
      el: 'Ο λόγιος περιηγητής Αργύρης Φιλιππίδης καταγράφει στη «Γεωγραφία» του έναν ακμάζοντα οικισμό με 500 πέτρινα σπίτια και πληθυσμό που άγγιζε τους 2.500 κατοίκους. Ο Λαύκος αναδεικνύεται σε ισχυρό κεφαλοχώρι του Νοτίου Πηλίου, στηρίζοντας την ευημερία του στην ελαιοκομία, τα λιοτρίβια και το διαμετακομιστικό εμπόριο. Η οικονομική αυτή ακμή οδήγησε στην ανέγερση μεγαλοπρεπών αρχοντικών.',
      en: 'Scholar Argyris Filippidis records a bustling township of 500 stone houses with a population of around 2,500 in his Geographia. Lafkos established itself as the preeminent market town (kefalochori) of South Pelion, sustained by olive cultivation, traditional press mills, and overland transit trade between the two seas. This flourishing era laid the groundwork for the village’s grand mansions.',
    },
    kind: 'milestone',
    stat: '500 σπίτια · ~2.500 κάτοικοι',
  },
  {
    year: 1834,
    title: {
      el: 'Αρχοντικό Παρίση',
      en: 'Parisis Mansion',
    },
    body: {
      el: 'Ολοκληρώνεται η κατασκευή του επιβλητικού Αρχοντικού Παρίση, ενός από τα παλαιότερα σωζόμενα δείγματα πηλιορείτικης αρχιτεκτονικής της Ύστερης Τουρκοκρατίας. Το τριώροφο πέτρινο κτίριο, με οχυρωματική δομή στο ισόγειο και ξύλινα σαχνισιά στους επάνω ορόφους, διατηρεί την αρχική του αίγλη και πλακόστρωτη αυλή. Σήμερα είναι χαρακτηρισμένο διατηρητέο μνημείο.',
      en: 'Construction concludes on the imposing Parisis Mansion, one of the earliest preserved examples of late Ottoman-era Pelion domestic architecture. Featuring a three-story stone facade, fortified lower floors, and timber sachnisia bays, it commands panoramic views over the Pagasetic Gulf. Today, it stands carefully restored as a protected historic landmark.',
    },
    kind: 'milestone',
  },
  {
    year: 1861,
    title: {
      el: 'Τα αρχοντικά ανθίζουν',
      en: 'The Flourishing Mansions',
    },
    body: {
      el: 'Ανεγείρεται το τριώροφο αρχοντικό Κρυστάλλη, το οποίο στις μέρες μας στεγάζει τον Ξενώνα των Χρωμάτων, σηματοδοτώντας την περίοδο της μεγάλης αρχιτεκτονικής ωριμότητας του χωριού. Εύποροι καπεταναίοι και έμποροι χτίζουν πολυτελείς οικίες με σκαλιστά ταβάνια, λιθόκτιστα υπέρθυρα και στέγες από ντόπιο σχιστόλιθο. Ο Λαύκος αποκτά το χαρακτηριστικό αρχοντικό του ύφος.',
      en: 'The three-story Krystallis mansion is built, which now houses the Guesthouse of Colors (Xenonas Chromaton), marking an era of architectural splendor in the village. Prosperous traders and ship captains commissioned stately residences boasting carved timber ceilings, stone lintels, and local slate roofs. These buildings defined the noble character that still graces the village alleys today.',
    },
    kind: 'milestone',
  },
  {
    year: 1882,
    title: {
      el: 'Οι πλάτανοι της πλατείας',
      en: 'The Plane Trees of the Square',
    },
    body: {
      el: 'Φυτεύονται τα πρώτα μεγάλα πλατάνια που θα πλαισιώσουν το κεντρικό σημείο συνάντησης των κατοίκων, δημιουργώντας τον θρυλικό πράσινο θόλο του χωριού. Μαζί με τις κρήνες, τα δέντρα πρόσφεραν αναγκαία σκιά και φυσική δροσιά στις υπαίθριες συγκεντρώσεις και τα πανηγύρια. Σήμερα, υπεραιωνόβια πλέον, αποτελούν προστατευόμενο φυσικό μνημείο και σήμα κατατεθέν του Λαύκου.',
      en: 'The first plane trees are planted around the central gathering space, beginning the monumental green canopy that shelters the village square. In harmony with the public stone fountains, the trees provided shade and cool refuge for communal gatherings, daily market trade, and festivals. Today, these centenarian giants remain an iconic natural landmark of Lafkos.',
    },
    kind: 'milestone',
  },
  {
    year: 1887,
    title: {
      el: 'Γεννιέται η πλατεία',
      en: 'The Square is Born',
    },
    body: {
      el: 'Η χρονιά-καμπή που επανακαθόρισε οριστικά τον δημόσιο χώρο του χωριού. Ο ναός της Γεννήσεως της Θεοτόκου ανακατασκευάζεται εκ θεμελίων ως επιβλητική τρίκλιτη βασιλική με γυναικωνίτη, το παλαιό νεκροταφείο μεταφέρεται οριστικά εκτός οικισμού και φυτεύονται οκτώ μνημειακά πλατάνια. Δημιουργείται έτσι η σημερινή ευρύχωρη, πλακόστρωτη πλατεία, που αναδεικνύεται στην αδιαμφισβήτητη καρδιά της λαυκιώτικης ζωής.',
      en: 'The defining milestone that permanently reshaped the village’s public core. The Church of the Nativity of the Theotokos was rebuilt from its foundations as a grand three-aisled basilica with a women’s gallery, the ancestral cemetery was relocated outside the village, and eight monumental plane trees were planted. This concerted redesign birthed the expansive stone-paved square as the beating heart of social, cultural, and spiritual life.',
    },
    kind: 'milestone',
  },
  {
    year: 1904,
    title: {
      el: 'Το Παρθεναγωγείο',
      en: 'The Girls’ School (Parthenagogeio)',
    },
    body: {
      el: 'Ανεγείρεται το νεοκλασικό Παρθεναγωγείο Λαύκου, ένα επιβλητικό σχολικό κτίριο με περίτεχνα μάρμαρα στις εισόδους και λαξευτές κλίμακες. Η ίδρυσή του υπήρξε κορυφαίο σύμβολο της εκπαιδευτικής πρωτοπορίας της κοινότητας και της μέριμνας για τη γυναικεία εκπαίδευση στην περιοχή. Για περισσότερα από πενήντα χρόνια αποτέλεσε φάρο μόρφωσης και πνευματικό καμάρι των κατοίκων.',
      en: 'The neoclassical Girls’ School (Parthenagogeio) is constructed, featuring handsome marble doorframes, sculpted steps, and balanced neoclassical proportions. Its construction was a proud symbol of the community’s progressive educational ambitions and commitment to women’s schooling. For over half a century, it served as a beacon of learning and a centerpiece of civic pride.',
    },
    kind: 'milestone',
  },
  {
    year: 1957,
    title: {
      el: 'Χάνεται το Παρθεναγωγείο',
      en: 'The Loss of the Parthenagogeio',
    },
    body: {
      el: 'Το ιστορικό κτίριο του Παρθεναγωγείου κατεδαφίζεται στο πλαίσιο των μεταπολεμικών παρεμβάσεων εκσυγχρονισμού, στερώντας από τον οικισμό ένα αναντικατάστατο νεοκλασικό κόσμημα. Στη θέση του διαμορφώθηκαν αργότερα υπαίθριος χώρος στάθμευσης και η σημερινή παιδική χαρά. Η απώλεια αυτή παραμένει ζωντανή στη συλλογική μνήμη ως υπενθύμιση της αξίας προστασίας του ιστορικού ιστού.',
      en: 'The historic Parthenagogeio is demolished during post-war modernization efforts, depriving the village of an irreplaceable neoclassical jewel. A public parking area and playground were subsequently created on the cleared plot. This loss remains vivid in local memory as a poignant reminder of the necessity to defend architectural heritage.',
    },
    kind: 'loss',
  },
  {
    year: 1976,
    title: {
      el: 'Η ίδρυση της «Δράσης»',
      en: 'Founding of "I Drasi"',
    },
    body: {
      el: 'Ιδρύεται ο Πολιτιστικός Σύλλογος Λαυκιωτών «Η Δράση», ανοίγοντας ένα νέο κεφάλαιο συλλογικής πρωτοβουλίας για τη διάσωση της τοπικής παράδοσης. Ο σύλλογος πρωτοστάτησε στη δημιουργία και συντήρηση των μουσείων, τη διάσωση αρχειακού υλικού και τη διοργάνωση εμβληματικών πολιτιστικών συναντήσεων, όπως οι Διεθνείς Ημέρες Κιθάρας. Αποτελεί τον άγρυπνο θεματοφύλακα της πολιτιστικής κληρονομιάς του χωριού.',
      en: 'The Cultural Association of Lafkos "I Drasi" is founded, opening a new chapter of grassroots stewardship for the preservation of local traditions. The association spearheaded the creation and upkeep of village museums, preserved archival records, and established signature cultural events like the International Guitar Days. It stands as the vigilant guardian of Lafkos’s cultural inheritance.',
    },
    kind: 'milestone',
  },
  {
    year: 1984,
    title: {
      el: 'Ξενώνας Λαύκος',
      en: 'Lafkos Guesthouse: The Hospitality Revival',
    },
    body: {
      el: 'Ανοίγει ο παραδοσιακός «Ξενώνας Λαύκος», εγκαινιάζοντας τη σύγχρονη εποχή φιλοξενίας στο χωριό με σεβασμό στην αρχιτεκτονική κλίμακα. Η επιτυχία του λειτούργησε ως υπόδειγμα για τη μετέπειτα αποκατάσταση παλαιών αρχοντικών και τη μετατροπή τους σε καλαίσθητους ξενώνες. Ο Λαύκος προσανατολίστηκε στον ήπιο, ποιοτικό τουρισμό, διαφυλάσσοντας τον χαρακτήρα του.',
      en: 'The traditional Lafkos Guesthouse opens, inaugurating a thoughtful revival of local hospitality grounded in respect for traditional scales and stone architecture. Its success established a model for the subsequent careful restoration of heritage mansions into boutique lodgings. Lafkos embraced sustainable, low-impact cultural tourism while protecting its historic identity.',
    },
    kind: 'milestone',
  },
  {
    year: 2008,
    title: {
      el: 'Ένα από τα δύο μουσεία ραδιοφώνου της Ελλάδας',
      en: 'One of Greece’s Two Radio Museums',
    },
    body: {
      el: 'Στις 26 Οκτωβρίου 2008 εγκαινιάζεται από τον σύλλογο «Η Δράση» το Μουσείο Ραδιοφώνου «Αντώνης Ταβάνης – Στάθης Σφονδυλιάς», στεγασμένο σε πέτρινο αρχοντικό. Η συλλογή φιλοξενεί περίπου 130 ιστορικά ραδιόφωνα των δεκαετιών 1920–1960, στη συντριπτική τους πλειονότητα λειτουργικά, βασισμένα στη δωρεά του Γερμανού φιλέλληνα Wilfried Schoeps. Αποτελεί ένα από τα μόλις δύο μουσεία του είδους στη χώρα.',
      en: 'On October 26, 2008, the cultural association "I Drasi" inaugurates the Antonis Tavanis – Stathis Sfondylias Radio Museum in a restored stone mansion. The collection features around 130 rare vintage radio sets from the 1920s to the 1960s—the vast majority in full working order—originating from the generous donation of German philhellene Wilfried Schoeps. It is one of only two dedicated radio museums in all of Greece.',
    },
    kind: 'milestone',
  },
  {
    year: '2021 → σήμερα',
    title: {
      el: 'Η μείωση που έσωσε το χωριό',
      en: 'The Depopulation That Preserved the Village',
    },
    body: {
      el: 'Οι επίσημες απογραφές καταγράφουν τη σταδιακή μείωση των μόνιμων κατοίκων: από 629 το 1991 σε 534 το 2001, 511 το 2011 και 378 το 2021. Αυτή η δημογραφική υποχώρηση λειτούργησε παραδόξως ως προστατευτική ασπίδα για τη φυσιογνωμία του Λαύκου, αποτρέποντας την άναρχη ανοικοδόμηση και την αλλοίωση του οικισμού. Σήμερα, ο Λαύκος παραμένει ένα αυθεντικό, ζωντανό χωριό με ακέραιο τον ιστορικό του πλούτο.',
      en: 'Official census records trace a steady demographic decline: from 629 residents in 1991 to 534 in 2001, 511 in 2011, and 378 in 2021. Paradoxically, this shrinkage acted as a protective shield for Lafkos, preventing the wave of speculative construction that altered many Mediterranean villages. Today, Lafkos remains an authentic, living community whose architectural soul survives entirely intact.',
    },
    kind: 'milestone',
    stat: '629 → 378',
  },
];

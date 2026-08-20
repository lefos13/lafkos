import type { StructureBuilder } from 'sanity/structure';

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Lafkos Content Studio')
    .items([
      // Places section
      S.listItem()
        .title('Places')
        .child(
          S.list()
            .title('Places')
            .items([
              S.listItem()
                .title('All Places')
                .child(S.documentTypeList('place').title('All Places')),
              S.listItem()
                .title('Greek Places (Ελληνικά)')
                .child(
                  S.documentList()
                    .title('Ελληνικά Μέρη')
                    .filter('_type == "place" && language == "el"'),
                ),
              S.listItem()
                .title('English Places (EN)')
                .child(
                  S.documentList()
                    .title('English Places')
                    .filter('_type == "place" && language == "en"'),
                ),
              S.listItem()
                .title('Places by Category')
                .child(
                  S.list()
                    .title('Categories')
                    .items([
                      S.listItem()
                        .title('Heritage / Ιστορία')
                        .child(
                          S.documentList()
                            .title('Heritage Places')
                            .filter('_type == "place" && category == "heritage"'),
                        ),
                      S.listItem()
                        .title('Architecture / Αρχιτεκτονική')
                        .child(
                          S.documentList()
                            .title('Architecture Places')
                            .filter('_type == "place" && category == "architecture"'),
                        ),
                      S.listItem()
                        .title('Sacred / Ιεροί τόποι')
                        .child(
                          S.documentList()
                            .title('Sacred Places')
                            .filter('_type == "place" && category == "sacred"'),
                        ),
                      S.listItem()
                        .title('Nature / Φύση')
                        .child(
                          S.documentList()
                            .title('Nature Places')
                            .filter('_type == "place" && category == "nature"'),
                        ),
                      S.listItem()
                        .title('Viewpoints / Θέα')
                        .child(
                          S.documentList()
                            .title('Viewpoint Places')
                            .filter('_type == "place" && category == "viewpoint"'),
                        ),
                      S.listItem()
                        .title('Community / Καθημερινή ζωή')
                        .child(
                          S.documentList()
                            .title('Community Places')
                            .filter('_type == "place" && category == "community"'),
                        ),
                    ]),
                ),
              S.listItem()
                .title('Featured Places')
                .child(
                  S.documentList()
                    .title('Featured Places')
                    .filter('_type == "place" && featured == true'),
                ),
              S.listItem()
                .title('Seed Places (Pending Verification)')
                .child(
                  S.documentList()
                    .title('Seed Places')
                    .filter('_type == "place" && isSeed == true'),
                ),
            ]),
        ),

      // Trails section
      S.listItem()
        .title('Trails')
        .child(
          S.list()
            .title('Trails')
            .items([
              S.listItem()
                .title('All Trails')
                .child(S.documentTypeList('trail').title('All Trails')),
              S.listItem()
                .title('Greek Trails (Ελληνικά)')
                .child(
                  S.documentList()
                    .title('Ελληνικές Διαδρομές')
                    .filter('_type == "trail" && language == "el"'),
                ),
              S.listItem()
                .title('English Trails (EN)')
                .child(
                  S.documentList()
                    .title('English Trails')
                    .filter('_type == "trail" && language == "en"'),
                ),
              S.listItem()
                .title('Trails by Difficulty')
                .child(
                  S.list()
                    .title('Difficulty Levels')
                    .items([
                      S.listItem()
                        .title('Easy / Εύκολες')
                        .child(
                          S.documentList()
                            .title('Easy Trails')
                            .filter('_type == "trail" && difficulty == "easy"'),
                        ),
                      S.listItem()
                        .title('Moderate / Μέτριες')
                        .child(
                          S.documentList()
                            .title('Moderate Trails')
                            .filter('_type == "trail" && difficulty == "moderate"'),
                        ),
                      S.listItem()
                        .title('Demanding / Απαιτητικές')
                        .child(
                          S.documentList()
                            .title('Demanding Trails')
                            .filter('_type == "trail" && difficulty == "demanding"'),
                        ),
                    ]),
                ),
              S.listItem()
                .title('Featured Trails')
                .child(
                  S.documentList()
                    .title('Featured Trails')
                    .filter('_type == "trail" && featured == true'),
                ),
              S.listItem()
                .title('Seed Trails (Pending Verification)')
                .child(
                  S.documentList()
                    .title('Seed Trails')
                    .filter('_type == "trail" && isSeed == true'),
                ),
            ]),
        ),

      // Stories section
      S.listItem()
        .title('Stories')
        .child(
          S.list()
            .title('Stories')
            .items([
              S.listItem()
                .title('All Stories')
                .child(S.documentTypeList('story').title('All Stories')),
              S.listItem()
                .title('Greek Stories (Ελληνικά)')
                .child(
                  S.documentList()
                    .title('Ελληνικές Ιστορίες')
                    .filter('_type == "story" && language == "el"'),
                ),
              S.listItem()
                .title('English Stories (EN)')
                .child(
                  S.documentList()
                    .title('English Stories')
                    .filter('_type == "story" && language == "en"'),
                ),
              S.listItem()
                .title('Featured Stories')
                .child(
                  S.documentList()
                    .title('Featured Stories')
                    .filter('_type == "story" && featured == true'),
                ),
              S.listItem()
                .title('Seed Stories (Pending Verification)')
                .child(
                  S.documentList()
                    .title('Seed Stories')
                    .filter('_type == "story" && isSeed == true'),
                ),
            ]),
        ),

      // Categories section
      S.listItem().title('Categories').child(S.documentTypeList('category').title('Categories')),

      S.divider(),

      // Editorial Audit & Verification Overview
      S.listItem()
        .title('Editorial Audit & QA')
        .child(
          S.list()
            .title('Editorial Audit')
            .items([
              S.listItem()
                .title('All Seed Items (Pending Field Verification)')
                .child(
                  S.documentList()
                    .title('All Seed Content')
                    .filter('(_type in ["place", "trail", "story"]) && isSeed == true'),
                ),
              S.listItem()
                .title('All Verified Production Items')
                .child(
                  S.documentList()
                    .title('Verified Content')
                    .filter('(_type in ["place", "trail", "story"]) && isSeed == false'),
                ),
              S.listItem()
                .title('All Featured Items')
                .child(
                  S.documentList()
                    .title('Featured Content')
                    .filter('(_type in ["place", "trail", "story"]) && featured == true'),
                ),
            ]),
        ),

      S.divider(),

      // Site Settings Singleton
      S.listItem()
        .title('Site Settings')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings'),
        ),
    ]);

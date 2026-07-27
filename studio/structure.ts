import type {StructureResolver} from 'sanity/structure'

/**
 * Left-hand menu of the Studio.
 * Ordered by how often the team will actually use each thing.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Encore')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings'),
        ),
      S.divider(),
      S.documentTypeListItem('show').title('Shows & Camps'),
      S.documentTypeListItem('program').title('Programs'),
      S.documentTypeListItem('venue').title('Venues'),
      S.divider(),
      S.documentTypeListItem('blogPost').title('Blog Posts'),
      S.documentTypeListItem('page').title('Content Pages'),
      S.documentTypeListItem('formPage').title('Form Pages'),
      S.divider(),
      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('teamMember').title('Team'),
    ])

import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'page',
  title: 'Content Page',
  type: 'document',
  description: 'General pages such as About, Fees, Tolerance at Encore, or Multi Child Discount.',
  fields: [
    defineField({name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      description: 'IMPORTANT: do not change this once the page is live.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'eyebrow', title: 'Eyebrow text', type: 'string', description: 'Small line above the heading.'}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'seoDescription', title: 'Search description', type: 'text', rows: 2}),
    defineField({name: 'body', title: 'Page content', type: 'array', of: [{type: 'block'}, {type: 'image', options: {hotspot: true}}]}),
    defineField({
      name: 'noindex',
      title: 'Hide from Google?',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on for private or internal pages you do not want in search results.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})

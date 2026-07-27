import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  description: 'The six Encore programs. The age range set here is the single source of truth and appears everywhere that program is mentioned.',
  fields: [
    defineField({name: 'name', title: 'Program name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      description: 'IMPORTANT: do not change this on an existing program — it will break links and search rankings.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ageRange',
      title: 'Ages',
      type: 'string',
      description: 'One canonical range for this program, e.g. "7-11". This replaces every hand-typed age on the site.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'blurb', title: 'Short description', type: 'text', rows: 2, description: 'One or two sentences, used on cards and listings.'}),
    defineField({name: 'description', title: 'Full description', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'heroImage', title: 'Hero image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'videoId', title: 'YouTube video ID', type: 'string', description: 'Just the ID, not the full link. From youtube.com/watch?v=ABC123 enter ABC123'}),
    defineField({name: 'order', title: 'Display order', type: 'number', description: '1 through 6, controls the order programs appear in.'}),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'ageRange'}},
})

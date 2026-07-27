import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'role', title: 'Role', type: 'string'}),
    defineField({name: 'headshot', title: 'Headshot', type: 'image', options: {hotspot: true}, description: 'Square photo works best.'}),
    defineField({name: 'bio', title: 'Bio', type: 'array', of: [{type: 'block'}]}),
    defineField({name: 'order', title: 'Display order', type: 'number'}),
    defineField({name: 'showOnSite', title: 'Show on the website?', type: 'boolean', initialValue: true}),
  ],
  orderings: [{title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'role', media: 'headshot'}},
})

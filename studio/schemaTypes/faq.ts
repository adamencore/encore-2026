import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  description: 'Questions and answers. These appear on pages AND feed the Ask Encore helper, so the two can never disagree.',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'answer', title: 'Answer', type: 'array', of: [{type: 'block'}], validation: (Rule) => Rule.required()}),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: ['Auditions', 'Tickets', 'Fees & scholarships', 'Venue & parking', 'Programs', 'Accessibility', 'General']},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'relatedShow', title: 'About a specific show?', type: 'reference', to: [{type: 'show'}], description: 'Leave blank for general questions.'}),
    defineField({name: 'showInAskEncore', title: 'Use in Ask Encore?', type: 'boolean', initialValue: true}),
    defineField({name: 'order', title: 'Display order', type: 'number'}),
  ],
  preview: {select: {title: 'question', subtitle: 'category'}},
})

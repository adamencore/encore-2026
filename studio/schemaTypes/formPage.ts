import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'formPage',
  title: 'Form Page',
  type: 'document',
  description: 'Pages whose main purpose is an Elfsight form — registrations, feedback surveys, applications.',
  fields: [
    defineField({name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'intro', title: 'Intro text', type: 'array', of: [{type: 'block'}], description: 'Shown above the form.'}),
    defineField({
      name: 'elfsightAppId',
      title: 'Elfsight form ID',
      type: 'string',
      description: 'The ID only. From the embed code, copy just the part after "elfsight-app-".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from Google?',
      type: 'boolean',
      initialValue: true,
      description: 'Registration pages are normally hidden from search results.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})

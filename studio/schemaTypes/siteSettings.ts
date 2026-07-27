import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  description: 'Settings that appear on every page of the site.',
  fields: [
    defineField({
      name: 'announcementEnabled',
      title: 'Show the announcement bar?',
      type: 'boolean',
      description: 'The purple strip at the very top of every page. Turn off to hide it site-wide.',
      initialValue: true,
    }),
    defineField({
      name: 'announcementText',
      title: 'Announcement text',
      type: 'string',
      description: 'Keep it short — it must fit on one line on a phone. Example: "Aspire: Traditions auditions — Thursday, July 30"',
      validation: (Rule) => Rule.max(70).warning('Long text will be cut off on phones.'),
    }),
    defineField({
      name: 'announcementLink',
      title: 'Announcement link',
      type: 'string',
      description: 'Where the bar links to. Start with a slash, e.g. /aspire-traditions',
    }),
    defineField({name: 'contactEmail', title: 'Contact email', type: 'string'}),
    defineField({name: 'phone', title: 'Phone number', type: 'string'}),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social sharing image',
      type: 'image',
      description: 'Used when a page has no image of its own. 1200x630 works best.',
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site Settings'}),
  },
})

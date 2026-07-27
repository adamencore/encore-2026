import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  description: 'Places where auditions, rehearsals, and performances happen. Enter each venue once — every show links to it, so an address only ever needs correcting in one place.',
  fields: [
    defineField({
      name: 'name',
      title: 'Venue name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortName',
      title: 'Short name',
      type: 'string',
      description: 'Used in tight spaces like calendar entries. Example: "Electric Theater"',
    }),
    defineField({name: 'address', title: 'Street address', type: 'string'}),
    defineField({name: 'city', title: 'City, State ZIP', type: 'string', initialValue: 'St. George, UT 84770'}),
    defineField({
      name: 'parkingNotes',
      title: 'Parking notes',
      type: 'text',
      rows: 2,
      description: 'Shown to families on venue and audition pages.',
    }),
    defineField({name: 'mapUrl', title: 'Google Maps link', type: 'url'}),
  ],
  preview: {select: {title: 'name', subtitle: 'address'}},
})

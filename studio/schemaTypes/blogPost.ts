import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Page address',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      description: 'CRITICAL: never change this on an existing post. These addresses carry years of Google ranking and were preserved from the old site.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'publishedAt', title: 'Published date', type: 'date', validation: (Rule) => Rule.required()}),
    defineField({name: 'author', title: 'Author', type: 'string'}),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: ['Community', 'Productions', 'Programs', 'Education', 'News']},
    }),
    defineField({name: 'featuredImage', title: 'Featured image', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'seoDescription',
      title: 'Search description',
      type: 'text',
      rows: 2,
      description: 'Shown in Google results. Aim for 150-160 characters.',
      validation: (Rule) => Rule.max(200).warning('Google usually cuts off around 160 characters.'),
    }),
    defineField({name: 'body', title: 'Post', type: 'array', of: [{type: 'block'}, {type: 'image', options: {hotspot: true}}]}),
    defineField({
      name: 'gallery',
      title: 'Photo gallery',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      description: 'Appears as a grid at the end of the post.',
    }),
  ],
  orderings: [{title: 'Newest first', name: 'dateDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'featuredImage'}},
})

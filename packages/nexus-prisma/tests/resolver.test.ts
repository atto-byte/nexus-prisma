import { generateDefaultResolver } from '../src/resolver'
import { TypesMap } from '../src/source-helper'
import { prisma } from './prisma/prisma-client'
const allTypes = require('./prisma/types.json') as TypesMap

const getField = (typeName: string, fieldName: string) => {
  return allTypes.types[typeName].fields.find(f => f.name === fieldName)!
}

const getData = async (
  typeName: string,
  fieldName: string,
  root: Record<string, any> = {},
  args: Record<string, any> = {},
) => {
  const field = getField(typeName, fieldName)
  const resolver = generateDefaultResolver(typeName, field, 'prisma')

  return resolver(root, args, { prisma }, {} as any)
}

test('Top-level Query.posts', async () => {
  const result = await getData('Query', 'posts')

  if (result.length) {
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('published')
    expect(result[0]).toHaveProperty('content')
    expect(result[0]).toHaveProperty('title')
  } else {
    expect(result).toBe([])
  }
})

test('TopLevel Query.post', async () => {
  const result = await getData('Query', 'post', {}, { where: { id: '' } })

  expect(result).toBe(null)
})

test('Top-level Mutation.createPost', async () => {
  try {
    await getData(
      'Mutation',
      'createPost',
      {},
      {
        data: {
          title: 'post_1',
          content: 'content',
          author: { connect: { id: '' } },
        },
      },
    )
  } catch (e) {
    expect(e.message).toEqual(
      'No Node for the model User with value  for id found.',
    )
  }
})

test('Top-level Mutation.deletePost', async () => {
  try {
    await getData(
      'Mutation',
      'deletePost',
      {},
      {
        where: { id: '' },
      },
    )
  } catch (e) {
    expect(e.message).toEqual(
      'No Node for the model Post with value  for id found.',
    )
  }
})

test('Children Post.author', async () => {
  const result = await getData('Post', 'author', {
    id: '',
  })

  expect(result).toBe(null)
})

import { describe, expect, it, vi, type Mock } from 'vitest'

// server-only throws when imported outside a Server Component — mock it for jsdom
vi.mock('server-only', () => ({}))

// mock db — intercept drizzle chain: insert().values().returning()
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(),
  },
}))

import { db } from '@/db'

import { createPost } from './create-post'

const mockInsert = db.insert as Mock

function makeMockChain(result: unknown[]) {
  const mockReturning = vi.fn().mockResolvedValue(result)
  const mockValues = vi.fn().mockReturnValue({ returning: mockReturning })
  mockInsert.mockReturnValueOnce({ values: mockValues })
  return { mockValues, mockReturning }
}

describe('createPost', () => {
  it('inserts a post and returns the created record', async () => {
    const fakePost = {
      id: 'fake-id',
      authorId: 'user-1',
      title: 'Hello',
      content: 'World',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    makeMockChain([fakePost])

    const result = await createPost('user-1', { title: 'Hello', content: 'World' })

    expect(result).toEqual(fakePost)
  })

  it('passes authorId and input fields to db.insert', async () => {
    const { mockValues } = makeMockChain([
      {
        id: 'x',
        authorId: 'user-2',
        title: 'T',
        content: 'C',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    await createPost('user-2', { title: 'T', content: 'C' })

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ authorId: 'user-2', title: 'T', content: 'C' }),
    )
  })

  it('generates a unique id for each post', async () => {
    const { mockValues: firstValues } = makeMockChain([
      {
        id: 'a',
        authorId: 'u',
        title: 'T',
        content: 'C',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    const { mockValues: secondValues } = makeMockChain([
      {
        id: 'b',
        authorId: 'u',
        title: 'T',
        content: 'C',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    await createPost('u', { title: 'T', content: 'C' })
    await createPost('u', { title: 'T', content: 'C' })

    const firstId = (firstValues.mock.calls[0] as [{ id: string }])[0].id
    const secondId = (secondValues.mock.calls[0] as [{ id: string }])[0].id
    expect(firstId).not.toBe(secondId)
  })
})

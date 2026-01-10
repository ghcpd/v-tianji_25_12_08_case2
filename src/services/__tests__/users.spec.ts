import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { userService, apiClient } from '../api'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(apiClient)
})

afterEach(() => {
  mock.restore()
})

describe('userService', () => {
  it('maps API snake_case created_at and profile fields into canonical User', async () => {
    const apiUser = {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
      created_at: '2025-01-01T12:00:00Z',
      status: 'enabled',
      profile: {
        avatar_url: 'https://example.com/a.png',
        dept: 'Engineering',
        city: 'Seattle'
      }
    }

    mock.onGet('/api/v1/users').reply(200, [apiUser])

    const users = await userService.getUsers()

    expect(users).toHaveLength(1)
    const u = users[0]
    expect(u.createdAt).toBe('2025-01-01T12:00:00Z')
    expect(u.status).toBe('active')
    expect(u.profile.avatar).toBe('https://example.com/a.png')
    expect(u.profile.department).toBe('Engineering')
    expect(u.profile.location).toBe('Seattle')
  })

  it('handles singular user response object and maps fields for getUserById', async () => {
    const apiUser = {
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
      role: 'user',
      created_at: '2025-02-01T12:00:00Z',
      enabled: false,
      avatar: 'https://example.com/b.png'
    }

    mock.onGet('/api/v1/users/2').reply(200, apiUser)

    const u = await userService.getUserById(2)

    expect(u.id).toBe(2)
    expect(u.createdAt).toBe('2025-02-01T12:00:00Z')
    expect(u.status).toBe('inactive')
    expect(u.profile.avatar).toBe('https://example.com/b.png')
  })
})

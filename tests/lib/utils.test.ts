import { cn, formatDate, truncateText, isValidEmail } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
    })

    it('handles conflicting Tailwind classes', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('January 15, 2024')
    })

    it('handles string dates', () => {
      expect(formatDate('2024-01-15')).toBe('January 15, 2024')
    })
  })

  describe('truncateText', () => {
    it('returns text unchanged if shorter than max length', () => {
      expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('truncates text and adds ellipsis if longer than max length', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
    })
  })

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('returns false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })
})
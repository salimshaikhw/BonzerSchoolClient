import { blankToUndefined, formatDate, nameLookup } from './format';

describe('format helpers', () => {
  it('formats date-only strings without a timezone shift', () => {
    expect(formatDate('2026-06-01')).toBe('01 Jun 2026');
  });

  it('shows a dash for empty or invalid dates', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('not-a-date')).toBe('-');
  });

  it('turns blank strings into undefined', () => {
    expect(blankToUndefined('  ')).toBeUndefined();
    expect(blankToUndefined(' x ')).toBe('x');
  });

  it('looks names up by id', () => {
    const name = nameLookup([{ id: 'a', n: 'Alpha' }], (i) => i.n);
    expect(name('a')).toBe('Alpha');
    expect(name('missing')).toBe('-');
    expect(name(null)).toBe('-');
  });
});

const { getRandomPrefix, possible } = require('./utils');

describe('getRandomPrefix', () => {
  test('should generate a prefix with a random length between 1 and 10', () => {
    const prefix = getRandomPrefix();
    expect(prefix.length).toBeGreaterThanOrEqual(1);
    expect(prefix.length).toBeLessThanOrEqual(10);
  });

  test('should only contain characters from the possible set', () => {
    const prefix = getRandomPrefix();
    for (let i = 0; i < prefix.length; i++) {
      expect(possible.includes(prefix.charAt(i))).toBe(true);
    }
  });
});

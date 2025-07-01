import {
  isAdult,
  isValidFrenchPostalCode,
  isValidEmail,
  isValidName,
  isValidPassword,
  isNotEmpty
} from '../module.js';

describe('module.js validation functions', () => {
  test('isAdult returns true for 18+ and false for <18', () => {
    const now = new Date();
    const adultDate = `${now.getFullYear() - 20}-01-01`;
    const childDate = `${now.getFullYear() - 10}-01-01`;
    expect(isAdult(adultDate)).toBe(true);
    expect(isAdult(childDate)).toBe(false);
  });

  test('isValidFrenchPostalCode only accepts 5 digits', () => {
    expect(isValidFrenchPostalCode('75000')).toBe(true);
    expect(isValidFrenchPostalCode('1234')).toBe(false);
    expect(isValidFrenchPostalCode('ABCDE')).toBe(false);
    expect(isValidFrenchPostalCode('7500A')).toBe(false);
  });

  test('isValidEmail basic email validation', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('test.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('isValidName accepts valid names and rejects invalid', () => {
    expect(isValidName('Jean')).toBe(true);
    expect(isValidName("O'Neil")).toBe(true);
    expect(isValidName('A')).toBe(false);
    expect(isValidName('123')).toBe(false);
  });

  test('isValidPassword checks length >= 6', () => {
    expect(isValidPassword('abcdef')).toBe(true);
    expect(isValidPassword('abc')).toBe(false);
    expect(isValidPassword('')).toBe(false);
  });

  test('isNotEmpty returns true for non-empty strings', () => {
    expect(isNotEmpty('abc')).toBe(true);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty('')).toBe(false);
  });
});

import {
    isValidName,
    isValidSurname,
    isValidEmail,
    isValidCity,
    isValidPostalCode,
    calculateAge
} from './module';

describe('Validation functions', () => {
    test('isValidName', () => {
        expect(isValidName({name: 'Jean'})).toBe(true);
        expect(isValidName({name: 'Élodie'})).toBe(true);
        expect(isValidName({name: ''})).toBe(false);
        expect(isValidName({name: 'A'})).toBe(false);
        expect(isValidName({name: '123'})).toBe(false);
    });

    test('isValidSurname', () => {
        expect(isValidSurname({surname: 'Dupont'})).toBe(true);
        expect(isValidSurname({surname: 'A'})).toBe(false);
        expect(isValidSurname({surname: ''})).toBe(false);
    });

    test('isValidEmail', () => {
        expect(isValidEmail({email: 'test@mail.com'})).toBe(true);
        expect(isValidEmail({email: 'badmail'})).toBe(false);
    });

    test('isValidCity', () => {
        expect(isValidCity({city: 'Paris'})).toBe(true);
        expect(isValidCity({city: ''})).toBe(false);
        expect(isValidCity({city: 'A'})).toBe(false);
    });

    test('isValidPostalCode', () => {
        expect(isValidPostalCode({postalCode: '75001'})).toBe(true);
        expect(isValidPostalCode({postalCode: '00123'})).toBe(false);
        expect(isValidPostalCode({postalCode: 'ABCDE'})).toBe(false);
        expect(isValidPostalCode({postalCode: '1234'})).toBe(false);
        expect(isValidPostalCode({postalCode: '99999'})).toBe(true);
    });

    test('calculateAge', () => {
        const now = new Date();
        const adult = new Date(now.getFullYear() - 20, now.getMonth(), now.getDate()).toISOString().slice(0,10);
        const child = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()).toISOString().slice(0,10);
        expect(calculateAge({birthDate: adult})).toBeGreaterThanOrEqual(18);
        expect(calculateAge({birthDate: child})).toBeLessThan(18);
        expect(calculateAge({birthDate: ''})).toBe(0);
        expect(calculateAge({birthDate: 'notadate'})).toBe(0);
    });
});
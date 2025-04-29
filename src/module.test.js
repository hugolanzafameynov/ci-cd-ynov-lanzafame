import {calculateAge, isValidEmail, isValidName, isValidSurname, isValidCity, isValidPostalCode} from "./module"

describe('isValidName', () => {
    test('valid names', () => {
        expect(isValidName({ name: 'Jean' })).toBe(true);
        expect(isValidName({ name: 'Jean-Pierre' })).toBe(true);
        expect(isValidName({ name: "D'Artagnan" })).toBe(true);
    });

    test('invalid names', () => {
        expect(isValidName({ name: 'Jean123' })).toBe(false);
        expect(isValidName({ name: '' })).toBe(false);
    });

    test('throws if param is invalid', () => {
        expect(() => isValidName(null)).toThrowError('paramètre invalide pour isValidName');
        expect(() => isValidName({})).toThrowError('paramètre invalide pour isValidName');
        expect(() => isValidName({ name: 123 })).toThrowError('paramètre invalide pour isValidName');
    });
});

describe('isValidSurname', () => {
    test('valid surnames', () => {
        expect(isValidSurname({ name: 'Jean' })).toBe(true);
        expect(isValidSurname({ name: 'Jean-Pierre' })).toBe(true);
        expect(isValidSurname({ name: "D'Artagnan" })).toBe(true);
    });

    test('invalid surnames', () => {
        expect(isValidSurname({ name: 'Jean123' })).toBe(false);
        expect(isValidSurname({ name: '' })).toBe(false);
    });

    test('throws if param is invalid', () => {
        expect(() => isValidSurname(null)).toThrowError('paramètre invalide pour isValidSurname');
        expect(() => isValidSurname({})).toThrowError('paramètre invalide pour isValidSurname');
        expect(() => isValidSurname({ name: 123 })).toThrowError('paramètre invalide pour isValidSurname');
    });
});

describe('isValidEmail', () => {
    test('valid emails', () => {
        expect(isValidEmail({ email: 'test@example.com' })).toBe(true);
    });

    test('invalid emails', () => {
        expect(isValidEmail({ email: 'testexample.com' })).toBe(false);
        expect(isValidEmail({ email: 'test@' })).toBe(false);
    });

    test('throws if param is invalid', () => {
        expect(() => isValidEmail(null)).toThrowError('paramètre invalide pour isValidEmail');
        expect(() => isValidEmail({})).toThrowError('paramètre invalide pour isValidEmail');
        expect(() => isValidEmail({ email: 123 })).toThrowError('paramètre invalide pour isValidEmail');
    });
});

describe('isValidCity', () => {
    test('valid city', () => {
        expect(isValidSurname({ name: 'Jean' })).toBe(true);
        expect(isValidSurname({ name: 'Jean-Pierre' })).toBe(true);
        expect(isValidSurname({ name: "D'Artagnan" })).toBe(true);
    });

    test('invalid city', () => {
        expect(isValidSurname({ name: 'Jean123' })).toBe(false);
        expect(isValidSurname({ name: '' })).toBe(false);
    });

    test('throws if param is invalid', () => {
        expect(() => isValidSurname(null)).toThrowError('paramètre invalide pour isValidCity');
        expect(() => isValidSurname({})).toThrowError('paramètre invalide pour isValidCity');
        expect(() => isValidSurname({ name: 123 })).toThrowError('paramètre invalide pour isValidCity');
    });
});

describe('isValidPostalCode', () => {
    test('valid postal code', () => {
        expect(isValidPostalCode({ postalCode: '75000' })).toBe(true);
    });

    test('invalid postal code', () => {
        expect(isValidPostalCode({ postalCode: '7500' })).toBe(false);
        expect(isValidPostalCode({ postalCode: '750001' })).toBe(false);
        expect(isValidPostalCode({ postalCode: 'ABCDE' })).toBe(false);
    });

    test('throws if param is invalid', () => {
        expect(() => isValidPostalCode(null)).toThrowError('paramètre invalide pour isValidPostalCode');
        expect(() => isValidPostalCode({})).toThrowError('paramètre invalide pour isValidPostalCode');
        expect(() => isValidPostalCode({ postalCode: 75000 })).toThrowError('paramètre invalide pour isValidPostalCode');
    });
});

let people20years;
beforeEach(() => {
    let date = new Date();
    people20years = {
        birth: new Date(date.setFullYear(date.getFullYear() - 20))
    };
})

describe('calculateAge', () => {
    it('should return a correct age', () => {
        expect(calculateAge(people20years)).toEqual(20);
    });

    it('should throw a "missing param p" error', () => {
        expect(() => calculateAge()).toThrow("missing param p");
    });

    it('should throw an error if param is not an object', () => {
        expect(() => calculateAge("not an object")).toThrow("param p must be an object");
        expect(() => calculateAge(42)).toThrow("param p must be an object");
        expect(() => calculateAge([])).toThrow("param p must be an object");
    });

    it('should throw an error if birth property is missing', () => {
        expect(() => calculateAge({})).toThrow("missing birth property in param p");
    });

    it('should throw an error if birth is not a Date', () => {
        expect(() => calculateAge({birth: "1990-01-01"})).toThrow("birth must be a Date");
        expect(() => calculateAge({birth: 123456789})).toThrow("birth must be a Date");
    });

    it('should work next year without modifying the test', () => {
        const currentYear = new Date().getFullYear();
        const birth = new Date(currentYear - 20, 0, 1);
        const person = { birth };
        const expectedAge = new Date().getFullYear() - birth.getFullYear();
        expect(calculateAge(person)).toBe(expectedAge);
    });
});

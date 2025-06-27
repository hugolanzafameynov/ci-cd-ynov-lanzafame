/**
 * Check if the name is valid.
 *
 * @param p
 * @return {boolean}
 */
export function isValidName({name}) {
    return typeof name === 'string' && /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]{2,}$/.test(name.trim());
}

/**
 * Check if the surname is valid.
 *
 * @param p
 * @return {boolean}
 */
export function isValidSurname({surname}) {
    return typeof surname === 'string' && /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]{2,}$/.test(surname.trim());
}

/**
 * Check if the email is valid.
 *
 * @param p
 * @return {boolean}
 */
export function isValidEmail({email}) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Check if the city is valid.
 *
 * @param p
 * @return {boolean}
 */
export function isValidCity({city}) {
    return typeof city === 'string' && city.trim().length > 1;
}

/**
 * Check if the postal code is valid.
 *
 * @param p
 * @return {boolean}
 */
export function isValidPostalCode({postalCode}) {
    return typeof postalCode === 'string' && /^[0-9]{5}$/.test(postalCode) && parseInt(postalCode, 10) >= 1000 && parseInt(postalCode, 10) <= 99999;
}

/**
 * Calculate a person's age in years.
 *
 * @param {object} p An object representing a person, implementing a birth Date parameter.
 * @return {number} The age in years of p.
 */
export function calculateAge({birthDate}) {
    if (!birthDate || isNaN(new Date(birthDate).getTime())) return 0;
    const now = new Date();
    const dob = new Date(birthDate);
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}
/**
 * Check if the name is valid.
 *
 * @param p
 * @return {boolean}
 */
function isValidName(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.name !== 'string') {
        throw new Error("paramètre invalide pour isValidName");
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/.test(p.name.trim());
}

/**
 * Check if the surname is valid.
 *
 * @param p
 * @return {boolean}
 */
function isValidSurname(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.surname !== 'string') {
        throw new Error("paramètre invalide pour isValidSurname");
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/.test(p.surname.trim());
}

/**
 * Check if the email is valid.
 *
 * @param p
 * @return {boolean}
 */
function isValidEmail(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.email !== 'string') {
        throw new Error("paramètre invalide pour isValidEmail");
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim());
}

/**
 * Check if the city is valid.
 *
 * @param p
 * @return {boolean}
 */
function isValidCity(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.city !== 'string') {
        throw new Error("paramètre invalide pour isValidCity");
    }

    return /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/.test(p.city.trim());
}

/**
 * Check if the postal code is valid.
 *
 * @param p
 * @return {boolean}
 */
function isValidPostalCode(p) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.postalCode !== 'string') {
        throw new Error("paramètre invalide pour isValidPostalCode");
    }

    return /^[0-9]{5}$/.test(p.postalCode.trim());
}

/**
 * Calculate a person's age in years.
 *
 * @param {object} p An object representing a person, implementing a birth Date parameter.
 * @return {number} The age in years of p.
 */
function calculateAge(p) {
    if (!p) {
        throw new Error("missing param p")
    }

    if (typeof p !== 'object' || Array.isArray(p)) {
        throw new Error("param p must be an object");
    }

    if (!('birthDate' in p)) {
        throw new Error("missing birth property in param p");
    }

    if (!(p.birthDate instanceof Date)) {
        throw new Error("birth must be a Date");
    }

    let dateDiff = new Date(Date.now() - p.birthDate.getTime())
    let age = Math.abs(dateDiff.getUTCFullYear() - 1970);

    return age;
}

export {isValidName, isValidSurname, isValidEmail, isValidCity, isValidPostalCode, calculateAge}
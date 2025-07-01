export function isAdult(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18;
}

export function isValidFrenchPostalCode(postalCode) {
  return /^\d{5}$/.test(postalCode);
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidName(name) {
  return /^[A-Za-zÀ-ÿ' -]{2,}$/.test(name);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function isNotEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

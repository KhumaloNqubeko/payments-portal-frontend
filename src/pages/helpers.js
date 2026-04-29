export const validationPatterns = {
  fullName: /^[A-Za-z' -]{2,100}$/,
  username: /^[A-Za-z0-9._]{3,30}$/,
  southAfricanIdNumber: /^\d{13}$/,
  accountNumber: /^\d{8,12}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/,
  beneficiaryName: /^[A-Za-z0-9'.,&()\-\/ ]{2,100}$/,
  beneficiaryAccountNumber: /^[A-Z0-9]{8,34}$/,
  swiftCode: /^[A-Z0-9]{8}([A-Z0-9]{3})?$/
};

export function validateCustomerRegistration(form) {
  const errors = {};

  if (!validationPatterns.fullName.test(form.fullName)) {
    errors.fullName = "Use letters, spaces, apostrophes or hyphens only.";
  }
  if (!validationPatterns.username.test(form.username)) {
    errors.username = "Use 3-30 safe characters: letters, digits, underscore or dot.";
  }
  if (!validationPatterns.southAfricanIdNumber.test(form.southAfricanIdNumber)) {
    errors.southAfricanIdNumber = "South African ID number must be exactly 13 digits.";
  }
  if (!validationPatterns.accountNumber.test(form.accountNumber)) {
    errors.accountNumber = "Account number must be 8-12 digits.";
  }
  if (!validationPatterns.password.test(form.password)) {
    errors.password = "Password must be at least 12 characters with upper, lower, digit and special character.";
  }

  return errors;
}

export function validatePayment(form) {
  const errors = {};

  if (!(Number(form.amount) > 0)) {
    errors.amount = "Amount must be greater than 0.";
  }
  if (!["ZAR", "USD", "EUR", "GBP"].includes(form.currency)) {
    errors.currency = "Choose a supported currency.";
  }
  if (!["SWIFT"].includes(form.provider)) {
    errors.provider = "Choose a supported provider.";
  }
  if (!validationPatterns.beneficiaryName.test(form.beneficiaryName)) {
    errors.beneficiaryName = "Beneficiary name contains invalid characters.";
  }
  if (!validationPatterns.beneficiaryAccountNumber.test(form.beneficiaryAccountNumber)) {
    errors.beneficiaryAccountNumber = "Beneficiary account number is invalid.";
  }
  if (!validationPatterns.swiftCode.test(form.swiftCode)) {
    errors.swiftCode = "SWIFT/BIC must be 8 or 11 uppercase letters or digits.";
  }

  return errors;
}

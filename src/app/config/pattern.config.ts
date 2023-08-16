export const NUMERO_FACTURE = '^([f|F|G|g]{1})?[0-9]{1,10}$';
export const ALPHA_NUMERIC = '^$|^[A-Za-zÀ-ÿ0-9]+';
export const IMMAT = '^$|^[A-Za-z0-9. , -- ]+';
export const MOBILE_PATTERN =
  /^(?!^0+$)((00|\+)[1-9]{2,3}|0)[0-9]([-. ]?[0-9]{2}){4}$/;
export const POSITIVE_INTEGER = '^[0-9]+$';
export const DECIMAL_NUMBER = '^[0-9]+(\\.[0-9])?$';
export const EMAIL_PATTERN =
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-zA-Z]{2,7}$/;
export const CODE_PRESTATION = '^(OB|CV|VC|CC|VP|VT|DI)[a-zA-ZÀ-ÿ0-9]{3}$';
export const SIV_FNI_REGEX: RegExp = new RegExp(
  /(^(([0-9]{1,3}[ ][A-Z]{3})|([0-9]{1,4}[ ][A-Z]{2}))[ ]([0-9]{2,3}|2A|2B)$)|(^[A-Z]{2}[-][0-9]{3}[-][A-Z]{2}$)/
);
export const SIV_PATTERN_REGEX: RegExp = new RegExp(
  /(^([A-Z]{2}-[0-9]{3}-[A-Z]{2})$)/
);
export const FNI_PATTERN_REGEX: RegExp = new RegExp(
  /^(([0-9]{1,3}[ ][A-Z]{3})|([0-9]{1,4}[ ][A-Z]{2}))[ ]([0-9]{2,3}|2A|2B)$/
);
export const NUMBER_LIASSE_PATTERN = (typeCentre: string) =>
  typeCentre === 'Autosur' ? /^[1-9][0-9]{8}$/ : /(^(?!000)[0-9]{3})[0-9]{6}$/;

export const AGREMENT_CONTROLEUR_PATTERN = /[A-B0-9]{3}(C|D|F|S|T|V|Z)[0-9]{4}/;
export const AGREMENT_CENTRE_PATTERN =
  /(A|S)[A-B0-9]{3}(C|D|F|S|T|V|Z)[0-9]{3}/;

/**
 * Check if the provided agreement code is a valid Controleur code
 * @param {string} agrement - The agreement code to validate
 * @return {boolean} - Returns true if the code is a valid Controleur code, false otherwise
 */
export const isControleur = (agrement: string) =>
  AGREMENT_CONTROLEUR_PATTERN.test(agrement);

/**
 * Check if the provided agreement code is a valid Centre code
 * @param {string} agrement - The agreement code to validate
 * @return {boolean} - Returns true if the code is a valid Centre code, false otherwise
 */
export const isCentre = (agrement: string) =>
  AGREMENT_CENTRE_PATTERN.test(agrement);

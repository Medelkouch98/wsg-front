import { ISivFniFormat } from '@app/models';

export class SivFniFormatHelper {
  /**
   *
   * validation de l'immatriculation selon le type (SIV ou FNI )
   * @param immatriculation string
   * @return ISivFniFormat
   */
  static validate(immatriculation: string): ISivFniFormat {
    let searchedItemRegex;
    let searchedItemRegex1;
    let searchedItem = immatriculation?.toUpperCase();

    /*remove - and spaces */
    searchedItem = searchedItem
      ?.replace(new RegExp('-', 'g'), '')
      ?.replace(new RegExp(' ', 'g'), '');
    /*le premier caractère d'un siv doit etre un caractère */
    if (isNaN(parseInt(searchedItem?.charAt(0), 10))) {
      /*la longueur de la chaine d'un siv  est 7 */
      if (searchedItem.length === 7) {
        /*tester sur la chaine si elle est correspondante à 2 lettres, 3 chiffres  et 2 lettres*/
        searchedItemRegex = new RegExp('^[a-zA-Z]{2}[0-9]{3}[a-zA-Z]{2}$');
        /*si le test est true*/
        if (searchedItemRegex.test(searchedItem)) {
          searchedItem =
            searchedItem.substring(0, 2) +
            '-' +
            searchedItem.substring(2, 5) +
            '-' +
            searchedItem.substring(5, 9);
          return { immat: searchedItem };
        }
      }
    } else {
      /*tester sur la chaine si elle est correspondante à 3 ou 4 chiffres, 2 ou 3 Lettres,  2 chiffres ou 2A ou 2B*/
      const formatFniRegex = /^[0-9]{3,4}[A-Z]{2,3}(2[^C-Z]|[0-9]{2})$/;
      if (formatFniRegex.test(searchedItem)) {
        // si le format fni contient juste 3 chiffres au début
        if (/^\d{3}[A-Z]/.test(searchedItem)) {
          // si le format fni contient juste 3 lettres au milieu
          if (isNaN(Number(searchedItem.substr(5, 1)))) {
            return {
              immat:
                searchedItem.substr(0, 3) +
                ' ' +
                searchedItem.substr(3, 3) +
                ' ' +
                searchedItem.substr(6, searchedItem.length - 6),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 3) +
                ' ' +
                searchedItem.substr(3, 2) +
                ' ' +
                searchedItem.substr(5, searchedItem.length - 5),
            };
          }
          // sinon si le format fni contient juste 4 chiffres au début
        } else if (/^\d{4}[A-Z]/.test(searchedItem)) {
          // si le format fni contient juste 3 lettres au milieu
          if (isNaN(Number(searchedItem.substr(6, 1)))) {
            return {
              immat:
                searchedItem.substr(0, 4) +
                ' ' +
                searchedItem.substr(4, 3) +
                ' ' +
                searchedItem.substr(7, searchedItem.length - 7),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 4) +
                ' ' +
                searchedItem.substr(4, 2) +
                ' ' +
                searchedItem.substr(6, searchedItem.length - 6),
            };
          }
        }
      }
      /*tester sur la chaine si elle est correspondante à 1AA01 à 9999ZZ999*/
      searchedItemRegex1 = /^([0-9]{1,4}[a-zA-Z]{2,3}[0-9]{2,3})$/;
      /*si le test est true*/
      if (searchedItemRegex1.test(searchedItem)) {
        // si le format fni contient juste 1 chiffre au début
        if (/^[0-9][a-zA-Z]/.test(searchedItem)) {
          if (isNaN(Number(searchedItem.substr(3, 1)))) {
            // si le format fni contient juste 3 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 1) +
                ' ' +
                searchedItem.substr(1, 3) +
                ' ' +
                searchedItem.substr(4, searchedItem.length - 4),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 1) +
                ' ' +
                searchedItem.substr(1, 2) +
                ' ' +
                searchedItem.substr(3, searchedItem.length - 3),
            };
          }
        } else if (/^[0-9]{2}[a-zA-Z]/.test(searchedItem)) {
          // si le format fni contient juste 2 chiffres au début
          if (isNaN(Number(searchedItem.substr(4, 1)))) {
            // si le format fni contient juste 3 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 2) +
                ' ' +
                searchedItem.substr(2, 3) +
                ' ' +
                searchedItem.substr(5, searchedItem.length - 5),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 2) +
                ' ' +
                searchedItem.substr(2, 2) +
                ' ' +
                searchedItem.substr(4, searchedItem.length - 4),
            };
          }
        } else if (/^[0-9]{3}[a-zA-Z]/.test(searchedItem)) {
          // si le format fni contient juste 3 chiffres au début
          if (isNaN(Number(searchedItem.substr(5, 1)))) {
            // si le format fni contient juste 3 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 3) +
                ' ' +
                searchedItem.substr(3, 3) +
                ' ' +
                searchedItem.substr(6, searchedItem.length - 6),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 3) +
                ' ' +
                searchedItem.substr(3, 2) +
                ' ' +
                searchedItem.substr(5, searchedItem.length - 5),
            };
          }
        } else if (/^[0-9]{4}[a-zA-Z]/.test(searchedItem)) {
          // si le format fni contient juste 4 chiffres au début
          if (isNaN(Number(searchedItem.substr(6, 1)))) {
            // si le format fni contient juste 3 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 4) +
                ' ' +
                searchedItem.substr(4, 3) +
                ' ' +
                searchedItem.substr(7, searchedItem.length - 7),
            };
          } else {
            // si le format fni contient juste 2 lettres au milieu
            return {
              immat:
                searchedItem.substr(0, 4) +
                ' ' +
                searchedItem.substr(4, 2) +
                ' ' +
                searchedItem.substr(6, searchedItem.length - 6),
            };
          }
        }
        return { immat: searchedItem };
      }
    }
    return { format: 'Format non adéquat', immat: immatriculation };
  }
}

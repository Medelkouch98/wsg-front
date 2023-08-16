import { CRYPT_KEY } from '@app/config';
import { Injectable } from '@angular/core';
import * as CryptoTS from 'crypto-ts';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public static setItem(key: string, text: any): void {
    try {
      text = JSON.stringify(text);
      text = CryptoTS.AES.encrypt(text, CRYPT_KEY).toString();
      localStorage.setItem(key, text);
    } catch (error) {
      localStorage.setItem(key, '');
    }
  }

  public static getItem(key: string): any {
    let text: string;
    try {
      text = localStorage.getItem(key);
      text = CryptoTS.AES.decrypt(text, CRYPT_KEY).toString(CryptoTS.enc.Utf8);
      text = JSON.parse(text);
    } catch (error) {
      text = null;
    }
    return text;
  }

  public static clear(): void {
    localStorage.clear();
  }

  public static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

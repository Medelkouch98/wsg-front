import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'byteSize', standalone: true})
export class ByteSizePipe implements PipeTransform {
  /**
   * retourne la taille en bytes
   * @param size number
   * @param unit FileSizes
   * @return number
   */
  transform(size: number, unit: FileSizeUnits): number {
    return unit * size;
  }
}

/**
 * prend la taille en bytes et affiche le text correspondant
 * @example 2048 => 2 KB, 6291456 => 6 MB
 * @param {number} size
 * @returns {string}
 */
export const byteSizeToString = (size: number): string => {
  if (size < FileSizeUnits.KILOBYTE) {
    return size + ' bytes';
  } else if (size < FileSizeUnits.MEGABYTE) {
    return size / FileSizeUnits.KILOBYTE + ' KB';
  } else if (size < FileSizeUnits.GIGABYTE) {
    return size / FileSizeUnits.MEGABYTE + ' MB';
  } else {
    return size / FileSizeUnits.GIGABYTE + ' GB';
  }
};

export enum FileSizeUnits {
  GIGABYTE = Math.pow(1024, 3),
  MEGABYTE = Math.pow(1024, 2),
  KILOBYTE = 1024,
}

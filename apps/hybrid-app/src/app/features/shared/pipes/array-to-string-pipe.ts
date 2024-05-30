import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'arrayTostringJoin'})
export class ArrayTostringJoinPipe implements PipeTransform {
  transform(value: any[], separator?: string): string {
    let temp = [];
    value.forEach((ele) => {
      if (typeof ele === 'object'){
        temp.push(ele.value);
      } else {
        temp.push(ele);
      }
    })
    return temp.join(separator);
  }
}
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rupiah',
  standalone: true
})
export class RupiahPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return 'Rp0';
    
    if (typeof value === 'string' && value.startsWith('Rp')) {
      return value;
    }

    const num = typeof value === 'number' 
      ? value 
      : Number(value.toString().replace(/[^0-9]/g, ''));
      
    if (isNaN(num)) return 'Rp0';

    return 'Rp.' + Math.floor(num).toLocaleString('id-ID');
  }
}

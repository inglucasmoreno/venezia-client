import { Pipe, PipeTransform } from '@angular/core';
import { compareAsc } from 'date-fns';

@Pipe({
  name: 'alertaReservas'
})
export class AlertaReservasPipe implements PipeTransform {
  transform(fechaAlerta: any): any {
    let comparacion = compareAsc(new Date(), new Date(fechaAlerta));
    console.log(comparacion === 1 ? true : false);
    return comparacion === 1 ? true : false;
  }
}

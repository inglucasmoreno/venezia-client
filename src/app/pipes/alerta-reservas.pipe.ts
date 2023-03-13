import { Pipe, PipeTransform } from '@angular/core';
import { compareAsc } from 'date-fns';

@Pipe({
  name: 'alertaReservas'
})
export class AlertaReservasPipe implements PipeTransform {
  transform(fechaAlerta: any, estado: string): any {
    let comparacion = compareAsc(new Date(), new Date(fechaAlerta));
    return (comparacion === 1 && estado === 'Pendiente') ? true : false;
  }
}

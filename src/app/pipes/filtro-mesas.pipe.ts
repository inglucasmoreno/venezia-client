import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroMesas'
})
export class FiltroMesasPipe implements PipeTransform {

  transform(valores: any[], estado: string): any {

    // Trabajando con activo boolean
    let filtrados: any[];

    // Filtrado Activo - Inactivo - Todos
    if (estado !== '') {
      filtrados = valores.filter(valor => {
        return valor.estado === estado;
      });
    } else if (estado === '') {
      filtrados = valores;
    }

    return filtrados;

  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCajas'
})
export class FiltroCajasPipe implements PipeTransform {

  transform(valores: any[], parametro: string): any {
        
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return valores.filter( valor => { 
        return valor.creatorUser.apellido.toLocaleLowerCase().includes(parametro) ||
               valor.creatorUser.nombre.toLocaleLowerCase().includes(parametro)
      });
    }else{
      return valores;
    }

  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCuentasCorrientesMayoristas'
})
export class FiltroCuentasCorrientesMayoristasPipe implements PipeTransform {
  transform(valores: any[], parametro: string, activo: string): any {
        
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return valores.filter( valor => { 
        return valor.mayorista.descripcion.toLocaleLowerCase().includes(parametro)
      });
    }else{
      return valores;
    }

  }


}

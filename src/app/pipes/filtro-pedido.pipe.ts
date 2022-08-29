import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPedido'
})
export class FiltroPedidoPipe implements PipeTransform {

  transform(valores: any[], parametro: string, estado: string): any {
    
    // Trabajando con activo boolean
    let filtrados: any[];
      
    // Filtrado por estado
    if(estado.trim() !== ''){
      filtrados = valores.filter( valor => valor.estado === estado )  
    }else{
      filtrados = valores;
    }
     
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
  
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.mayorista.descripcion.toLocaleLowerCase().includes(parametro) ||
               valor.repartidor.descripcion.toLocaleLowerCase().includes(parametro) ||
               valor.numero == parametro
      });
    }else{
      return filtrados;
    }

  }

}

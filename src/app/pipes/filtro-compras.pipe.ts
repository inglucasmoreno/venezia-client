import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCompras'
})
export class FiltroComprasPipe implements PipeTransform {

  transform(valores: any[], parametro: string, estado: string): any {
    
    let filtrados: any[];
      
    // Filtrado - Estado
    if(estado !== null && estado !== 'Todas'){
      filtrados = valores.filter( valor => {
        return valor.estado == estado;
      });
    }else{
      filtrados = valores; 
    }
    
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.numero_factura.includes(parametro) ||
               valor.numero === Number(parametro) ||
               valor.comentarios.toUpperCase().includes(parametro)
      });
    }else{
      return filtrados;
    }

  }

}

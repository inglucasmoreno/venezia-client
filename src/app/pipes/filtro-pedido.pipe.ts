import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPedido'
})
export class FiltroPedidoPipe implements PipeTransform {

  transform(valores: any[], parametro: string, mayorista: string): any {
    
    // Trabajando con activo boolean
    let filtrados: any[];
      
    // Filtrado por mayorista
    if(mayorista.trim() !== ''){
      filtrados = valores.filter( valor => valor.mayorista._id === mayorista )  
    }else{
      filtrados = valores;
    }
     
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
  
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.numero == parametro
      });
    }else{
      return filtrados;
    }

  }

}

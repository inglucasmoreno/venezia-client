import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroPedido'
})
export class FiltroPedidoPipe implements PipeTransform {

  transform(valores: any[], parametro: string, mayorista: string, estado: string): any {
    
    // Trabajando con activo boolean
    let filtrados: any[];
      
    // Filtrado por mayorista
    if(mayorista.trim() !== ''){
      filtrados = valores.filter( valor => valor.mayorista._id === mayorista )  
    }else{
      filtrados = valores;
    }

    // Filtrado por estado
    if(estado === 'deuda'){
      filtrados = filtrados.filter( valor => valor.deuda_monto !== 0 )  
    }else if(estado === 'anticipo'){
      filtrados = filtrados.filter( valor => valor.monto_anticipo !== 0 )  
    }else if(estado === 'cuenta_corriente'){
      filtrados = filtrados.filter( valor => valor.monto_cuenta_corriente !== 0 )  
    }else{
      filtrados = filtrados;
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

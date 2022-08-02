import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroVentas'
})
export class FiltroVentasPipe implements PipeTransform {

  transform(valores: any[], parametro: string, pedidosYa: string, facturacion: string): any {
    
    let filtrados: any[];
    
    // Filtrado - PedidosYa
    if(pedidosYa === 'PedidosYa'){
      filtrados = valores.filter( valor => {
        return valor.forma_pago[0]?.descripcion === 'PedidosYa' || valor.forma_pago[0]?.descripcion === 'PedidosYa - Efectivo';
      });
    }else if(pedidosYa === 'PedidosYa - App'){
      filtrados = valores.filter( valor => {
        return valor.forma_pago[0]?.descripcion === 'PedidosYa';
      });
    }else if(pedidosYa === 'PedidosYa - Efectivo'){
      filtrados = valores.filter( valor => {
        return valor.forma_pago[0]?.descripcion === 'PedidosYa - Efectivo';
      });
    }else if(pedidosYa === 'SinPedidosYa'){
      filtrados = valores.filter( valor => {
        return valor.forma_pago[0]?.descripcion !== 'PedidosYa' && valor.forma_pago[0]?.descripcion !== 'PedidosYa - Efectivo' ;
      });
    }else if(pedidosYa === 'todos'){
      filtrados = valores; 
    }

    // Filtrado - Facturacion
    if(facturacion === 'facturadas'){
      filtrados = filtrados.filter( valor => {
        return valor.comprobante === 'Fiscal';
      });
    }else if(facturacion === 'normal'){
      filtrados = filtrados.filter( valor => {
        return valor.comprobante !== 'Fiscal';
      });
    }else if(facturacion === 'todos'){
      filtrados = filtrados; 
    }
    
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return filtrados.filter( valor => { 
        return valor.creatorUser.apellido.toLocaleLowerCase().includes(parametro) ||
               valor.creatorUser.nombre.toLocaleLowerCase().includes(parametro) ||
               valor.pedidosya_comprobante.toLocaleLowerCase().includes(parametro)
      });
    }else{
      return filtrados;
    }

  }

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaPipe } from './fecha.pipe';
import { RolPipe } from './rol.pipe';
import { MonedaPipe } from './moneda.pipe';
import { FiltroUsuariosPipe } from './filtro-usuarios.pipe';
import { FiltroUnidadMedidaPipe } from './filtro-unidad-medida.pipe';
import { FiltroProductosPipe } from './filtro-productos.pipe';
import { FiltroVentasPipe } from './filtro-ventas.pipe';
import { FiltroCajasPipe } from './filtro-cajas.pipe';
import { FiltroPedidosyaPipe } from './filtro-pedidosya.pipe';
import { FiltroPedidoPipe } from './filtro-pedido.pipe';

@NgModule({
  declarations: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroUnidadMedidaPipe,
    FiltroProductosPipe,
    FiltroVentasPipe,
    FiltroCajasPipe,
    FiltroPedidosyaPipe,
    FiltroPedidoPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroUnidadMedidaPipe,
    FiltroProductosPipe,
    FiltroVentasPipe,
    FiltroCajasPipe,
    FiltroPedidosyaPipe,
    FiltroPedidoPipe
  ]
})
export class PipesModule { }

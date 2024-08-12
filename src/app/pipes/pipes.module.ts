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
import { FiltroMayoristasPipe } from './filtro-mayoristas.pipe';
import { FiltroRepartidoresPipe } from './filtro-repartidores.pipe';
import { FiltroMayoristasGastosTiposPipe } from './filtro-mayoristas-gastos-tipos.pipe';
import { FiltroMayoristasIngresosTiposPipe } from './filtro-mayoristas-ingresos-tipos.pipe';
import { FiltroCuentasCorrientesMayoristasPipe } from './filtro-cuentas-corrientes-mayoristas.pipe';
import { AlertaReservasPipe } from './alerta-reservas.pipe';
import { FiltroComprasPipe } from './filtro-compras.pipe';
import { FiltroProductosCompraPipe } from './filtro-productos-compra.pipe';
import { FiltroMesasPipe } from './filtro-mesas.pipe';

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
    FiltroMayoristasPipe,
    FiltroRepartidoresPipe,
    FiltroMayoristasGastosTiposPipe,
    FiltroMayoristasIngresosTiposPipe,
    FiltroCuentasCorrientesMayoristasPipe,
    AlertaReservasPipe,
    FiltroComprasPipe,
    FiltroProductosCompraPipe,
    FiltroMesasPipe,
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
    FiltroProductosCompraPipe,
    FiltroVentasPipe,
    FiltroComprasPipe,
    FiltroCajasPipe,
    FiltroPedidosyaPipe,
    FiltroPedidoPipe,
    FiltroMayoristasPipe,
    FiltroRepartidoresPipe,
    FiltroMayoristasGastosTiposPipe,
    FiltroMayoristasIngresosTiposPipe,
    FiltroCuentasCorrientesMayoristasPipe,
    AlertaReservasPipe
  ]
})
export class PipesModule { }

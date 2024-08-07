import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PagesComponent } from './pages.component';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { PipesModule } from '../pipes/pipes.module';
import { ComponentsModule } from '../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DirectivesModule } from '../directives/directives.module';
import { PerfilComponent } from './perfil/perfil.component';
import { UnidadMedidaComponent } from './unidad-medida/unidad-medida.component';
import { ProductosComponent } from './productos/productos.component';
import { VentasComponent } from './ventas/ventas.component';
import { VentasHistorialComponent } from './ventas/ventas-historial.component';
import { CajaComponent } from './caja/caja.component';
import { CajasHistorialComponent } from './caja/cajas-historial.component';
import { VentasActivasComponent } from './ventas/ventas-activas.component';
import { PedidosyaComponent } from './pedidosya/pedidosya.component';
import { PedidosyaHistorialComponent } from './pedidosya/pedidosya-historial.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { MayoristasComponent } from './mayoristas/mayoristas.component';
import { RepartidoresComponent } from './repartidores/repartidores.component';
import { NuevoPedidoComponent } from './pedidos/nuevo-pedido.component';
import { PedidosReportesComponent } from './pedidos/pedidos-reportes.component';
import { PedidosGastosComponent } from './pedidos-gastos/pedidos-gastos.component';
import { PedidosGastosTiposComponent } from './pedidos-gastos/pedidos-gastos-tipos.component';
import { CajasMayoristasComponent } from './cajas-mayoristas/cajas-mayoristas.component';
import { PedidosIngresosComponent } from './pedidos-ingresos/pedidos-ingresos.component';
import { PedidosIngresosTiposComponent } from './pedidos-ingresos/pedidos-ingresos-tipos.component';
import { CuentasCorrientesMayoristasComponent } from './cuentas-corrientes-mayoristas/cuentas-corrientes-mayoristas.component';
import { CobrosMayoristasComponent } from './cobros-mayoristas/cobros-mayoristas.component';
import { NuevoCobroMayoristaComponent } from './cobros-mayoristas/nuevo-cobro-mayorista.component';
import { CajasMayoristasHistorialComponent } from './cajas-mayoristas/cajas-mayoristas-historial.component';
import { PedidosCompletarComponent } from './pedidos/pedidos-completar.component';
import { PaquetesComponent } from './paquetes/paquetes.component';
import { NuevoPaqueteComponent } from './paquetes/nuevo-paquete.component';
import { PaquetesDetallesComponent } from './paquetes/paquetes-detalles.component';
import { PaquetesReportesComponent } from './paquetes/paquetes-reportes.component';
import { ReportesMayoristasGeneralesComponent } from './reportes-mayoristas/reportes-mayoristas-generales.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ReservasComponent } from './reservas/reservas.component';
import { NuevaReservaComponent } from './reservas/nueva-reserva.component';
import { DetallesReservasComponent } from './reservas/detalles-reservas.component';
import { ComprasComponent } from './compras/compras.component';
import { ComprasDetallesComponent } from './compras-detalles/compras-detalles.component';
import { CafeteriaComponent } from './cafeteria/cafeteria.component';


@NgModule({
  declarations: [
    HomeComponent,
    PagesComponent,
    UsuariosComponent,
    NuevoUsuarioComponent,
    EditarUsuarioComponent,
    EditarPasswordComponent,
    PerfilComponent,
    UnidadMedidaComponent,
    ProductosComponent,
    VentasComponent,
    VentasHistorialComponent,
    CajaComponent,
    CajasHistorialComponent,
    VentasActivasComponent,
    PedidosyaComponent,
    PedidosyaHistorialComponent,
    PedidosComponent,
    MayoristasComponent,
    RepartidoresComponent,
    NuevoPedidoComponent,
    PedidosReportesComponent,
    PedidosGastosComponent,
    PedidosGastosTiposComponent,
    CajasMayoristasComponent,
    PedidosIngresosComponent,
    PedidosIngresosTiposComponent,
    CuentasCorrientesMayoristasComponent,
    CobrosMayoristasComponent,
    NuevoCobroMayoristaComponent,
    CajasMayoristasHistorialComponent,
    PedidosCompletarComponent,
    PaquetesComponent,
    NuevoPaqueteComponent,
    PaquetesDetallesComponent,
    PaquetesReportesComponent,
    ReportesMayoristasGeneralesComponent,
    ClientesComponent,
    ReservasComponent,
    NuevaReservaComponent,
    DetallesReservasComponent,
    ComprasComponent,
    ComprasDetallesComponent,
    CafeteriaComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    DirectivesModule,
    SharedModule,
    PipesModule,
    ComponentsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FormsModule,
    DirectivesModule
  ]
})
export class PagesModule { }

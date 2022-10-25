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

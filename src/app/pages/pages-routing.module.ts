import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { PermisosGuard } from '../guards/permisos.guard';

// Componentes
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
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
import { PedidosIngresosTiposComponent } from './pedidos-ingresos/pedidos-ingresos-tipos.component';
import { PedidosIngresosComponent } from './pedidos-ingresos/pedidos-ingresos.component';
import { CuentasCorrientesMayoristasComponent } from './cuentas-corrientes-mayoristas/cuentas-corrientes-mayoristas.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [AuthGuard],    // Guard - Se verifica si el usuario esta logueado
        children: [

            // Home
            { path: 'home', component: HomeComponent },

            // Perfil de usuarios
            { path: 'perfil', component: PerfilComponent },

            // Ventas
            { path: 'ventas', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasComponent },
            { path: 'ventas/historial', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasHistorialComponent },
            { path: 'ventas/activas', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasActivasComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarPasswordComponent },

            // Unidad de medida
            { path: 'unidad-medida', data: { permisos: 'UNIDAD_MEDIDA_NAV' }, canActivate: [PermisosGuard], component: UnidadMedidaComponent },

            // Productos
            { path: 'productos', data: { permisos: 'PRODUCTOS_NAV' }, canActivate: [PermisosGuard], component: ProductosComponent },

            // PedidosYa
            { path: 'pedidosya', data: { permisos: 'PEDIDOSYA_NAV' }, canActivate: [PermisosGuard], component: PedidosyaComponent },
            { path: 'pedidosya/historial', data: { permisos: 'PEDIDOSYA_NAV' }, canActivate: [PermisosGuard], component: PedidosyaHistorialComponent },

            // Mayoristas
            { path: 'repartidores', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: RepartidoresComponent },
            { path: 'mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: MayoristasComponent },
            { path: 'cuentas-corrientes-mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CuentasCorrientesMayoristasComponent },
            { path: 'pedidos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosComponent },
            { path: 'nuevo-pedido', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: NuevoPedidoComponent },
            { path: 'pedidos-reportes', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosReportesComponent },
            { path: 'pedidos-gastos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosGastosComponent },
            { path: 'pedidos-ingresos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosIngresosComponent },
            { path: 'pedidos-gastos-tipos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosGastosTiposComponent },
            { path: 'pedidos-ingresos-tipos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosIngresosTiposComponent },
            { path: 'cajas-mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CajasMayoristasComponent },

            // Cajas
            { path: 'caja', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: CajaComponent },
            { path: 'caja/historial', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: CajasHistorialComponent },


        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
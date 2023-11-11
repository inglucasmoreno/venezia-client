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
import { CobrosMayoristasComponent } from './cobros-mayoristas/cobros-mayoristas.component';
import { NuevoCobroMayoristaComponent } from './cobros-mayoristas/nuevo-cobro-mayorista.component';
import { CajasMayoristasHistorialComponent } from './cajas-mayoristas/cajas-mayoristas-historial.component';
import { PedidosCompletarComponent } from './pedidos/pedidos-completar.component';
import { NuevoPaqueteComponent } from './paquetes/nuevo-paquete.component';
import { PaquetesComponent } from './paquetes/paquetes.component';
import { PaquetesDetallesComponent } from './paquetes/paquetes-detalles.component';
import { PaquetesReportesComponent } from './paquetes/paquetes-reportes.component';
import { ReportesMayoristasGeneralesComponent } from './reportes-mayoristas/reportes-mayoristas-generales.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ReservasComponent } from './reservas/reservas.component';
import { NuevaReservaComponent } from './reservas/nueva-reserva.component';
import { DetallesReservasComponent } from './reservas/detalles-reservas.component';
import { ComprasComponent } from './compras/compras.component';
import { ComprasDetallesComponent } from './compras-detalles/compras-detalles.component';

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

            // Compras
            { path: 'compras', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: ComprasComponent },
            { path: 'compras/detalles/:id', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: ComprasDetallesComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarPasswordComponent },

            // Clientes
            { path: 'clientes', data: { permisos: 'CLIENTES_NAV' }, canActivate: [PermisosGuard], component: ClientesComponent },

            // Unidad de medida
            { path: 'unidad-medida', data: { permisos: 'UNIDAD_MEDIDA_NAV' }, canActivate: [PermisosGuard], component: UnidadMedidaComponent },

            // Productos
            { path: 'productos', data: { permisos: 'PRODUCTOS_NAV' }, canActivate: [PermisosGuard], component: ProductosComponent },

            // PedidosYa
            { path: 'pedidosya', data: { permisos: 'PEDIDOSYA_NAV' }, canActivate: [PermisosGuard], component: PedidosyaComponent },
            { path: 'pedidosya/historial', data: { permisos: 'PEDIDOSYA_NAV' }, canActivate: [PermisosGuard], component: PedidosyaHistorialComponent },

            // Reservas
            { path: 'reservas', data: { permisos: 'RESERVAS_NAV' }, canActivate: [PermisosGuard], component: ReservasComponent },

            { path: 'reservas/detalles/:id', data: { permisos: 'RESERVAS_NAV' }, canActivate: [PermisosGuard], component: DetallesReservasComponent },
            
            { path: 'reservas/nueva', data: { permisos: 'RESERVAS_NAV' }, canActivate: [PermisosGuard], component: NuevaReservaComponent },

            // Mayoristas
            { path: 'repartidores', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: RepartidoresComponent },
            
            { path: 'mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: MayoristasComponent },
            { path: 'cuentas-corrientes-mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CuentasCorrientesMayoristasComponent },
            
            { path: 'cobros-mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CobrosMayoristasComponent },
            
            { path: 'nuevo-cobro-mayorista', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: NuevoCobroMayoristaComponent },
            
            { path: 'paquetes', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PaquetesComponent },
            
            { path: 'paquetes-reportes', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PaquetesReportesComponent },
            
            { path: 'paquetes/detalles/:id/:origen', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PaquetesDetallesComponent },

            { path: 'nuevo-pedido', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: NuevoPedidoComponent },
            
            { path: 'nuevo-paquete', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: NuevoPaqueteComponent },
            
            { path: 'pedidos-reportes', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosReportesComponent },
            
            { path: 'pedidos-gastos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosGastosComponent },
            
            { path: 'pedidos-ingresos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosIngresosComponent },
            
            { path: 'pedidos-gastos-tipos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosGastosTiposComponent },
            
            { path: 'pedidos-ingresos-tipos', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosIngresosTiposComponent },
            
            { path: 'pedidos-completar', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: PedidosCompletarComponent },
            
            { path: 'cajas-mayoristas', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CajasMayoristasComponent },
            
            { path: 'cajas-mayoristas-historial', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: CajasMayoristasHistorialComponent },

            { path: 'reportes-mayoristas-generales', data: { permisos: 'MAYORISTAS_NAV' }, canActivate: [PermisosGuard], component: ReportesMayoristasGeneralesComponent },

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
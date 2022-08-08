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

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],    // Guard - Se verifica si el usuario esta logueado
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Perfil de usuarios
            { path: 'perfil', component: PerfilComponent },

            // Ventas
            { path: 'ventas', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasComponent },
            { path: 'ventas/historial', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasHistorialComponent },
            { path: 'ventas/activas', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasActivasComponent},

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
export class PagesRoutingModule {}
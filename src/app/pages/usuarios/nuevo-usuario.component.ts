import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

import { UsuariosService } from 'src/app/services/usuarios.service';
import { AlertService } from '../../services/alert.service';

import gsap from 'gsap';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styles: [
  ]
})
export class NuevoUsuarioComponent implements OnInit {

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    ventas: 'VENTAS_NOT_ACCESS',
    compras: 'COMPRAS_NOT_ACCESS',
    clientes: 'CLIENTES_NOT_ACCESS',
    productos: 'PRODUCTOS_NOT_ACCESS',
    unidad_medida: 'UNIDAD_MEDIDA_NOT_ACCESS',
    pedidosYa: 'PEDIDOSYA_NOT_ACCESS',
    mayoristas: 'MAYORISTAS_NOT_ACCESS',
    cajas: 'CAJAS_NOT_ACCESS',
    reservas: 'RESERVAS_NOT_ACCESS',
    cafeteria: 'CAFETERIA_NOT_ACCESS',
  };

  // Modals
  public showModal = false;

  // Modelo reactivo
  public usuarioForm: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router,
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {

    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Creando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      repetir: ['', Validators.required],
      role: ['ADMIN_ROLE', Validators.required],
      activo: ['true', Validators.required]
    });

  }

  // Crear nuevo usuario
  nuevoUsuario(): void {

    const { status } = this.usuarioForm;
    const { usuario, apellido, nombre, dni, email, role, password, repetir } = this.usuarioForm.value;

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' ||
      apellido.trim() === '' ||
      dni.trim() === '' ||
      email.trim() === '' ||
      nombre.trim() === '' ||
      password.trim() === '' ||
      repetir.trim() === '';

    // Se verifica si los campos son invalidos
    if (status === 'INVALID' || campoVacio) {
      this.alertService.formularioInvalido();
      return;
    }

    // Se verifica si las contraseñas coinciden
    if (password !== repetir) {
      this.alertService.info('Las contraseñas deben coincidir');
      return;
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;

    if (role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos();
    else data.permisos = [];

    this.alertService.loading();  // Comienzo de loading

    // Se crear el nuevo usuario
    this.usuariosService.nuevoUsuario(data).subscribe(() => {
      this.alertService.close();  // Finaliza el loading
      this.router.navigateByUrl('dashboard/usuarios');
    }, (({ error }) => {
      this.alertService.close();  // Finaliza el loading
      this.alertService.errorApi(error.message);
      return;
    }));

  }

  // Abrir modal: Permisos
  abrirPermisos(): void {
    this.showModal = true;
  }

  // Asignar permisos por tipo de usuario seleccionado
  asignarPermisosTipoUsuario(): void {

    const { role } = this.usuarioForm.value;

    if (role === 'USER_ROLE') {
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        ventas: 'VENTAS_ALL',
        compras: 'COMPRAS_ALL',
        clientes: 'CLIENTES_ALL',
        productos: 'PRODUCTOS_READ',
        unidad_medida: 'UNIDAD_MEDIDA_NOT_ACCESS',
        pedidosYa: 'PEDIDOSYA_NOT_ACCESS',
        mayoristas: 'MAYORISTAS_NOT_ACCESS',
        cajas: 'CAJAS_ALL',
        reservas: 'RESERVAS_ALL',
        cafeteria: 'CAFETERIA_ALL'
      }
    }

    if (role === 'DELIVERY_ROLE') {
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        clientes: 'CLIENTES_NOT_ACCESS',
        ventas: 'VENTAS_NOT_ACCESS',
        compras: 'COMPRAS_NOT_ACCESS',
        productos: 'PRODUCTOS_NOT_ACCESS',
        unidad_medida: 'UNIDAD_MEDIDA_NOT_ACCESS',
        pedidosYa: 'PEDIDOSYA_NOT_ACCESS',
        mayoristas: 'MAYORISTAS_ALL',
        cajas: 'CAJAS_NOT_ACCESS',
        reservas: 'RESERVAS_NOT_ACCESS',
        cafeteria: 'CAFETERIA_NOT_ACCESS'
      }
    }

  }

  // Se arma el arreglo de permisos
  adicionarPermisos(): any {

    let permisos: any[] = [];

    // Seccion usuarios
    if (this.permisos.usuarios !== 'USUARIOS_NOT_ACCESS') {
      permisos.push('USUARIOS_NAV');
      permisos.push(this.permisos.usuarios);
    }

    // Seccion ventas
    if (this.permisos.ventas !== 'VENTAS_NOT_ACCESS') {
      permisos.push('VENTAS_NAV');
      permisos.push(this.permisos.ventas);
    }

    // Seccion compras
    if (this.permisos.compras !== 'COMPRAS_NOT_ACCESS') {
      permisos.push('COMPRAS_NAV');
      permisos.push(this.permisos.compras);
    }

    // Seccion clientes
    if (this.permisos.clientes !== 'CLIENTES_NOT_ACCESS') {
      permisos.push('CLIENTES_NAV');
      permisos.push(this.permisos.clientes);
    }

    // Seccion productos
    if (this.permisos.productos !== 'PRODUCTOS_NOT_ACCESS') {
      permisos.push('PRODUCTOS_NAV');
      permisos.push(this.permisos.productos);
    }

    // Seccion unidades de medida
    if (this.permisos.unidad_medida !== 'UNIDAD_MEDIDA_NOT_ACCESS') {
      permisos.push('UNIDAD_MEDIDA_NAV');
      permisos.push(this.permisos.unidad_medida);
    }

    // Seccion pedidosYa
    if (this.permisos.pedidosYa !== 'PEDIDOSYA_NOT_ACCESS') {
      permisos.push('PEDIDOSYA_NAV');
      permisos.push(this.permisos.pedidosYa);
    }

    // Seccion mayoristas
    if (this.permisos.mayoristas !== 'MAYORISTAS_NOT_ACCESS') {
      permisos.push('MAYORISTAS_NAV');
      permisos.push(this.permisos.mayoristas);
    }

    // Seccion cajas
    if (this.permisos.cajas !== 'CAJAS_NOT_ACCESS') {
      permisos.push('CAJAS_NAV');
      permisos.push(this.permisos.cajas);
    }

    // Seccion reservas
    if (this.permisos.reservas !== 'RESERVAS_NOT_ACCESS') {
      permisos.push('RESERVAS_NAV');
      permisos.push(this.permisos.reservas);
    }

    // Seccion cafeteria
    if (this.permisos.cafeteria !== 'CAFETERIA_NOT_ACCESS') {
      permisos.push('CAFETERIA_NAV');
      permisos.push(this.permisos.cafeteria);
    }

    return permisos;

  }

}

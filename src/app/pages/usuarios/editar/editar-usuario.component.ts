import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from '../../../models/usuario.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';

import gsap from 'gsap';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styles: [
  ]
})
export class EditarUsuarioComponent implements OnInit {

  // Permisos
  public permisos = {
    usuarios: 'USUARIOS_NOT_ACCESS',
    ventas: 'VENTAS_NOT_ACCESS',
    productos: 'PRODUCTOS_NOT_ACCESS',
    unidad_medida: 'UNIDAD_MEDIDA_NOT_ACCESS',
    pedidosYa: 'PEDIDOSYA_NOT_ACCESS',
    cajas: 'CAJAS_NOT_ACCESS'
  };

  // Modals
  public showModal = false;

  public id: string;
  public usuario: Usuario;
  public usuarioForm: FormGroup;

  constructor(private router: Router,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private usuariosService: UsuariosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    
    // Animaciones y Datos de ruta
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Editando usuario';

    // Formulario reactivo
    this.usuarioForm = this.fb.group({
      usuario: ['', Validators.required],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', Validators.email],
      role: ['USER_ROLE', Validators.required],
      activo: ['true', Validators.required],
    });
  
    this.getUsuario(); // Datos iniciales de usuarios

  }

  // Datos iniciales de usuarios
  getUsuario(): void {
    
    // Se buscan los datos iniciales del usuario a editar
    this.alertService.loading();
    this.activatedRoute.params.subscribe(({id}) => { this.id = id; });
    this.usuariosService.getUsuario(this.id).subscribe(usuarioRes => {
      
      // Marcar permisos
      this.getPermisos(usuarioRes.permisos); // Se obtienen los permisos

      this.usuario = usuarioRes;
      const {usuario, apellido, nombre, dni, email, role, activo} = this.usuario;

      this.usuarioForm.patchValue({
        usuario,
        apellido,
        nombre,
        dni,
        email,
        role,
        activo: String(activo)
      });

      this.alertService.close();
    },({error})=> {
      this.alertService.errorApi(error.message); 
    });
  
  }

  // Se obtienen los permisos
  getPermisos(permisosFnc: Array<string>): void {
    
    permisosFnc.forEach( permiso => {
    
      // Usuarios
      (permiso === 'USUARIOS_ALL' || permiso === 'USUARIOS_READ') ? this.permisos.usuarios = permiso : null;

      // Ventas
      (permiso === 'VENTAS_ALL' || permiso === 'VENTAS_READ') ? this.permisos.ventas = permiso : null;

      // Productos
      (permiso === 'PRODUCTOS_ALL' || permiso === "PRODUCTOS_READ") ? this.permisos.productos = permiso : null;

      // Unidades de medida
      (permiso === 'UNIDAD_MEDIDA_ALL' || permiso === 'UNIDAD_MEDIDA_READ') ? this.permisos.unidad_medida = permiso : null;

      // PedidosYa
      (permiso === 'PEDIDOSYA_ALL' || permiso === 'PEDIDOSYA_READ') ? this.permisos.pedidosYa = permiso : null;
    
      // Cierre de cajas
      (permiso === 'CAJAS_ALL' || permiso === 'CAJAS_READ') ? this.permisos.cajas = permiso : null;

    });

  }

  // Editar usuario
  editarUsuario(): void | boolean{
      
    const {usuario, apellido, dni, role, nombre, email} = this.usuarioForm.value;

    // Se verifica que los campos no tengan un espacio vacio
    const campoVacio = usuario.trim() === '' || 
                       apellido.trim() === '' || 
                       dni.trim() === '' || 
                       email.trim() === '' || 
                       nombre.trim() === '';

    // Se verifica que todos los campos esten rellenos
    if (this.usuarioForm.status === 'INVALID' || campoVacio){
      this.alertService.formularioInvalido()
      return false;
    }

    // Se agregan los permisos
    let data: any = this.usuarioForm.value;

    if(role !== 'ADMIN_ROLE') data.permisos = this.adicionarPermisos(); // Se adicionan los permisos a la data para actualizacion
    else data.permisos = [];

    this.alertService.loading();

    this.usuariosService.actualizarUsuario(this.id, data).subscribe(() => {
      this.alertService.close();
      this.router.navigateByUrl('dashboard/usuarios');
    }, ({error}) => {
      this.alertService.close();
      this.alertService.errorApi(error.message);
    });

  }

  // Abrir modal: Permisos
  abrirPermisos(): void {
    this.showModal = true;
  }

  // Asignar permisos por tipo de usuario seleccionado
  asignarPermisosTipoUsuario():void {
    
    const { role } = this.usuarioForm.value;

    if(role === 'USER_ROLE'){
      this.permisos = {
        usuarios: 'USUARIOS_NOT_ACCESS',
        ventas: 'VENTAS_ALL',
        productos: 'PRODUCTOS_READ',
        unidad_medida: 'UNIDAD_MEDIDA_NOT_ACCESS',
        pedidosYa: 'PEDIDOSYA_NOT_ACCESS',
        cajas: 'CAJAS_ALL',
      }
    }

  }

  // Se arma el arreglo de permisos
  adicionarPermisos(): any {

    let permisos: any[] = [];    
    
    // Seccion usuarios
    if(this.permisos.usuarios !== 'USUARIOS_NOT_ACCESS'){
      permisos.push('USUARIOS_NAV');
      permisos.push(this.permisos.usuarios);
    }

    // Seccion ventas
    if(this.permisos.ventas !== 'VENTAS_NOT_ACCESS'){
      permisos.push('VENTAS_NAV');
      permisos.push(this.permisos.ventas);
    }

    // Seccion productos
    if(this.permisos.productos !== 'PRODUCTOS_NOT_ACCESS'){
      permisos.push('PRODUCTOS_NAV');
      permisos.push(this.permisos.productos);
    }

    // Seccion unidades de medida
    if(this.permisos.unidad_medida !== 'UNIDAD_MEDIDA_NOT_ACCESS'){
      permisos.push('UNIDAD_MEDIDA_NAV');
      permisos.push(this.permisos.unidad_medida);
    }

    // Seccion pedidosYa
    if(this.permisos.pedidosYa !== 'PEDIDOSYA_NOT_ACCESS'){
      permisos.push('PEDIDOSYA_NAV');
      permisos.push(this.permisos.pedidosYa);
    }

    // Seccion cajas
    if(this.permisos.cajas !== 'CAJAS_NOT_ACCESS'){
      permisos.push('CAJAS_NAV');
      permisos.push(this.permisos.cajas);
    }
    
    return permisos;  
  
  }

  // Funcion del boton regresar
  regresar(): void{
    this.router.navigateByUrl('/dashboard/usuarios');
  }

}

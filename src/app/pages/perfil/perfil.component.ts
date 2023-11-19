import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AlertService } from '../../services/alert.service';
import { Usuario } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfiguracionesGeneralesService } from 'src/app/services/configuraciones-generales.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {

  // Configuraciones generales
  public configuraciones = {
    stock: 'false',
    venta_cantidad: 'true',
    venta_precio: 'false',
  }

  constructor(public authService: AuthService,
              private dataService: DataService,
              private configuracionesGeneralesService: ConfiguracionesGeneralesService,
              private fb: FormBuilder,
              private usuariosService: UsuariosService,
              private alertService: AlertService) { }

  public usuarioLogin: Usuario;
  public passwordForm: FormGroup;

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Dashboard - Perfil";
    this.getUsuario();
    
    // Formulario reactivo para password
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
      repetir: ['', Validators.required]
    });
  }

  // Obtener datos de usuario
  getUsuario(): void {
    this.alertService.loading();
    this.usuariosService.getUsuario(this.authService.usuario.userId).subscribe( (usuario: Usuario) => {
      this.usuarioLogin = usuario;
      this.configuracionesGeneralesService.getConfiguracion().subscribe({
        next: ({ configuraciones }) => {
          this.configuraciones.stock = configuraciones.stock ? 'true' : 'false';
          this.configuraciones.venta_cantidad = configuraciones.venta_cantidad ? 'true' : 'false';
          this.configuraciones.venta_precio = configuraciones.venta_precio ? 'true' : 'false';
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    },({error}) => {
      this.alertService.errorApi(error.msg);
    })
  }

  // Actualizar configuracion
  actualizarConfiguracion(): void {
    this.alertService.loading();
    this.configuracionesGeneralesService.actualizarConfiguracion({
      stock: this.configuraciones.stock === 'true' ? true : false,
      venta_cantidad: this.configuraciones.venta_cantidad === 'true' ? true : false,
      venta_precio: this.configuraciones.venta_precio === 'true' ? true : false,
    }).subscribe({
      next: ({ configuraciones }) => {
        this.configuraciones.stock = configuraciones.stock ? 'true' : 'false';
        this.configuraciones.venta_cantidad = configuraciones.venta_cantidad ? 'true' : 'false';
        this.configuraciones.venta_precio = configuraciones.venta_precio ? 'true' : 'false';
        this.alertService.success('Configuraciones actualizadas');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar password
  actualizarPassword(): void {
    this.alertService.loading();
    this.usuariosService.actualizarUsuario(this.usuarioLogin._id, this.passwordForm.value).subscribe( () => {
      this.reiniciarValores();
      this.alertService.success('Contraseña actualizada');
    },({error}) => { 
      this.alertService.errorApi(error.msg)
    });
  }

  // Reiniciar valores
  reiniciarValores(): void {
    this.passwordForm.patchValue({
      password: '',
      repetir: ''
    });
  }

}

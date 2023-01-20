import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CuentasCorrientesMayoristasService } from 'src/app/services/cuentas-corrientes-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';

@Component({
  selector: 'app-mayoristas',
  templateUrl: './mayoristas.component.html',
  styles: [
  ]
})
export class MayoristasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalMayorista = false;
  public showModalNuevoMayorista = false;
  public showModalPassword = false;
  public showModalCuenta = false;

  // Cuenta corriente
  public saldo = 0;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Mayorista
  public idMayorista: string = '';
  public mayoristas: any = [];
  public mayoristaSeleccionado: any;
  public descripcion: string = '';

  public mayoristasForm: any = {
    descripcion: '',
    telefono: '',
    direccion: '',
    email: '',
    confirm: 'true'
  }

  // Contraseña
  public password = 'demo';
  public repetir = 'demo';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    estado: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private mayoristasService: MayoristasService,
    public authService: AuthService,
    private cuentasService: CuentasCorrientesMayoristasService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Mayoristas';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarMayoristas();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MAYORISTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, mayorista: any = null): void {

    this.reiniciarFormulario();

    this.mayoristasForm = {
      descripcion: '',
      telefono: '',
      direccion: '',
      email: '',
      confirm: 'true'
    }

    this.idMayorista = '';

    this.getMayorista(mayorista);

    this.estadoFormulario = estado;

  }

  // Traer datos de mayorista
  getMayorista(mayorista: any): void {
    this.alertService.loading();
    this.idMayorista = mayorista._id;
    this.mayoristaSeleccionado = mayorista;
    this.mayoristasService.getMayorista(mayorista._id).subscribe(({ mayorista }) => {
      this.mayoristasForm = mayorista;
      this.mayoristasForm.confirm = mayorista.confirm ? 'true' : 'false';
      this.alertService.close();
      this.showModalMayorista = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar mayoristas
  listarMayoristas(): void {
    this.mayoristasService.listarMayoristasConCC(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.parametro,
      this.filtro.activo,
      this.filtro.estado
    )
      .subscribe(({ mayoristas, totalItems }) => {
        this.mayoristas = mayoristas;
        this.totalItems = totalItems;
        console.log(mayoristas);
        this.showModalMayorista = false;
        this.showModalNuevoMayorista = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo mayorista
  nuevoMayorista(): void {

    const { descripcion, telefono, direccion, email, confirm } = this.mayoristasForm;

    // Verificacion: Descripción vacia
    if (descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    // Verificacion: email vacia
    if (email.trim() === "") {
      this.alertService.info('Debes colocar un correo electrónico');
      return;
    }

    // Verificacion: telefono vacio
    if (telefono.trim() === "") {
      this.alertService.info('Debes colocar un telefono');
      return;
    }

    // Verificacion: direccion vacia
    if (direccion.trim() === "") {
      this.alertService.info('Debes colocar una dirección');
      return;
    }

    // Verificacion: contraseña
    if (this.password.trim() === "") {
      this.alertService.info('Debes colocar una contraseña');
      return;
    }

    // Verificacion: repetir contraseña
    if (this.repetir.trim() === "") {
      this.alertService.info('Debes repetir la contraseña');
      return;
    }

    // Verificacion: Las contraseñas debe coindicir
    if (this.password.trim() !== this.repetir.trim()) {
      this.alertService.info('Las contraseñas debe coindicir');
      return;
    }

    this.alertService.loading();

    // Ajustando
    const data = {
      descripcion,
      telefono,
      direccion,
      email,
      password: this.password,
      repetir: this.repetir,
      confirm: confirm === 'true' ? true : false,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.mayoristasService.nuevoMayorista(data).subscribe({
      next: () => {
        this.listarMayoristas();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar cuenta corriente
  actualizarCuentaCorriente(): void {

    // Verificacion: Saldo vacio
    if (!this.saldo) {
      this.alertService.info('Debes colocar un saldo');
      return;
    }

    this.alertService.loading();

    const data = {
      saldo: this.saldo,
      updatorUser: this.authService.usuario.userId,
    }

    this.cuentasService.actualizarCuentaCorriente(this.mayoristaSeleccionado.cuenta_corriente._id, data).subscribe(() => {
      this.showModalCuenta = false;
      this.listarMayoristas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Abrir modal
  abrirModalCuenta(mayorista: any): void {
    this.saldo = mayorista.cuenta_corriente.saldo;
    this.mayoristaSeleccionado = mayorista;
    this.showModalCuenta = true;
  }

  // Actualizar mayorista
  actualizarMayorista(): void {

    const { descripcion, telefono, direccion, email, confirm } = this.mayoristasForm;

    // Verificacion: Descripción vacia
    if (descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    // Verificacion: email vacia
    if (email.trim() === "") {
      this.alertService.info('Debes colocar un correo electrónico');
      return;
    }

    // Verificacion: telefono vacio
    if (telefono.trim() === "") {
      this.alertService.info('Debes colocar un telefono');
      return;
    }

    // Verificacion: direccion vacia
    if (direccion.trim() === "") {
      this.alertService.info('Debes colocar una dirección');
      return;
    }

    this.alertService.loading();

    // Ajustando
    const data = {
      descripcion,
      telefono,
      direccion,
      email,
      confirm: confirm === 'true' ? true : false,
      updatorUser: this.authService.usuario.userId,
    }

    this.mayoristasService.actualizarMayorista(this.idMayorista, data).subscribe(() => {
      this.listarMayoristas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(mayorista: any): void {

    const { _id, activo } = mayorista;

    // if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mayoristasService.actualizarMayorista(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarMayoristas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Abrir modal
  abrirModalPassword(mayorista: any): void {
    this.password = '';
    this.repetir = '';
    this.mayoristaSeleccionado = mayorista;
    this.showModalPassword = true;
  }

  // Abrir nuevo mayorista
  abrirNuevoMayorista(): void {

    this.reiniciarFormulario();

    this.mayoristasForm = {
      descripcion: '',
      telefono: '',
      direccion: '',
      email: '',
      confirm: 'true'
    }

    this.password = 'demo';
    this.repetir = 'demo';

    this.idMayorista = '';

    this.showModalNuevoMayorista = true;

  }

  // Actualizar password
  actualizarPassword(): void {

    // Verificaciones
    if (this.password.trim() === '' || this.repetir.trim() === '') {
      this.alertService.info('Debes completar los campos obligatorios');
      return;
    }

    if (this.password.trim() !== this.repetir.trim()) {
      this.alertService.info('Las contraseñas deben coincidir');
      return;
    }

    // Actualizacion
    this.mayoristasService.actualizarMayorista(this.mayoristaSeleccionado._id, { password: this.password }).subscribe({
      next: () => {
        this.alertService.close();
        this.showModalPassword = false;
        this.alertService.success('Contraseña actualizada correctamente');
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.mayoristasForm = {
      descripcion: '',
      telefono: '',
      direccion: '',
      email: '',
      confirm: 'true'
    };
    this.password = 'demo';
    this.repetir = 'demo';
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarMayoristas();
  }

   // Cambiar cantidad de items
   cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarMayoristas();
  } 

}

import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CuentasCorrientesMayoristasService } from 'src/app/services/cuentas-corrientes-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';

@Component({
  selector: 'app-cuentas-corrientes-mayoristas',
  templateUrl: './cuentas-corrientes-mayoristas.component.html',
  styles: [
  ]
})
export class CuentasCorrientesMayoristasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalCuenta = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Cuenta corrinete
  public idCuenta: string = '';
  public cuentasCorrientes: any = [];
  public cuentaSeleccionada: any;
  public descripcion: string = '';
  public saldo: number = null;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'mayorista.descripcion'
  }

  constructor(private cuentasService: CuentasCorrientesMayoristasService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Cuentas corrientes';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.calculosIniciales();
  }

  calculosIniciales(): void {
    this.alertService.loading();
    this.cuentasService.inicializarCuentasCorrientes(this.authService.usuario.userId).subscribe({ // Inicializando CC faltantes
      next: () => {
        this.listarCuentas();
      }, error: ({error}) => this.alertService.errorApi(error.message) 
    })
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MAYORISTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, tipo: any = null): void {
    window.scrollTo(0, 0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idCuenta = '';

    if (estado === 'editar') this.getCuenta(tipo);
    else this.showModalCuenta = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de cuenta corriente
  getCuenta(cuenta: any): void {
    console.log(cuenta);
    this.alertService.loading();
    this.idCuenta = cuenta._id;
    this.cuentaSeleccionada = cuenta;
    this.cuentasService.getCuentaCorriente(cuenta._id).subscribe(({ cuenta_corriente }) => {
      this.descripcion = cuenta_corriente.mayorista.descripcion;
      this.saldo = cuenta_corriente.saldo;
      this.alertService.close();
      this.showModalCuenta = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar cuentas
  listarCuentas(): void {
    this.cuentasService.listarCuentasCorrientes(
      this.ordenar.direccion,
      this.ordenar.columna
    )
      .subscribe(({ cuentas_corrientes }) => {
        this.cuentasCorrientes = cuentas_corrientes;
        this.showModalCuenta = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nueva cuenta
  nuevaCuentaCorriente(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.cuentasService.nuevaCuentaCorriente(data).subscribe(() => {
      this.listarCuentas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar cuenta corriente
  actualizarCuentaCorriente(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      saldo: this.saldo,
      updatorUser: this.authService.usuario.userId,
    }

    this.cuentasService.actualizarCuentaCorriente(this.idCuenta, data).subscribe(() => {
      this.listarCuentas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(tipo: any): void {

    const { _id, activo } = tipo;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cuentasService.actualizarCuentaCorriente(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarCuentas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';
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
    this.listarCuentas();
  }


}

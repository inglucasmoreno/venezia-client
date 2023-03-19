import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styles: [
  ]
})
export class ClientesComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalCliente = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Cliente
  public idCliente: string = '';
  public clientes: any = [];
  public clienteSeleccionado: any;

  // Datos de cliente
  public descripcion: string = '';
  public tipo_identificacion: string = 'DNI';
  public identificacion: string = '';
  public direccion: string = '';
  public telefono: string = '';
  public email: string = '';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
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
    columna: 'descripcion'
  }

  constructor(private clientesService: ClientesService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Clientes';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarClientes();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('CLIENTES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, cliente: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idCliente = '';

    if (estado === 'editar') this.getCliente(cliente);
    else this.showModalCliente = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de cliente
  getCliente(cliente: any): void {
    
    this.idCliente = cliente._id;
    this.clienteSeleccionado = cliente;
    
    this.descripcion = cliente.descripcion;
    this.tipo_identificacion = cliente.tipo_identificacion;
    this.identificacion = cliente.identificacion;
    this.direccion = cliente.direccion;
    this.telefono = cliente.telefono;
    this.email = cliente.email;
    this.showModalCliente = true;

  }

  // Listar clientes
  listarClientes(): void {
    this.clientesService.listarClientes(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.parametro,
      this.filtro.activo
    )
      .subscribe(({ clientes, totalItems }) => {
        this.totalItems = totalItems;
        this.clientes = clientes;
        this.showModalCliente = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo cliente
  nuevoCliente(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar un Apellido y Nombre / Razon social');
      return;
    }

    // Verificacion: Tipo de identificacion
    if (this.tipo_identificacion.trim() === "") {
      this.alertService.info('Debes colocar un tipo de identificacion');
      return;
    }

    // Verificacion: Identificacion
    if (this.identificacion.trim() === "") {
      this.alertService.info('Debes colocar una identificacion');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion.toUpperCase(),
      tipo_identificacion: this.tipo_identificacion,
      identificacion: this.identificacion,
      direccion: this.direccion.toLocaleUpperCase(),
      telefono: this.telefono,
      email: this.email.toLowerCase(),
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.clientesService.nuevoCliente(data).subscribe(() => {
      this.listarClientes();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar cliente
  actualizarCliente(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar un Apellido y Nombre / Razon social');
      return;
    }

    // Verificacion: Tipo de identificacion
    if (this.tipo_identificacion.trim() === "") {
      this.alertService.info('Debes colocar un tipo de identificacion');
      return;
    }

    // Verificacion: Identificacion
    if (this.identificacion.trim() === "") {
      this.alertService.info('Debes colocar una identificacion');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      tipo_identificacion: this.tipo_identificacion,
      identificacion: this.identificacion,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email,
      updatorUser: this.authService.usuario.userId,
    }

    this.clientesService.actualizarCliente(this.idCliente, data).subscribe(() => {
      this.listarClientes();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(cliente: any): void {

    const { _id, activo } = cliente;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.clientesService.actualizarCliente(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarClientes();
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
    this.tipo_identificacion = 'DNI';
    this.identificacion = '';
    this.direccion = '';
    this.telefono = '';
    this.email = '';
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
    this.listarClientes();
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
    this.listarClientes();
  }

}

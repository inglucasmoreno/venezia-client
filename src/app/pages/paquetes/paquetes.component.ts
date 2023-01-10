import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { PaquetesService } from 'src/app/services/paquetes.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: []
})
export class PaquetesComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalPaquete = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Paquete
  public idPaquete: string = '';
  public paquetes: any = [];
  public paqueteSeleccionado: any;
  public descripcion: string = '';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Repartidores
  public repartidores: any[] = [];
  
  // Mayoristas
  public mayoristas: any[] = [];

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: '',
    parametroProductos: '',
    mayorista: '',
    repartidor: '',
    fechaDesde: '',
    fechaHasta: '',
    activo: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(
    private paquetesService: PaquetesService,
    private mayoristasService: MayoristasService,
    public authService: AuthService,
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Unidades de medida';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.cargaInicial();
  }

  // Carga inicial de valores
  cargaInicial(): void {
    this.alertService.loading();

    // Listado de repartidores
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        
        this.repartidores = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');

        // Listado de mayoristas
        this.mayoristasService.listarMayoristas().subscribe({
          next: ({ mayoristas }) => {
            
            this.mayoristas = mayoristas;

            // Listado de pedidos
            this.paquetesService.listarPaquetes(
              this.ordenar.direccion,
              this.ordenar.columna,
              this.desde,
              this.cantidadItems,
              this.filtro.estado,
              this.filtro.parametro,
              this.authService.usuario.role === 'DELIVERY_ROLE' ? this.authService.usuario.userId : this.filtro.repartidor,
              this.filtro.fechaDesde,
              this.filtro.fechaHasta,
              this.filtro.activo
            ).subscribe({
              next: ({ paquetes, paquetesTotal }) => {
                this.paquetes = paquetes.filter(paquete => paquete.activo);
                this.totalItems = paquetesTotal;
                this.alertService.close();
              },
              error: ({ error }) => {
                this.alertService.errorApi(error.message);
              }
            });

          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('UNIDAD_MEDIDA_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, paquete: any = null): void {
    window.scrollTo(0, 0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idPaquete = '';

    if (estado === 'editar') this.getPaquete(paquete);
    else this.showModalPaquete = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de paquete
  getPaquete(paquete: any): void {
    this.alertService.loading();
    this.idPaquete = paquete._id;
    this.paqueteSeleccionado = paquete;
    this.paquetesService.getPaquete(paquete._id).subscribe(({ paquete }) => {
      this.descripcion = paquete.descripcion;
      this.alertService.close();
      this.showModalPaquete = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar paquetes
  listarPaquetes(): void {
    this.paquetesService.listarPaquetes(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.estado,
      this.filtro.parametro,
      this.authService.usuario.role === 'DELIVERY_ROLE' ? this.authService.usuario.userId : this.filtro.repartidor,
      this.filtro.fechaDesde,
      this.filtro.fechaHasta,
      this.filtro.activo
    )
      .subscribe(({ paquetes, totalPaquetes }) => {
        this.paquetes = paquetes;
        this.totalItems = totalPaquetes;
        this.showModalPaquete = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo paquete
  nuevoPaquete(): void {

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

    this.paquetesService.nuevoPaquete(data).subscribe(() => {
      this.listarPaquetes();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar paquete
  actualizarPaquete(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.paquetesService.actualizarPaquete(this.idPaquete, data).subscribe(() => {
      this.listarPaquetes();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(unidad: any): void {

    const { _id, activo } = unidad;

    // Unidades no modificables
    if (unidad._id === '000000000000000000000000' || unidad._id === '111111111111111111111111') {
      this.alertService.info('No se puede modificar esta unidad');
      return;
    }

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.actualizarPaquete(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarPaquetes();
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
    this.listarPaquetes();
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
    this.listarPaquetes();
  }

}

import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasGastosService } from 'src/app/services/mayoristas-gastos.service';
import gsap from 'gsap';
import { MayoristasTiposGastosService } from 'src/app/services/mayoristas-tipos-gastos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-pedidos-gastos',
  templateUrl: './pedidos-gastos.component.html',
  styleUrls: []
})
export class PedidosGastosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalGasto = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Gastos
  public idGasto: string = '';
  public gastos: any = [];
  public gastoSeleccionado: any;
  public montoTotal: number = 0;
  public descripcion: string = '';

  // Nuevo gastos
  public tipo: string = '';
  public repartidor: string = '';
  public monto: number = null;

  // Tipo
  public tipos: any[] = [];

  // Repartidores
  public repartidores: any[] = [];

	// Paginacion
  public totalItems: number;
  public desde: number = 0;
	public paginaActual: number = 1;
	public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: '',
    parametro: '',
    repartidor: '',
    tipo_gasto: '',
    fecha_desde: '',
    fecha_hasta: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'fecha_gasto'
  }

  constructor(
    private gastosService: MayoristasGastosService,
    private tiposService: MayoristasTiposGastosService,
    private usuariosService: UsuariosService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Gastos';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.cargaInicial();
  }

  cargaInicial(): void {
    this.gastosService.listarGastos(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.activo,
      '', // Parametro
      this.filtro.fecha_desde, // Fecha desde
      this.filtro.fecha_hasta, // Fecha hasta
      this.filtro.tipo_gasto,
      this.filtro.repartidor
    )
      .subscribe(({ gastos, totalItems, montoTotal }) => {
        this.gastos = gastos;
        this.totalItems = totalItems;
        this.montoTotal = montoTotal;
        this.tiposService.listarTipos().subscribe({
          next: ({ tipos }) => {
            this.tipos = tipos;
            this.usuariosService.listarUsuarios().subscribe({
              next: ({usuarios}) => {
                this.repartidores = usuarios.filter( usuario => usuario.activo && usuario.role === 'DELIVERY_ROLE' );
                this.alertService.close();    
              }, error: ({error}) => this.alertService.errorApi(error.message)
            })
          }, error: ({error}) => this.alertService.errorApi(error.message)
        })
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MAYORISTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, gasto: any = null): void {
    
    this.tipo = '';
    this.repartidor = '';
    this.monto = null;

    this.idGasto = '';

    if (estado === 'editar') this.getGasto(gasto);
    else this.showModalGasto = true;

    this.estadoFormulario = estado;

    this.alertService.close();
    
  }

  // Traer datos de gasto
  getGasto(gasto: any): void {
    this.alertService.loading();
    this.idGasto = gasto._id;
    this.gastoSeleccionado = gasto;
    this.gastosService.getGasto(gasto._id).subscribe(({ gasto }) => {
      this.tipo = gasto.tipo_gasto._id;
      this.repartidor = gasto.repartidor._id;
      this.monto = gasto.monto;
      this.alertService.close();
      this.showModalGasto = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar gastos
  listarGastos(): void {
    this.gastosService.listarGastos(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.activo,
      '', // Parametro
      this.filtro.fecha_desde, // Fecha desde
      this.filtro.fecha_hasta, // Fecha hasta
      this.filtro.tipo_gasto,
      this.filtro.repartidor
    )
      .subscribe(({ gastos, totalItems, montoTotal }) => {
        this.gastos = gastos;
        this.totalItems = totalItems;
        this.montoTotal = montoTotal;
        this.showModalGasto = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo gasto
  nuevoGasto(): void {

    // Verificacion: Tipo de gasto vacio
    if (this.tipo.trim() === "") {
      this.alertService.info('Debes seleccionar un tipo de gasto');
      return;
    }

    // Verificacion: Repartidor vacio
    if (this.repartidor.trim() === "") {
      this.alertService.info('Debes seleccionar un repartidor');
      return;
    }

    // Verificacion: Monto inválido
    if (this.monto <= 0) {
      this.alertService.info('Debes colocar un monto válido');
      return;
    }

    this.alertService.loading();

    const data = {
      tipo_gasto: this.tipo,
      repartidor: this.repartidor,
      monto: this.monto,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.gastosService.nuevoGasto(data).subscribe(() => {
      this.listarGastos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar gasto
  actualizarGasto(): void {

    // Verificacion: Tipo de gasto vacio
    if (this.tipo.trim() === "") {
      this.alertService.info('Debes seleccionar un tipo de gasto');
      return;
    }

    // Verificacion: Repartidor vacio
    if (this.repartidor.trim() === "") {
      this.alertService.info('Debes seleccionar un repartidor');
      return;
    }

    // Verificacion: Monto inválido
    if (this.monto <= 0) {
      this.alertService.info('Debes colocar un monto válido');
      return;
    }

    this.alertService.loading();

    const data = {
      tipo_gasto: this.tipo,
      repartidor: this.repartidor,
      monto: this.monto,
      updatorUser: this.authService.usuario.userId,
    }

    this.gastosService.actualizarGasto(this.idGasto, data).subscribe(() => {
      this.listarGastos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(gasto: any): void {

    const { _id, activo } = gasto;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.gastosService.actualizarGasto(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarGastos();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

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
    this.listarGastos();
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
    this.listarGastos();
  }

}

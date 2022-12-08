import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasIngresosService } from 'src/app/services/mayoristas-ingresos.service';
import { MayoristasTiposIngresosService } from 'src/app/services/mayoristas-tipos-ingresos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';

@Component({
  selector: 'app-pedidos-ingresos',
  templateUrl: './pedidos-ingresos.component.html',
  styles: [
  ]
})
export class PedidosIngresosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalIngreso = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Ingresos
  public idIngreso: string = '';
  public ingresos: any = [];
  public ingresoSeleccionado: any;
  public montoTotal: number = 0;
  public descripcion: string = '';

  // Nuevo ingresos
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
    tipo_ingreso: '',
    fecha_desde: '',
    fecha_hasta: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'fecha_ingreso'
  }

  constructor(
    private ingresosService: MayoristasIngresosService,
    private tiposService: MayoristasTiposIngresosService,
    private usuariosService: UsuariosService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Ingresos';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.cargaInicial();
  }

  cargaInicial(): void {
    this.ingresosService.listarIngresos(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.activo,
      '', // Parametro
      this.filtro.fecha_desde, // Fecha desde
      this.filtro.fecha_hasta, // Fecha hasta
      this.filtro.tipo_ingreso,
      this.filtro.repartidor
    )
      .subscribe(({ ingresos, totalItems, montoTotal }) => {
        this.ingresos = ingresos;
        this.totalItems = totalItems;
        this.montoTotal = montoTotal;
        this.tiposService.listarTipos().subscribe({
          next: ({ tipos }) => {
            this.tipos = tipos;
            this.usuariosService.listarUsuarios().subscribe({
              next: ({ usuarios }) => {
                this.repartidores = usuarios.filter(usuario => usuario.activo && usuario.role === 'DELIVERY_ROLE');
                this.alertService.close();
              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })
          }, error: ({ error }) => this.alertService.errorApi(error.message)
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
  abrirModal(estado: string, ingreso: any = null): void {

    window.scrollTo(0, 0);

    this.tipo = '';
    this.repartidor = '';
    this.monto = null;

    this.idIngreso = '';

    if (estado === 'editar') this.getIngreso(ingreso);
    else this.showModalIngreso = true;

    this.estadoFormulario = estado;

    this.alertService.close();

  }

  // Traer datos de ingreso
  getIngreso(ingreso: any): void {
    this.alertService.loading();
    this.idIngreso = ingreso._id;
    this.ingresoSeleccionado = ingreso;
    this.ingresosService.getIngreso(ingreso._id).subscribe(({ ingreso }) => {
      this.tipo = ingreso.tipo_ingreso._id;
      this.repartidor = ingreso.repartidor._id;
      this.monto = ingreso.monto;
      this.alertService.close();
      this.showModalIngreso = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar ingresos
  listarIngresos(): void {
    this.ingresosService.listarIngresos(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.activo,
      '', // Parametro
      this.filtro.fecha_desde, // Fecha desde
      this.filtro.fecha_hasta, // Fecha hasta
      this.filtro.tipo_ingreso,
      this.filtro.repartidor
    )
      .subscribe(({ ingresos, totalItems, montoTotal }) => {
        this.ingresos = ingresos;
        this.totalItems = totalItems;
        this.montoTotal = montoTotal;
        this.showModalIngreso = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo ingreso
  nuevoIngreso(): void {

    // Verificacion: Tipo de ingreso vacio
    if (this.tipo.trim() === "") {
      this.alertService.info('Debes seleccionar un tipo de ingreso');
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
      tipo_ingreso: this.tipo,
      repartidor: this.repartidor,
      monto: this.monto,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.ingresosService.nuevoIngreso(data).subscribe(() => {
      this.listarIngresos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar ingreso
  actualizarIngreso(): void {

    // Verificacion: Tipo de gasto vacio
    if (this.tipo.trim() === "") {
      this.alertService.info('Debes seleccionar un tipo de ingreso');
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

    this.ingresosService.actualizarIngreso(this.idIngreso, data).subscribe(() => {
      this.listarIngresos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(ingreso: any): void {

    const { _id, activo } = ingreso;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ingresosService.actualizarIngreso(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarIngresos();
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
    this.listarIngresos();
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
    this.listarIngresos();
  }

}

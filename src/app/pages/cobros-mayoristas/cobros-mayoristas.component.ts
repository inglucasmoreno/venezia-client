import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CobrosMayoristasService } from 'src/app/services/cobros-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import gsap from 'gsap';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { CobrosPedidosService } from 'src/app/services/cobros-pedidos.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';

@Component({
  selector: 'app-cobros-mayoristas',
  templateUrl: './cobros-mayoristas.component.html',
  styles: [
  ]
})
export class CobrosMayoristasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalCobro = false;
  public showModalDetallesCobro = false;
  public showModalDetallesPedido = false;

  // Pedido
  public pedidoSeleccionado: any = {};
  public productos: any[] = [];

  // Mayoristas
  public mayoristas: any[] =[];

  // Repartidores
  public repartidores: any[] = [];

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Cobro
  public idCobro: string = '';
  public cobros: any = [];
  public cobroSeleccionado: any;
  public descripcion: string = '';
  public relacionCobroPedidos: any[] = [];

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    mayorista: '',
    repartidor: '',
    estado: '',
    tipo: '',
    activo: 'true',
    parametro: '',
    fecha_desde: '',
    fecha_hasta: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'nro'
  }

  constructor(
    private cobrosService: CobrosMayoristasService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService,
    private mayoristasService: MayoristasService,
    private usuariosService: UsuariosService,
    private cobrosPedidosService: CobrosPedidosService,
    private pedidosProductosService: VentasMayoristasProductosService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Cobros';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.calculosIniciales();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MAYORISTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Calculos iniciales
  calculosIniciales(): void {
    this.mayoristasService.listarMayoristas().subscribe({
      next: ({mayoristas}) => {
        this.mayoristas = mayoristas;
        this.usuariosService.listarUsuarios().subscribe({
          next: ({usuarios}) => {
            this.repartidores = usuarios.filter( usuario => usuario.role === 'DELIVERY_ROLE' );
            this.listarCobros();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({error}) => this.alertService.errorApi(error.message)   
    })
  }

  // Abrir modal
  abrirModal(estado: string, cobro: any = null): void {
    window.scrollTo(0, 0);
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idCobro = '';

    if (estado === 'editar') this.getCobro(cobro);
    else this.showModalCobro = true;

    this.estadoFormulario = estado;
  }

  // Traer datos del cobro
  getCobro(cobro: any): void {
    this.alertService.loading();
    this.idCobro = cobro._id;
    this.cobroSeleccionado = cobro;
    this.cobrosPedidosService.listarRelaciones(-1, 'createdAt', cobro._id).subscribe({
      next: ({ relaciones }) => {
        this.relacionCobroPedidos = relaciones;
        this.showModalCobro = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)    
    })
    this.cobrosService.getCobro(cobro._id).subscribe(({ cobro }) => {

    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar cobros
  listarCobros(): void {
    this.cobrosService.listarCobros(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.estado,
      this.filtro.parametro,
      this.filtro.repartidor,
      this.filtro.mayorista,
      this.filtro.fecha_desde,
      this.filtro.fecha_hasta,
      this.filtro.tipo
    )
      .subscribe(({ cobros, totalItems }) => {
        this.cobros = cobros;
        this.totalItems = totalItems;
        this.showModalCobro = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo cobro
  nuevoCobro(): void {

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

    this.cobrosService.nuevoCobro(data).subscribe(() => {
      this.listarCobros();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar cobro
  actualizarCobro(): void {

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

    this.cobrosService.actualizarCobro(this.idCobro, data).subscribe(() => {
      this.listarCobros();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(cobro: any): void {

    const { _id, activo } = cobro;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cobrosService.actualizarCobro(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarCobros();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Abrir detalles de cobro
  abrirDetallesCobro(cobro: any): void {
    this.alertService.loading();
    this.cobroSeleccionado = cobro;
    this.cobrosPedidosService.listarRelaciones(-1, 'createdAt', cobro._id).subscribe({
      next: ({ relaciones }) => {
        this.relacionCobroPedidos = relaciones;
        this.showModalDetallesCobro = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir detalles de pedido
  abrirDetallesPedido(pedido: any): void {
    this.alertService.loading();
    this.pedidosProductosService.listarProductos(1, 'descripcion', pedido._id).subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        this.pedidoSeleccionado = pedido;
        this.showModalDetallesCobro = false;
        this.showModalDetallesPedido = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  } 

  // Cerrar detalles de pedido
  cerrarDetallesPedido(): void {
    this.showModalDetallesPedido = false;
    this.showModalDetallesCobro = true;
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
    this.listarCobros();
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
    this.listarCobros();
  }


}

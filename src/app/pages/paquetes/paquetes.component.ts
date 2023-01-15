import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { PaquetesService } from 'src/app/services/paquetes.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import { environment } from 'src/environments/environment';
import { UsuariosService } from '../../services/usuarios.service';

const base_url = environment.base_url;

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: []
})
export class PaquetesComponent implements OnInit {

  // Fecha
  public fechaMasivo = format(new Date(),'yyyy-MM-dd')

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalPaquete = false;
  public showModalProductosPendientes = false;
  public showModalCompletarDeuda = false;
  public showModalListadoPreparacion = false;
  public showModalEnvioMasivo = false;
  public showModalEnviar = false;

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
  public repartidoresLista: any[] = [];
  public repartidorSeleccionado: any;

  // Mayoristas
  public mayoristas: any[] = [];

  // Productos
  public productosPendientes: any[] = [];

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: '',
    parametroProductos: '',
    mayorista: '',
    repartidor: '',
    fecha: '',
    fechaDesde: '',
    fechaHasta: '',
    activo: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'fecha_paquete'
  }
  
  constructor(
    private paquetesService: PaquetesService,
    private mayoristasService: MayoristasService,
    private ventasMayoristasService: VentasMayoristasService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
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
              this.filtro.fecha,
              this.filtro.fecha,
              this.filtro.activo
            ).subscribe({
              next: ({ paquetes, totalItems }) => {
                this.paquetes = paquetes.filter(paquete => paquete.activo);
                this.totalItems = totalItems;
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
      this.filtro.fecha,
      this.filtro.fecha,
      this.filtro.activo
    )
      .subscribe(({ paquetes, totalItems }) => {
        this.paquetes = paquetes;
        this.totalItems = totalItems;
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

  // Enviar paquete
  enviarPaquete(): void {
    this.alertService.question({ msg: '¿Quieres enviar el paquete?', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.enviarPaquete(this.paqueteSeleccionado._id, this.fechaMasivo).subscribe({
            next: () => {
              this.listarPaquetes();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Productos para elaboracion
  productosParaElaboracion(): void {
    this.alertService.loading();
    this.ventasMayoristasProductosService.listarProductos(1, 'descripcion', '', 'true').subscribe({
      next: ({ productos }) => {

        let productoTMP = productos;

        this.productosPendientes = [];

        const agregados = [];

        productoTMP.map(producto => {
          if (!agregados.includes(producto.producto._id)) {
            agregados.push(producto.producto._id);
            this.productosPendientes.push(producto);
          } else {
            this.productosPendientes.map(elemento => {
              if (elemento.producto._id === producto.producto._id) {
                elemento.cantidad += producto.cantidad;
              }
            })
          }
        });

        this.showModalProductosPendientes = true;
        this.showModalCompletarDeuda = false;
        this.alertService.close();

      },

      error: ({ error }) => this.alertService.errorApi(error.message)

    })
  }

  // PDF - Productos para elaboracion
  productosParaElaboracionPDF(): void {
    this.alertService.loading();
    this.ventasMayoristasProductosService.generarPDF().subscribe({
      next: () => {
        this.alertService.close();
        window.open(`${base_url}/pdf/productos_pendientes.pdf`, '_blank');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Generar listado de deudas PDF
  generarListadoDeudas(): void {
    this.alertService.question({ msg: '¿Quieres generar listado de deudas?', buttonText: 'Generar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.ventasMayoristasService.detallesDeudasPDF().subscribe({
          next: () => {
            window.open(`${base_url}/pdf/deudas_mayoristas.pdf`, '_blank');
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })     
      }
    }); 
  }

  // Abrir preparacion pedidos
  abrirPreparacionPedidos(): void {
    this.alertService.loading();
    this.repartidorSeleccionado = '';
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidoresLista = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');
        this.showModalListadoPreparacion = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Generar listado de preparacion
  generarListadoPreparacion(): void {

    this.alertService.loading();

    if (this.repartidorSeleccionado === '') {
      this.ventasMayoristasProductosService.generarPreparacionPedidosPDF().subscribe({
        next: () => {
          window.open(`${base_url}/pdf/productos_preparacion_pedidos.pdf`, '_blank');
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    } else {
      this.ventasMayoristasProductosService.generarPreparacionPedidosPorRepartidorPDF(this.repartidorSeleccionado).subscribe({
        next: () => {
          window.open(`${base_url}/pdf/productos_preparacion_pedidos_por_repartidor.pdf`, '_blank');
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

  }

  // Impresion masiva
  impresionMasiva(): void {
    this.alertService.question({ msg: '¿Quieres realizar una impresion masiva?', buttonText: 'Imprimir' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasService.talonariosMasivosPDF().subscribe({
            next: () => {
              this.alertService.close();
              window.open(`${base_url}/pdf/talonarios_masivos.pdf`, '_blank');
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }
      });      
  }

  // Eliminar paquete
  eliminarPaquete(paquete: any): void {
    this.alertService.question({ msg: 'Eliminando paquete', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.eliminarPaquete(paquete._id).subscribe({
            next: () => {
              this.listarPaquetes();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        };
      });
  }

  // Abrir envio de paquete
  abrirEnviosMasivos(): void {
    this.fechaMasivo = format(new Date(),'yyyy-MM-dd');
    this.showModalEnvioMasivo = true;
  }

  // Abrir envios masivos
  abrirEnviarPaquete(paquete: any): void {
    this.paqueteSeleccionado = paquete;
    this.fechaMasivo = format(new Date(),'yyyy-MM-dd');
    this.showModalEnviar = true;
  }

  // Envio masivo
  envioMasivo(): void {

    // Verificacion: Fecha de pedido
    if(this.fechaMasivo === ''){
      this.alertService.info('Debe colocar una fecha correcta');
      return;
    }

    this.alertService.question({ msg: '¿Quieres realizar un envio masivo?', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.envioMasivoPaquetes(this.fechaMasivo).subscribe({
            next: () => {
              this.showModalEnvioMasivo = false;
              this.listarPaquetes();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
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

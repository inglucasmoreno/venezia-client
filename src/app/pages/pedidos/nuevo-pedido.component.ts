import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { format } from 'date-fns';
import { PaquetesService } from '../../services/paquetes.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: []
})
export class NuevoPedidoComponent implements OnInit {

  // Modal
  public showModalProductos = false;
  public showModalNuevoPedido = false;
  public showModalDetallesPedido = false;
  public showModalNuevoProducto = false;

  // Fecha del paquete
  public fecha_paquete: string = format(new Date(), 'yyyy-MM-dd');

  // Etapas
  public etapa: string = 'creacion';

  // Variables
  public precioCarrito: number = 0;
  public productos: any[] = [];
  public cantidad: number = null;
  public productoSeleccionado: any = null;
  public carrito: any[] = [];

  // Paquete
  public paquete: any;
  public precio_total: number = 0;

  // Pedidos
  public pedidos: any[] = [];
  public pedidoSeleccionado: any;
  public pedidos_productos: any[] = [];
  public nuevaCantidad: number;

  // Mayoristas
  public mayorista: string = '';
  public mayoristas: any[] = [];

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Repartidores
  public repartidor: string = '';
  public repartidores: any[] = [];

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private dataService: DataService,
    public authService: AuthService,
    private paquetesService: PaquetesService,
    private alertService: AlertService,
    private usuarioService: UsuariosService,
    private mayoristasService: MayoristasService,
    private ventasMayoristasService: VentasMayoristasService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
    private productosService: ProductosService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = "Dashboard - Nuevo pedido";
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.recuperarLocalStorage();
    this.alertService.loading();
    this.calculosIniciales();
  }

  calculosIniciales(): void {

    // Se listan los mayoristas activos
    this.mayoristasService.listarMayoristas().subscribe({
      next: ({ mayoristas }) => {
        this.mayoristas = mayoristas.filter(mayorista => mayorista.activo);

        // Listado de repartidores
        this.usuarioService.listarUsuarios().subscribe({
          next: ({ usuarios }) => {

            this.repartidores = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');

            // Listado de pedidos
            if (this.etapa === 'paquete' && this.paquete) {
              this.listarPedidos();
            } else {
              this.alertService.close();
            }


          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Listado de productos
  listarProductos(): void {

    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos.filter(producto => producto.precio_mayorista);
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });

  }

  // Listar pedidos de un paquete
  listarPedidos(): void {
    this.ventasMayoristasService.listarVentas(
      -1,
      'createdAt',
      0,
      100000,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      String(this.paquete._id)
    ).subscribe({
      next: ({ventas}) => {
        this.pedidos = ventas;
        this.productoSeleccionado = null;
        this.calcularPrecioTotal();
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Agregar producto
  agregarProducto(): void {

    if (!this.cantidad || this.cantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.carrito.find(elemento => {
      if (elemento.producto._id === this.productoSeleccionado._id) {
        repetido = true;
        elemento.cantidad += this.dataService.redondear(this.cantidad, 2);
        elemento.precio += this.dataService.redondear(this.productoSeleccionado.precio_mayorista * this.cantidad, 2);
      }
    });

    // Se agrega si el producto no esta cargado en el carrito
    if (!repetido) this.carrito.unshift(
      {
        producto: this.productoSeleccionado,
        descripcion: this.productoSeleccionado.descripcion,
        precio_unitario: this.productoSeleccionado.precio_mayorista,
        repartido: this.authService.usuario.userId,
        precio: this.productoSeleccionado.precio_mayorista * this.cantidad,
        unidad_medida: this.productoSeleccionado.unidad_medida._id,
        entregado: true,
        unidad_medida_descripcion: this.productoSeleccionado.unidad_medida.descripcion,
        cantidad: this.cantidad,
        precio_total: this.dataService.redondear(this.productoSeleccionado.precio_mayorista * this.cantidad, 2),
        creatorUser: this.mayorista,
        updatorUser: this.mayorista
      }
    );

    this.filtro.parametro = '';
    this.calculoPrecio();
    this.cerrarSeleccion();

  }

  // Eliminar producto
  eliminarProducto(producto: any): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.carrito = this.carrito.filter(elemento => elemento.producto._id !== producto.producto._id)
          this.calculoPrecio();
        };
      });
  }

  // Calculo precio
  calculoPrecio(): void {
    let precioTMP = 0;
    this.carrito.map(elemento => {
      precioTMP += elemento.precio;
    })
    this.precioCarrito = precioTMP;
    this.almacenarLocalStorage();
  }

  // Recuperar info del localStorage
  recuperarLocalStorage(): void {
    this.paquete = localStorage.getItem('pedidos-paquete') ? JSON.parse(localStorage.getItem('pedidos-paquete')) : null;
    this.etapa = localStorage.getItem('pedidos-etapa') ? JSON.parse(localStorage.getItem('pedidos-etapa')) : 'creacion';
    this.repartidor = localStorage.getItem('pedidos-repartidor') ? JSON.parse(localStorage.getItem('pedidos-repartidor')) : '';
    this.fecha_paquete = localStorage.getItem('pedidos-fecha_paquete') && this.fecha_paquete !== '' ? JSON.parse(localStorage.getItem('pedidos-fecha_paquete')) : format(new Date(), 'yyyy-MM-dd');
    this.precioCarrito = localStorage.getItem('pedidos-precioCarrito') ? JSON.parse(localStorage.getItem('pedidos-precioCarrito')) : 0;
    this.carrito = localStorage.getItem('pedidos-carrito') ? JSON.parse(localStorage.getItem('pedidos-carrito')) : [];
    this.mayorista = localStorage.getItem('pedidos-mayorista') && this.carrito.length !== 0 ? JSON.parse(localStorage.getItem('pedidos-mayorista')) : '';
  }

  // Almacenar en localStorage
  almacenarLocalStorage(): void {
    localStorage.setItem('pedidos-paquete', JSON.stringify(this.paquete));
    localStorage.setItem('pedidos-etapa', JSON.stringify(this.etapa));
    localStorage.setItem('pedidos-fecha_paquete', JSON.stringify(this.fecha_paquete));
    localStorage.setItem('pedidos-repartidor', JSON.stringify(this.repartidor));
  }

  // Crear nuevo pedido
  crearPedido(): void {

    if (this.repartidor.trim() === '' && this.authService.usuario.role !== 'DELIVERY_ROLE') {
      this.alertService.info('Debe seleccionar un repartidor');
      return;
    }

    if (this.mayorista.trim() === '') {
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }

    this.alertService.question({ msg: 'Enviando pedido', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const data = {
            pedido: {
              mayorista: this.mayorista,
              repartidor: this.authService.usuario.role === 'DELIVERY_ROLE' ? this.authService.usuario.userId : this.repartidor,
              deuda: false,
              deuda_monto: 0,
              estado: 'Pendiente',
              precio_total: this.precioCarrito,
              creatorUser: this.mayorista,
              updatorUser: this.mayorista
            },
            productos: this.carrito
          };

          this.ventasMayoristasService.nuevaVenta(data).subscribe({
            next: () => {
              this.alertService.success('Pedido enviado!');
              this.reiniciarPedido();
            },
            error: ({ error }) => {
              this.alertService.errorApi(error.message);
            }
          })

        };
      });
  }

  // Abrir modal productos
  abrirModalProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos.filter(producto => producto.precio_mayorista);
        this.showModalProductos = true;
        this.showModalNuevoPedido = false;
        this.productoSeleccionado = null;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Cerrar modal productos
  cerrarModalProductos(): void {
    this.showModalProductos = false;
    this.showModalNuevoPedido = true;
  }

  // Cerrar seleccion de producto
  cerrarSeleccion(): void {
    this.cantidad = null;
    this.productoSeleccionado = null;
  }

  // Reiniciar pedido
  reiniciarPedido(): void {
    this.productoSeleccionado = null;
    this.mayorista = '';
    this.carrito = [];
    this.cantidad = null;
    this.precioCarrito = 0;
    this.almacenarLocalStorage();
  }

  // Crear paquete
  crearPaquete(): void {

    // Verificacion: Fecha de paquete
    if (!this.fecha_paquete) {
      this.alertService.info('Debe colocar una fecha de paquete válida');
      return;
    }

    // Verificacion - Seleccionar repartidor - Usuario administrador
    if (this.authService.usuario.role === 'ADMIN_ROLE' && this.repartidor === '') {
      this.alertService.info('Debe seleccionar un repartidor');
      return;
    }

    const data = {
      fecha_paquete: this.fecha_paquete,
      repartidor: this.authService.usuario.role === 'DELIVERY_ROLE' ? String(this.authService.usuario.userId) : this.repartidor,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };

    this.alertService.loading();

    this.paquetesService.nuevoPaquete(data).subscribe({
      next: ({ paquete }) => {
        this.etapa = 'paquete';
        this.paquete = paquete;
        this.almacenarLocalStorage();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  completarPedido(): void {

    // Verificacion: Mayorista
    if (this.mayorista === '') {
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }

    // Adaptando productos
    this.carrito.map( producto => {
      producto.creatorUser = this.mayorista;
      producto.updatorUser = this.mayorista;
    });

    // Creando pedido
    this.alertService.question({ msg: 'Creando pedido', buttonText: 'Crear' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const data = {
            pedido: {
              paquete: this.paquete._id,
              mayorista: this.mayorista,
              repartidor: this.authService.usuario.role === 'DELIVERY_ROLE' ? String(this.authService.usuario.userId) : this.repartidor,
              deuda: false,
              deuda_monto: 0,
              estado: 'Pendiente',
              precio_total: this.precioCarrito,
              creatorUser: this.mayorista,
              updatorUser: this.mayorista
            },
            productos: this.carrito
          };

          console.log(data);

          this.ventasMayoristasService.nuevaVenta(data).subscribe({
            next: () => {
              this.showModalNuevoPedido = false;
              this.listarPedidos();
              this.reiniciarPedido();
            },
            error: ({ error }) => {
              this.alertService.errorApi(error.message);
            }
          })

        };
      });

  }

  // Completar paquete
  completarPaquete(): void {

    // Verificacion: Cantidad de productos
    if(this.pedidos.length === 0){
      this.alertService.info('Debe agregar al menos un pedido');
      return;
    }

    this.alertService.question({ msg: 'Completando paquete', buttonText: 'Completar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        const data = {
          paquete: this.paquete._id,
          fecha: this.fecha_paquete,
          cantidad_pedidos: this.pedidos.length,
          precio_total: this.precio_total,
          repartidor: this.authService.usuario.role === 'DELIVERY_ROLE' ? String(this.authService.usuario.userId) : this.repartidor
        };
        this.paquetesService.completarPaquete(data).subscribe({
          next: () => {
            this.paquete = null;
            this.carrito = [];
            this.productos = [];
            this.pedidos = [];
            this.repartidor = '';
            this.fecha_paquete = format(new Date(), 'yyyy-MM-dd');
            this.etapa = 'creacion';
            this.almacenarLocalStorage();
            this.alertService.success('Paquete completado correctamente');
          }, error: ({error}) => this.alertService.errorApi(error.message)
        })
      };
    });   
  }

  // Eliminar pedido
  eliminarPedido(idPedido): void {
    this.alertService.question({ msg: 'Eliminando pedido', buttonText: 'Eliminar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.ventasMayoristasService.eliminarVenta(idPedido).subscribe({
          next: () => {
            this.listarPedidos();
          }, error: ({error}) => this.alertService.errorApi(error.message)
        })
      };
    });
  }

  // Producto seleccionado
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
  }

  // Abrir nuevo pedido
  abrirNuevoPedido(): void {
    this.showModalNuevoPedido = true;
  }

  // Abrir detalles de pedido
  abrirDetallesPedido(pedido: any): void {
    this.alertService.loading();
    this.ventasMayoristasProductosService.listarProductos(
      1,
      'descripcion',
      String(pedido._id)
    ).subscribe({
      next: ({ productos }) => {
        console.log(productos);
        this.pedidos_productos = productos;
        this.pedidoSeleccionado = pedido;
        this.productoSeleccionado = null;
        this.nuevaCantidad = null;
        this.showModalDetallesPedido = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  actualizarProductoDetalle(): void {
    
    // Verificacion de nueva cantidad
    if (!this.nuevaCantidad || this.nuevaCantidad < 0) {
      this.alertService.info('Debe colocar una cantidad valida');
      return;
    }

    this.alertService.question({ msg: 'Actualizar producto', buttonText: 'Actualizar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const nuevoPrecio = this.nuevaCantidad * this.productoSeleccionado.precio_unitario;

          // Se actualizar el producto
          this.ventasMayoristasProductosService.actualizarProducto(this.productoSeleccionado._id, {
            precio: nuevoPrecio,
            cantidad: this.nuevaCantidad
          }).subscribe({
            next: () => {

              const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio + nuevoPrecio;

              // Se actualizar el pedido
              this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
                precio_total: nuevoPrecioPedido,
                activo: true
              }).subscribe({

                next: () => {

                  this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;
                  // Se actualizar el producto en la interfaz
                  this.pedidos_productos.map(elemento => {
                    if (elemento._id === this.productoSeleccionado._id) {
                      elemento.precio = nuevoPrecio,
                        elemento.cantidad = this.nuevaCantidad
                    }
                  })

                  this.nuevaCantidad = null;

                  this.listarPedidos();

                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        }
      });
  }

  eliminarProductoDetalle(): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();

          // Se elimina el producto
          this.ventasMayoristasProductosService.eliminarProducto(this.productoSeleccionado._id).subscribe({
            next: ({ producto }) => {
              const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio;
              this.pedidos_productos = this.pedidos_productos.filter(elemento => elemento._id !== producto._id);

              // Se actualiza el pedido
              this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
                precio_total: nuevoPrecioPedido,
                activo: true
              }).subscribe({
                next: () => {
                  this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;
                  this.nuevaCantidad = null;
                  this.listarPedidos();
                }, error: ({ error }) => {
                  this.alertService.errorApi(error.message);
                }
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Abrir modal nuevo producto
  abrirModalNuevoProducto(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.listaProductos = productos.filter(producto => producto.precio_mayorista);
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.showModalDetallesPedido = false;
        this.filtro.parametro = '';
        this.showModalNuevoProducto = true;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    this.showModalNuevoProducto = false;
    this.showModalDetallesPedido = true;
  }

  // Seleccionar nuevo producto
  seleccionarNuevoProducto(producto: any): void {
    this.nuevoProductoSeleccionado = producto;
    this.nuevoProductoCantidad = producto.cantidad;
  }

  agregarNuevoProducto(): void {

    // Verificacion: Cantidad
    if (!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.pedidos_productos.find(elemento => {
      if (elemento.producto._id === this.nuevoProductoSeleccionado._id) {
        repetido = true;
      }
    });

    // Producto repetido
    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado');
      return;
    }

    // Se agrega si el producto no esta cargado en el carrito
    if (!repetido) {

      this.alertService.loading();

      const dataProducto = {
        ventas_mayorista: this.pedidoSeleccionado._id,
        producto: this.nuevoProductoSeleccionado,
        descripcion: this.nuevoProductoSeleccionado.descripcion,
        precio_unitario: this.nuevoProductoSeleccionado.precio_mayorista,
        repartido: this.pedidoSeleccionado.repartidor,
        precio: this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad,
        unidad_medida: this.nuevoProductoSeleccionado.unidad_medida._id,
        entregado: true,
        unidad_medida_descripcion: this.nuevoProductoSeleccionado.unidad_medida.descripcion,
        cantidad: this.nuevoProductoCantidad,
        precio_total: this.dataService.redondear(this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad, 2),
        creatorUser: this.pedidoSeleccionado.mayorista,
        updatorUser: this.pedidoSeleccionado.mayorista
      }

      // Agregando producto
      this.ventasMayoristasProductosService.nuevoProducto(dataProducto).subscribe({
        next: ({ producto }) => {

          this.pedidos_productos.unshift(producto);

          // Calculo de precio
          let precioTMP = 0;
          this.pedidos_productos.map(elemento => {
            precioTMP += elemento.precio;
          })

          this.pedidoSeleccionado.precio_total = precioTMP;

          // Se actualizar el pedido
          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
            precio_total: this.pedidoSeleccionado.precio_total,
            activo: true
          }).subscribe({
            next: () => {
              this.showModalNuevoProducto = false;
              this.showModalDetallesPedido = true;
              this.listarPedidos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })

    }

    this.filtro.parametro = '';
  }


  // Calcular precio total
  calcularPrecioTotal(): void {
    let precioTMP = 0;
    this.pedidos.map( pedido => {
      precioTMP += pedido.precio_total;
    });
    this.precio_total = precioTMP;
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
    this.listarProductos();
  }

}

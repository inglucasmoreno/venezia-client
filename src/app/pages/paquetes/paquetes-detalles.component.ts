import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PaquetesService } from 'src/app/services/paquetes.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-paquetes-detalles',
  templateUrl: './paquetes-detalles.component.html',
  styles: [
  ]
})
export class PaquetesDetallesComponent implements OnInit {

  // Flag
  public inicio = true;

  // Fecha de paquete
  public fecha = format(new Date(), 'yyyy-MM-dd');

  // Modal
  public showModalNuevoProducto: boolean = false;
  public showModalNuevoPedido: boolean = false;
  public showModalProductos: boolean = false;
  public showModalEnviar: boolean = false;

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

  // Paquete
  public idPaquete: string;
  public paquete: any;
  public pedidos: any;
  public pedidoSeleccionado: any;

  // Mayoristas
  public mayoristas: any[] = [];
  public mayorista: string = '';

  // Carrito
  public precioCarrito: number;
  public carrito: any[] = [];

  // Productos
  public productos: any[] = [];
  public productoSeleccionado: any;
  public cantidad: number = null;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
  }

  // Filtrado de pedidos
  public filtroPedido = {
    mayorista: '',
    parametro: ''
  }

  constructor(
    public authService: AuthService,
    private mayoristasService: MayoristasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private dataService: DataService,
    private paquetesService: PaquetesService,
    private pedidosService: VentasMayoristasService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
    private productosService: ProductosService
  ) { }


  // Inicio del componente
  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Dashboard - Detalles de paquete";
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.idPaquete = id;
        this.alertService.loading();
        this.getPaquete();
      }
    })
  }

  // Detalles del paquete
  getPaquete(): void {
    this.paquetesService.getPaquete(this.idPaquete).subscribe({
      next: ({ paquete }) => {
        this.paquete = paquete;
        this.fecha = format(new Date(paquete.fecha_paquete), 'yyyy-MM-dd');
        console.log(paquete);

        // Listado de pedidos
        this.pedidosService.listarVentas(
          1,
          'mayorista.descripcion',
          0,
          1000,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          String(this.idPaquete)
        ).subscribe({
          next: ({ ventas }) => {
            
            this.pedidos = ventas;
            console.log(ventas);
            this.showModalNuevoPedido = false;

            if(this.inicio){
              this.mayoristasService.listarMayoristas().subscribe({
                next: ({ mayoristas }) => {
                  this.mayoristas = mayoristas.filter(mayorista => mayorista.activo);
                  this.inicio = false;
                  this.alertService.close();
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })              
            }else{
              this.alertService.close();
            }

          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar cantidad - Producto
  actualizarCantidadProducto(pedido: any, producto: any): void {

    // Verificacion: Cantidad
    if (!producto.cantidad || producto.cantidad <= 0) {
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    // Actualizacion precio de producto
    producto.precio = producto.cantidad * producto.precio_unitario;

    const data = {
      cantidad: producto.cantidad,
      precio: producto.precio
    }

    // Actualizacion de producto en backend
    this.alertService.loading();
    this.ventasMayoristasProductosService.actualizarProducto(producto._id, data).subscribe({
      next: () => {
        this.calcularTotalPedido(pedido);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Eliminar paquete
  eliminarPaquete(): void {
    this.alertService.question({ msg: 'Eliminando paquete', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.eliminarPaquete(this.idPaquete).subscribe({
            next: () => {
              this.router.navigateByUrl('/dashboard/paquetes');
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        };
      });
  }

  // Eliminar producto
  eliminarProducto(pedido: any, producto: any): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasProductosService.eliminarProducto(producto._id).subscribe({
            next: () => {
              pedido.productos = pedido.productos.filter(elemento => elemento._id !== producto._id);
              this.calcularTotalPedido(pedido);
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }


  // Eliminar producto
  eliminarProductoNuevoPedido(producto: any): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.carrito = this.carrito.filter(elemento => elemento.producto._id !== producto.producto._id)
          this.calculoPrecio();
        };
      });
  }

  // Eliminar pedido
  eliminarPedido(pedido: any): void {
    this.alertService.question({ msg: 'Eliminando pedido', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.pedidosService.eliminarVenta(pedido._id).subscribe({
            next: () => {
              this.pedidos = this.pedidos.filter(elemento => elemento._id !== pedido._id);
              this.calcularTotalPaquete();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  // Seleccionar nuevo producto
  seleccionarNuevoProducto(producto: any): void {
    this.nuevoProductoSeleccionado = producto;
    this.nuevoProductoCantidad = producto.cantidad;
  }

  // Caluclar totales de pedido
  calcularTotalPedido(pedido: any) {
    let totalTMP = 0;
    pedido.productos.map(producto => {
      totalTMP += producto.precio;
    })
    pedido.precio_total = totalTMP;
    this.calcularTotalPaquete();
  }

  // Calcular totales de paquete
  calcularTotalPaquete(): void {
    let totalTMP = 0;
    this.pedidos.map(pedido => {
      totalTMP += pedido.precio_total;
    });
    this.paquete.precio_total = totalTMP;
  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    this.showModalNuevoProducto = false;
  }

  agregarNuevoProducto(): void {

    // Verificacion: Cantidad
    if (!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    console.log(this.pedidoSeleccionado.productos);
    console.log(this.nuevoProductoSeleccionado);

    // Verificacion: Producto repetido
    this.pedidoSeleccionado.productos.find(elemento => {
      if (elemento.producto === this.nuevoProductoSeleccionado._id) {
        repetido = true;
      }
    });

    // Producto repetido
    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado en este pedido');
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

      // Agregar producto
      this.ventasMayoristasProductosService.nuevoProducto(dataProducto).subscribe({
        next: ({ producto }) => {
          console.log(producto);
          this.nuevoProductoSeleccionado = null;
          this.nuevoProductoCantidad = null;
          this.pedidoSeleccionado.productos.push(producto);
          this.calcularTotalPedido(this.pedidoSeleccionado);
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })

    }

    this.filtro.parametro = '';

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

  completarPedido(): void {

    // Verificacion: Mayorista
    if (this.mayorista === '') {
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }

    // Adaptando productos
    this.carrito.map(producto => {
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
              repartidor: String(this.authService.usuario.userId),
              deuda: false,
              deuda_monto: 0,
              estado: 'Pendiente',
              precio_total: this.precioCarrito,
              creatorUser: this.mayorista,
              updatorUser: this.mayorista
            },
            productos: this.carrito
          };

          this.pedidosService.nuevaVenta(data).subscribe({
            next: () => {
              this.alertService.loading();
              this.getPaquete();
            },
            error: ({ error }) => {
              this.alertService.errorApi(error.message);
            }
          })

        };
      });

  }

  // Abrir modal nuevo producto
  abrirModalNuevoProducto(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.listaProductos = productos.filter(producto => producto.precio_mayorista);
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.filtro.parametro = '';
        this.showModalNuevoProducto = true;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Abrir nuevo pedido
  abrirNuevoPedido(): void {
    this.showModalNuevoPedido = true;
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

  // Calculo precio
  calculoPrecio(): void {
    let precioTMP = 0;
    this.carrito.map(elemento => {
      precioTMP += elemento.precio;
    })
    this.precioCarrito = precioTMP;
  }

  // Enviar paquete
  enviarPaquete(): void {
    this.alertService.question({ msg: '¿Quieres enviar el paquete?', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.enviarPaquete(this.paquete._id, this.fecha).subscribe({
            next: () => {
              this.paquete.estado = 'Enviado';
              this.alertService.success('Paquete enviado correctamente');
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar fecha
  actualizarFecha(): void {
    
    // Verificacion: Fecha
    if(!this.fecha || this.fecha === ''){
      this.alertService.info('Debe colocar una fecha válida');
      return;
    }

    this.alertService.loading();
    this.paquetesService.actualizarPaquete(this.paquete._id, { fecha_paquete: this.fecha }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
    console.log('Actualizar fecha');
  }

  // Abrir envio de paquete
  abrirEnviarPaquete(): void {
    this.fecha = this.fecha;
    this.showModalEnviar = true;
  }

  // Cerrar modal productos
  cerrarModalProductos(): void {
    this.showModalProductos = false;
    this.showModalNuevoPedido = true;
  }

  // Producto seleccionado
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
  }

  // Cerrar seleccion de producto
  cerrarSeleccion(): void {
    this.cantidad = null;
    this.productoSeleccionado = null;
  }

}

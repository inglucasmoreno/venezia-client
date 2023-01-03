import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { MayoristasTiposGastosService } from 'src/app/services/mayoristas-tipos-gastos.service';
import { MayoristasTiposIngresosService } from 'src/app/services/mayoristas-tipos-ingresos.service';

@Component({
  selector: 'app-pedidos-completar',
  templateUrl: './pedidos-completar.component.html',
  styles: [
  ]
})
export class PedidosCompletarComponent implements OnInit {

  // Fechas
  public fechaPedidos = format(new Date(), 'yyyy-MM-dd');

  // Modals
  public showListadoProductos = false;
  public showNuevoProducto = false;
  public showGastoIngreso = false;

  // Repartidores
  public repartidores: any[];
  public repartidor: string = '';

  // Pedidos
  public pedidoSeleccionado: any;
  public pedidosEnviados: any[];
  public productos: any[];
  public productoSeleccionado: any;
  public nuevaCantidad: number;

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

  // Variables - Calculos
  public totalPedidosMasivo = 0;
  public totalDeudaMasivo = 0;
  public totalAnticipoMasivo = 0;
  public totalRecibidoMasivo = 0;

  // Gastos e Ingresos
  public tipo: string = 'gasto';
  public tipo_gasto: any = '';
  public tipo_ingreso: any = '';
  public tipos_gastos: any[] = [];
  public tipos_ingresos: any[] = [];
  public total_gastos: number = 0;
  public total_ingresos: number = 0;
  public gastos: any[] = [];
  public ingresos: any[] = [];
  public monto: number = null;

  // Filtro
  public filtro = {
    parametroProductos: ''
  }

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private tiposGastosService: MayoristasTiposGastosService,
    private tiposIngresosService: MayoristasTiposIngresosService,
    private productosService: ProductosService,
    private usuariosService: UsuariosService,
    private ventasMayoristasService: VentasMayoristasService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Completando pedidos';
    this.recuperarLocalStorage();
    this.calculosIniciales();
  }

  calculosIniciales(): void {
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidores = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');
        this.totalGastosIngresos();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }


  // Buscar pedidos enviados
  buscarPedidosEnviados(): void {

    if (this.repartidor === '') {
      this.pedidosEnviados = [];
      return;
    }

    this.alertService.loading();

    this.ventasMayoristasService.listarVentas(
      1,
      'mayorista.descripcion',
      0,
      10000,
      'Enviado',
      '',
      this.repartidor,
      '',
      '',
      '',
      'true',
    ).subscribe({
      next: ({ ventas, totalItems, totalDeuda, totalIngresos, totalMonto }) => {

        this.pedidosEnviados = [];

        ventas.map(venta => {
          this.pedidosEnviados.push({
            _id: venta._id,
            fecha_pedido: venta.fecha_pedido,
            precio_total: venta.precio_total,
            numero: venta.numero,
            deuda: false,
            estado: 'Completado',
            mayorista: venta.mayorista.descripcion,
            mayoristaID: venta.mayorista._id,
            repartidorID: venta.repartidor._id,
            seleccionado: true,
            diferencia: 0,
            monto_anticipo: 0,
            deuda_monto: 0,
            monto_cobrado: venta.precio_total
          })
        });

        this.calculosMasivos();

        console.log(this.pedidosEnviados);
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }


  // Calculos masivos
  calculosMasivos(): void {

    if(this.pedidosEnviados?.length > 0){
      
      let totalPedidosTMP = 0;
      let totalDeudaTMP = 0;
      let totalAnticipoTMP = 0;
      let totalRecibidoTMP = 0;
  
      this.pedidosEnviados.map(pedido => {
        if (pedido.seleccionado) {
          totalPedidosTMP += pedido.precio_total;
          totalDeudaTMP += pedido.deuda_monto;
          totalAnticipoTMP += pedido.monto_anticipo;
          totalRecibidoTMP += pedido.monto_cobrado;
        }
      })
  
      this.totalPedidosMasivo = totalPedidosTMP;
      this.totalDeudaMasivo = totalDeudaTMP;
      this.totalAnticipoMasivo = totalAnticipoTMP;
      this.totalRecibidoMasivo = totalRecibidoTMP - this.total_gastos + this.total_ingresos;
    
    }

  }

  // Calcular deuda completar masivo
  calcularDeudaEnvioMasivo(pedido: any): void {
    console.log(pedido);

    if (pedido.monto_cobrado >= 0) {
      pedido.diferencia = pedido.monto_cobrado - pedido.precio_total;
    }

    if (pedido.diferencia > 0) {
      pedido.deuda_monto = 0;
      pedido.deuda = false;
      pedido.estado = 'Completado';
      pedido.monto_anticipo = pedido.diferencia;
    } else if (pedido.diferencia < 0) {
      pedido.monto_anticipo = 0;
      pedido.deuda = true;
      pedido.estado = 'Deuda';
      pedido.deuda_monto = -pedido.diferencia;
    }

    this.calculosMasivos();

    console.log(pedido);

  }

  // Completar masivo
  completarMasivo(): void {

    // Verificacion: Fecha de pedido
    if (this.fechaPedidos === '') {
      this.alertService.info('Debe colocar una fecha correcta');
      return;
    }

    let pedidosACompletar: any = [];

    let errorMonto: boolean = false;

    this.pedidosEnviados.map(pedido => {
      if (pedido.seleccionado) {
        pedidosACompletar.push(pedido);
        if (!pedido.monto_cobrado || pedido.monto_cobrado < 0) errorMonto = true;
      }
    });

    // Verificacion: Pedidos seleccionados
    if (pedidosACompletar.length === 0) {
      this.alertService.info('No hay pedidos seleccionados');
      return;
    }

    // Verificacion: Monto
    if (errorMonto) {
      this.alertService.info('Hay un monto inválido en la lista');
      return;
    }

    // Adaptando gastos e ingresos

    this.gastos.map( gasto => {
      gasto.repartidor = this.repartidor;
    })

    this.ingresos.map( ingreso => {
      ingreso.repartidor = this.repartidor;
    })

    const dataCompletar = {
      usuario: this.authService.usuario.userId,
      fecha_pedidos: this.fechaPedidos,
      gastos: this.gastos,
      ingresos: this.ingresos,
      pedidos: pedidosACompletar
    }

    this.alertService.question({ msg: '¿Quieres completar de forma masiva?', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasService.completarMasivo(dataCompletar).subscribe({
            next: () => {
              this.repartidor = '';
              this.pedidosEnviados = [];
              this.gastos = [];
              this.ingresos = [];
              this.fechaPedidos = format(new Date(), 'yyyy-MM-dd');
              this.almacenamientoLocalStorage();
              this.alertService.success('Pedidos completados correctamente');
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Seleccionar/Deseleccionar pedido
  seleccionarDeseleccionarPedido(pedido: any): void {

    pedido.seleccionado = !pedido.seleccionado;

    if (!pedido.seleccionado) {
      pedido.deuda_monto = 0;
      pedido.diferencia = 0;
      pedido.deuda = false;
      pedido.estado = 'Completado',
        pedido.monto_cobrado = null;
    } else {
      pedido.deuda_monto = 0;
      pedido.diferencia = 0;
      pedido.deuda = false;
      pedido.estado = 'Completado';
      pedido.monto_cobrado = pedido.precio_total;
    }

    this.calculosMasivos();

  }

  // Abrir listado de productos
  abrirListadoProductos(pedido: any): void {
    window.scrollTo(0, 0);
    this.alertService.loading();
    this.pedidoSeleccionado = pedido;
    this.ventasMayoristasProductosService.listarProductos(
      1,
      'descripcion',
      pedido._id
    ).subscribe({
      next: ({ productos }) => {
        window.scrollTo(0, 0);
        this.productos = productos;
        this.showListadoProductos = true;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.nuevaCantidad = producto.cantidad;
  }

  // Actualizar producto
  actualizarProducto(): void {

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
                  this.productos.map(elemento => {
                    if (elemento._id === this.productoSeleccionado._id) {
                      elemento.precio = nuevoPrecio,
                        elemento.cantidad = this.nuevaCantidad
                    }
                  })

                  // Calcular nuevo precio
                  this.calcularNuevoPrecio();

                  this.productoSeleccionado = null;
                  this.alertService.close();

                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        }
      });
  }


  // Eliminar producto
  eliminarProducto(): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();

          // Se elimina el producto
          this.ventasMayoristasProductosService.eliminarProducto(this.productoSeleccionado._id).subscribe({
            next: ({ producto }) => {
              const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio;
              this.productos = this.productos.filter(elemento => elemento._id !== producto._id);

              // Se actualiza el pedido
              this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
                precio_total: nuevoPrecioPedido,
                activo: true
              }).subscribe({
                next: () => {
                  this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;

                  // Calcular nuevo precio
                  this.calcularNuevoPrecio();

                  this.productoSeleccionado = null;
                  this.alertService.close();

                }, error: ({ error }) => {
                  this.alertService.errorApi(error.message);
                }
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Calcular nuevo precio del pedido
  calcularNuevoPrecio(): void {

    let precioTMP = 0;

    this.productos.map(producto => {
      precioTMP += producto.precio;
    })
    this.pedidoSeleccionado.precio_total = precioTMP;

    if (this.pedidoSeleccionado.seleccionado) {
      this.calcularDeudaEnvioMasivo(this.pedidoSeleccionado);
    } else {
      this.calculosMasivos();
    }

  }

  // Agregar producto
  agregarProducto(): void {

    if (!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.productos.find(elemento => {
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
        repartido: this.pedidoSeleccionado.repartidorID,
        precio: this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad,
        unidad_medida: this.nuevoProductoSeleccionado.unidad_medida._id,
        entregado: true,
        unidad_medida_descripcion: this.nuevoProductoSeleccionado.unidad_medida.descripcion,
        cantidad: this.nuevoProductoCantidad,
        precio_total: this.dataService.redondear(this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad, 2),
        creatorUser: this.pedidoSeleccionado.mayoristaID,
        updatorUser: this.pedidoSeleccionado.mayoristaID
      }

      // Agregando producto
      this.ventasMayoristasProductosService.nuevoProducto(dataProducto).subscribe({
        next: ({ producto }) => {

          this.productos.unshift(producto);

          // Calculo de precio
          let precioTMP = 0;
          this.productos.map(elemento => {
            precioTMP += elemento.precio;
          })

          this.pedidoSeleccionado.precio_total = precioTMP;

          // Se actualizar el pedido
          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
            precio_total: this.pedidoSeleccionado.precio_total,
            activo: true
          }).subscribe({
            next: () => {

              // Calcular nuevo precio
              this.calcularNuevoPrecio();

              this.nuevoProductoSeleccionado = null;
              this.showNuevoProducto = false;
              this.showListadoProductos = true;
              this.alertService.close();

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })

    }

    this.filtro.parametroProductos = '';

  }

  // Seleccionar nuevo producto
  seleccionarNuevoProducto(producto: any): void {
    this.nuevoProductoSeleccionado = producto;
    this.nuevoProductoCantidad = producto.cantidad;
  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    this.showNuevoProducto = false;
    this.showListadoProductos = true;
  }

  // Abrir modal nuevo producto
  abrirModalNuevoProducto(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.listaProductos = productos.filter(producto => producto.precio_mayorista);
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.showListadoProductos = false;
        this.showNuevoProducto = true;
        this.filtro.parametroProductos = '';
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Abrir agregar gasto o ingreso
  abrirGastoIngreso(): void {
    this.monto = null;
    this.tipo_gasto = '';
    this.tipo_ingreso = '';
    this.tipo = 'gasto';
    this.alertService.loading();
    this.buscarTipos();
  }

  // Buscar tipos
  buscarTipos(): void {
    this.alertService.loading();
    this.tiposGastosService.listarTipos().subscribe({
      next: ({ tipos }) => {
        this.tipos_gastos = tipos.filter(tipo => tipo.activo);
        this.tiposIngresosService.listarTipos().subscribe({
          next: ({ tipos }) => {
            console.log(tipos);
            this.tipos_ingresos = tipos.filter(tipo => tipo.activo);
            this.showGastoIngreso = true;
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Crear gasto o ingreso
  crearGastoIngreso(): void {

    // Verificacion: Tipo gasto
    if (this.tipo_gasto === '' && this.tipo === 'gasto') {
      this.alertService.info('Debe colocar un tipo de gasto');
      return;
    }

    // Verificacion: Tipo ingreso
    if (this.tipo_ingreso === '' && this.tipo === 'ingreso') {
      this.alertService.info('Debe colocar un tipo de ingreso');
      return;
    }

    // Verificacion de elemento repetido
    let gastoRepetido = false;
    let ingresoRepetido = false;

    if(this.tipo === 'gasto'){
      
      this.gastos.map( gasto => {
        if(gasto.tipo_gasto === this.tipo_gasto){
          gastoRepetido = true;
        }
      })
      
      if(gastoRepetido){
        this.alertService.info('El gasto ya se encuentra cargado');
        return;
      }
      
    }

    if(this.tipo === 'ingreso'){
      
      this.ingresos.map( ingreso => {
        if(ingreso.tipo_ingreso === this.tipo_ingreso){
          ingresoRepetido = true;
        }
      })

      if(ingresoRepetido){
        this.alertService.info('El ingreso ya se encuentra cargado');
        return;
      }

    }


    // Verificacion: Monto
    if (!this.monto || this.monto <= 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    if (this.tipo === 'gasto') {
      this.gastos.push({
        fecha_gasto: '',
        tipo_gasto: this.tipo_gasto,
        descripcion: this.tipos_gastos.find( elemento => elemento._id === this.tipo_gasto ).descripcion,
        monto: this.monto,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
        activo: true
      });
    } else {
      this.ingresos.push({
        fecha_ingreso: '',
        tipo_ingreso: this.tipo_ingreso,
        descripcion: this.tipos_ingresos.find( elemento => elemento._id === this.tipo_ingreso ).descripcion,
        monto: this.monto,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
        activo: true
      });
    }

    this.showGastoIngreso = false;
  
    this.totalGastosIngresos();

  }

  // Cacular total de gastos e ingresos
  totalGastosIngresos(): void {
    let totalGastosTMP = 0;
    let totalIngresosTMP = 0;
    this.gastos.map( gasto => {
      totalGastosTMP += gasto.monto;
    });
    this.ingresos.map( ingreso => {
      totalIngresosTMP += ingreso.monto;
    });
    this.total_gastos = totalGastosTMP;
    this.total_ingresos = totalIngresosTMP;
    this.calculosMasivos();
    this.almacenamientoLocalStorage();
  }

  // Eliminar gasto
  eliminarGasto(gasto: any): void {
    this.alertService.question({ msg: 'Eliminando gasto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.gastos = this.gastos.filter( elemento => elemento.tipo_gasto !== gasto.tipo_gasto  );
          this.totalGastosIngresos();
        }
      });
  }

  // Eliminar ingreso
  eliminarIngreso(ingreso: any): void {
    this.alertService.question({ msg: 'Eliminando ingreso', buttonText: 'Eliminar' })
    .then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.ingresos = this.ingresos.filter( elemento => elemento.tipo_ingreso !== ingreso.tipo_ingreso  );
        this.totalGastosIngresos();
      }
    });
  }

  // Almacenamiento en localstorage
  almacenamientoLocalStorage(): void {
    localStorage.setItem('pedidos-gastos', JSON.stringify(this.gastos));
    localStorage.setItem('pedidos-ingresos', JSON.stringify(this.ingresos));
  }

  // Recuperacion de valores de localStorage
  recuperarLocalStorage(): void {
    this.gastos = localStorage.getItem('pedidos-gastos') ? JSON.parse(localStorage.getItem('pedidos-gastos')) : [];
    this.ingresos = localStorage.getItem('pedidos-ingresos') ? JSON.parse(localStorage.getItem('pedidos-ingresos')) : [];
  }

}

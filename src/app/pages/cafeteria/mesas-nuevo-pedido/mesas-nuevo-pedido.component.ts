import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MesasPedidosService } from 'src/app/services/mesas-pedidos.service';
import { MesasService } from 'src/app/services/mesas.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-mesas-nuevo-pedido',
  templateUrl: './mesas-nuevo-pedido.component.html',
  styles: [
  ]
})
export class MesasNuevoPedidoComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['CAFETERIA_ALL'];

  // Mesa
  public mesa: any;
  public formActualizarMesa = {
    descripcion: ''
  }

  // Productos
  public cantidad: number = 1;
  public productoSeleccionado: any;
  public productos: any[] = [];
  public filtroProductos = {
    parametro: ''
  }

  // Pedido
  public precioTotal = 0;
  public productosCarrito: any[] = [];

  // Modals
  public showModalProductos: boolean = false;
  public showModalActualizarMesa: boolean = false;

  // Loadings
  public cargandoProductos: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private mesasService: MesasService,
    private mesasPedidosService: MesasPedidosService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Nuevo pedido';
    this.alertService.loading();
    this.listarProductos();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.mesasService.getMesa(id).subscribe({
          next: ({ mesa }) => {
            this.mesa = mesa;
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }
    })
  }

  listarProductos(): void {
    this.cargandoProductos = true;
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        this.cargandoProductos = false;
      }, error: ({ error }) => {
        this.alertService.errorApi(error.message);
        this.cargandoProductos = false;
      }
    })
  }

  actualizarMesa(): void {

    // Verificar si no esta vacio
    if (this.formActualizarMesa.descripcion.trim() === '') {
      this.alertService.info('El nombre de la mesa no puede estar vacío');
    }

    this.alertService.loading();
    this.mesasService.actualizarMesa(this.mesa._id, this.formActualizarMesa).subscribe({
      next: () => {
        this.mesa.descripcion = this.formActualizarMesa.descripcion;
        this.showModalActualizarMesa = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  abrirActualizarMesa(): void {
    this.formActualizarMesa.descripcion = this.mesa.descripcion;
    this.showModalActualizarMesa = true;
  }

  abrirListadoProductos(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.showModalProductos = true;
  }

  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.cantidad = 1;
  }

  deseleccionarProducto(): void {
    this.productoSeleccionado = null;
    this.filtroProductos.parametro = '';
  }

  agregarProducto(): void {

    // Verificar si el producto ya fue agregado y en caso de que si incrementar la cantidad
    const productoExistente = this.productosCarrito.find(({ producto }) => producto._id === this.productoSeleccionado._id);
    if (productoExistente) {
      productoExistente.cantidad += this.cantidad;
      productoExistente.precioTotal = productoExistente.producto.precio * productoExistente.cantidad;
      this.productoSeleccionado = null;
      this.calcularPrecioTotal();
      return;
    }

    this.productosCarrito.push({
      producto: this.productoSeleccionado,
      precio: this.productoSeleccionado.precio,
      precioTotal: this.productoSeleccionado.precio * this.cantidad,
      cantidad: this.cantidad
    });
    this.productoSeleccionado = null;
    this.calcularPrecioTotal();
  }

  calcularPrecioTotal(): void {
    this.precioTotal = 0;
    this.ordenarPorDescripcion();
    this.productosCarrito.map(({ precioTotal }) => this.precioTotal += precioTotal);
  }

  generarPedido(): void {
    this.alertService.question({ msg: 'Generando pedido', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          let productosAdaptados = [];

          // Adaptando productos
          this.productosCarrito.map(({ producto, cantidad }) => {
            productosAdaptados.push({
              mesa: this.mesa._id,
              producto: producto._id,
              precio: producto.precio,
              cantidad,
              precioTotal: producto.precio * cantidad,
              creatorUser: this.authService.usuario.userId,
              updatorUser: this.authService.usuario.userId,
            });
          });

          const data = {
            mesa: this.mesa._id,
            productos: productosAdaptados,
            precioTotal: this.precioTotal,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          }

          this.mesasPedidosService.nuevoPedido(data).subscribe({
            next: () => {
              this.router.navigateByUrl(`/dashboard/cafeteria/mesa/detalles/${this.mesa._id}`);
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        }
      });
  }

  actualizarCantidad(elemento: any): void {
    if (elemento.cantidad <= 0) elemento.cantidad = 1;
    elemento.precio = elemento.producto.precio;
    elemento.precioTotal = elemento.producto.precio * elemento.cantidad;
    this.calcularPrecioTotal();
  }

  incrementarCantidad(elemento: any): void {
    elemento.cantidad += 1;
    elemento.precio = elemento.producto.precio;
    elemento.precioTotal = elemento.producto.precio * elemento.cantidad;
    this.calcularPrecioTotal();
  }

  decrementarCantidad(elemento: any): void {

    if (elemento.cantidad <= 1) {
      this.eliminarProducto(elemento);
    } else {
      elemento.cantidad -= 1;
      elemento.precio = elemento.producto.precio;
      elemento.precioTotal = elemento.producto.precio * elemento.cantidad;
      this.calcularPrecioTotal();
    }

  }

  cancelarPedido(): void {
    this.alertService.question({ msg: 'Cancelando pedido', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.productosCarrito = [];
          this.precioTotal = 0;
        }
      });
  }

  eliminarProducto(elemento: any): void {
    this.productosCarrito = this.productosCarrito.filter(({ producto }) => producto._id !== elemento.producto._id);
    this.calcularPrecioTotal();
  }

  // Ordenar carrito por descripcion
  ordenarPorDescripcion(): void {
    this.productosCarrito.sort((a, b) => a.producto.descripcion.localeCompare(b.producto.descripcion));
  }

  // Eliminar mesa
  eliminarMesa(): void {
    this.alertService.question({ msg: 'Eliminando mesa', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mesasService.eliminarMesas(this.mesa._id).subscribe({
            next: () => {
              this.router.navigateByUrl('/dashboard/cafeteria');
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });
  }

}

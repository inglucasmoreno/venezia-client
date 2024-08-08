import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { MesasService } from 'src/app/services/mesas.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-mesas-detalles',
  templateUrl: './mesas-detalles.component.html',
  styles: [
  ]
})
export class MesasDetallesComponent implements OnInit {

  public mesa: any;
  public productos: any[] = [];
  public showModalProductos: boolean = false;

  // Producto seleccionado
  public productoSeleccionado: any;
  public cantidad: number = 1;

  public filtroProductos = {
    parametro: ''
  }

  // Pedido
  public precioTotal = 0;
  public productosCarrito: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService,
    private mesasService: MesasService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
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

  abrirListadoProductos(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.showModalProductos = true;
        this.productos = productos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
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

        console.log(data);

        this.alertService.success('Pedido generado');

      }
    });
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
    console.log(elemento);
    console.log(this.productosCarrito);
    this.productosCarrito = this.productosCarrito.filter(({ producto }) => producto._id !== elemento.producto._id);
    this.calcularPrecioTotal();
  }

  // Ordenar carrito por descripcion
  ordenarPorDescripcion(): void {
    this.productosCarrito.sort((a, b) => a.producto.descripcion.localeCompare(b.producto.descripcion));
  }

}

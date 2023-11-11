import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComprasProductosService } from 'src/app/services/compras-productos.service';
import { ComprasService } from 'src/app/services/compras.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-compras-detalles',
  templateUrl: './compras-detalles.component.html',
  styles: [
  ]
})
export class ComprasDetallesComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };


  // Flags
  public flagBuscarProductos = true;
  public flagProductoSeleccionado = false;

  // Modals
  public showModalCompra = false;
  public showModalProductos = false;
  public showModalEditarProducto = false;

  // Compra
  public idCompra: string = '';
  public compra: any = {};

  public compraForm = {
    numero_factura: '',
    fecha_compra: '',
    comentarios: ''
  }

  // Productos - Compra
  public comprasProductos: any[] = [];

  // Productos
  public productos: any[] = [];

  // Producto seleccionado
  public productoSeleccionado = null;
  public cantidad = null;

  // Filtros
  public parametros = {
    productos: '',
    productosCompra: ''
  }

  constructor(
    public location: Location,
    private comprasService: ComprasService,
    private productosService: ProductosService,
    private comprasProductosService: ComprasProductosService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    this.permisos.all = this.permisosUsuarioLogin();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {
        this.idCompra = id;
        this.getCompra();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('COMPRAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  getCompra(): void {
    this.comprasService.getCompra(this.idCompra).subscribe({
      next: ({ compra }) => {
        this.compra = compra;
        this.listarProductosCompra();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar productos de la compra
  listarProductosCompra(): void {
    this.comprasProductosService.listarComprasProductos(
      1,
      'producto.descripcion',
      this.idCompra
    ).subscribe({
      next: ({ comprasProductos }) => {
        this.comprasProductos = comprasProductos;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar productos totales
  listarProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        console.log(this.productos);
        this.flagBuscarProductos = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Agregar producto
  agregarProducto(): void {

    if (this.productoSeleccionado === null) return this.alertService.info('Debe seleccionar un producto');
    if (this.cantidad === null || this.cantidad <= 0) return this.alertService.info('Debe colocar una cantidad válida');

    const productoCargado = this.comprasProductos.find(compraProducto => compraProducto.producto._id === this.productoSeleccionado._id);
    if (productoCargado) return this.alertService.info('El producto ya se encuentra cargado');

    this.alertService.loading();

    const data = {
      producto: this.productoSeleccionado._id,
      cantidad: this.cantidad,
      compra: this.idCompra,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.comprasProductosService.nuevaCompraProducto(data).subscribe(({ compraProducto }) => {
      this.comprasProductos.unshift(compraProducto);
      this.ordenarProductos();
      this.deseleccionarProducto();
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Eliminar producto
  eliminarProducto(idCompraProducto: string): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.comprasProductosService.eliminarCompraProducto(idCompraProducto).subscribe(() => {
            this.comprasProductos = this.comprasProductos.filter(compraProducto => compraProducto._id !== idCompraProducto);
            this.alertService.close();
          }, ({ error }) => {
            this.alertService.errorApi(error.message);
          });
        }
      });
  }

  // Completar compra
  completarCompra(): void {

    // Validar que la compra tenga productos
    if (this.comprasProductos.length === 0) return this.alertService.info('La compra no tiene productos');

    // Completar compra
    this.alertService.question({ msg: 'Completando compra', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.comprasService.completarCompra(this.idCompra).subscribe(() => {
            this.getCompra();
          }, ({ error }) => {
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Actualizar compra
  actualizarCompra(): void {

    if (this.compraForm.fecha_compra === '') return this.alertService.info('Debe colocar una fecha de compra');

    this.alertService.loading();

    const data = {
      fecha_compra: format(add(new Date(this.compraForm.fecha_compra), { hours: 3 }), 'yyyy-MM-dd'),
      numero_factura: this.compraForm.numero_factura,
      comentarios: this.compraForm.comentarios,
      updatorUser: this.authService.usuario.userId,
    }
    this.comprasService.actualizarCompra(this.idCompra, data).subscribe(({ compra }) => {
      this.compra = compra;
      this.showModalCompra = false;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar producto
  actualizarProducto(): void {

    if (this.cantidad === null || this.cantidad <= 0) return this.alertService.info('Debe colocar una cantidad válida');

    this.alertService.loading();

    const data = {
      cantidad: this.cantidad,
      updatorUser: this.authService.usuario.userId,
    }
    this.comprasProductosService.actualizarCompraProducto(this.productoSeleccionado._id, data).subscribe(() => {
      this.comprasProductos = this.comprasProductos.map(compraProducto => {
        if (compraProducto._id === this.productoSeleccionado._id) {
          compraProducto.cantidad = this.cantidad;
        }
        return compraProducto;
      });
      this.showModalEditarProducto = false;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Seleccionar producto
  seleccionarProducto(producto): void {
    this.productoSeleccionado = producto;
    this.flagProductoSeleccionado = true;
    this.cantidad = null;
  }

  // Deseleccionar producto
  deseleccionarProducto(): void {
    this.productoSeleccionado = null;
    this.parametros.productos = '';
    this.flagProductoSeleccionado = false;
  }

  // --- MODALS ---

  // Abrir modal - Editar producto
  abrirModalEditarCompra(): void {
    this.compraForm = {
      fecha_compra: format(add(new Date(this.compra.fecha_compra), { hours: 3 }), 'yyyy-MM-dd'),
      numero_factura: this.compra.numero_factura,
      comentarios: this.compra.comentarios,
    }
    this.showModalCompra = true;
  }

  // Abrir modal - Agregar productos
  abrirModalAgregarProductos(): void {
    this.flagBuscarProductos && this.listarProductos();
    this.productoSeleccionado = null;
    this.parametros.productos = '';
    this.showModalProductos = true;
  }

  // Abrir modal - Editar producto
  abrirModalEditarProducto(producto): void {
    this.productoSeleccionado = producto;
    this.cantidad = producto.cantidad;
    this.showModalEditarProducto = true;
  }

  // Ordenar productos de la compra de forma ascendente
  ordenarProductos(): void {
    this.comprasProductos.sort((a, b) => {
      if (a.producto.descripcion > b.producto.descripcion) return 1;
      if (a.producto.descripcion < b.producto.descripcion) return -1;
      return 0;
    });
  }


}

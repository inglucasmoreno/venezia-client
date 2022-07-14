import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasService } from 'src/app/services/ventas.service';
import gsap from 'gsap';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styles: [
  ]
})
export class VentasComponent implements OnInit {

  // Fecha de hoy
  public fecha = new Date();

  // Tipo de busqueda
  public modo: string = 'codigo';

  // Ventas
  public showModalVenta = false;
  public precio_total: number = 0;
  public vuelto: number = 0;
  public pagaCon: number = null;
  public formaPago: string = 'Efectivo';
  public flag_multiples_formasPago = false;

  // Agregando productos
  public codigo: string = '';
  public productoActual: any;
  public productos: any[] = [];
  public cantidad: number = null;
  public flag_agregandoProducto = false;
  public productoSeleccionado: any = null;

  // Listado de productos - Para modo busqueda
  public productosBuscador: any[] = [];

  // Paginacion
  public paginaActualBuscador: number = 1;
  public cantidadItemsBuscador: number = 5;

  // Filtrados
  public filtroBuscador = {
    activo: 'true',
    parametro: ''
  }

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private authService: AuthService,
              private ventasService: VentasService,
              private productosService: ProductosService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Ventas';
  }

  // Listar productos - Para modo 'Buscador'
  listarProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos(1, 'descripcion').subscribe({
      next: ({productos}) => {
        this.productosBuscador = productos.filter( producto => producto.activo );
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);  
      }
    });
  }

  // Buscando producto por codigo
  productoPorCodigo(): void {

    if(this.codigo.trim() === ''){
      this.alertService.info('Debe colocar un código de producto');
      return;
    } 

    this.alertService.loading();
    this.productosService.getProductoParametro(this.codigo).subscribe({
      next: ({producto}) => {
        this.productoActual = producto;
        this.agregarProducto(producto);
      },
      error: ({error}) => {
        this.reiniciarValores();
        this.alertService.errorApi(error.message);
      }
    })

  }

  // Agregar producto
  agregarProducto(producto: any, cantidad: number = 1): void {

    let repetido = false;

    // Verificacion de cantidad correcta
    if(cantidad === null || cantidad <= 0){
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    // Verificacion: Producto repetido
    this.productos.find( elemento => {
      if(elemento.productoTMP._id === producto._id){
        repetido = true;
        elemento.cantidad += cantidad;
        elemento.precio += producto.precio;
      }
    })

    if(!repetido){ // El producto no esta repetido en la lista
      const nuevoProducto = {
        productoTMP: producto,
        producto: producto._id,
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida.descripcion,
        cantidad: cantidad,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
        precio: producto.precio * cantidad
      }
      this.productos.push(nuevoProducto);
    }

    this.calcularPrecio();
    this.reiniciarValores();
    this.alertService.close();
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void{
    this.productoSeleccionado = producto;
    this.flag_agregandoProducto = true;
  }

  // Calcular precio de venta
  calcularPrecio(): void {
    let precioTMP = 0;
    this.productos.map(producto => {
      precioTMP += producto.precio;
    })
    this.precio_total = precioTMP;
  }

  // Abrir modal - Completar venta
  abrirModalVenta(): void {
    this.showModalVenta = true;
  }

  // Eliminar venta
  eliminarVenta(): void {
    this.alertService.question({ msg: 'Eliminando venta', buttonText: 'Eliminar' })
        .then(({isConfirmed}) => { 
          if(isConfirmed){
            this.productoActual = null;
            this.pagaCon = null;
            this.vuelto = 0;
            this.precio_total = 0;
            this.formaPago = 'Efectivo';
            this.productos = [];
            this.reiniciarValores(); 
          } 
        }); 
  }

  // Eliminar producto de la venta
  eliminarProducto(producto): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) this.productos = this.productos.filter( elemento => elemento.producto !== producto.producto);  
          this.calcularPrecio();
        }); 
  }

  // Completar venta
  completarVenta(): void {
    
    let forma_pago: any[];
    
    this.alertService.loading();

    if(!this.flag_multiples_formasPago) forma_pago = [{ descripcion: this.formaPago, valor: this.precio_total }];
    
    const data = {
      productos: this.productos,
      precio_total: this.precio_total,
      forma_pago,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    this.ventasService.nuevaVenta(data).subscribe({
      next: () => {
        this.productoActual = null;
        this.precio_total = 0;
        this.productos = [];    
        this.showModalVenta = false;   
        this.pagaCon = null;
        this.formaPago = 'Efectivo';
        this.vuelto = 0;
        this.reiniciarValores();
        this.alertService.success('Venta finalizada')
      },
      error: ({error}) => this.alertService.errorApi(error.message) 
    });  
  }

  // Cambiar modo de busqueda
  modoBusqueda(modo: string): void {
    this.reiniciarValores();
    this.modo = modo;   
    if(modo === 'codigo'){
      this.codigo = '';
      this.productosBuscador = [];
    }else if(modo === 'buscador'){
      this.listarProductos();  
    }
  }

  // Calcular vuelto
  calcularVuelto(): void{
    this.vuelto = this.pagaCon - this.precio_total;
  }

  // Reiniciar paginador
  reiniciarPaginador(): void {
    this.paginaActualBuscador = 1;
  }

  // Reiniciar valores
  reiniciarValores(): void {
    this.codigo = '';
    this.cantidad = null;
    this.flag_agregandoProducto = false;
    this.filtroBuscador.parametro = '';
    this.reiniciarPaginador();
  }

}

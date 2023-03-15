import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasService } from 'src/app/services/ventas.service';
import gsap from 'gsap';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

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

  // Items formas de pago
  public itemsFormasPago: string[] = [
    'Efectivo',
    'Crédito',
    'Débito',
    'Mercado pago',
    'PedidosYa',
    'PedidosYa - Efectivo'
  ];
  
  // Flag - Impresion
  public imprimir: boolean = false;

  // Ventas
  public comprobante = 'Normal';
  public showModalVenta = false;

  public precio_total: number = 0;
  public precio_total_limpio: number = 0;

  public vuelto: number = 0;
  public pagaCon: number = null;
  public formaPago: string = 'Efectivo';
  public formasPago: any[] = [];
  public multiples_formasPago = false;
  public formaPagoMonto: number = null;

  public diferenciaPago = 0;

  public proximo_nro_factura: string = null;

  // Agregando productos
  public codigo: string = '';
  public precio: number = null;
  public productoActual: any;
  public productos: any[] = [];
  public cantidad: number = null;
  public agregandoProducto = false;
  public productoSeleccionado: any = null;

  // Listado de productos - Para modo busqueda
  public productosBuscador: any[] = [];

  // Paginacion
  public paginaActualBuscador: number = 1;
  public cantidadItemsBuscador: number = 5;

  // PedidosYa
  public pedidosya_comprobante:string = '';

  // Filtrados
  public filtroBuscador = {
    activo: 'true',
    parametro: ''
  }

  constructor(private dataService: DataService,
              private alertService: AlertService,
              public authService: AuthService,
              private ventasService: VentasService,
              private productosService: ProductosService) { }

  ngOnInit(): void {
    // Se recuperan los valores del localstorage
    this.recuperarLocalStorage();
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

    this.productosService.getProductoParametro(this.codigo).subscribe({
      next: ({producto}) => {
        this.agregarProducto(producto);
      },
      error: ({error}) => {
        this.reiniciarValores();
        this.alertService.errorApi(error.message);
      }
    })

  }

  // Agregar producto
  agregarProducto(producto: any, cantidad: number = 1, desde: string = 'codigo'): void {

    let repetido = false;
    let cantidadProducto = 0;

    // Verificacion de cantidad correcta - Si viene desde buscador
    if(cantidad === null || cantidad <= 0){
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    // El producto es de balanza    
    if(producto.balanza && desde === 'codigo'){
      cantidadProducto = Number(this.codigo.slice(7,this.codigo.length - 1)) / 1000;
    }else{
      cantidadProducto = cantidad;
    }

    // Verificacion: Producto repetido
    this.productos.find( elemento => {
      if(elemento.productoTMP._id === producto._id){
        repetido = true;
        elemento.cantidad = this.dataService.redondear(elemento.cantidad + cantidadProducto, 2);
        elemento.precio += this.dataService.redondear(producto.precio * cantidadProducto, 2);
      }
    })

    this.productoActual = producto;
    this.productoActual.cantidad = cantidadProducto;
    this.productoActual.precio_final = producto.precio * cantidadProducto;

    if(!repetido){ // El producto no esta repetido en la lista
      const nuevoProducto = {
        productoTMP: this.productoActual,
        producto: producto._id,
        balanza: producto.balanza,
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida.descripcion,
        cantidad: this.dataService.redondear(cantidadProducto, 2),
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
        precio: producto.precio * cantidadProducto,
        precio_unitario: producto.precio
      }
      this.productos.unshift(nuevoProducto);
    }

    this.calcularPrecio();
    this.reiniciarValores();
    this.alertService.close();

  }

  // Agregar producto - Modo precio
  agregarProductoConPrecio(producto: any): void {

    // Verificacion de cantidad correcta - Si viene desde buscador
    if(this.precio === null || this.precio <= 0){
      this.alertService.info('Debe colocar un precio válido');
      return;
    }

    let repetido = false;

    // Verificacion - El producto esta cargado
    this.productos.map( productoRec => {
      if(productoRec.productoTMP._id === producto._id) repetido = true;
    })

    if(repetido){
      this.alertService.info('El producto ya se encuentra cargado');
      this.precio = null;
      return;
    }

    this.productoActual = producto;
    this.productoActual.cantidad = 0;
    this.productoActual.precio_final = this.precio;

    const nuevoProducto = {
      productoTMP: this.productoActual,
      producto: producto._id,
      balanza: producto.balanza,
      descripcion: producto.descripcion,
      unidad_medida: producto.unidad_medida.descripcion,
      cantidad: 0,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
      precio: this.precio,
      precio_unitario: producto.precio
    }
    
    this.productos.unshift(nuevoProducto);

    this.calcularPrecio();
    this.reiniciarValores();
    this.alertService.close();

  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void{
    this.productoSeleccionado = producto;
    this.agregandoProducto = true;
  }
  
  // Seleccionando forma de pago
  seleccionarFormaPago(): void {

    if(!this.multiples_formasPago && (this.formaPago === 'Crédito' || this.formaPago === 'Débito' || this.formaPago === 'Mercado pago')){
      this.comprobante = 'Fiscal';    
    }

    this.pedidosya_comprobante = '';
    this.calcularPrecio();

  }

  // Cambiar tipo de comprobante - Almacenar
  cambiarTipoComprobante(): void {
    this.almacenamientoLocalStorage();
  }

  // Calcular precio de venta
  calcularPrecio(): void {
    
    let precioTMP = 0;
    this.productos.map(producto => {
      precioTMP += producto.precio;
    })
  
    // Precio sin adicionales ni descuentos
    this.precio_total_limpio = this.dataService.redondear(precioTMP, 2);

    if(this.formasPago.length === 0){ // Forma de pago unica
      // Con adicional por credito => precio total + 10% : Sin adicional por credito
      this.formaPago === 'Crédito' 
      ? this.precio_total = this.dataService.redondear(precioTMP * 1.10, 2) 
      : this.precio_total = this.dataService.redondear(precioTMP, 2);
    }else{}

    // Se actualiza el vuelto
    this.calcularVuelto();

    // Se almacenan los valores en el localstorage
    this.almacenamientoLocalStorage();

  }

  // Abrir modal - Completar venta
  abrirModalVenta(): void {
    this.proximo_nro_factura = null;
    this.showModalVenta = true;
  }

  // Eliminar venta
  eliminarVenta(): void {
    this.alertService.question({ msg: 'Eliminando venta', buttonText: 'Eliminar' })
        .then(({isConfirmed}) => { 
          if(isConfirmed){
            this.productoActual = null;
            this.pagaCon = null;
            this.comprobante = 'Normal',
            this.vuelto = 0;
            this.precio_total = 0;
            this.precio_total_limpio = 0;
            this.formaPago = 'Efectivo';
            this.pedidosya_comprobante = '';
            this.productos = [];
            this.metodoPagoUnico();
            this.reiniciarValores();
            this.almacenamientoLocalStorage(); // Alamacenamiento de valores en localStorage
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
    
    // Verificacion - Formas de pago multiples
    if(this.multiples_formasPago && this.formasPago.length === 0){ // Seleccionar al menos una forma de pago (Multiples formas de pago)
      this.alertService.info('Debe seleccionar una forma de pago');
      return;
    }

    if(this.multiples_formasPago && this.diferenciaPago !== 0){
      this.alertService.info('Debe cubrir el precio total de la venta');
      return;
    }

    // Verificacion - PedidosYa
    if((this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') && this.pedidosya_comprobante.trim() === ''){
      this.alertService.info('Colocar número de comprobante de PedidosYa');
      return;
    }

    this.alertService.question({ msg: 'Completando venta', buttonText: 'Completar' })
        .then(({isConfirmed}) => { 
          if(isConfirmed){

            let forma_pago: any[];
    
            this.alertService.loading();
        
            if(!this.multiples_formasPago) forma_pago = [{ descripcion: this.formaPago, valor: this.precio_total }];
            else if(this.multiples_formasPago) forma_pago = this.formasPago;
            
            const data = {
              productos: this.productos,
              precio_total: this.precio_total,
              precio_total_limpio: this.precio_total_limpio,
              comprobante: this.comprobante,
              pedidosya_comprobante: (this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') ? this.pedidosya_comprobante : '',
              forma_pago,
              adicional_credito: this.formaPago === 'Crédito' ? this.precio_total_limpio * 0.10 : 0,
              creatorUser: this.authService.usuario.userId,
              updatorUser: this.authService.usuario.userId,
            };
            this.ventasService.nuevaVenta(data).subscribe({
              next: ({venta}) => {
                
                this.productoActual = null;
                this.precio_total = 0;
                this.precio_total_limpio = 0;
                this.comprobante = 'Normal',
                this.productos = [];    
                this.showModalVenta = false;   
                this.pagaCon = null;
                this.formaPago = 'Efectivo';
                this.vuelto = 0;
                this.pedidosya_comprobante = '';
                
                this.reiniciarValores();
                this.metodoPagoUnico();
                this.almacenamientoLocalStorage();  // Alamacenamiento de valores en localStorage
                  
                // Imprimir comprobante
                if(this.imprimir){
                  this.ventasService.getComprobante(venta._id).subscribe({
                    next: () => {
                      window.open(`${base_url}/pdf/comprobante.pdf`, '_blank');
                      this.alertService.success('Venta completada');
                    }, error: (error) => this.alertService.errorApi(error.message)
                  })
                }else{
                  this.alertService.success('Venta completada');
                }

              },
              error: ({error}) => this.alertService.errorApi(error.message) 
            });  

          } 
        }); 
  }

  // Cambiar modo de busqueda
  modoBusqueda(modo: string): void {
    this.reiniciarValores();
    this.modo = modo;   
    if(modo === 'codigo'){
      this.codigo = '';
      this.productosBuscador = [];
    }else if(modo === 'buscador' || modo === 'precio'){
      this.listarProductos();  
    }
  }

  // Calcular vuelto
  calcularVuelto(): void{
    this.vuelto = this.pagaCon - this.precio_total;
    localStorage.setItem('vuelto', JSON.stringify(this.vuelto));
    localStorage.setItem('pagaCon', JSON.stringify(this.pagaCon));
  }

  // Agregar forma de pago
  agregarFormaPago(): void {

    // Verificacion de valores ingresados
    if(!this.formaPagoMonto || this.formaPagoMonto <= 0){
      this.alertService.info('Valores inválidos');
      return;
    }

    if(this.formaPagoMonto > this.diferenciaPago){
      this.alertService.info('No se puede superar el monto de la venta');
      return;
    }

    this.formasPago.push({ descripcion: this.formaPago, valor: this.formaPagoMonto });
    
    // Se elimina el elemento
    this.itemsFormasPago = this.itemsFormasPago.filter(elemento => elemento !== this.formaPago);

    this.formaPago = this.itemsFormasPago[0];
    
    // this.formaPagoMonto = null;
    this.calcularDiferencia();
  
  }

  // Eliminar forma de pago
  eliminarFormaPago(formaPago: any): void {
    
    this.formasPago = this.formasPago.filter(elemento => elemento.descripcion !== formaPago.descripcion);
    
    this.itemsFormasPago = [];  

    let efectivo = false;
    let debito = false;
    let mercadoPago = false;

    for(const elemento of this.formasPago){
      const elementoTMP: any = elemento;
      if(elementoTMP.descripcion === 'Efectivo') efectivo = true;
      else if(elementoTMP.descripcion === 'Débito') debito = true;
      else if(elementoTMP.descripcion === 'Mercado pago') mercadoPago = true;
    }

    this.itemsFormasPago = [];

    if(!efectivo) this.itemsFormasPago.push('Efectivo');
    if(!debito) this.itemsFormasPago.push('Débito');
    if(!mercadoPago) this.itemsFormasPago.push('Mercado pago');

    this.formaPago = this.itemsFormasPago[0];

    this.calcularDiferencia();

  }

  // Regresar a metodo de pago unico
  metodoPagoUnico(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Crédito',
      'Débito',
      'Mercado pago',
      'PedidosYa',
      'PedidosYa - Efectivo'
    ];
    this.reiniciarMetodosPago();
    this.multiples_formasPago = false;
    this.almacenamientoLocalStorage();
  }

  metodoPagoMultiple(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Débito',
      'Mercado pago',
    ];
    this.formaPago = 'Efectivo';
    this.multiples_formasPago = true;
    this.calcularDiferencia();
  }

  // Reiniciar Metodos de pago
  reiniciarMetodosPago(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Crédito',
      'Débito',
      'Mercado pago',
      'PedidosYa',
      'PedidosYa - Efectivo'
    ]
    this.formaPago = 'Efectivo';
    this.formaPagoMonto = null;
    this.formasPago = [];
    this.almacenamientoLocalStorage();
  }

  // Calcular diferencia - Metodos de pago multiples
  calcularDiferencia(): void {
    let precioTotalTMP = this.precio_total;
    for(const elemento of this.formasPago){
      precioTotalTMP = precioTotalTMP - elemento.valor;      
    }  

    this.formaPagoMonto = this.dataService.redondear(precioTotalTMP, 2);
    this.diferenciaPago = this.dataService.redondear(precioTotalTMP, 2);

    this.almacenamientoLocalStorage();
  }

  cambiarImprimir(): void {
    this.imprimir = !this.imprimir;
    this.almacenamientoLocalStorage();
  }

  // Almacenamiento en localstorage
  almacenamientoLocalStorage(): void {
    localStorage.setItem('imprimir', JSON.stringify(this.imprimir));
    localStorage.setItem('precio_total', JSON.stringify(this.precio_total));
    localStorage.setItem('precio_total_limpio', JSON.stringify(this.precio_total_limpio));  
    localStorage.setItem('productos', JSON.stringify(this.productos));
    localStorage.setItem('comprobante', JSON.stringify(this.comprobante));
    localStorage.setItem('productoActual', JSON.stringify(this.productoActual));
    localStorage.setItem('vuelto', JSON.stringify(this.vuelto));
    localStorage.setItem('pagaCon', JSON.stringify(this.pagaCon));
    localStorage.setItem('formaPago', JSON.stringify(this.formaPago));
    localStorage.setItem('formasPago', JSON.stringify(this.formasPago));
    localStorage.setItem('multiples_formasPago', JSON.stringify(this.multiples_formasPago));
    localStorage.setItem('formaPagoMonto', JSON.stringify(this.formaPagoMonto));
    localStorage.setItem('diferenciaPago', JSON.stringify(this.diferenciaPago));
    localStorage.setItem('itemsFormasPago', JSON.stringify(this.itemsFormasPago));
  }

  // Recuperacion de valores de localStorage
  recuperarLocalStorage(): void {
    this.imprimir = localStorage.getItem('imprimir') ? JSON.parse(localStorage.getItem('imprimir')) : false;  
    this.precio_total = localStorage.getItem('precio_total') ? JSON.parse(localStorage.getItem('precio_total')) : 0;  
    this.precio_total_limpio = localStorage.getItem('precio_total_limpio') ? JSON.parse(localStorage.getItem('precio_total_limpio')) : 0; 
    this.productos = localStorage.getItem('productos') ? JSON.parse(localStorage.getItem('productos')) : [];
    this.comprobante = localStorage.getItem('comprobante') ? JSON.parse(localStorage.getItem('comprobante')) : 'Normal';    
    this.productoActual = localStorage.getItem('productoActual') ? JSON.parse(localStorage.getItem('productoActual')) : null;
    this.vuelto = localStorage.getItem('vuelto') ? JSON.parse(localStorage.getItem('vuelto')) : 0;
    this.pagaCon = localStorage.getItem('pagaCon') ? JSON.parse(localStorage.getItem('pagaCon')) : null;
    this.formaPago = localStorage.getItem('formaPago') ? JSON.parse(localStorage.getItem('formaPago')) : 'Efectivo';
    this.formasPago = localStorage.getItem('formasPago') ? JSON.parse(localStorage.getItem('formasPago')) : [];
    this.multiples_formasPago = localStorage.getItem('multiples_formasPago') ? JSON.parse(localStorage.getItem('multiples_formasPago')) : false;
    this.formaPagoMonto = localStorage.getItem('formaPagoMonto') ? JSON.parse(localStorage.getItem('formaPagoMonto')) : null;
    this.diferenciaPago = localStorage.getItem('diferenciaPago') ? JSON.parse(localStorage.getItem('diferenciaPago')) : 0;
    this.itemsFormasPago = localStorage.getItem('itemsFormasPago') ? JSON.parse(localStorage.getItem('itemsFormasPago')) : [
      'Efectivo',
      'Crédito',
      'Débito',
      'Mercado pago',
      'PedidosYa',
      'PedidosYa - Efectivo'
    ];
  }

  // Proximo numero de factura
  proximoNroFactura(): void {
    this.alertService.loading();
    this.ventasService.proximoNroFactura('B').subscribe({
      next: ({nro_factura}) => {
        this.proximo_nro_factura = nro_factura;
        this.alertService.close();
      },error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Reiniciar paginador
  reiniciarPaginador(): void {
    this.paginaActualBuscador = 1;
  }

  // Reiniciar valores
  reiniciarValores(): void {
    this.codigo = '';
    this.cantidad = null;
    this.precio = null;
    this.agregandoProducto = false;
    this.filtroBuscador.parametro = '';
    this.reiniciarPaginador();
  }

}

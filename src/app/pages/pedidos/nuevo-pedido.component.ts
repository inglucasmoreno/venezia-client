import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-nuevo-pedido',
  templateUrl: './nuevo-pedido.component.html',
  styleUrls: []
})
export class NuevoPedidoComponent implements OnInit {

// Modal
public showModal = false;

// Variables
public precioCarrito: number = 0;
public productos: any[] = [];
public cantidad: number = null;
public productoSeleccionado: any = null;
public carrito: any[] = [];

// Mayoristas
public mayorista: string = '';
public mayoristas: any[] = [];

// Paginacion
public paginaActual: number = 1;
public cantidadItems: number = 10;

// Repartidores
public repartidor: string = '';
public repartidores: any[] = [];

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
            private alertService: AlertService,
            private usuarioService: UsuariosService,
            private mayoristasService: MayoristasService,
            private ventasMayoristasService: VentasMayoristasService,
            private productosService: ProductosService) { }

ngOnInit(): void {
  this.dataService.ubicacionActual = "Dashboard - Nuevo pedido";
  gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
  this.recuperarLocalStorage();
  this.alertService.loading();
  this.mayoristasService.listarMayoristas().subscribe({
    next: ({mayoristas}) => {
      this.mayoristas = mayoristas.filter( mayorista => mayorista.activo );
      
      // Listado de repartidores
      this.usuarioService.listarUsuarios().subscribe({
        next: ({usuarios}) => {
          this.repartidores = usuarios.filter( usuario =>  usuario.role === 'DELIVERY_ROLE' );
        }, error: ({error}) => this.alertService.errorApi(error.message)
      })
      
      this.listarProductos();


    },
    error: ({error}) => this.alertService.errorApi(error.message)
  })
}

// Listado de productos
listarProductos(): void {
  this.productosService.listarProductos().subscribe({
    next: ({productos}) => {
      this.productos = productos.filter( producto => producto.precio_mayorista );
      this.alertService.close();
    },
    error: ({error}) => {
      this.alertService.errorApi(error.message);
    }
  });  
}

// Agregar producto
agregarProducto(): void {

  if(!this.cantidad || this.cantidad < 0){
    this.alertService.info("Debe colocar una cantidad válida");
    return;
  }

  let repetido = false;
  
  // Verificacion: Producto repetido
  this.carrito.find( elemento => {
    if(elemento.producto._id === this.productoSeleccionado._id){
      repetido = true;
      elemento.cantidad += this.dataService.redondear(this.cantidad, 2);
      elemento.precio += this.dataService.redondear(this.productoSeleccionado.precio_mayorista * this.cantidad, 2);
    }
  });

  // Se agrega si el producto no esta cargado en el carrito
  if(!repetido) this.carrito.unshift(
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
      .then(({isConfirmed}) => {  
      if(isConfirmed){
        this.carrito = this.carrito.filter( elemento => elemento.producto._id !== producto.producto._id)
        this.calculoPrecio();
      };  
  });
}

// Calculo precio
calculoPrecio(): void {
  let precioTMP = 0;
  this.carrito.map( elemento => {
    precioTMP += elemento.precio;
  })
  this.precioCarrito = precioTMP;
  this.almacenarLocalStorage();    
}

// Recuperar info del localStorage
recuperarLocalStorage(): void {
  this.repartidor = localStorage.getItem('repartidor') && this.carrito.length !== 0 ? JSON.parse(localStorage.getItem('repartidor')) : ''; 
  this.precioCarrito = localStorage.getItem('precioCarrito') ? JSON.parse(localStorage.getItem('precioCarrito')) : 0; 
  this.carrito = localStorage.getItem('carrito') ? JSON.parse(localStorage.getItem('carrito')) : []; 
  this.mayorista = localStorage.getItem('mayorista') && this.carrito.length !== 0 ? JSON.parse(localStorage.getItem('mayorista')) : ''; 
}

// Almacenar en localStorage
almacenarLocalStorage(): void {
  localStorage.setItem('repartidor', JSON.stringify(this.repartidor));
  localStorage.setItem('mayorista', JSON.stringify(this.mayorista));
  localStorage.setItem('precioCarrito', JSON.stringify(this.precioCarrito));
  localStorage.setItem('carrito', JSON.stringify(this.carrito));
}

// Crear nuevo pedido
crearPedido(): void {

  if(this.repartidor.trim() === '' && this.authService.usuario.role !== 'DELIVERY_ROLE'){
    this.alertService.info('Debe seleccionar un repartidor');
    return;
  }

  if(this.mayorista.trim() === ''){
    this.alertService.info('Debe seleccionar un mayorista');
    return;
  }

  this.alertService.question({ msg: 'Enviando pedido', buttonText: 'Enviar' })
      .then(({isConfirmed}) => {  
      if(isConfirmed){
        
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
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        })

      };  
  });
}

// Abrir modal
abrirModal(): void {

  if(this.repartidor.trim() === '' && this.authService.usuario.role !== 'DELIVERY_ROLE'){
    this.alertService.info('Debe seleccionar un repartidor');
    return;
  }

  if(this.mayorista.trim() === ''){
    this.alertService.info('Debe seleccionar un mayorista');
    return;
  }

  this.showModal = true;
  this.productoSeleccionado = null;

}

// Cerrar seleccion de producto
cerrarSeleccion(): void {
  this.cantidad = null;
  this.productoSeleccionado = null;
}

// Reiniciar pedido
reiniciarPedido(): void {
  this.productoSeleccionado = null;
  this.repartidor = '';
  this.mayorista = '';
  this.carrito = [];
  this.cantidad = null;
  this.precioCarrito = 0; 
  this.almacenarLocalStorage();      
}

// Producto seleccionado
seleccionarProducto(producto: any): void {
  this.productoSeleccionado = producto;
}

// Filtrar Activo/Inactivo
filtrarActivos(activo: any): void{
  this.paginaActual = 1;
  this.filtro.activo = activo;
}

// Filtrar por Parametro
filtrarParametro(parametro: string): void{
  this.paginaActual = 1;
  this.filtro.parametro = parametro;
}

// Ordenar por columna
ordenarPorColumna(columna: string){
  this.ordenar.columna = columna;
  this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
  this.alertService.loading();
  this.listarProductos();
}


}

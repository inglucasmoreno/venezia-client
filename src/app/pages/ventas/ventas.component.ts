import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styles: [
  ]
})
export class VentasComponent implements OnInit {

  // Agregando productos
  public codigo: string = '';
  public productoActual: any;
  public productos: any[] = [];

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private productosService: ProductosService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ventas';
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
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Agregar producto
  agregarProducto(producto: any): void {

    let repetido = false;

    // Verificacion: Producto repetido
    this.productos.find( elemento => {
      if(elemento.productoTMP._id === producto._id){
        repetido = true;
        elemento.cantidad += 1;
        elemento.precio += producto.precio;
      }
    })

    if(!repetido){ // El producto no esta repetido en la lista
      const nuevoProducto = {
        productoTMP: producto,
        producto: producto._id,
        descripcion: producto.descripcion,
        unidad_medida: producto.unidad_medida.descripcion,
        cantidad: 1,
        precio: producto.precio
      }
      this.productos.push(nuevoProducto);
    }

    this.reiniciarValores();
    this.alertService.close();
  }

  // Reiniciar valores
  reiniciarValores(): void {
    this.codigo = '';
  }

}

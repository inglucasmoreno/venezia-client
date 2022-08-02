import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { VentasService } from 'src/app/services/ventas.service';
import gsap from 'gsap';

@Component({
  selector: 'app-ventas-historial',
  templateUrl: './ventas-historial.component.html',
  styles: [
  ]
})
export class VentasHistorialComponent implements OnInit {

  // Flag
  public inicio = true;

  // Modals
  public showModalDetalle = false;

  // Permisos de usuarios login
  public permisos = { all: false };
    
  // Venta
  public idVenta: string = '';
  public ventas: any = [];
  public ventaSeleccionada: any;
  public descripcion: string = '';
  public montoTotal: number = 0;
  public montoTotalFacturado: number = 0;
  public montoTotalPedidosYa:number = 0;
  public productos: any[] = [];
  
  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  
  // Filtrado
  public filtro = {
    facturacion: 'todos',
    pedidosYa: 'todos',
    parametro: '',
    fechaDesde: '',
    fechaHasta: ''
  } 
  
  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }
  
  constructor(private ventasService: VentasService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }
  
    ngOnInit(): void {
      gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
      this.dataService.ubicacionActual = 'Dashboard - Historial de ventas'; 
      this.permisos.all = this.permisosUsuarioLogin();
    }
  
    // Asignar permisos de usuario login
    permisosUsuarioLogin(): boolean {
      return this.authService.usuario.permisos.includes('VENTAS_HISTORIAL_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
    }
  
    // Listar ventas
    listarVentas(): void {
      this.alertService.loading();
      this.ventasService.listarVentas( 
        this.ordenar.direccion,
        this.ordenar.columna,
        'todo',
        this.filtro.fechaDesde,
        this.filtro.fechaHasta
        )
      .subscribe( ({ ventas }) => {
        this.inicio === true ? this.inicio = false : null;
        this.ventas = ventas;
        this.calculoMontoTotal();
        this.showModalDetalle = false;
        this.paginaActual = 1;
        this.alertService.close();
      }, (({error}) => {
        this.alertService.errorApi(error.msg);
      }));
    }
    

    // Actualizar estado Activo/Inactivo
    actualizarEstado(venta: any): void {
      
      const { _id, activo } = venta;
        
      if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');
  
      this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
          .then(({isConfirmed}) => {  
            if (isConfirmed) {
              this.alertService.loading();
              this.ventasService.actualizarVenta(_id, {activo: !activo}).subscribe(() => {
                this.alertService.loading();
                this.listarVentas();
              }, ({error}) => {
                this.alertService.close();
                this.alertService.errorApi(error.message);
              });
            }
          });
  
    }

    // Facturacion electronica
    facturacionElectronica(): void {
      this.alertService.question({ msg: 'Facturación electrónica', buttonText: 'Facturar' })
      .then(({isConfirmed}) => {  
        if (isConfirmed) {
          const { _id, precio_total } = this.ventaSeleccionada;
          this.alertService.loading();
          this.ventasService.actualizarFacturacion(_id, {precio_total, updatorUser: this.authService.usuario.userId }).subscribe({
            next: () => this.listarVentas(),
            error: (error) => this.alertService.errorApi(error.message)
          })
        }
      });  
    }

    // Calculo de monto total
    calculoMontoTotal(): void {
      let montoTotalTMP = 0;
      let montoTotalFacturadoTMP = 0;
      let montoTotalPedidosYaTMP = 0;
      this.ventas.map((venta: any) => {
        montoTotalTMP += venta.precio_total;  
        if(venta.comprobante === 'Fiscal') montoTotalFacturadoTMP += venta.precio_total;  
        if(venta.forma_pago[0].descripcion === 'PedidosYa' || venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaTMP += venta.precio_total;   
      });
      this.montoTotal = montoTotalTMP;
      this.montoTotalFacturado = montoTotalFacturadoTMP;
      this.montoTotalPedidosYa = montoTotalPedidosYaTMP;
    }
  
    // Abrir modal - Detalles de venta
    abrirModalDetalles(venta: any): void {
      this.alertService.loading();
      this.ventasService.getVenta(venta._id).subscribe(({venta, productos}) => {
        this.ventaSeleccionada = venta;
        console.log(productos);
        this.productos = productos;
        this.showModalDetalle = true;
        this.alertService.close();
      },({error})=>{
        this.alertService.errorApi(error);
      });
    }
      
    // Ordenar por columna
    ordenarPorColumna(columna: string){
      this.ordenar.columna = columna;
      this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
      this.alertService.loading();
      this.listarVentas();
    }
  

}

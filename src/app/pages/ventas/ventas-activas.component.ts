import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { VentasService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-ventas-activas',
  templateUrl: './ventas-activas.component.html',
  styles: [
  ]
})
export class VentasActivasComponent implements OnInit {


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
  public montoTotalPedidosYaEfectivo:number = 0;
  public montoTotalPedidosYaApp:number = 0;
  public productos: any[] = [];
  
	// Paginacion
  public totalItems: number;
  public desde: number = 0;
	public paginaActual: number = 1;
	public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    facturacion: '',
    pedidosYa: '',
    parametro: '',
  }
  
  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }
  
  constructor(private ventasService: VentasService,
              public authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }
  
    ngOnInit(): void {
      this.dataService.ubicacionActual = 'Dashboard - Ventas activas'; 
      this.permisos.all = this.permisosUsuarioLogin();
      this.alertService.loading();
      this.listarVentas(); 
    }
  
    // Asignar permisos de usuario login
    permisosUsuarioLogin(): boolean {
      return this.authService.usuario.permisos.includes('VENTAS_HISTORIAL_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
    }
  
    // Listar ventas
    listarVentas(): void {
      this.ventasService.listarVentas( 
        this.ordenar.direccion,
        this.ordenar.columna,
        this.desde,
        this.cantidadItems,
        'true',
        this.filtro.parametro,
        '',
        '',
        this.filtro.facturacion,
        this.filtro.pedidosYa
        )
      .subscribe( ({ 
          ventas, 
          totalItems, 
          totalVentas, 
          totalFacturado, 
          totalPedidosYa,
          totalPedidosYaOnline,
          totalPedidosYaEfectivo
        }) => {
        this.ventas = ventas;
        this.montoTotalPedidosYa = totalPedidosYa,
        this.totalItems = totalItems;
        this.montoTotalFacturado = totalFacturado,
        this.montoTotal = totalVentas;
        this.montoTotalPedidosYaApp = totalPedidosYaOnline,
        this.montoTotalPedidosYaEfectivo = totalPedidosYaEfectivo
        // this.calculoMontoTotal();
        this.showModalDetalle = false;
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
    // calculoMontoTotal(): void {
    //   let montoTotalTMP = 0;
    //   let montoTotalFacturadoTMP = 0;
    //   let montoTotalPedidosYaTMP = 0;
    //   let montoTotalPedidosYaEfectivoTMP = 0;
    //   let montoTotalPedidosYaAppTMP = 0;
    //   this.ventas.map((venta: any) => {
    //     montoTotalTMP += venta.precio_total;  
    //     if(venta.comprobante === 'Fiscal') montoTotalFacturadoTMP += venta.precio_total;  
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa' || venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaTMP += venta.precio_total;   
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa') montoTotalPedidosYaAppTMP += venta.precio_total;   
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaEfectivoTMP += venta.precio_total; 
    //   });
    //   this.montoTotal = montoTotalTMP;
    //   this.montoTotalFacturado = montoTotalFacturadoTMP;
    //   this.montoTotalPedidosYa = montoTotalPedidosYaTMP;
    //   this.montoTotalPedidosYaEfectivo = montoTotalPedidosYaEfectivoTMP;
    //   this.montoTotalPedidosYaApp = montoTotalPedidosYaAppTMP;
    // }
  
    // Abrir modal - Detalles de venta
    abrirModalDetalles(venta: any): void {
      this.alertService.loading();
      this.ventasService.getVenta(venta._id).subscribe(({venta, productos}) => {
        window.scrollTo(0,0);
        this.ventaSeleccionada = venta;
        console.log(productos);
        this.productos = productos;
        this.showModalDetalle = true;
        this.alertService.close();
      },({error})=>{
        this.alertService.errorApi(error);
      });
    }

    // Generacion de PDF
    comprobanteElectronico(venta: any): void {
      this.alertService.loading();
      this.ventasService.getComprobante(venta._id).subscribe({
        next: () => {
          window.open(`${base_url}/pdf/comprobante.pdf`,'_blank');
          this.alertService.close();
        },
        error: ({error}) => this.alertService.errorApi(error.message)
      })
    }
      
    // Ordenar por columna
    ordenarPorColumna(columna: string){
      this.ordenar.columna = columna;
      this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
      this.alertService.loading();
      this.listarVentas();
    }

    // Cambiar cantidad de items
    cambiarCantidadItems(): void {
      this.paginaActual = 1
      this.cambiarPagina(1);
    }

    // Paginacion - Cambiar pagina
    cambiarPagina(nroPagina): void {
      this.paginaActual = nroPagina;
      this.desde = (this.paginaActual - 1) * this.cantidadItems;
      this.alertService.loading();
      this.listarVentas();
    }

}

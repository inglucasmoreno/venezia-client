import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { VentasService } from 'src/app/services/ventas.service';
import gsap from 'gsap';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-pedidosya-historial',
  templateUrl: './pedidosya-historial.component.html',
  styles: [
  ]
})
export class PedidosyaHistorialComponent implements OnInit {


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
    pedidosYa: 'PedidosYa',
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
      this.dataService.ubicacionActual = 'Dashboard - Ventas - PedidosYa'; 
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
        this.desde,
        this.cantidadItems,
        '',
        this.filtro.parametro,
        this.filtro.fechaDesde,
        this.filtro.fechaHasta,
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
        this.inicio === true ? this.inicio = false : null;
        this.ventas = ventas;
        this.montoTotalPedidosYa = totalPedidosYa,
        this.totalItems = totalItems;
        this.montoTotalPedidosYaApp = totalPedidosYaOnline;
        this.montoTotalPedidosYaEfectivo = totalPedidosYaEfectivo;
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

    // Calculo de monto total
    // calculoMontoTotal(): void {
    //   let montoTotalPedidosYaTMP = 0;
    //   let montoTotalPedidosYaEfectivoTMP = 0;
    //   let montoTotalPedidosYaAppTMP = 0;
    //   this.ventas.map((venta: any) => {
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa' || venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaTMP += venta.precio_total;   
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa') montoTotalPedidosYaAppTMP += venta.precio_total;   
    //     if(venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaEfectivoTMP += venta.precio_total; 
    //   });
    //   this.montoTotalPedidosYa = montoTotalPedidosYaTMP;
    //   this.montoTotalPedidosYaEfectivo = montoTotalPedidosYaEfectivoTMP;
    //   this.montoTotalPedidosYaApp = montoTotalPedidosYaAppTMP;
    // }

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

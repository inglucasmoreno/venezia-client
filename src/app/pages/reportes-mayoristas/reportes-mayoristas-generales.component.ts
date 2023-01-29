import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';
import { PaquetesService } from 'src/app/services/paquetes.service';

@Component({
  selector: 'app-reportes-mayoristas-generales',
  templateUrl: './reportes-mayoristas-generales.component.html',
  styles: [
  ]
})
export class ReportesMayoristasGeneralesComponent implements OnInit {

  // Flags
  public showFiltros: boolean = true;
  public inicio: boolean = true;

  // Parametros de busqueda
  public fechaDesde: string = '';
  public fechaHasta: string = '';

  // Repartidores
  public repartidores: any[] = [];
  public repartidor: string = '';

  // Reportes
  public totales: any;
  public totalFinal: number = 0;
  public cantidad_pedidos: number;

  constructor(
    private usuariosService: UsuariosService,
    private dataService: DataService,
    private alertService: AlertService,
    private paquetesService: PaquetesService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Reportes generales';
    this.cargaInicial();
  }

  // Carga inicial
  cargaInicial(): void {
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidores = usuarios.filter( usuario => usuario.role === 'DELIVERY_ROLE');
        this.alertService.close();
        console.log(this.repartidores); 
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Generar reporte
  generarReporte(): void {
    this.alertService.loading();
    const parametros = {
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      repartidor: ''
    }
    this.paquetesService.reportesGenerales(parametros).subscribe({
      next: ({ totales, cantidad_pedidos }) => {
        if(totales && cantidad_pedidos){
          this.totales = totales;
          this.cantidad_pedidos = cantidad_pedidos;
          this.totalFinal = totales?.precio_total - totales?.total_deudas + totales.total_ingresos - totales.total_gastos;
          this.alertService.close();
        }else{
          this.cantidad_pedidos = 0;
          this.totales = null;
          this.alertService.close();
        }
        this.inicio = false;
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

}

import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { CajasService } from 'src/app/services/cajas.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cajas-historial',
  templateUrl: './cajas-historial.component.html',
  styles: [
  ]
})
export class CajasHistorialComponent implements OnInit {

  // Modals
  public showModalCaja: boolean = false;
  
  // Postnet
  public showPostnet = false;

  // Ingresos y Gastos
  public showIngresos: boolean = false;
  public showGastos: boolean = false;

  // Cajas
  public cajaSeleccionada: any;
  public cajas: any = [];

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private alertService: AlertService,
              private dataService: DataService,
              private cajasService: CajasService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Historial de cajas';
    this.listarCajas();
  }

  // Listado de cajas
  listarCajas(): void {
    this.alertService.loading();
    this.cajasService.listarCajas(this.ordenar.direccion, this.ordenar.columna).subscribe({
      next: ({cajas}) => {
        this.cajas = cajas;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message) 
    });
  }

  // Abrir modal - Detalles de caja
  abrirModalDetalles(caja: any): void {
    this.cajaSeleccionada = caja;
    this.showModalCaja = true;
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
    this.listarCajas();
  }

}

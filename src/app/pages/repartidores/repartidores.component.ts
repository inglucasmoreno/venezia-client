import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { RepartidoresService } from 'src/app/services/repartidores.service';

@Component({
  selector: 'app-repartidores',
  templateUrl: './repartidores.component.html',
  styles: [
  ]
})
export class RepartidoresComponent implements OnInit {

  //Permisos de usuarios login
  public permisos = { all: false };
  
  // Modal
  public showModalRepartidor = false;
  
  // Estado formulario 
  public estadoFormulario = 'crear';
  
  // Repartidor
  public idRepartidor: string = '';
  public repartidores: any = [];
  public repartidorSeleccionado: any;
  public descripcion: string = '';
  
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
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }
  
  constructor(private repartidoresService: RepartidoresService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }
  
    ngOnInit(): void {
      this.dataService.ubicacionActual = 'Dashboard - Repartidores'; 
      this.permisos.all = this.permisosUsuarioLogin();
      this.alertService.loading();
      this.listarRepartidores(); 
    }
  
    // Asignar permisos de usuario login
    permisosUsuarioLogin(): boolean {
      return this.authService.usuario.permisos.includes('Repartidores_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
    }
  
    // Abrir modal
    abrirModal(estado: string, repartidor: any = null): void {
      this.reiniciarFormulario();
      this.descripcion = '';
      this.idRepartidor = '';
      
      if(estado === 'editar') this.getRepartidor(repartidor);
      else this.showModalRepartidor = true;
  
      this.estadoFormulario = estado;  
    }
  
    // Traer datos de repartidor
    getRepartidor(repartidor: any): void {
      this.alertService.loading();
      this.idRepartidor = repartidor._id;
      this.repartidorSeleccionado = repartidor;
      this.repartidoresService.getRepartidor(repartidor._id).subscribe(({repartidor}) => {
        this.descripcion = repartidor.descripcion;
        this.alertService.close();
        this.showModalRepartidor = true;
      },({error})=>{
        this.alertService.errorApi(error);
      });
    }
  
    // Listar repartidores
    listarRepartidores(): void {
      this.repartidoresService.listarRepartidores( 
        this.ordenar.direccion,
        this.ordenar.columna
        )
      .subscribe( ({ repartidores }) => {
        this.repartidores = repartidores;
        this.showModalRepartidor = false;
        this.alertService.close();
      }, (({error}) => {
        this.alertService.errorApi(error.msg);
      }));
    }
  
    // Nuevo repartidor
    nuevoRepartidor(): void {
  
      // Verificacion: Descripción vacia
      if(this.descripcion.trim() === ""){
        this.alertService.info('Debes colocar una descripción');
        return;
      }
  
      this.alertService.loading();
  
      const data = {
        descripcion: this.descripcion,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
      }
  
      this.repartidoresService.nuevoRepartidor(data).subscribe(() => {
        this.listarRepartidores();
      },({error})=>{
        this.alertService.errorApi(error.message);  
      });
      
    }
  
    // Actualizar repartidor
    actualizarRepartidor(): void {
  
      // Verificacion: Descripción vacia
      if(this.descripcion.trim() === ""){
        this.alertService.info('Debes colocar un repartidor');
        return;
      }
  
      this.alertService.loading();
  
      const data = {
        descripcion: this.descripcion,
        updatorUser: this.authService.usuario.userId,
      }
  
      this.repartidoresService.actualizarRepartidor(this.idRepartidor, data).subscribe(() => {
        this.listarRepartidores();
      },({error})=>{
        this.alertService.errorApi(error.message);
      });
    }
  
    // Actualizar estado Activo/Inactivo
    actualizarEstado(repartidor: any): void {
      
      const { _id, activo } = repartidor;
        
      if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');
  
      this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
          .then(({isConfirmed}) => {  
            if (isConfirmed) {
              this.alertService.loading();
              this.repartidoresService.actualizarRepartidor(_id, {activo: !activo}).subscribe(() => {
                this.alertService.loading();
                this.listarRepartidores();
              }, ({error}) => {
                this.alertService.close();
                this.alertService.errorApi(error.message);
              });
            }
          });
  
    }
  
    // Reiniciando formulario
    reiniciarFormulario(): void {
      this.descripcion = '';  
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
      this.listarRepartidores();
    }

}

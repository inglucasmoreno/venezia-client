import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PedidosyaService } from 'src/app/services/pedidosya.service';
import { VentasService } from 'src/app/services/ventas.service';

@Component({
  selector: 'app-pedidosya',
  templateUrl: './pedidosya.component.html',
  styles: [
  ]
})
export class PedidosyaComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalPedidosYa = false;
  public showModalVentas = true;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // PedidosYa
  public idPedidoYa: string = '';
  public pedidosYa: any = [];
  public pedidoYaSeleccionado: any;
  public monto: number = null;
  public comentario: string = '';
  public total = 0;

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

  constructor(private pedidosYaService: PedidosyaService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

    ngOnInit(): void {
      this.dataService.ubicacionActual = 'Dashboard - PedidosYa'; 
      this.permisos.all = this.permisosUsuarioLogin();
      this.alertService.loading();
      this.listarPedidosYa(); 
    }

    // Asignar permisos de usuario login
    permisosUsuarioLogin(): boolean {
      return this.authService.usuario.permisos.includes('PEDIDOSYA_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
    }

    // Abrir modal
    abrirModal(estado: string, pedido: any = null): void {
      window.scrollTo(0,0);
      this.reiniciarFormulario();
      this.monto = null;
      this.comentario = '';
      this.idPedidoYa = '';
      
      if(estado === 'editar') this.getPedidoYa(pedido);
      else this.showModalPedidosYa = true;

      this.estadoFormulario = estado;  
    }

    // Traer datos de pedido
    getPedidoYa(pedido: any): void {
      this.alertService.loading();
      this.idPedidoYa = pedido._id;
      this.pedidoYaSeleccionado = pedido;
      this.pedidosYaService.getPedidoYa(pedido._id).subscribe({
        next: () => {
          this.monto = pedido.monto;
          this.comentario = pedido.comentario;
          this.alertService.close();
          this.showModalPedidosYa = true;
        },
        error: ({error}) => this.alertService.errorApi(error.message)
      });
    }

    // Listar pedidos
    listarPedidosYa(): void {
      this.pedidosYaService.listarPedidosYa( 
        this.ordenar.direccion,
        this.ordenar.columna
        )
      .subscribe({
        next: ({pedidos}) => {
          this.pedidosYa = pedidos;
          let totalTMP = 0;
          pedidos.map( pedido => {
            totalTMP += pedido.monto;
          });
          this.total = totalTMP;
          this.showModalPedidosYa = false;
          this.alertService.close();
        },
        error: ({error}) => this.alertService.errorApi(error.msg)
      });
    }

    // Nuevo pedido
    nuevoPedidoYa(): void {

      // Verificacion: Monto vacio
      if(!this.monto || this.monto <= 0){
        this.alertService.info('Debes colocar un monto correcto');
        return;
      }

      this.alertService.loading();

      const data = {
        monto: this.monto,
        comentario: this.comentario,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
      }

      this.pedidosYaService.nuevoPedidoYa(data).subscribe({
        next: () => this.listarPedidosYa(),
        error: ({error}) => this.alertService.errorApi(error.message)
      })
            
    }

    // Actualizar pedido
    actualizarPedidoYa(): void {

      // Verificacion: Monto vacio
      if(!this.monto || this.monto <= 0){
        this.alertService.info('Debes colocar un monto correcto');
        return;
      }

      this.alertService.loading();

      const data = {
        monto: this.monto,
        comentario: this.comentario,
        updatorUser: this.authService.usuario.userId,
      }

      this.pedidosYaService.actualizarPedidoYa(this.idPedidoYa, data).subscribe({
        next: () => this.listarPedidosYa(),
        error: ({error}) => this.alertService.errorApi(error.message)
      });

    }

    // Actualizar estado Activo/Inactivo
    actualizarEstado(pedido: any): void {
      
      const { _id, activo } = pedido;

      if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

      this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
          .then(({isConfirmed}) => {  
            if (isConfirmed) {
              this.alertService.loading();
              this.pedidosYaService.actualizarPedidoYa(_id, {activo: !activo}).subscribe({
                next: () => {
                  this.alertService.loading();
                  this.listarPedidosYa();
                },
                error: ({error}) => this.alertService.errorApi(error.message)
              }
            )}
          });

    }

    // Reiniciando formulario
    reiniciarFormulario(): void {
      this.monto = null;
      this.comentario = '';  
    }

    // Filtrar Activo/Inactivo
    filtrarActivos(activo: any): void{
      this.paginaActual = 1;
      this.filtro.activo = activo;
    }

    // Filtrar por Parametro
    filtrarParametro(parametro: string): void{
      console.log(parametro);
      this.paginaActual = 1;
      this.filtro.parametro = parametro;
    }

    // Ordenar por columna
    ordenarPorColumna(columna: string){
      this.ordenar.columna = columna;
      this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
      this.alertService.loading();
      this.listarPedidosYa();
    }


}

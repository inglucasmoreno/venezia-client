import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComprasService } from 'src/app/services/compras.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styles: [
  ]
})
export class ComprasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalCompra = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Compra
  public idCompra: string = '';
  public compras: any = [];
  public compraSeleccionada: any;

  public compra: any = {
    numero_factura: '',
    fecha_compra: format(new Date(), 'yyyy-MM-dd'),
    comentarios: ''
  };

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private comprasService: ComprasService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Compras';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarCompras();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('COMPRAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, compra: any = null): void {
    this.reiniciarFormulario();
    this.idCompra = '';

    if (estado === 'editar') this.getCompra(compra);
    else this.showModalCompra = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de compra
  getCompra(compra: any): void {
    this.alertService.loading();
    this.idCompra = compra._id;
    this.compraSeleccionada = compra;
    this.comprasService.getCompra(compra._id).subscribe(({ compra }) => {
      this.compra = {
        numero_factura: compra.numero_factura,
        fecha_compra: format(new Date(compra.fecha_compra), 'yyyy-MM-dd'),
        comentarios: compra.comentarios
      }
      this.alertService.close();
      this.showModalCompra = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar compras
  listarCompras(): void {
    this.comprasService.listarCompras(
      this.ordenar.direccion,
      this.ordenar.columna
    )
      .subscribe(({ compras }) => {
        this.compras = compras;
        this.showModalCompra = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nueva compra
  nuevaCompra(): void {

    if (this.compra.fecha_compra === '') return this.alertService.info('Debe colocar una fecha de compra');

    const data = {
      fecha_compra: format(add(new Date(this.compra.fecha_compra), { hours: 3 }), 'yyyy-MM-dd'),
      numero_factura: this.compra.numero_factura,
      comentarios: this.compra.comentarios,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.alertService.question({ msg: 'Creando compra', buttonText: 'Crear' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.comprasService.nuevaCompra(data).subscribe(({ compra }) => {
            this.router.navigateByUrl(`/dashboard/compras/detalles/${compra._id}`);
          }, ({ error }) => {
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Actualizar compra
  actualizarCompra(): void {

    if (this.compra.fecha_compra === '') return this.alertService.info('Debe colocar una fecha de compra');

    this.alertService.loading();

    const data = {
      fecha_compra: format(add(new Date(this.compra.fecha_compra), { hours: 3 }), 'yyyy-MM-dd'),
      numero_factura: this.compra.numero_factura,
      comentarios: this.compra.comentarios,
      updatorUser: this.authService.usuario.userId,
    }

    this.comprasService.actualizarCompra(this.idCompra, data).subscribe(() => {
      this.listarCompras();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(compra: any): void {

    const { _id, activo } = compra;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.comprasService.actualizarCompra(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarCompras();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.compra = {
      numero_factura: '',
      fecha_compra: format(new Date(), 'yyyy-MM-dd'),
      comentarios: ''
    }
  }

  // Filtro por estado
  filtrarEstados(estado: string): void {
    this.paginaActual = 1;
    this.filtro.estado = estado;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarCompras();
  }

}

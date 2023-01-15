import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { InicializacionService } from 'src/app/services/inicializacion.service';
import { ProductosService } from 'src/app/services/productos.service';
import { UnidadMedidaService } from 'src/app/services/unidad-medida.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})
export class ProductosComponent implements OnInit {

// Flag y mensaje de estado
public flag_productos_importados = false;
public mensaje = '';

// Archivos para importacion
public file: any;
public archivoSubir: any;

// Permisos de usuarios login
public permisos = { all: false };

// Modal
public showModalProducto = false;
public showModalImportarProductos = false;

// Estado formulario
public estadoFormulario = 'crear';

// Producto
public idProducto: string = '';
public productos: any = [];
public productoSeleccionado: any;
public descripcion: string = '';
public codigoTMP: string = '';

// Unidades de medida
public unidades: any[] = [];

// Formulario producto
public productoForm: any = {
  descripcion: '',
  unidad_medida: '000000000000000000000000',
  balanza: 'false',
  codigo: '',
  precio: null,
  precio_mayorista: null
}

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

constructor(private productosService: ProductosService,
            private inicializacionService: InicializacionService,
            private unidadMedidaService: UnidadMedidaService,
            public authService: AuthService,
            private alertService: AlertService,
            private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Productos'; 
    this.permisos.all = this.permisosUsuarioLogin();
    this.cargaInicial(); 
  }

  // Carga inicial
  cargaInicial(): void {
    this.alertService.loading();

    // Listado de productos
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos;

        // Listado de unidades de medida
        this.unidadMedidaService.listarUnidades().subscribe({
          next:({unidades}) => {
            this.unidades = unidades.filter(unidad => (unidad.activo));
            this.alertService.close();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        })
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }


  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('PRODUCTOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, producto: any = null): void {
    this.reiniciarFormulario();
    
    if(estado === 'editar') this.getProducto(producto);
    else this.showModalProducto = true;

    this.estadoFormulario = estado;  
  }

  // Traer datos de producto
  getProducto(producto: any): void {
    this.alertService.loading();
    this.idProducto = producto._id;
    this.productoSeleccionado = producto;
    this.productosService.getProducto(producto._id).subscribe({
      next: ({producto}) => {
        const { descripcion, unidad_medida, balanza, codigo, precio, precio_mayorista } = producto;
        this.productoForm = {
          descripcion,
          unidad_medida: unidad_medida._id,
          balanza: balanza ? 'true' : 'false',
          codigo,
          precio,
          precio_mayorista       
        }
        this.alertService.close();
        this.showModalProducto = true;
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Listar productos
  listarProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos( 
      this.ordenar.direccion,
      this.ordenar.columna
    ).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        this.showModalProducto = false;
        this.alertService.close();
      },
      error: ({error}) => {
          this.alertService.errorApi(error.message);
      }
    })
  }

  verificacion(): boolean {
    
    const { descripcion, unidad_medida, balanza, precio } = this.productoForm;

    const condicion = descripcion.trim() === '' ||
                      (unidad_medida.trim() === '' && balanza === 'false') ||
                      precio === 0 || precio === null
    
    if(condicion) return true
    else return false

  }

  // Nuevo producto
  nuevoProducto(): void {

    const { descripcion, codigo, unidad_medida, balanza, precio, precio_mayorista } = this.productoForm;

    // Verificacion
    if(this.verificacion()){
      this.alertService.info('Formulario inválido');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion,
      unidad_medida: balanza === 'true' ? '111111111111111111111111' : unidad_medida,
      balanza: balanza === 'true' ? true : false,
      codigo,
      precio,
      precio_mayorista,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.productosService.nuevoProducto(data).subscribe({
      next: () => {
        this.listarProductos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
    
  }

  // Actualizar producto
  actualizarProducto(): void {

    const { descripcion, codigo, unidad_medida, balanza, precio, precio_mayorista } = this.productoForm;

    // Verificacion
    if(this.verificacion()){
      this.alertService.info('Formulario inválido');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion,
      unidad_medida: balanza === 'true' ? '111111111111111111111111' : unidad_medida,
      balanza: balanza === 'true' ? true : false,
      codigo,
      precio,
      precio_mayorista,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.productosService.actualizarProducto(this.idProducto, data).subscribe({
      next: () => {
        this.listarProductos();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })

  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(producto: any): void {
    
    const { _id, activo } = producto;
    
    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: activo ? '¿Quieres dar de baja el producto?': '¿Quieres dar de alta el producto?', buttonText: activo ? 'Dar de baja' : 'Dar de alta' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.productosService.actualizarProducto(_id, {activo: !activo}).subscribe({
              next: () => {
                this.alertService.loading();
                this.listarProductos();
              },
              error: ({error}) => {
                this.alertService.errorApi(error.message);
              }
            })
          }
        });

  }

  // Adaptacion de codigo
  adaptacionCodigo(desde: string): void {
    
    console.log(this.productoForm.balanza);

    this.productoForm.unidad_medida = this.productoForm.balanza === 'true' ? '111111111111111111111111' : '000000000000000000000000';

    // Se guarda el codigo
    if(desde === 'codigo'){
      this.codigoTMP = this.productoForm.codigo;
    }

    if((desde === 'balanza' || desde === 'codigo') && this.productoForm.balanza === 'true'){
      this.productoForm.codigo = this.codigoTMP.slice(2,7);
    }

    if((desde === 'balanza' || desde === 'codigo') && this.productoForm.balanza === 'false'){
      this.productoForm.codigo = this.codigoTMP;
    }
    
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.idProducto = '';
    this.codigoTMP = '';
    this.productoForm = {
      descripcion: '',
      unidad_medida: '000000000000000000000000',
      balanza: 'false',
      codigo: '',
      precio: null,
      precio_mayorista: null
    }
  }

  // Capturando archivo de importacion
  capturarArchivo(event: any): void {
    if(event.target.files[0]){
      // Se capatura el archivo
      this.archivoSubir = event.target.files[0];
  
      // Se verifica el formato - Debe ser un excel
      const formato = this.archivoSubir.type.split('/')[1];
      const condicion = formato !== 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  
      if(condicion){
        this.file = null;
        this.archivoSubir = null;
        return this.alertService.info('Debes seleccionar un archivo de excel');      
      }
    }
  }

  // Abrir modal de importacion de productos
  abrirImportarProductos(): void {
    this.file = null;
    this.showModalImportarProductos = true;
  }  

  // Importar productos
  importarProductos(): void {

    if(!this.file) return this.alertService.info('Debe seleccionar un archivo de excel');

    this.alertService.loading();
    const formData =  new FormData();
    formData.append('file', this.archivoSubir); // FormData -> key = 'file' y value = Archivo

    this.inicializacionService.importarProductos(formData, this.authService.usuario.userId).subscribe({
      next: ({msg}) => {
        this.mensaje = msg;
        this.flag_productos_importados = true;
        this.listarProductos();        
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })

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

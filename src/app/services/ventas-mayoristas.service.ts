import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasMayoristasService {

  constructor(private http: HttpClient) {}

  // Nueva venta
  nuevaVenta(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Venta por ID
  getVenta(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar ventas
  listarVentas(
    direccion : number = 1, 
    columna: string = 'apellido_nombre',
    desde: number = 0,
    registerpp: number = 10,
    estado: string = '',
    parametro: string = '',
    repartidor: string = '',
    mayorista: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',  
  ): Observable<any> {
    console.log(mayorista);
    return this.http.get(`${base_url}/ventas-mayoristas`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        estado,
        parametro,
        repartidor,
        mayorista,
        fechaDesde,
        fechaHasta   
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar venta
  actualizarVenta(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas-mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Generar detalles de pedido - PDF
  generarDetallesPDF(id:string): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/detalles-pedido/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  } 
  
}

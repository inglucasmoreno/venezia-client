import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private http: HttpClient) {}

  // Nueva venta
  nuevaVenta(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Venta por ID
  getVenta(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas/${ id }`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar ventas
  listarVentas(
    direccion : number = -1, 
    columna: string = 'createdAt',
    desde: number = 0,
    registerpp: number = 10,
    activo: string = '',
    parametro: string = '',
    fechaDesde,
    fechaHasta,
    tipoComprobante: string = '',
    pedidosYa: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/ventas`, {
      params: {
        columna,
        desde,
        registerpp,
        parametro,
        direccion: String(direccion),
        tipoComprobante,
        pedidosYa,
        fechaDesde,
        fechaHasta,
        activo
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar venta
  actualizarVenta(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar facturacion
  actualizarFacturacion(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas/actualizar/facturacion/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Comprobante electronico
  getComprobante(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas/comprobante/${ id }`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

}

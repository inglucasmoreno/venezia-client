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
    direccion: number = -1,
    columna: string = 'createdAt'  
  ): Observable<any> {
    return this.http.get(`${base_url}/ventas`, {
      params: {
        direccion: String(direccion),
        columna
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

  // Facturacion
  facturacion(): Observable<any> {
    return this.http.get(`${base_url}/ventas/facturacion/testing`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

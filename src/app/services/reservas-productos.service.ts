import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ReservasProductosService {

  constructor(private http: HttpClient) { }

  // Producto por ID
  getProducto(id: string): Observable<any> {
    return this.http.get(`${base_url}/reservas-productos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Nuevo producto
  nuevoProducto(data: any): Observable<any> {
    return this.http.post(`${base_url}/reservas-productos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar productos
  listarProductos(
    direccion: number = 1,
    columna: string = 'descripcion',
    desde: number = 0,
    registerpp: number = 10,
    parametro: string = '',
    activo: string = '',
  ): Observable<any> {
    return this.http.get(`${base_url}/reservas-productos`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        activo,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar producto
  actualizarProducto(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/reservas-productos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar productos
  eliminarProducto(id: string): Observable<any> {
    return this.http.delete(`${base_url}/reservas-productos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

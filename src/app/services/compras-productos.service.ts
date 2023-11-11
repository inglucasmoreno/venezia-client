import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ComprasProductosService {

  constructor(private http: HttpClient) { }

  // Nueva compra-producto
  nuevaCompraProducto(data: any): Observable<any> {
    return this.http.post(`${base_url}/compras-productos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Compra-producto por ID
  getCompraProducto(id: string): Observable<any> {
    return this.http.get(`${base_url}/compras-productos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar compras-productos
  listarComprasProductos(
    direccion: number = 1,
    columna: string = 'producto.descripcion',
    compra: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/compras-productos`, {
      params: {
        direccion: String(direccion),
        columna,
        compra
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar compra-producto
  actualizarCompraProducto(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/compras-productos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar compra-producto
  eliminarCompraProducto(id: string): Observable<any> {
    return this.http.delete(`${base_url}/compras-productos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

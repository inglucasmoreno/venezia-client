import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasMayoristasProductosService {

  constructor(private http: HttpClient) {}

  // Nuevo producto
  nuevoProducto(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-mayoristas-productos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Producto por ID
  getProducto(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas-productos/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar productos
  listarProductos(
    direccion: number = -1,
    columna: string = 'createdAt',
    pedido: string = '',
    activo: string = ''  
  ): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas-productos`, {
      params: {
        direccion: String(direccion),
        columna,
        pedido,
        activo
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar producto
  actualizarProducto(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas-mayoristas-productos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MesasPedidosService {

  constructor(private http: HttpClient) {}

  // Nuevo pedido
  nuevoPedido(data: any): Observable<any> {
    return this.http.post(`${base_url}/mesas-pedidos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Pedido por ID
  getPedido(id: string): Observable<any> {
    return this.http.get(`${base_url}/mesas-pedidos/${ id }`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar pedidos
  listarPedidos(
    direccion: number = 1,
    columna: string = 'descripcion'
  ): Observable<any> {
    return this.http.get(`${base_url}/mesas-pedidos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar pedido
  actualizarPedido(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mesas-pedidos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

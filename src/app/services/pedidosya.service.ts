import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PedidosyaService {

  constructor(private http: HttpClient) {}

  // Nuevo pedidoYa
  nuevoPedidoYa(data: any): Observable<any> {
    return this.http.post(`${base_url}/pedidosya`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // PedidosYa por ID
  getPedidoYa(id: string): Observable<any> {
    return this.http.get(`${base_url}/pedidosya/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar pedidosYa
  listarPedidosYa(
    direccion: number = -1,
    columna: string = 'createdAt'  
  ): Observable<any> {
    return this.http.get(`${base_url}/pedidosya`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar pedidoYa
  actualizarPedidoYa(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/pedidosya/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MesasPedidosProductosService {

  constructor(private http: HttpClient) {}

  // Nueva relacion
  nuevoRelacion(data: any): Observable<any> {
    return this.http.post(`${base_url}/mesas-pedidos-productos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Relacion por ID
  getRelacion(id: string): Observable<any> {
    return this.http.get(`${base_url}/mesas-pedidos-productos/${ id }`,{
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar relaciones
  listarRelaciones(
    direccion: number = 1,
    columna: string = 'descripcion'
  ): Observable<any> {
    return this.http.get(`${base_url}/mesas-pedidos-productos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar relacion
  actualizarRelacion(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mesas-pedidos-productos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CobrosPedidosService {

  constructor(private http: HttpClient) {}

  // Nueva relacion
  nuevaRelacion(data: any): Observable<any> {
    return this.http.post(`${base_url}/cobros-pedidos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Relacion por ID
  getRelacion(id: string): Observable<any> {
    return this.http.get(`${base_url}/cobros-pedidos/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar relaciones
  listarRelaciones(
    direccion: number = 1,
    columna: string = 'createdAt',
    cobro: string = ''  
  ): Observable<any> {
    return this.http.get(`${base_url}/cobros-pedidos`, {
      params: {
        direccion: String(direccion),
        columna,
        cobro
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar relacion
  actualizarRelacion(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cobros-pedidos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MayoristasTiposIngresosService {

  constructor(private http: HttpClient) { }

  // Nuevo tipo
  nuevoTipo(data: any): Observable<any> {
    return this.http.post(`${base_url}/mayoristas-tipos-ingresos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Tipo por ID
  getTipo(id: string): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-tipos-ingresos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar tipos
  listarTipos(
    direccion: number = 1,
    columna: string = 'descripcion'
  ): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-tipos-ingresos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar tipo
  actualizarTipo(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mayoristas-tipos-ingresos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

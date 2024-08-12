import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MesasService {

  constructor(private http: HttpClient) { }

  // Nueva mesa
  nuevaMesa(data: any): Observable<any> {
    return this.http.post(`${base_url}/mesas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Mesa por ID
  getMesa(id: string): Observable<any> {
    return this.http.get(`${base_url}/mesas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar mesas
  listarMesas(
    direccion: number = 1,
    columna: string = 'descripcion'
  ): Observable<any> {
    return this.http.get(`${base_url}/mesas`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar mesas
  actualizarMesa(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mesas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar mesas
  eliminarMesas(id: string): Observable<any> {
    return this.http.delete(`${base_url}/mesas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

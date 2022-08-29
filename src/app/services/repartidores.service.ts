import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class RepartidoresService {

  constructor(private http: HttpClient) {}

  // Nuevo repartidor
  nuevoRepartidor(data: any): Observable<any> {
    return this.http.post(`${base_url}/repartidores`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Repartidor por ID
  getRepartidor(id: string): Observable<any> {
    return this.http.get(`${base_url}/repartidores/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar repartidores
  listarRepartidores(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/repartidores`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar repartidor
  actualizarRepartidor(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/repartidores/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MayoristasService {

  constructor(private http: HttpClient) {}

  // Mayoristas por ID
  getMayorista(id: string): Observable<any> {
    return this.http.get(`${base_url}/mayoristas/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Nuevo mayorista
  nuevoMayorista(data: any): Observable<any> {
    return this.http.post(`${base_url}/mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar mayoristas
  listarMayoristas(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/mayoristas`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Listar mayoristas con cuenta corriente
  listarMayoristasConCC(
    direccion: number = 1,
    columna: string = 'descripcion',
    desde: number = 0,
    registerpp: number = 10,
    parametro: string = '',
    activo: string = '',
    estado: string = '', 
  ): Observable<any> {
    return this.http.get(`${base_url}/mayoristas/parametro/cuenta-corriente`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        activo,
        estado
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar mayorista
  actualizarMayorista(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

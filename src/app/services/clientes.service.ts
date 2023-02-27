import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  constructor(private http: HttpClient) { }

  // Clientes por ID
  getCliente(id: string): Observable<any> {
    return this.http.get(`${base_url}/clientes/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Clientes por identificacion
  getClientePorIdentificacion(identificacion: string): Observable<any> {
    return this.http.get(`${base_url}/clientes/identificacion/${identificacion}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Nuevo cliente
  nuevoCliente(data: any): Observable<any> {
    return this.http.post(`${base_url}/clientes`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar clientes
  listarClientes(
    direccion: number = 1,
    columna: string = 'descripcion',
    desde: number = 0,
    registerpp: number = 10,
    parametro: string = '',
    activo: string = '',
  ): Observable<any> {
    return this.http.get(`${base_url}/clientes`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        activo,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar cliente
  actualizarCliente(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/clientes/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

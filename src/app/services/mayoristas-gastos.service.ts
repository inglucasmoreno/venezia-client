import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MayoristasGastosService {

  constructor(private http: HttpClient) { }

  // Nuevo gasto
  nuevoGasto(data: any): Observable<any> {
    return this.http.post(`${base_url}/mayoristas-gastos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Gasto por ID
  getGasto(id: string): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-gastos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar gastos
  listarGastos(
    direccion : number = -1, 
    columna: string = 'createdAt',
    desde: number = 0,
    registerpp: number = 10,
    activo: string = '',
    parametro: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',
    tipo_gasto: string = '',
    repartidor: string = '',
  ): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-gastos`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        fechaDesde,
        fechaHasta,
        tipo_gasto,
        repartidor,
        activo
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar gasto
  actualizarGasto(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mayoristas-gastos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

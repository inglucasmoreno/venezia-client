import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class MayoristasIngresosService {

  constructor(private http: HttpClient) { }

  // Nuevo ingreso
  nuevoIngreso(data: any): Observable<any> {
    return this.http.post(`${base_url}/mayoristas-ingresos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Ingreso por ID
  getIngreso(id: string): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-ingresos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar ingresos
  listarIngresos(
    direccion: number = -1,
    columna: string = 'createdAt',
    desde: number = 0,
    registerpp: number = 10,
    activo: string = '',
    parametro: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',
    tipo_ingreso: string = '',
    repartidor: string = '',
  ): Observable<any> {
    return this.http.get(`${base_url}/mayoristas-ingresos`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        fechaDesde,
        fechaHasta,
        tipo_ingreso,
        repartidor,
        activo
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar ingreso
  actualizarIngreso(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/mayoristas-ingresos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar ingresos
  eliminarIngreso(id: string): Observable<any> {
    return this.http.delete(`${base_url}/mayoristas-ingresos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

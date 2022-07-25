import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class IngresosGastosService {

  constructor(private http: HttpClient) {}

  // Nuevo ingreso o gasto
  nuevoIngresoGasto(data: any): Observable<any> {
    return this.http.post(`${base_url}/ingresos-gastos`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Ingreso o gasto por ID
  getIngresoGasto(id: string): Observable<any> {
    return this.http.get(`${base_url}/ingresos-gastos/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar ingresos y gastos
  listarIngresosGastos(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/ingresos-gastos`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar ingreso o gasto
  actualizarIngresoGasto(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ingresos-gastos/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  } 
  
  // Eliminar ingreso o gasto
  eliminarIngresoGasto(id:string): Observable<any> {
    return this.http.delete(`${base_url}/ingresos-gastos/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  } 

}

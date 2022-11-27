import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CobrosMayoristasService {

  constructor(private http: HttpClient) {}

  // Nuevo cobro
  nuevoCobro(data: any): Observable<any> {
    return this.http.post(`${base_url}/cobros-mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Cobro por ID
  getCobro(id: string): Observable<any> {
    return this.http.get(`${base_url}/cobros-mayoristas/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar cobros
  listarCobros(
    direccion : number = 1, 
    columna: string = 'apellido_nombre',
    desde: number = 0,
    registerpp: number = 10,
    estado: string = '',
    parametro: string = '',
    repartidor: string = '',
    mayorista: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',
    tipo: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/cobros-mayoristas`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        estado,
        parametro,
        repartidor,
        mayorista,
        fechaDesde,
        fechaHasta,
        tipo  
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar cobro
  actualizarCobro(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cobros-mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  


}

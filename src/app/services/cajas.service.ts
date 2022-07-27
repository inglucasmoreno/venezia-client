import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

type NewType = Observable<any>;

@Injectable({
  providedIn: 'root'
})
export class CajasService {

  constructor(private http: HttpClient) {}

  // Caja por ID
  getCaja(id: string): Observable<any> {
    return this.http.get(`${base_url}/cajas/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Calculos iniciales
  calculosIniciales(): Observable<any> {
    return this.http.get(`${base_url}/cajas/calculos/iniciales`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Nueva caja
  nuevaCaja(data: any): NewType {
    return this.http.post(`${base_url}/cajas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar cajas
  listarCajas(
    direccion: number = -1,
    columna: string = 'createdAt'  
  ): Observable<any> {
    return this.http.get(`${base_url}/cajas`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar caja
  actualizarCaja(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cajas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

  // Actualizar saldo inicial de caja
  actualizarSaldoInicial(data: any): Observable<any> {
    return this.http.put(`${base_url}/cajas/update/saldo-inicial`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

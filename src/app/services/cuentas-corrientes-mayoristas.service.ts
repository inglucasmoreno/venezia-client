import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CuentasCorrientesMayoristasService {

  constructor(private http: HttpClient) {}

  // Nueva cuenta corriente
  nuevaCuentaCorriente(data: any): Observable<any> {
    return this.http.post(`${base_url}/cuentas-corrientes-mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Cuenta corriente por ID
  getCuentaCorriente(id: string): Observable<any> {
    return this.http.get(`${base_url}/cuentas-corrientes-mayoristas/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Inicializar cuentas corrientes
  inicializarCuentasCorrientes(usuario: any): Observable<any> {
    return this.http.get(`${base_url}/cuentas-corrientes-mayoristas/inicializar/cuentas`, {
      params: {
        creatorUser: usuario
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Listar cuentas corrientes
  listarCuentasCorrientes(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/cuentas-corrientes-mayoristas`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar cuenta corriente
  actualizarCuentaCorriente(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cuentas-corrientes-mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

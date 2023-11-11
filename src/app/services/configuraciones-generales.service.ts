import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionesGeneralesService {

  constructor(private http: HttpClient) {}

  // Nueva configuracion
  nuevaConfiguracion(data: any): Observable<any> {
    return this.http.post(`${base_url}/configuraciones-generales`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Obtener configuraciones
  getConfiguracion(): Observable<any> {
    return this.http.get(`${base_url}/configuraciones-generales`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar configuraciones
  listarConfiguraciones(
    direccion: number = -1,
    columna: string = 'createdAt'  
  ): Observable<any> {
    return this.http.get(`${base_url}/configuraciones-generales`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar configuracion
  actualizarConfiguracion(data: any): Observable<any> {
    return this.http.put(`${base_url}/configuraciones-generales`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {

  constructor(private http: HttpClient) {}

  // Nuevo paquete
  nuevoPaquete(data: any): Observable<any> {
    return this.http.post(`${base_url}/paquetes`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Completar paquete
  completarPaquete(data: any): Observable<any> {
    return this.http.post(`${base_url}/paquetes/completar`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Paquete por ID
  getPaquete(id: string): Observable<any> {
    return this.http.get(`${base_url}/paquetes/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar paquetes
  listarPaquetes(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/paquetes`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar paquetes
  actualizarPaquete(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/paquetes/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

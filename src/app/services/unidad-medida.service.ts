import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UnidadMedidaService {

  constructor(private http: HttpClient) {}

  // Nueva unidad de medida
  nuevaUnidad(data: any): Observable<any> {
    return this.http.post(`${base_url}/unidad-medida`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Unidad de medida por ID
  getUnidad(id: string): Observable<any> {
    return this.http.get(`${base_url}/unidad-medida/${ id }`,{ 
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar unidades de medida
  listarUnidades(
    direccion: number = 1,
    columna: string = 'descripcion'  
  ): Observable<any> {
    return this.http.get(`${base_url}/unidad-medida`, {
      params: {
        direccion: String(direccion),
        columna
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar unidad de medida
  actualizarUnidad(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/unidad-medida/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }  

}

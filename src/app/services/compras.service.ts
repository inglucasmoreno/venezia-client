import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  constructor(private http: HttpClient) { }

  // Nueva compra
  nuevaCompra(data: any): Observable<any> {
    return this.http.post(`${base_url}/compras`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Compra por ID
  getCompra(id: string): Observable<any> {
    return this.http.get(`${base_url}/compras/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Completar compra
  completarCompra(id: string): Observable<any> {
    return this.http.get(`${base_url}/compras/completar/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar compras
  listarCompras(
    direccion: number = -1,
    columna: string = 'fecha_compra',
  ): Observable<any> {
    return this.http.get(`${base_url}/compras`, {
      params: {
        direccion: String(direccion),
        columna,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar compra
  actualizarCompra(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/compras/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

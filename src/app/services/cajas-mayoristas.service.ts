import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CajasMayoristasService {

  constructor(private http: HttpClient) { }

  // Nueva caja
  nuevaCaja(data: any): Observable<any> {
    return this.http.post(`${base_url}/cajas-mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Caja por ID
  getCaja(id: string): Observable<any> {
    return this.http.get(`${base_url}/cajas-mayoristas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Calculos iniciales - CAJA MAYORISTAS
  calculosIniciales(repartidor: string): Observable<any> {
    return this.http.get(`${base_url}/cajas-mayoristas/calculos/iniciales`, {
      params: {
        repartidor: repartidor || ''
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar cajas
  listarCajas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/cajas-mayoristas`, {
      params: {
        columna: parametros?.columna || 'descripcion',
        direccion: parametros?.direccion || 1,
        desde: parametros?.desde || 0,
        registerpp: parametros?.cantidadItems || 100000,
        fechaDesde: parametros?.fechaDesde || '',
        fechaHasta: parametros?.fechaHasta || '',
        parametro: parametros?.parametro || '',
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar caja
  actualizarCaja(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cajas-mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Reporte de cajas
  reporteCajas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/cajas-mayoristas/reportes/acumulacion/estadisticas`, {
      params: {
        fechaDesde: parametros?.fechaDesde || '',
        fechaHasta: parametros?.fechaHasta || '',   
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

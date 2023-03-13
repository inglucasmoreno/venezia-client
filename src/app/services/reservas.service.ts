import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  constructor(private http: HttpClient) { }

  // Reserva por ID
  getReserva(id: string): Observable<any> {
    return this.http.get(`${base_url}/reservas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Nueva reserva
  nuevaReserva(data: any): Observable<any> {
    return this.http.post(`${base_url}/reservas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Generar comprobante
  generarComprobante(data: any): Observable<any> {
    return this.http.post(`${base_url}/reservas/comprobante`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar reservas
  listarReservas(
    direccion: number = 1,
    columna: string = 'descripcion',
    desde: number = 0,
    registerpp: number = 10,
    parametro: string = '',
    activo: string = '',
    estado: string = '',
    por_vencer: boolean = false,
    fecha: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/reservas`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        parametro,
        activo,
        estado,
        por_vencer,
        fecha
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Reservas por vencer -> Alerta 
  reservasPorVencer(
    direccion: number = -1,
    columna: string = 'createdAt',
  ): Observable<any> {
    return this.http.get(`${base_url}/reservas/parametro/vencer`, {
      params: {
        direccion: String(direccion),
        columna,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar reserva
  actualizarReserva(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/reservas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar reserva
  eliminarReserva(id: string): Observable<any> {
    return this.http.delete(`${base_url}/reservas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PaquetesService {

  constructor(private http: HttpClient) { }

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
    return this.http.get(`${base_url}/paquetes/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Enviar paquete
  enviarPaquete(id: string, fecha: any = ''): Observable<any> {
    return this.http.get(`${base_url}/paquetes/enviar/${id}`, {
      params: {
        fecha
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Envio masivo de paquetes
  envioMasivoPaquetes(fecha: any): Observable<any> {
    return this.http.get(`${base_url}/paquetes/enviar/masivo/total`, {
      params: {
        fecha
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar paquetes
  listarPaquetes(
    direccion: number = -1,
    columna: string = 'createdAt',
    desde: number = 0,
    registerpp: number = 10,
    estado: string = '',
    parametro: string = '',
    repartidor: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',
    activo: string = '',
  ): Observable<any> {

    return this.http.get(`${base_url}/paquetes`, {
      params: {
        direccion: String(direccion),
        columna,
        desde,
        registerpp,
        estado,
        parametro,
        repartidor,
        fechaDesde,
        fechaHasta,
        activo,
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Cerrar paquete
  cerrarPaquete(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/paquetes/cerrar/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Reportes generales
  reportesGenerales(data: any): Observable<any> {
    return this.http.post(`${base_url}/paquetes/reportes/general`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar paquetes
  actualizarPaquete(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/paquetes/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar paquete
  eliminarPaquete(id: string): Observable<any> {
    return this.http.delete(`${base_url}/paquetes/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Talonarios masivos PDF
  talonariosMasivosPDF(idPaquete: string): Observable<any> {
    return this.http.get(`${base_url}/paquetes/talonarios-masivos/pdf/${idPaquete}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Generar lista de preparacion de pedidos - PDF
  generarPreparacionPedidosPDF(idPaquete: string): Observable<any> {
    return this.http.get(`${base_url}/paquetes/preparacion-pedidos/pdf/${idPaquete}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  } 



}

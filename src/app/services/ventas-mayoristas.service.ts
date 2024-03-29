import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasMayoristasService {

  constructor(private http: HttpClient) { }

  // Nueva venta
  nuevaVenta(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-mayoristas`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Venta por ID
  getVenta(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Envio masivo
  envioMasivo(repartidor: string, data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-mayoristas/envio/masivo/${repartidor}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Completar masivo
  completarMasivo(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-mayoristas/completar/masivo/`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Listar ventas
  listarVentas(
    direccion: number = -1,
    columna: string = 'createdAt',
    desde: number = 0,
    registerpp: number = 10,
    estado: string = '',
    parametro: string = '',
    repartidor: string = '',
    mayorista: string = '',
    fechaDesde: string = '',
    fechaHasta: string = '',
    activo: string = '',
    paquete: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas`, {
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
        activo,
        paquete
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Actualizar venta
  actualizarVenta(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas-mayoristas/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Completar venta
  completarVenta(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas-mayoristas/completar/venta/${id}`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Eliminar venta
  eliminarVenta(id: string): Observable<any> {
    return this.http.delete(`${base_url}/ventas-mayoristas/eliminar/venta/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Generar detalles de pedido - PDF
  generarDetallesPDF(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/detalles-pedido/${id}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Generar detalles de deudas mayoristas - PDF
  detallesDeudasPDF(): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/detalles-deudas/pdf`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

  // Talonarios masivos PDF
  talonariosMasivosPDF(): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/talonarios-masivos/pdf`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Reportes - Repartidores
  reportesRepartidores(
    repartidor: string = '',
    fechaDesde: string = '',
    fechaHasta: string = ''
  ): Observable<any> {
    return this.http.get(`${base_url}/ventas-mayoristas/reportes/repartidores/web`, {
      params: {
        repartidor,
        fechaDesde,
        fechaHasta
      },
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  }

}

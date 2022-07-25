import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AfipService {

  constructor(private http: HttpClient) {}

  // Ultimo numero de comprobante
  ultimoNumeroComprobante(data: any): Observable<any> {
    return this.http.post(`${base_url}/afip/info/ultimo-numero-comprobante`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Informacion de comprobante
  informacionComprobante(data: any): Observable<any> {
    return this.http.post(`${base_url}/afip/info/comprobante`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Facturacion electronica
  facturaElectronica(data: any): Observable<any> {
    return this.http.post(`${base_url}/afip/factura-electronica`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };

  // Ajustar fecha
  ajustarFecha(data: any): Observable<any> {
    return this.http.post(`${base_url}/afip/ajustar/fecha`, data, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
  };


}

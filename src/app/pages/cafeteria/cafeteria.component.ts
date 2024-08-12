import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MesasService } from 'src/app/services/mesas.service';
import gsap from 'gsap';

@Component({
  selector: 'app-cafeteria',
  templateUrl: './cafeteria.component.html',
  styleUrls: []
})
export class CafeteriaComponent implements OnInit {

  public showModalNuevaMesa = false;
  public mesas: any[] = [];

  public ver = 'Cuadricula';

  public formNuevaMesa = {
    descripcion: ''
  };

  public filtroMesas = {
    estado: ''
  };

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private mesasService: MesasService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Cafetería';
    this.alertService.loading();
    this.mesasService.listarMesas().subscribe({
      next: ({ mesas }) => {
        this.mesas = mesas;
        this.alertService.close();
      }, error: (error) => console.error(error)
    })
  }

  abrirModalNuevaMesa() {
    this.formNuevaMesa.descripcion = '';
    this.showModalNuevaMesa = true;
  }

  crearMesa(): void {

    if (this.formNuevaMesa.descripcion.trim() === '') {
      this.alertService.info('Debe ingresar el nombre de la mesa');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.formNuevaMesa.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.mesasService.nuevaMesa(data).subscribe({
      next: ({ mesa }) => {
        this.mesas.push(mesa)
        this.showModalNuevaMesa = false;
        this.alertService.success('Mesa creada correctamente');
      }, error: (error) => this.alertService.errorApi(error.message)
    });

  }

}

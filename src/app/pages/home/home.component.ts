import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  public SUCURSAL = environment.sucursal;

  constructor(private dataService: DataService) { }

  ngOnInit(): void { 
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Home';
  }

}

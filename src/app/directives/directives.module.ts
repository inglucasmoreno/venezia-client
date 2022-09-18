import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PermisosDirective } from './permisos.directive';
import { AutoFocusDirective } from './auto-focus.directive';



@NgModule({
  declarations: [
    PermisosDirective,
    AutoFocusDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    PermisosDirective,
    AutoFocusDirective
  ]
})
export class DirectivesModule { }

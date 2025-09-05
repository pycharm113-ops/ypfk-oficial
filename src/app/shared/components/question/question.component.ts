import { Component, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { CopyPasteDirective } from "../../directives/copy-paste.directive";
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'app-question',
  imports: [CommonModule, AccordionModule, FieldsetModule],
  templateUrl: './question.component.html',
})
export class QuestionComponent implements OnInit {
  loading = true;
  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }
}
